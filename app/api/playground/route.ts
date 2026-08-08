import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

const SYSTEM_PROMPT = `You are BudAI, an AI assistant demo built by Stilledev, running in the "playground" section of a marketing site.
You're being tried out by a visitor — could be an individual or a business, and could ask about absolutely anything,
not just business topics. Answer whatever they ask genuinely and helpfully, the way a capable general-purpose
assistant would; don't redirect non-business questions back to business use cases.
Keep replies concise (3-6 sentences) and warm.
This is a developer preview — if asked about pricing, availability, or timelines for BudAI itself, say the team can
share details when they request access, don't invent specifics.
Never claim to have already completed real actions (e.g. don't say "I've drafted the email" — instead describe what
you *would* produce).
The conversation may include earlier turns — use them for context like a normal chat.`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Cap history so a long-running chat can't balloon token usage/cost —
    // keep the most recent turns, that's what matters for context anyway.
    const recent = rawMessages.slice(-16);

    const messages = [];
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

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      // Raised from 300 -> 500 so visitors can actually see the quality of a
      // full response in the demo, while still keeping a hard ceiling so a
      // single reply can't run away and rack up cost.
      max_tokens: 500,
      system: SYSTEM_PROMPT,
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