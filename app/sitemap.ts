import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { en: siteUrl, sv: `${siteUrl}/sv` } },
    },
    {
      url: `${siteUrl}/sv`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: { en: siteUrl, sv: `${siteUrl}/sv` } },
    },
    {
      url: `${siteUrl}/legal/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/gdpr`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/legal/data`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/labs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: { en: `${siteUrl}/labs`, sv: `${siteUrl}/sv/labs` } },
    },
    {
      url: `${siteUrl}/sv/labs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: { languages: { en: `${siteUrl}/labs`, sv: `${siteUrl}/sv/labs` } },
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
      alternates: { languages: { en: `${siteUrl}/contact`, sv: `${siteUrl}/sv/contact` } },
    },
    {
      url: `${siteUrl}/sv/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: { languages: { en: `${siteUrl}/contact`, sv: `${siteUrl}/sv/contact` } },
    },
    {
      url: `${siteUrl}/changelog`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
