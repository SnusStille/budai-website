import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const pair = (en: string, sv: string) => ({ languages: { en, sv, "x-default": en } });

/** Only canonical, indexable pages are listed. No synthetic lastModified dates:
 * static pages do not pretend to change on every sitemap request. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1, alternates: pair(siteUrl, `${siteUrl}/sv`) },
    { url: `${siteUrl}/sv`, changeFrequency: "weekly", priority: 0.9, alternates: pair(siteUrl, `${siteUrl}/sv`) },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.5, alternates: pair(`${siteUrl}/contact`, `${siteUrl}/sv/contact`) },
    { url: `${siteUrl}/sv/contact`, changeFrequency: "yearly", priority: 0.4, alternates: pair(`${siteUrl}/contact`, `${siteUrl}/sv/contact`) },
    { url: `${siteUrl}/changelog`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/legal/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/cookies`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/gdpr`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/data`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
