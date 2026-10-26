import { NextResponse } from "next/server";
import { publicModelOptions } from "@/lib/ai-models";

/**
 * Public feature flags for the client.
 * Image generation is only "on" when OPENAI_API_KEY is present server-side.
 * Never expose the key — only a boolean.
 */
export async function GET() {
  const aiConfigured = Boolean(
    process.env.ANTHROPIC_API_KEY &&
      process.env.ANTHROPIC_API_KEY.trim().length >= 10 &&
      !process.env.ANTHROPIC_API_KEY.includes("your-")
  );
  const imageGen = Boolean(
    process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.trim().length > 8 &&
      !process.env.OPENAI_API_KEY.includes("your-")
  );
  return NextResponse.json(
    {
      aiConfigured,
      imageGeneration: imageGen,
      models: publicModelOptions(),
      vision: true, // Claude vision via ANTHROPIC when configured
      voice: true, // Web Speech (browser-dependent)
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
