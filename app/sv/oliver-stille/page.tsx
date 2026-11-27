import type { Metadata } from "next";
import FounderProfile from "@/components/sections/FounderProfile";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const canonical = `${siteUrl}/sv/oliver-stille`;
const title = "Oliver Stille — grundare av Stilledev";
const description = "Oliver Stille grundade Stilledev, en svensk mjukvarustudio med fokus på digital utveckling och AI. Lär känna studion och BudAI.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  authors: [{ name: "Oliver Stille", url: canonical }],
  creator: "Oliver Stille · Stilledev",
  alternates: {
    canonical,
    languages: { en: `${siteUrl}/oliver-stille`, sv: canonical, "x-default": `${siteUrl}/oliver-stille` },
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: canonical,
    siteName: "Stilledev",
    title,
    description,
    images: [{ url: "/stilledev-social.png", width: 1200, height: 630, alt: "Stilledev — grundat av Oliver Stille" }],
    locale: "sv_SE",
    alternateLocale: ["en_US"],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/stilledev-social.png"] },
  keywords: ["Oliver Stille", "Stilledev", "grundare", "svensk mjukvarustudio", "digital utveckling", "AI"],
};

export default function OliverStillePageSv() {
  return <FounderProfile sv />;
}
