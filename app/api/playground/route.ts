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

/* ── Personas ─────────────────────────────────────────────── */

type PersonaId = "core" | "writer" | "analyst" | "builder" | "coach" | "studio";

const PERSONAS: Record<PersonaId, { sv: string; en: string }> = {
  core: {
    sv: "Du är BudAI Core — en varm, rak och praktisk AI-arbetsassistent. Du hjälper till att skriva, tänka, planera och förenkla arbete.",
    en: "You are BudAI Core — a warm, direct, practical AI work assistant. You help people write, think, plan and simplify work.",
  },
  writer: {
    sv: "Du är BudAI Writer — en skarp svensk/engelsk skribent. Du skriver publicerbar text, föreslår rubriker, stryker fluff och levererar färdigt material.",
    en: "You are BudAI Writer — a sharp bilingual copywriter. You produce publishable text, propose headlines, cut fluff, and deliver finished material.",
  },
  analyst: {
    sv: "Du är BudAI Analyst — strukturerad och källkritisk. Du väger alternativ, listar antaganden, risker och rekommenderar ett tydligt nästa steg.",
    en: "You are BudAI Analyst — structured and source-critical. You weigh options, list assumptions and risks, and recommend one clear next step.",
  },
  builder: {
    sv: "Du är BudAI Builder — teknisk och konkret. Du skriver kod, förklarar arkitektur, felsöker och ger körbara exempel med korta kommentarer.",
    en: "You are BudAI Builder — technical and concrete. You write code, explain architecture, debug, and give runnable examples with short comments.",
  },
  coach: {
    sv: "Du är BudAI Coach — uppmuntrande och prestigelös. Du ställer en bra följdfråga när det behövs och delar upp stora mål i små, tydliga steg.",
    en: "You are BudAI Coach — encouraging and ego-free. You ask one good follow-up question when needed and break big goals into small, clear steps.",
  },
  studio: {
    sv: "Du är BudAI Studio — kreativ och bildspråklig. Du beskriver miljöer, ljus och känsla och skriver detaljerade bildprompter.",
    en: "You are BudAI Studio — creative and visual. You describe scenes, light and mood, and write detailed image prompts.",
  },
};

/* ── Response styles ──────────────────────────────────────── */

type StyleId = "balanced" | "concise" | "creative" | "precise" | "stepbystep";

const STYLES: Record<StyleId, { sv: string; en: string }> = {
  balanced: {
    sv: "Svara hjälpsamt och innehållsrikt (120–260 ord när det är värt det). Korta stycken eller punktlistor.",
    en: "Reply helpfully and substantially (120–260 words when deserved). Short paragraphs or bullets.",
  },
  concise: {
    sv: "Var knivskarp: 60–110 ord, punktlistor välkomna. Ingen utfyllnad, ingen repetition av frågan.",
    en: "Be razor sharp: 60–110 words, bullets welcome. No filler, never restate the question.",
  },
  creative: {
    sv: "Var lekfull och bildrik. Överraska med en oväntad vinkel, ett konkret exempel och en mening värd att citera.",
    en: "Be playful and vivid. Surprise with an unexpected angle, one concrete example, and a line worth quoting.",
  },
  precise: {
    sv: "Var exakt och källkritisk. Skilj tydligt på fakta, antaganden och osäkerhet. Flagga när information kan ha ändrats.",
    en: "Be exact and source-critical. Separate facts, assumptions and uncertainty. Flag when information may have changed.",
  },
  stepbystep: {
    sv: "Arbeta steg för steg. Numrera stegen, visa hur du kommer fram, avsluta med ett tydligt nästa steg.",
    en: "Work step by step. Number the steps, show your reasoning, end with one clear next step.",
  },
};

/* ── Effort / depth ──────────────────────────────────────── */

type EffortId = "quick" | "balanced" | "deep";

