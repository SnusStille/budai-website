/** The only legal pages that exist. Shared by the server route and the client view. */
export const LEGAL_SLUGS = ["privacy", "terms", "cookies", "gdpr", "data"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug);
}

export const LEGAL_TITLES: Record<LegalSlug, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  cookies: "Cookie Policy",
  gdpr: "GDPR",
  data: "How your data is handled",
};
