/**
 * Environment-aware site / auth URLs.
 * Never hardcode localhost for production redirects.
 *
 * Priority for canonical site URL (server):
 * 1. NEXT_PUBLIC_SITE_URL
 * 2. VERCEL_URL (https)
 * 3. https://stilledev.se
 *
 * Client auth redirects always prefer window.location.origin
 * so local dev stays on localhost and prod stays on stilledev.se.
 */

export const PRODUCTION_HOST = "stilledev.se";
export const PRODUCTION_URL = "https://stilledev.se";

/** Canonical public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes("YOUR_") && fromEnv.startsWith("http")) {
    return fromEnv;
  }
  const vercel = (process.env.VERCEL_URL || "").trim().replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }
  // Server-side fallback — production brand domain
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_URL;
  }
  return "http://localhost:3000";
}

/**
 * Browser origin for auth redirects (client only).
 * Falls back to getSiteUrl() during SSR.
 */
export function getBrowserOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return getSiteUrl();
}

/** Full OAuth / magic-link callback URL for the current environment. */
export function getAuthCallbackUrl(nextPath = "/#playground"): string {
  const origin = getBrowserOrigin();
  const next = encodeURIComponent(nextPath.startsWith("/") ? nextPath : "/#playground");
  return `${origin}/auth/callback?next=${next}`;
}

/**
 * Supabase only accepts redirect URLs on its allowlist.
 * If emailRedirectTo is rejected, Supabase falls back to Dashboard "Site URL"
 * (often still localhost) — that is the production magic-link bug.
 *
 * Allowlist that MUST exist in Supabase → Authentication → URL Configuration:
 * - Site URL: https://stilledev.se
 * - Redirect URLs:
 *   https://stilledev.se/**
 *   https://stilledev.se/auth/callback
 *   http://localhost:3000/**
 *   http://localhost:3000/auth/callback
 */

export const REQUIRED_SUPABASE_REDIRECTS = [
  "https://stilledev.se",
  "https://stilledev.se/**",
  "https://stilledev.se/auth/callback",
  "https://www.stilledev.se/**",
  "https://www.stilledev.se/auth/callback",
  "http://localhost:3000/**",
  "http://localhost:3000/auth/callback",
] as const;
