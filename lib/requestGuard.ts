import type { NextRequest } from "next/server";

/**
 * Small shared guards for public API routes.
 * - clientIp: best-effort caller address behind proxies (Vercel/Next set x-forwarded-for).
 * - createRateLimiter: fixed-window counter per key that prunes expired entries,
 *   so the map cannot grow without bound on a long-lived server.
 * - readJsonObject: never throws on malformed bodies; always yields a plain object.
 *
 * Note: counters are per server instance. They stop casual abuse; for a hard
 * global quota keep using the database-backed limits in lib/limits.ts.
 */

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function createRateLimiter(limit: number, windowMs: number) {
  const counts = new Map<string, { count: number; resetAt: number }>();
  let lastPrune = 0;

  function prune(now: number) {
    if (counts.size < 2000 && now - lastPrune < windowMs) return;
    lastPrune = now;
    counts.forEach((v, k) => {
      if (now > v.resetAt) counts.delete(k);
    });
  }

  /** Returns true when the key is over its limit for the current window. */
  return function isLimited(key: string): boolean {
    const now = Date.now();
    prune(now);
    const entry = counts.get(key);
    if (!entry || now > entry.resetAt) {
      counts.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    if (entry.count >= limit) return true;
    entry.count += 1;
    return false;
  };
}

export async function readJsonObject<T extends Record<string, unknown>>(req: NextRequest): Promise<Partial<T>> {
  try {
    const parsed = (await req.json()) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Partial<T>) : {};
  } catch {
    return {};
  }
}