const EFFORT: Record<EffortId, { sv: string; en: string; tokens: number }> = {
  quick: {
    sv: "Svara snabbt och kompakt.",
    en: "Answer fast and compact.",
    tokens: 700,
  },
  balanced: { sv: "", en: "", tokens: 1300 },
  deep: {
    sv: "Tänk igenom detta noggrant. Överväg minst två infallsvinklar, lyft kantfall och var extragrundlig.",
    en: "Think this through carefully. Consider at least two angles, surface edge cases, and be extra thorough.",
    tokens: 2600,
  },
};

function buildSystem(opts: {
  lang: "sv" | "en";
  persona: PersonaId;
  style: StyleId;
  effort: EffortId;
  dual: boolean;
  extra?: string;
  hasImage?: boolean;
}) {
  const { lang, persona, style, effort, dual, extra, hasImage } = opts;

  const parts: string[] = [];
  parts.push(PERSONAS[persona][lang === "sv" ? "sv" : "en"]);
  parts.push("Du är BudAI, byggd av Stilledev i Sverige. En tidig förhandsvisning.");
  parts.push("Kärnprinciper: var konkret, undvik floskler, hitta inte på fakta, erkänn osäkerhet.");
  parts.push(
    lang === "sv"
      ? "Svara på svenska om användaren skriver på svenska, annars på engelska."
      : "Reply in English unless the user writes in Swedish, then reply in Swedish."
  );
  parts.push(STYLES[style][lang === "sv" ? "sv" : "en"]);
  if (EFFORT[effort][lang === "sv" ? "sv" : "en"]) parts.push(EFFORT[effort][lang === "sv" ? "sv" : "en"]);

  if (dual) {
    parts.push(
      lang === "sv"
        ? "Ge EXAKT två alternativ i formatet:\n\n===OPTION_A===\n<rubrik max 6 ord>\n<text 160–300 ord>\n\n===OPTION_B===\n<rubrik max 6 ord>\n<text 160–300 ord, annan vinkel>"
        : "Produce EXACTLY two alternatives:\n\n===OPTION_A===\n<title max 6 words>\n<body 160–300 words>\n\n===OPTION_B===\n<title max 6 words>\n<body 160–300 words, different angle>"
    );
  }

  parts.push(
    lang === "sv"
      ? "Lova aldrig priser, lanseringsdatum, rabatter eller funktioner som inte är bekräftade. Låtsas aldrig ha tillgång till privat data."
      : "Never promise pricing, launch dates, discounts or unconfirmed features. Never claim access to private data."
  );

  if (hasImage) {
    parts.push(
      lang === "sv"
        ? "Användaren har bifogat en bild. Beskriv och analysera den korrekt. Hitta inte på text som inte går att läsa."
        : "The user attached an image. Describe and analyse it accurately. Never invent unreadable text."
    );
  }

  if (extra?.trim()) {
    parts.push(
      (lang === "sv" ? "Kontext (minne/enhet — respektera integritet):\n" : "Context (memory/device — respect privacy):\n") +
        extra.trim().slice(0, 3500)
    );
  }

  parts.push(
    "Om du lär dig en varaktig fakta om användaren (namn, roll, företag, preferens, mål), avsluta svaret med exakt en rad: [[MEMORY: kort fakta]]. Bara beständiga fakta, aldrig uppgiftsdetaljer."
  );

  return parts.join("\n\n");
}

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

function stripMemory(text: string): { clean: string; memory: string | null } {
  const m = text.match(/\[\[MEMORY:\s*([\s\S]*?)\]\]/i);
  if (!m) return { clean: text, memory: null };
  const memory = m[1].trim().slice(0, 240);
  const clean = text.replace(m[0], "");
  return { clean, memory: memory || null };
}

