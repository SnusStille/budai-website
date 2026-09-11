import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dayKey, limitFor, type AccessTier } from "@/lib/limits";

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 60;
const WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= LIMIT) return true;
  entry.count += 1;
  return false;
}

async function resolveUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anon || url.includes("YOUR_PROJECT")) return null;
  const sb = createClient(url, anon);
  const { data } = await sb.auth.getUser(auth.slice(7));
  return data.user ?? null;
}

function adminSb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key || url.includes("YOUR_PROJECT")) return null;
  return createClient(url, key);
}

const SYSTEM_PROMPT = (
  lang: "sv" | "en",
  dual: boolean,
  concise: boolean,
  extra?: string,
  hasImage?: boolean
) => {
  const langLine =
    lang === "sv"
      ? "Always reply in Swedish unless the user clearly writes in English only."
      : "Always reply in English unless the user clearly writes in Swedish only.";

  let length: string;
  if (dual) {
    length = `Produce TWO alternatives EXACTLY:

===OPTION_A===
<title max 6 words>
<body 160-300 words>

===OPTION_B===
<title max 6 words>
<body 160-300 words different angle>`;
  } else if (concise) {
    length = `Keep replies sharp (60-110 words). Bullets welcome.`;
  } else {
    length = `Helpful and substantial (120-260 words when deserved). Short paragraphs or bullets. Warm and concrete.`;
  }

  const vision = hasImage
    ? `\nThe user attached an image. Describe and analyze it accurately. Never invent text that is not readable. If unclear, say so.`
    : "";

  const extraBlock = extra?.trim()
    ? `\n\nContext (memory / device / system — respect privacy):\n${extra.trim().slice(0, 3500)}`
    : "";

  return `You are BudAI — an AI work assistant by Stilledev (Sweden).
You help people write, automate, decide, and think clearer. Nordic context when relevant.
${langLine}
Developer preview. Pricing/access: waitlist + code BUDAI-EARLY-10 (10% at launch).
Never claim access to private phone data, messages, contacts, camera, or mic unless the user explicitly provided content.
If useful long-term facts appear (name, role, company, preferences, goals), end your reply with a single hidden line:
[[MEMORY: short fact]]
Only for durable facts, not temporary task details. Max one per reply. Skip if nothing durable.
${length}${vision}${extraBlock}`;
};

