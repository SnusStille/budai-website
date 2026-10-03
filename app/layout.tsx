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
  inLanguage: ["en", "sv"],
  author: { "@type": "Organization", name: "Stilledev" },
  publisher: { "@type": "Organization", name: "Stilledev" },
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SEK",
    description: "Developer preview — free while in preview",
  },
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
    locale: "en_US",
    alternateLocale: ["sv_SE"],
    url: siteUrl,
    siteName: "BudAI",
    title: "BudAI — try the AI work assistant live",
    description:
      "The AI work assistant built in Sweden. Try the Playground instantly — no account needed. Developer preview by Stilledev.",
    // Social card is generated in app/opengraph-image.tsx from the same tokens
    // as the site, so it can never drift from the design.
  },
  twitter: {
    card: "summary_large_image",
    title: "BudAI — try the AI work assistant live",
    description:
      "Chat, draft, analyze and automate in Swedish and English. Live preview, no account needed.",
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
