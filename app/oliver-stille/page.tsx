import type { Metadata } from "next";
import FounderProfile from "@/components/sections/FounderProfile";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const canonical = `${siteUrl}/oliver-stille`;
const title = "Oliver Stille — Founder of Stilledev";
const description = "Oliver Stille is the founder of Stilledev, a Swedish software studio focused on digital development and AI. Discover the studio and BudAI.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  authors: [{ name: "Oliver Stille", url: canonical }],
  creator: "Oliver Stille · Stilledev",
  alternates: {
    canonical,
    languages: { en: canonical, sv: `${siteUrl}/sv/oliver-stille`, "x-default": canonical },
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: canonical,
    siteName: "Stilledev",
    title,
    description,
    images: [{ url: "/stilledev-social.png", width: 1200, height: 630, alt: "Stilledev — founded by Oliver Stille" }],
    locale: "en_US",
    alternateLocale: ["sv_SE"],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/stilledev-social.png"] },
  keywords: ["Oliver Stille", "Stilledev", "Founder", "Swedish software studio", "digital development", "AI"],
};

export default function OliverStillePage() {
  return <FounderProfile />;
}
