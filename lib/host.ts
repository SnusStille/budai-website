/**
 * Duplicate-domain guard (audit point A5).
 *
 * The canonical host is https://stilledev.se. Vercel's automatic
 * `<project>.vercel.app` domain serves the same content, which used to be
 * indexed as a duplicate. We noindex that host rather than 301-redirecting it,
 * so preview deployments keep working. A production 301 decision is still open.
 */
export const CANONICAL_HOST = "stilledev.se";

export function isNonCanonicalHost(hostname: string): boolean {
  const host = hostname
    .toLowerCase()
    .trim()
    .replace(/\.$/, "")
    .split(":")[0];
  if (!host || host === "localhost" || host === "127.0.0.1" || host === "[::1]") return false;
  return host.endsWith(".vercel.app");
}
