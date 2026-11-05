/**
 * Content-Security-Policy builder (audit point B5).
 *
 * Pure and unit-testable: the middleware generates a fresh per-request nonce
 * and passes it here. Next.js picks the nonce up from the *request* CSP header
 * and adds it to its own inline bootstrap/chunk scripts.
 *
 * Deliberate trade-offs:
 * - `style-src 'unsafe-inline'` is required by styled-jsx / Framer Motion.
 * - `img-src https:` allows provider-hosted generated images; `blob:`/`data:`
 *   are required by the Three.js experience and generated-image previews.
 * - `frame-ancestors` is intentionally omitted, matching the existing
 *   no-X-Frame-Options decision: the Arena/E2B preview embeds this site in a
 *   cross-origin iframe. Enable it on production once the embed is not needed.
 * - `upgrade-insecure-requests` is intentionally omitted so local HTTP
 *   previews and the e2e suite keep working.
 * - `strict-dynamic` lets nonce-trusted bootstraps load the Vercel Analytics
 *   script; the host is also allowlisted for CSP2 browsers.
 */
export function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-analytics.com https://va.vercel-scripts.com",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
}
