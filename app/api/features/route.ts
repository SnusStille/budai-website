import { NextResponse } from "next/server";
import { availableModels } from "@/lib/playground/models";

/**
 * Must be evaluated per request: these flags are read from runtime env, and a prerendered
 * snapshot would freeze them at build time (which is exactly what happened before — the
 * route was statically generated, so adding a key or a model tier in the deploy settings
 * changed nothing until the next build). Same convention as /api/health.
 */
export const dynamic = "force-dynamic";

/**
 * Public feature flags for the client.
 * Image generation is only "on" when OPENAI_API_KEY is present server-side.
 * Never expose the key — only a boolean.
 */
export async function GET() {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("your-"));
  const imageGen = Boolean(
    process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY.trim().length > 8 &&
      !process.env.OPENAI_API_KEY.includes("your-")
  );
  return NextResponse.json(
    {
      // Public, cacheable, and honest: anything claimed here must be true of this deployment.
      chat: hasAnthropic,
      imageGeneration: imageGen,
      vision: hasAnthropic, // Claude vision needs the same key
      voice: true, // browser Web Speech, independent of the server
      // only models this deployment can actually serve — the UI hides the picker when there is one
      models: availableModels(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
