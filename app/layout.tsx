import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import "./experience.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";
import { introBootstrap } from "@/lib/experience/intro";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

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
      description: "Independent software studio in Sweden building BudAI.",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stilledev.se · BudAI",
    template: "%s · BudAI",
  },
  description:
    "BudAI by Stilledev — AI workspace built in Sweden for real work in Swedish and English. Write, automate, analyze, and turn messy context into clear action with memory you control.",
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
    locale: "en_US",
    alternateLocale: ["sv_SE"],
    url: siteUrl,
    siteName: "BudAI",
    title: "BudAI — AI Workspace for Swedish & English Work",
    description:
      "Built in Sweden by Stilledev. Write, analyze, plan, and automate in Swedish and English with a live Playground and memory you control.",
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
    title: "BudAI — AI Workspace for Swedish & English Work",
    description:
      "Built in Sweden by Stilledev. Write, analyze, plan, and automate in Swedish and English with a live Playground and memory you control.",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#020205",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The middleware generates a fresh nonce per request (see lib/csp.ts).
  const nonce = headers().get("x-nonce") ?? undefined;
  return (
    <html
      lang="en"
      className="font-sans"
      suppressHydrationWarning
    >
      <head>
        <script id="budai-intro-policy" nonce={nonce} dangerouslySetInnerHTML={{ __html: introBootstrap }} />
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
        <Providers>{children}</Providers>
        <VercelAnalytics enabled={process.env.VERCEL === "1"} />
      </body>
    </html>
  );
}