/** Live view of a streaming answer: hide the memory tag the moment it starts. */
function visibleStream(text: string) {
  const i = text.search(/\[\[MEMORY:/i);
  return i === -1 ? text : text.slice(0, i);
}

type Body = {
  messages?: { role?: string; content?: string }[];
  lang?: string;
  dual?: boolean;
  concise?: boolean;
  persona?: string;
  style?: string;
  effort?: string;
  stream?: boolean;
  context?: string;
  imageBase64?: string;
  imageMediaType?: string;
  guest?: string;
  temporary?: boolean;
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit reached. Try again later." }, { status: 429 });
  }

  const anthropic = getClient();
  if (!anthropic) {
    return NextResponse.json(
      {
        error:
          "Playground is not configured yet. Add ANTHROPIC_API_KEY to enable live answers — the interface still works.",
        code: "unconfigured",
        reply: null,
      },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as Body;
    const rawMessages = body?.messages;
    const lang: "sv" | "en" = body?.lang === "sv" ? "sv" : "en";
    const dual = body?.dual === true;
    const persona = (
      ["core", "writer", "analyst", "builder", "coach", "studio"].includes(String(body?.persona))
        ? body?.persona
        : "core"
    ) as PersonaId;
    const style = (
      ["balanced", "concise", "creative", "precise", "stepbystep"].includes(String(body?.style))
        ? body?.style
        : "balanced"
    ) as StyleId;
    const effort = (
      ["quick", "balanced", "deep"].includes(String(body?.effort)) ? body?.effort : "balanced"
    ) as EffortId;
    const wantStream = body?.stream === true;
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

    const sb = adminSb();
    if (imageBase64 && tier === "guest") {
      return NextResponse.json(
        { error: "Image analysis requires a free account.", code: "auth" },
        { status: 403 }
      );
    }

    /* Server-side quota bookkeeping (best effort — tables may not exist yet) */
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
          if (imageBase64 && (full?.images ?? 0) >= limitFor(tier, "images")) {
            return NextResponse.json(
              { error: "Daily image analysis limit reached.", code: "limit" },
              { status: 429 }
            );
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

    const recent = rawMessages.slice(-14);
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
        m.content.length > 8000
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
    const system = buildSystem({
      lang,
      persona,
      style,
      effort,
      dual,
      extra: contextBlock,
      hasImage: !!imageBase64,
    });
    const maxTokens = dual ? 1800 : EFFORT[effort].tokens;

    const persistMemory = async (memory: string | null) => {
      if (!memory || !user || !sb || temporary) return;
      try {
        const { data: prof } = await sb
          .from("profiles")
          .select("memory_enabled")
          .eq("id", user.id)
          .maybeSingle();
        if (prof?.memory_enabled === false) return;
        await sb.from("memories").insert({
          user_id: user.id,
          content: memory,
          category: "general",
          source: "auto",
          confidence: 0.75,
        });
      } catch {
        /* */
      }
    };

    /* ── Streaming path ───────────────────────────────────── */
    if (wantStream && !dual) {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: maxTokens,
        system,
        messages: messages as Anthropic.MessageParam[],
      });

      const encoder = new TextEncoder();
      const started = Date.now();

      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          let full = "";
          try {
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                full += event.delta.text;
                const visible = visibleStream(full);
                if (visible) controller.enqueue(encoder.encode(visible));
              }
            }
            const { memory } = stripMemory(full);
            await persistMemory(memory);
            controller.enqueue(encoder.encode(`\n\u0000META${JSON.stringify({ ms: Date.now() - started, model, memory: memory ?? null })}`));
          } catch (err) {
            console.error("Playground stream error:", err);
            controller.enqueue(encoder.encode("\n\u0000ERR" + JSON.stringify({ error: "stream" })));
          } finally {
            controller.close();
          }
        },
        cancel() {
          try {
            stream.abort();
          } catch {
            /* */
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }

    /* ── Classic path (dual / non-stream) ──────────────────── */
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: messages as Anthropic.MessageParam[],
    });

    const textBlock = response.content.find((c) => c.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const { clean, memory } = stripMemory(raw);
    await persistMemory(memory);

    if (dual) {
      const parsed = parseDual(clean);
      if (parsed) {
        return NextResponse.json({
          dual: true,
          replies: parsed.replies,
          reply: parsed.replies[0]?.body ?? clean,
          memory,
        });
      }
    }

    return NextResponse.json({ dual: false, reply: clean.trim() || "…", memory });
  } catch (err) {
    console.error("Playground error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
