import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Lazy client so missing API keys don't crash the module at import time.
function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  if (!key) return null;

  return new Anthropic({
    apiKey: key,
    ...(workspaceId
      ? {
          defaultHeaders: {
            "anthropic-workspace-id": workspaceId,
          },
        }
      : {}),
  });
}

// Very simple in-memory rate limit (resets on redeploy — fine for a dev preview)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 50; // 50 messages per IP per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

const SYSTEM_PROMPT = (lang: "sv" | "en") => `You are BudAI, an AI assistant demo built by Stilledev, running in the "playground" section of a marketing site.
You're being tried out by a visitor — could be an individual or a business, and could ask about absolutely anything,
not just business topics. Answer whatever they ask genuinely and helpfully, the way a capable general-purpose
assistant would; don't redirect non-business questions back to business use cases.
Keep replies concise (3-6 sentences) and warm.
${
  lang === "sv"
    ? "The site is currently set to Swedish — always reply in Swedish, regardless of what language the visitor writes in."
    : "The site is currently set to English — always reply in English, regardless of what language the visitor writes in."
}
This is a developer preview — if asked about pricing, availability, or timelines for BudAI itself, say the team can
share details when they request access, don't invent specifics.
Never claim to have already completed real actions (e.g. don't say "I've drafted the email" — instead describe what
you *would* produce).
The conversation may include earlier turns — use them for context like a normal chat.`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again later." },
      { status: 429 }
    );
  }

  const anthropic = getClient();
  if (!anthropic) {
    return NextResponse.json(
      {
        error: "Playground is not configured. Set ANTHROPIC_API_KEY.",
        reply: null,
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const rawMessages = body?.messages;
    const lang = body?.lang === "sv" ? "sv" : "en";

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Cap history so a long-running chat can't balloon token usage/cost
    const recent = rawMessages.slice(-16);

    const messages: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of recent) {
      if (
        !m ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string" ||
        m.content.length === 0 ||
        m.content.length > 1000
      ) {
        return NextResponse.json({ error: "Invalid message" }, { status: 400 });
      }
      messages.push({ role: m.role as "user" | "assistant", content: m.content });
    }

    if (messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Prefer a currently supported model and keep the app resilient if a stale
    // model name is still left in the environment.
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";

    const response = await anthropic.messages.create({
      model,
      max_tokens: 500,
      system: SYSTEM_PROMPT(lang),
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Playground API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
