import { randomUUID } from "node:crypto";

/**
 * Structured, PII-free server logging (audit point B9).
 *
 * One JSON line per event so logs can be searched and correlated by requestId.
 * Only scalars are accepted and strings are bounded: no prompts, message
 * bodies, emails, tokens, IP addresses or API keys are ever logged. An external
 * error tracker (Sentry etc.) is still an open product/infra decision.
 */
export type LogLevel = "info" | "warn" | "error";
export type LogFields = Record<string, string | number | boolean | null | undefined>;

const MAX_STRING = 240;

export function logEvent(level: LogLevel, scope: string, fields: LogFields = {}): void {
  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    scope,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string") entry[key] = value.slice(0, MAX_STRING);
    else if (typeof value === "number") entry[key] = Number.isFinite(value) ? value : 0;
    else if (typeof value === "boolean") entry[key] = value;
  }
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

/** Short, non-reversible correlation id — never derived from user data. */
export function newRequestId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message.slice(0, MAX_STRING);
  return String(err).slice(0, MAX_STRING);
}
