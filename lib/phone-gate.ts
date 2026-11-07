/** Presentation preference, not an access-control or security boundary. */
export function isCanonicalPhone(hostHeader: string, userAgent: string): boolean {
  const host = hostHeader.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  if (host !== "stilledev.se" && host !== "www.stilledev.se") return false;
  // Let search engines and link-preview crawlers see the normal, indexable site.
  if (/bot|crawler|spider|slurp|facebookexternalhit|bingpreview/i.test(userAgent)) return false;
  // Deliberately excludes tablets and narrow desktop windows.
  return /iphone|ipod|windows phone|android.*mobile/i.test(userAgent);
}
