import type { Lang } from "@/lib/i18n";

/** Functional, non-tracking cookie that mirrors the localStorage language choice. */
export const LANG_COOKIE = "budai-lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const SWEDISH_PATH = "/sv";

/**
 * Server-side language resolution (F1). `/sv` is the crawlable Swedish entry
 * point; otherwise an explicit language cookie wins. A crawler without a cookie
 * always gets English on `/`, so both variants have a distinct, stable URL.
 */
export function resolveLang(pathname: string, cookieValue?: string | null): Lang {
  if (pathname === SWEDISH_PATH || pathname.startsWith(`${SWEDISH_PATH}/`)) return "sv";
  return cookieValue === "sv" ? "sv" : "en";
}

/** Canonical path for the current request, without a trailing slash. */
export function canonicalPath(pathname: string): string {
  if (pathname === SWEDISH_PATH) return SWEDISH_PATH;
  const clean = pathname.replace(/\/+$/, "");
  return clean || "/";
}

/** Only the homepage has a real language pair. Never invent /sv/... URLs for
 *  routes that do not exist — hreflang must point at real, reciprocal pages. */
export function hasLanguageAlternate(pathname: string): boolean {
  return pathname === "/" || pathname === SWEDISH_PATH;
}
