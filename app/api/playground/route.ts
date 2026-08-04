import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Very simple in-memory rate limit (resets on redeploy — fine for a dev preview)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 50; // 3 meddelanden
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

const SYSTEM_PROMPT = `You are BudAI, an AI assistant demo for Swedish businesses, built by Stilledev.
You're being tried out by a potential customer on a marketing site's "playground" demo.
Keep replies concise (2-4 sentences), professional but warm, and focused on business use cases:
automation, document generation, data analysis, customer support, marketing content, workflow optimization.
This is a developer preview — if asked about pricing, availability, or timelines, say the team can share
details when they request access, don't invent specifics.
Never claim to have already completed real actions (e.g. don't say "I've drafted the email" — instead
describe what you *would* produce).`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.length > 200) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
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