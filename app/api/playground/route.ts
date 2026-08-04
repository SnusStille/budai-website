import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Very simple in-memory rate limit
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 50;
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

const SYSTEM_PROMPT = `You are BudAI, an advanced AI assistant demo for individuals and businesses, built by Stilledev.
You're being tried out by a user on a marketing site's "playground" demo.
Keep replies concise (2-4 sentences), professional but warm, and focused on helping the user work smarter.
This is a beta preview — if asked about pricing, availability, or timelines, say premium plans are coming soon.
Never claim to have already completed real actions (e.g. don't say "I've drafted the email" — instead
describe what you *would* produce).
If the user's prompt relies on context, use the conversation history if provided.`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { message, memoryEnabled, history } = await req.json();

    if (!message || typeof message !== "string" || message.length > 500) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Build conversation context if memory is enabled
    const messages = [];

    if (memoryEnabled && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role && msg.content && typeof msg.content === 'string') {
          // Map 'ai' role from frontend to 'assistant' for Anthropic
          const role = msg.role === 'ai' ? 'assistant' : (msg.role === 'user' ? 'user' : null);
          if (role) {
            messages.push({ role, content: msg.content });
          }
        }
      }
    }

    // Always append the latest user message
    messages.push({ role: "user", content: message });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages as any,
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
