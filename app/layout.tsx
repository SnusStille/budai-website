import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "BudAI",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI work assistant for Swedish companies and individuals — write, automate, and think faster in Swedish and English.",
      url: siteUrl,
      inLanguage: ["sv-SE", "en"],
      author: { "@type": "Organization", name: "Stilledev", url: siteUrl },
      publisher: { "@type": "Organization", name: "Stilledev", url: siteUrl },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "SEK",
        description: "Developer preview — free to try",
      },
    },
    {
      "@type": "Organization",
      name: "Stilledev",
      url: siteUrl,
      description:
        "Stilledev builds BudAI — an AI work assistant for Sweden and the Nordics.",
    },
  ],
};

/**
 * Fonts are self-hosted (SIL Open Font License — see app/fonts/LICENSE-*).
 * Benefits: no third-party font requests, deterministic builds, faster first paint.
 * Same typefaces as before: Plus Jakarta Sans (UI) + JetBrains Mono (code).
 */
const jakarta = localFont({
  src: [
    { path: "./fonts/PlusJakartaSans-latin.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/PlusJakartaSans-latin-ext.woff2", weight: "200 800", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

const jetbrains = localFont({
  src: [
    { path: "./fonts/JetBrainsMono-latin.woff2", weight: "100 800", style: "normal" },
    { path: "./fonts/JetBrainsMono-latin-ext.woff2", weight: "100 800", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Stilledev.se · BudAI",
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
  category: "productivity",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    alternateLocale: ["en_US"],
    url: siteUrl,
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
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/apple-icon.png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "sv-SE": siteUrl,
      en: siteUrl,
    },
  },
  applicationName: "BudAI",
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
      className={`${jakarta.variable} ${jetbrains.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="antialiased noise-overlay bg-background text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
        <VercelAnalytics />
      </body>
    </html>
  );
}
