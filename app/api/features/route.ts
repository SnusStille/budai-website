import { NextResponse } from "next/server";

/**
 * Public feature flags for the client.
 * Image generation is only "on" when OPENAI_API_KEY is present server-side.
 * Never expose the key — only a boolean.
 */
export async function GET() {
  const imageGen = Boolean(
    process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.trim().length > 8 &&
      !process.env.OPENAI_API_KEY.includes("your-")
  );
  return NextResponse.json(
    {
      imageGeneration: imageGen,
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
