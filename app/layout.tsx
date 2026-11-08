import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import "./experience.css";
import "./phone-welcome.css";
import "./mascot.css";
import "./companion.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";
import { introBootstrap } from "@/lib/experience/intro";
import { canonicalPath, hasLanguageAlternate, SWEDISH_PATH } from "@/lib/lang";
import { isPhoneUserAgent } from "@/lib/phone-gate";
import PhoneWelcome from "@/components/sections/PhoneWelcome";
import MobileProviders from "@/components/MobileProviders";

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
        "AI work assistant for Swedish companies and individuals — write, automate, and think faster in Swedish and English.",
      url: siteUrl,
      author: { "@id": `${siteUrl}/#organization` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "SEK", description: "Developer preview" },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Stilledev",
      url: siteUrl,
      founder: {
        "@type": "Person",
        name: "Oliver Stille",
      },
      description: "Independent software studio in Sweden founded by Oliver Stille, building BudAI and digital AI products.",
    },
  ],
};

// F1: localized titles/descriptions for metadata. Body copy is translated by
// LanguageContext; this covers the parts crawlers and social previews read.
const META = {
  en: {
    description:
      "BudAI by Stilledev — AI workspace built in Sweden for real work in Swedish and English. Write, automate, analyze, and turn messy context into clear action with memory you control.",
    ogTitle: "BudAI — AI Workspace for Swedish & English Work",
    ogDescription:
      "Built in Sweden by Stilledev. Write, analyze, plan, and automate in Swedish and English with a live Playground and memory you control.",
  },
  sv: {
    description:
      "BudAI av Stilledev — AI-arbetsyta byggd i Sverige för riktigt arbete på svenska och engelska. Skriv, automatisera, analysera och gör rörig kontext till tydlig handling med minne du styr.",
    ogTitle: "BudAI — AI-arbetsyta för arbete på svenska och engelska",
    ogDescription:
      "Byggd i Sverige av Stilledev. Skriv, analysera, planera och automatisera på svenska och engelska med live Playground och minne du styr.",
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
      default: "Stilledev.se · BudAI",
      template: "%s · BudAI",
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
      siteName: "BudAI",
      title: copy.ogTitle,
      description: copy.ogDescription,
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
  const phoneGate = isPhoneUserAgent(h.get("user-agent") || "");
  const path = canonicalPath(h.get("x-budai-path") || "/");
  // Policies remain reachable, but no desktop marketing pages are shown on phones.
  const phoneLegalPage = path.startsWith("/legal/");
  return (
    <html
      lang={lang}
      className="font-sans"
      suppressHydrationWarning
    >
      <head>
        {!phoneGate && <script id="budai-intro-policy" nonce={nonce} dangerouslySetInnerHTML={{ __html: introBootstrap }} />}
      </head>
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
        {phoneGate ? <MobileProviders initialLang={lang}>{phoneLegalPage ? children : <PhoneWelcome normalizeLanguagePath />}</MobileProviders> : <Providers initialLang={lang}>{children}</Providers>}
        <VercelAnalytics enabled={process.env.VERCEL === "1"} />
      </body>
    </html>
  );
}
