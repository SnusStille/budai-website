import type { Metadata } from "next";
import ContactPageContent from "@/components/sections/ContactPageContent";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const title = "Contact Stilledev | Oliver Stille";
const description = "Contact Stilledev and founder Oliver Stille about BudAI, digital development, AI projects or collaboration. Email info@stilledev.se or send an enquiry.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: `${siteUrl}/contact`,
    languages: { en: `${siteUrl}/contact`, sv: `${siteUrl}/sv/contact`, "x-default": `${siteUrl}/contact` },
  },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: `${siteUrl}/contact`, siteName: "Stilledev", title, description, images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stilledev — contact" }], locale: "en_US" },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function ContactPage() { return <ContactPageContent />; }
