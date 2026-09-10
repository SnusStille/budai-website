import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 40;
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

const SYSTEM_PROMPT = (lang: "sv" | "en", dual: boolean, concise: boolean) => {
  const langLine =
    lang === "sv"
      ? "The site is set to Swedish — always reply in Swedish."
      : "The site is set to English — always reply in English.";

  let length: string;
  if (dual) {
    length = `You produce TWO alternative answers to the same user question.
Structure your output EXACTLY like this (no extra preamble):

===OPTION_A===
<title max 6 words>
<body: thorough, structured, 180-320 words, use short paragraphs and bullets where useful>

===OPTION_B===
<title max 6 words>
<body: different angle or tone, equally thorough, 180-320 words>

Option A should be the practical / direct approach.
Option B should be the strategic / creative alternative.
Never invent that you already completed real actions.`;
  } else if (concise) {
    length = `Keep replies sharp and concise (about 60-110 words). Bullets welcome. No fluff.
Never invent that you already completed real actions.`;
  } else {
    length = `Keep replies helpful and substantial (about 140-260 words when the question deserves depth).
Use short paragraphs or bullets when useful. Be warm and concrete.
Never invent that you already completed real actions.`;
  }

  return `You are BudAI, an AI assistant demo by Stilledev on a marketing playground.
Answer genuinely and helpfully — not only business topics.
${langLine}
This is a developer preview — if asked about BudAI pricing/availability, say the team shares details when they request access. Early waitlist members get 10% off with code BUDAI-EARLY-10.
${length}`;
};

function parseDual(text: string): { replies: { title: string; body: string }[] } | null {
  const parts = text.split(/===OPTION_[AB]===/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const replies = parts.slice(0, 2).map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const title = (lines[0] || "Svar").replace(/^#+\s*/, "").slice(0, 48);
    const body = lines.slice(1).join("\n").trim() || block;
    return { title, body };
  });
  if (replies.some((r) => r.body.length < 40)) return null;
  return { replies };
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
    // dual default true unless single/concise requested
    const dual = concise ? false : body?.dual !== false;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const recent = rawMessages.slice(-12);
    const messages: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of recent) {
      if (
        !m ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string" ||
        m.content.length === 0 ||
        m.content.length > 2000
      ) {
        return NextResponse.json({ error: "Invalid message" }, { status: 400 });
      }
      messages.push({ role: m.role, content: m.content });
    }

    if (messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

    const response = await anthropic.messages.create({
      model,
      max_tokens: dual ? 1600 : concise ? 500 : 1000,
      system: SYSTEM_PROMPT(lang, dual, concise),
      messages,
    });

    const textBlock = response.content.find((c) => c.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

    if (dual) {
      const parsed = parseDual(text);
      if (parsed) {
        return NextResponse.json({
          dual: true,
          replies: parsed.replies,
          reply: parsed.replies[0]?.body ?? text,
        });
      }
    }

    return NextResponse.json({ dual: false, reply: text || "…" });
  } catch (err) {
    console.error("Playground error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
