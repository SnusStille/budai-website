import { timingSafeEqual, createHmac } from "crypto";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin authentication.
 *
 * Only ADMIN_PASSWORD is accepted. A NEXT_PUBLIC_* name must never be used for a
 * secret: Next.js inlines those values into the browser bundle.
 *
 * The browser never holds the password after login. Instead /api/admin/login sets
 * an httpOnly, SameSite=Strict cookie containing a stateless HMAC-derived session
 * token, which every /api/admin/* route verifies with a constant-time comparison.
 */
const secret = () => (process.env.ADMIN_PASSWORD || "").trim();

export const ADMIN_SESSION_COOKIE = "budai_admin_session";
const SESSION_PAYLOAD = "budai-admin-session-v1";
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours

export const adminConfigured = () => !!secret();

/** Stateless session token: derived from the secret, never equal to it. */
export function adminSessionToken(): string {
  const s = secret();
  return s ? createHmac("sha256", s).update(SESSION_PAYLOAD).digest("hex") : "";
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
} as const;

export const adminSessionMaxAge = SESSION_MAX_AGE;

export function passwordOk(got: string): boolean {
  const expected = secret();
  const g = (got || "").trim();
  if (!expected || !g) return false;
  const a = Buffer.from(g);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdmin(req: NextRequest): boolean {
  const expected = adminSessionToken();
  if (!expected) return false;
  const got = req.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX_FAILURES = 5;
const failures = new Map<string, { count: number; expires: number }>();

export function loginLocked(ip: string): boolean {
  const rec = failures.get(ip);
  if (!rec) return false;
  if (Date.now() >= rec.expires) {
    failures.delete(ip);
    return false;
  }
  return rec.count >= LOGIN_MAX_FAILURES;
}

export function noteLoginFailure(ip: string): void {
  const now = Date.now();
  const rec = failures.get(ip);
  if (!rec || now >= rec.expires) failures.set(ip, { count: 1, expires: now + LOGIN_WINDOW_MS });
  else {
    rec.count += 1;
    rec.expires = now + LOGIN_WINDOW_MS;
  }
  if (failures.size > 5_000) {
    for (const [key, value] of Array.from(failures.entries())) {
      if (now >= value.expires) failures.delete(key);
    }
  }
}

export function clearLoginFailures(ip: string): void {
  failures.delete(ip);
}

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key || url.includes("YOUR_PROJECT")) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
