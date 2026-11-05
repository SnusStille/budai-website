import { createHash } from "crypto";
import type { NextRequest } from "next/server";

/**
 * One shared, in-memory fixed-window limiter for all API routes.
 *
 * Scope caveat (important): the map lives in a single Node.js process. On a
 * serverless platform each instance has its own map, so this reliably stops
 * bursts against one instance but is NOT a global quota. A durable, shared
 * counter (Supabase RPC or Upstash) is still needed for a hard cap — see B1 in
 * docs/audit/audit-2026-11.md.
 */

export type RateLimitRule = { name: string; limit: number; windowMs: number };

export const RULES: Record<string, RateLimitRule> = {
  playground: { name: "playground", limit: 60, windowMs: 60 * 60_000 },
  feedback: { name: "feedback", limit: 15, windowMs: 60 * 60_000 },
  share: { name: "share", limit: 20, windowMs: 60 * 60_000 },
  waitlist: { name: "waitlist", limit: 8, windowMs: 60 * 60_000 },
};

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

/**
 * Prefer the platform-set header; only trust the FIRST forwarded hop and bound
 * the string so a spoofed header cannot become an unbounded map key.
 */
export function clientIp(req: NextRequest): string {
  const raw =
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return (raw.split(",")[0] || "unknown").trim().slice(0, 64).toLowerCase() || "unknown";
}

/** Hashed key: raw IP addresses are never kept in the limiter map. */
export function rateLimitKey(req: NextRequest, rule: RateLimitRule, scope = ""): string {
  return createHash("sha256")
    .update(`${rule.name}|${clientIp(req)}|${scope.slice(0, 128)}`)
    .digest("hex");
}

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, bucket] of Array.from(buckets.entries())) {
      if (now >= bucket.resetAt) buckets.delete(k);
    }
  }
  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { limited: false, remaining: rule.limit - 1, retryAfterSeconds: 0 };
  }
  if (entry.count >= rule.limit) {
    return { limited: true, remaining: 0, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { limited: false, remaining: Math.max(0, rule.limit - entry.count), retryAfterSeconds: 0 };
}
