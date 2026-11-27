import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Keep the admin path crawlable only so crawlers can receive its explicit
    // noindex response header; authentication remains the security boundary.
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
