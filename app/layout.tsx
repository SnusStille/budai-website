import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
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
    "AI work assistant for Swedish companies and individuals — write, automate, and think faster in Swedish and English.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se",
  author: { "@type": "Organization", name: "Stilledev" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "SEK", description: "Developer preview" },
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
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
      className={`${jakarta.variable} ${jetbrains.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="noise-overlay isolate bg-background text-white antialiased">
        <a
          href="#main-content"
          className="absolute left-3 top-3 z-[200] -translate-y-16 rounded-lg bg-accent-cyan px-4 py-2 text-sm font-semibold text-black transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <div className="site-world-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="relative z-10 min-h-screen">
          <Providers>{children}</Providers>
        </div>
        <VercelAnalytics />
      </body>
    </html>
  );
}
