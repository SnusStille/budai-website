import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }> = [
    { path: "/budai", priority: 0.9, changeFrequency: "weekly" },
    { path: "/labs", priority: 0.6, changeFrequency: "monthly" },
    { path: "/roadmap", priority: 0.7, changeFrequency: "monthly" },
    { path: "/knowledge", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "yearly" },
    { path: "/feedback", priority: 0.4, changeFrequency: "yearly" },
    { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
    { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/cookies", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/gdpr", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/data", priority: 0.4, changeFrequency: "yearly" },
  ];
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
    ...pages.map((page) => ({
      url: `${siteUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  ];
}
