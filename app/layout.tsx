import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BudAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Try BudAI live in your browser — the AI work assistant built in Sweden. Write, plan, analyze and automate in Swedish and English, then join the waitlist for early access.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se",
  author: { "@type": "Organization", name: "Stilledev" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "SEK", description: "Developer preview" },
};

/* Self-hosted variable fonts (SIL OFL — see app/fonts/LICENSE-*.txt).
   Local files keep the build deterministic: no Google Fonts fetch at build time. */
const jakarta = localFont({
  src: [{ path: "./fonts/plus-jakarta-sans-latin.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-jakarta",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const jetbrains = localFont({
  src: [{ path: "./fonts/jetbrains-mono-latin.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-jetbrains",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BudAI — try the AI work assistant | Stilledev",
    template: "%s · BudAI",
  },
  description:
    "Testa BudAI direkt i webbläsaren — AI-arbetsassistenten byggd i Sverige. Skriv, planera, analysera och automatisera på svenska och engelska. Utvecklarförhandsvisning av Stilledev.",
  keywords: [
    "BudAI",
    "AI playground",
    "AI assistant",
    "AI-assistent",
    "artificial intelligence",
    "Sweden",
    "Sverige",
    "business automation",
    "automatisering",
    "Stilledev",
  ],
  authors: [{ name: "Stilledev" }],
  creator: "Stilledev",
  publisher: "Stilledev",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "BudAI",
    title: "BudAI — testa AI-assistenten direkt",
    description:
      "AI-arbetsassistent för svenska företag och privatpersoner. Testa Playground live — skriv, automatisera och tänk snabbare på SV & EN.",
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
    title: "BudAI — testa AI-assistenten direkt",
    description:
      "AI-arbetsassistent byggd i Sverige. Testa Playground live — skriv, automatisera och tänk snabbare på SV & EN.",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
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
      className={`${jakarta.variable} ${jetbrains.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="antialiased noise-overlay bg-background text-white">
        <a
          href="#playground"
          className="absolute left-3 top-3 z-[200] -translate-y-16 focus:translate-y-0 px-4 py-2 rounded-lg bg-accent-cyan text-black text-sm font-semibold transition-transform"
        >
          Skip to content
        </a>
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
