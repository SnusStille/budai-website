import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import "./experience.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";
import { introBootstrap } from "@/lib/experience/intro";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BudAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI work assistant for Swedish companies and individuals — write, automate, and think faster in Swedish and English.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se",
  author: { "@type": "Organization", name: "Stilledev" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "SEK", description: "Developer preview" },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stilledev.se · BudAI",
    template: "%s · BudAI",
  },
  description:
    "BudAI by Stilledev — AI workspace built in Sweden for real work in Swedish and English. Write, automate, analyze, and turn messy context into clear action with user-controlled memory.",
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
    locale: "en_US",
    alternateLocale: ["sv_SE"],
    url: siteUrl,
    siteName: "BudAI",
    title: "BudAI — AI Workspace for Swedish & English Work",
    description:
      "Built in Sweden by Stilledev. Write, analyze, plan, and automate in Swedish and English with a live Playground and user-controlled memory.",
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
      "Built in Sweden by Stilledev. Write, analyze, plan, and automate in Swedish and English with a live Playground and user-controlled memory.",
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
  return (
    <html
      lang="en"
      className="font-sans"
      suppressHydrationWarning
    >
      <head>
        <script id="budai-intro-policy" dangerouslySetInnerHTML={{ __html: introBootstrap }} />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
        <VercelAnalytics enabled={process.env.VERCEL === "1"} />
      </body>
    </html>
  );
}
