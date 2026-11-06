import Home from "../page";

/**
 * F1: the crawlable Swedish entry point. The middleware sets `x-budai-lang=sv`
 * for this path, so the root layout emits <html lang="sv">, Swedish metadata
 * and hreflang, and Providers hydrates in Swedish. The homepage itself is
 * reused verbatim — no duplicated sections or divergent copy.
 */
export default function SwedishHome() {
  return <Home />;
}
