import type { Metadata } from "next";
import ContactPageContent from "@/components/sections/ContactPageContent";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const title = "Kontakt Stilledev | Oliver Stille";
const description = "Kontakta Stilledev och grundaren Oliver Stille om BudAI, digital utveckling, AI-projekt eller samarbeten. Mejla info@stilledev.se eller skicka en förfrågan.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteUrl}/sv/contact`,
    languages: { en: `${siteUrl}/contact`, sv: `${siteUrl}/sv/contact`, "x-default": `${siteUrl}/contact` },
  },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: `${siteUrl}/sv/contact`, siteName: "Stilledev", title, description, images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stilledev — kontakt" }], locale: "sv_SE" },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function ContactPageSv() { return <ContactPageContent sv />; }
