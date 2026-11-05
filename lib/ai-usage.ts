/**
 * Structured, PII-free usage logging for upstream AI calls (audit point B9).
 *
 * Only the token counts the provider actually reports are logged. No prices,
 * cost estimates, prompts, user ids or message contents are recorded — there
 * is no pricing data in the repo and inventing one would be misleading.
 */

export type AiUsageEvent = {
  event: "ai.usage";
  provider: "anthropic" | "openai";
  operation: "chat" | "image";
  model: string;
  tier: "guest" | "member" | "unknown";
  stream: boolean;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  ok: boolean;
  status?: number;
};

const MAX_VALUE = 10_000_000;

function safeInt(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
  return Math.min(MAX_VALUE, Math.max(0, n));
}

export function aiUsageEvent(
  input: Partial<AiUsageEvent> & Pick<AiUsageEvent, "provider" | "operation">
): AiUsageEvent {
  const tier = input.tier === "guest" || input.tier === "member" ? input.tier : "unknown";
  const event: AiUsageEvent = {
    event: "ai.usage",
    provider: input.provider,
    operation: input.operation,
    model: String(input.model || "unknown").slice(0, 80),
    tier,
    stream: input.stream === true,
    inputTokens: safeInt(input.inputTokens),
    outputTokens: safeInt(input.outputTokens),
    durationMs: safeInt(input.durationMs),
    ok: input.ok === true,
  };
  if (typeof input.status === "number") event.status = safeInt(input.status);
  return event;
}

export function logAiUsage(entry: AiUsageEvent): void {
  console.info("[budai:usage]", JSON.stringify(entry));
}
