import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora",
  display: "swap",
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
    default: "BudAI — Framtiden för Digitalt Arbete",
    template: "%s · BudAI",
  },
  description:
    "BudAI är en avancerad AI-plattform som hjälper svenska företag och privatpersoner att spara tid, automatisera uppgifter, förbättra arbetsflöden och göra verksamheter mer effektiva. Utvecklarförhandsvisning av Stilledev.",
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
    title: "BudAI — Framtiden för Digitalt Arbete",
    description:
      "Avancerad AI-plattform för svenska företag och privatpersoner. Automatisera, analysera och accelerera ditt arbete.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BudAI — Framtiden för Digitalt Arbete",
    description:
      "Avancerad AI-plattform för svenska företag och privatpersoner. Automatisera, analysera och accelerera ditt arbete.",
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
    <html lang="sv" className={`${sora.variable} ${jetbrains.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased noise-overlay bg-background text-white">
        <Providers>{children}</Providers>
        <VercelAnalytics />
      </body>
    </html>
  );
}
