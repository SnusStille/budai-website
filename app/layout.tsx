import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import "./experience.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";
import "./v2.css";
import { canonicalPath, hasLanguageAlternate, SWEDISH_PATH } from "@/lib/lang";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");

// A7/F2: one @graph so crawlers see both a standalone Organization and the
// SoftwareApplication that references it. Public/og.png is the single social
// image for both og:image and twitter:image (no duplicate route).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: "BudAI",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "An intelligent AI workspace by Stilledev for Swedish and English work — conversations, analysis, editable drafts, memory controls, vision and voice.",
      url: siteUrl,
      author: { "@id": `${siteUrl}/#organization` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "SEK", description: "Developer preview" },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Stilledev",
      url: siteUrl,
      description: "Independent Swedish software and AI development brand building intelligent digital experiences, including BudAI.",
    },
  ],
};

// F1: localized titles/descriptions for metadata. Body copy is translated by
// LanguageContext; this covers the parts crawlers and social previews read.
const META = {
  en: {
    description:
      "Stilledev is an independent Swedish software and AI brand. Explore BudAI, an intelligent workspace for bilingual conversations, analysis, editable drafts, memory you control, vision and voice.",
    ogTitle: "Stilledev — Independent software & AI development",
    ogDescription:
      "Built in Sweden. Explore BudAI, a real AI workspace for Swedish and English work, with editable drafts, memory you control, vision and voice.",
  },
  sv: {
    description:
      "Stilledev är ett oberoende svenskt mjukvaru- och AI-varumärke. Utforska BudAI, en intelligent arbetsyta för tvåspråkiga samtal, analys, redigerbara utkast, minne du styr, bildförståelse och röst.",
    ogTitle: "Stilledev — Oberoende mjukvaru- och AI-utveckling",
    ogDescription:
      "Oberoende mjukvaru- och AI-utveckling i Sverige. Utforska BudAI för samtal på svenska och engelska, redigerbara utkast, minne du styr, bildförståelse och röst.",
  },
} as const;

/**
 * F1: metadata is generated per request from the language the middleware
 * resolved. The root layout already reads headers() for the CSP nonce, so this
 * does not change static/dynamic behaviour of any route.
 */
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const lang = sv ? "sv" : "en";
  const pathname = h.get("x-budai-path") || "/";
  const path = canonicalPath(pathname);
  const canonical = path === "/" ? siteUrl : `${siteUrl}${path}`;
  const copy = META[lang];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: sv ? "Stilledev — Oberoende mjukvaru- och AI-utveckling" : "Stilledev — Independent software & AI development",
      template: "%s — Stilledev",
    },
    description: copy.description,
    keywords: [
      "AI",
      "artificial intelligence",
      "Sweden",
      "Sverige",
      "business automation",
      "digital assistant",
      "Stilledev",
      "BudAI",
      "automatisering",
    ],
    authors: [{ name: "Stilledev" }],
    creator: "Stilledev",
    publisher: "Stilledev",
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: sv ? "sv_SE" : "en_US",
      alternateLocale: [sv ? "en_US" : "sv_SE"],
      url: canonical,
      siteName: "Stilledev",
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Stilledev — Independent software and AI development, creators of BudAI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: ["/og.png"],
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      canonical,
      // Only the homepage has a real reciprocal language pair. Pointing every
      // page at /sv would invent URLs that do not exist.
      ...(hasLanguageAlternate(pathname)
        ? { languages: { en: siteUrl, sv: `${siteUrl}${SWEDISH_PATH}`, "x-default": siteUrl } }
        : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#020205",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  // The middleware generates a fresh nonce per request (see lib/csp.ts).
  const nonce = h.get("x-nonce") ?? undefined;
  const lang = h.get("x-budai-lang") === "sv" ? "sv" : "en";
  return (
    <html
      lang={lang}
      className="font-sans"
      data-budai-intro="done"
      suppressHydrationWarning
    >
      <body className="antialiased noise-overlay bg-background text-white">
        <a
          href="#main"
          className="absolute left-3 top-3 z-[200] -translate-y-16 focus:translate-y-0 px-4 py-2 rounded-lg bg-accent-cyan text-black text-sm font-semibold transition-transform"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers initialLang={lang}>{children}</Providers>
        <VercelAnalytics enabled={process.env.VERCEL === "1"} />
      </body>
    </html>
  );
}
