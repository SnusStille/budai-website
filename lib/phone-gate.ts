/** Device presentation rule, not an authentication or security boundary. */
export function isPhoneUserAgent(userAgent: string): boolean {
  // Keep indexers and unfurlers on the normal, indexable desktop content.
  if (/bot|crawler|spider|slurp|facebookexternalhit|bingpreview/i.test(userAgent)) return false;
  // Tablets and narrow desktop windows are intentionally not classified as phones.
  return /iphone|ipod|windows phone|android.*mobile/i.test(userAgent);
}