function parseDual(text: string) {
  const parts = text
    .split(/===OPTION_[AB]===/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  const replies = parts.slice(0, 2).map((block) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const title = (lines[0] || "Svar").replace(/^#+\s*/, "").slice(0, 48);
    const body = lines.slice(1).join("\n").trim() || block;
    return { title, body };
  });
  if (replies.some((r) => r.body.length < 40)) return null;
  return { replies };
}

function stripMemoryTag(text: string): { clean: string; memory: string | null } {
  const m = text.match(/\[\[MEMORY:\s*([\s\S]*?)\]\]/i);
  if (!m) return { clean: text.trim(), memory: null };
  const memory = m[1].trim().slice(0, 240);
  const clean = text.replace(m[0], "").trim();
  return { clean, memory: memory || null };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
  }

  const anthropic = getClient();
  if (!anthropic) {
    return NextResponse.json(
      { error: "Playground is not configured. Set ANTHROPIC_API_KEY.", reply: null },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const rawMessages = body?.messages;
    const lang = body?.lang === "sv" ? "sv" : "en";
    const concise = body?.concise === true;
    const dual = concise ? false : body?.dual === true;
    const contextBlock = typeof body?.context === "string" ? body.context : "";
    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : null;
    const imageMediaType =
      body?.imageMediaType === "image/png" ||
      body?.imageMediaType === "image/gif" ||
      body?.imageMediaType === "image/webp"
        ? body.imageMediaType
        : "image/jpeg";
    const guestKey = typeof body?.guest === "string" ? body.guest.slice(0, 80) : null;
    const temporary = body?.temporary === true;

    const user = await resolveUser(req);
    const tier: AccessTier = user ? "member" : "guest";

    // Soft server quota when tables exist (single clean upsert)
    const sb = adminSb();
    if (imageBase64 && tier === "guest") {
      return NextResponse.json(
        { error: "Image analysis requires a free account.", code: "auth" },
        { status: 403 }
      );
    }
    if (sb) {
      try {
        const day = dayKey();
        if (user) {
          const { data: full } = await sb
            .from("usage_daily")
            .select("*")
            .eq("user_id", user.id)
            .eq("day", day)
            .maybeSingle();
          const used = full?.messages ?? 0;
          if (used >= limitFor(tier, "messages")) {
            return NextResponse.json(
              { error: "Daily message limit reached. Sign in unlocks higher limits.", code: "limit" },
              { status: 429 }
            );
          }
          if (imageBase64) {
            const imgUsed = full?.images ?? 0;
            if (imgUsed >= limitFor(tier, "images")) {
              return NextResponse.json(
                { error: "Daily image analysis limit reached.", code: "limit" },
                { status: 429 }
              );
            }
          }
          await sb.from("usage_daily").upsert({
            user_id: user.id,
            day,
            messages: used + 1,
            images: (full?.images ?? 0) + (imageBase64 ? 1 : 0),
            generations: full?.generations ?? 0,
          });
        } else if (guestKey) {
          const { data } = await sb
            .from("usage_guest_daily")
            .select("*")
            .eq("guest_key", guestKey)
            .eq("day", day)
            .maybeSingle();
          const used = data?.messages ?? 0;
          if (used >= limitFor("guest", "messages")) {
            return NextResponse.json(
              {
                error: "Guest daily limit reached. Sign in for more messages, memory, and images.",
                code: "limit",
              },
              { status: 429 }
            );
          }
          await sb.from("usage_guest_daily").upsert({
            guest_key: guestKey,
            day,
            messages: used + 1,
            images: data?.images ?? 0,
            generations: data?.generations ?? 0,
          });
        }
      } catch {
        /* tables may not exist yet */
      }
    }

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const recent = rawMessages.slice(-12);
    type Msg = {
      role: "user" | "assistant";
      content: string | Anthropic.ContentBlockParam[];
    };
    const messages: Msg[] = [];

    for (let i = 0; i < recent.length; i++) {
      const m = recent[i];
      if (
        !m ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string" ||
        m.content.length === 0 ||
        m.content.length > 4000
      ) {
        return NextResponse.json({ error: "Invalid message" }, { status: 400 });
      }
      const isLast = i === recent.length - 1;
      if (m.role === "user" && isLast && imageBase64 && imageBase64.length < 6_000_000) {
        messages.push({
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageMediaType,
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
            { type: "text", text: m.content },
          ],
        });
      } else {
        messages.push({ role: m.role, content: m.content });
      }
    }

    if (messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

    const response = await anthropic.messages.create({
      model,
      max_tokens: dual ? 1600 : concise ? 500 : 1200,
      system: SYSTEM_PROMPT(lang, dual, concise, contextBlock, !!imageBase64),
      messages: messages as Anthropic.MessageParam[],
    });

    const textBlock = response.content.find((c) => c.type === "text");
    let text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const { clean, memory } = stripMemoryTag(text);
    text = clean;

    // Persist auto-memory for members
    if (memory && user && sb && !temporary) {
      try {
        const { data: prof } = await sb
          .from("profiles")
          .select("memory_enabled")
          .eq("id", user.id)
          .maybeSingle();
        if (prof?.memory_enabled !== false) {
          await sb.from("memories").insert({
            user_id: user.id,
            content: memory,
            category: "general",
            source: "auto",
            confidence: 0.75,
          });
        }
      } catch {
        /* */
      }
    }

    if (dual) {
      const parsed = parseDual(text);
      if (parsed) {
        return NextResponse.json({
          dual: true,
          replies: parsed.replies,
          reply: parsed.replies[0]?.body ?? text,
          memory,
        });
      }
    }

    return NextResponse.json({ dual: false, reply: text || "…", memory });
  } catch (err) {
    console.error("Playground error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
