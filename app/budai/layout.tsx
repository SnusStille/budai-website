import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";
// NOTE: the BudAI SoftwareApplication JSON-LD is emitted once in the root layout
// (it also documents the studio as an Organization) — no duplicate here.

/**
 * The product page keeps the exact SEO identity it had while it was the site root:
 * same title, description, keyword set, Swedish-first Open Graph card and the
 * SoftwareApplication structured data — only the canonical moved to /budai.
 */
export const metadata: Metadata = {
  title: {
    // `absolute` so the root layout's "%s · STILLEDEV" template does not append the studio brand
    absolute: "Stilledev.se · BudAI",
    template: "%s · BudAI",
  },
  description:
    "BudAI är AI-arbetsassistenten för Sverige — skriv, automatisera och tänk snabbare på svenska och engelska. Utvecklarförhandsvisning av Stilledev.",
  keywords: [
    "AI",
    "artificial intelligence",
    "Sweden",
    "Sverige",
    "business automation",
    "digital assistant",
    "Stilledev",
    "BudAI",
    "enterprise AI",
    "automatisering",
  ],
  authors: [{ name: "Stilledev" }],
  creator: "Stilledev",
  publisher: "Stilledev",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    alternateLocale: ["en_US"],
    url: `${siteUrl}/budai`,
    siteName: "BudAI",
    title: "BudAI — AI-arbete för Sverige",
    description:
      "AI-arbetsassistent för svenska företag och privatpersoner. Skriv, automatisera och tänk snabbare — SV & EN.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "BudAI — AI work for Sweden",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BudAI — AI-arbete för Sverige",
    description:
      "AI-arbetsassistent för svenska företag och privatpersoner. Skriv, automatisera och tänk snabbare — SV & EN.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: `${siteUrl}/budai`,
  },
};

export default function BudAILayout({ children }: { children: React.ReactNode }) {
  return children;
}
