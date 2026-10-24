import { NextResponse } from "next/server";

// Env-driven flags must be read per request, not frozen into the build output.
// The Cache-Control header below still lets the CDN serve a short-lived copy.
export const dynamic = "force-dynamic";

/**
 * Public feature flags for the client.
 * Image generation is only "on" when OPENAI_API_KEY is present server-side.
 * Never expose the key — only a boolean.
 */
function configured(name: string): boolean {
  const v = (process.env[name] || "").trim();
  return v.length > 0 && !v.includes("your-");
}

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
      // Which playground model tiers the server can actually serve.
      // Tiers are env-driven (ANTHROPIC_MODEL / _FAST / _DEEP); no model names
      // or keys are ever sent to the browser.
      models: {
        default: "quality",
        available: {
          fast: configured("ANTHROPIC_MODEL_FAST"),
          quality: true,
          deep: configured("ANTHROPIC_MODEL_DEEP"),
        },
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
