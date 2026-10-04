import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import INTRO_SCRIPT from "@/components/effects/introScript";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BudAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "BudAI is an AI work assistant in early preview, built in Sweden to help people write, think, create, and move everyday work forward in Swedish and English.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se",
  author: { "@type": "Organization", name: "Stilledev" },
  releaseNotes: "Early product preview; features are still in development.",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BudAI — AI work assistant in early preview",
    template: "%s · BudAI",
  },
  description:
    "Meet BudAI, an AI work assistant in early preview. Try the live Playground — streaming answers in Swedish and English, no account needed. Built in Sweden by Stilledev.",
  keywords: [
    "AI",
    "artificial intelligence",
    "Sweden",
    "Sverige",
    "work productivity",
    "AI writing assistant",
    "Swedish language AI",
    "English language AI",
    "workflow planning",
    "Stilledev",
    "BudAI",
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
    title: "BudAI — the Playground is live",
    description:
      "Try BudAI right now: an AI work assistant for Swedish and English workdays. Early preview, built in Sweden — join the waitlist for 10% off at launch.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BudAI — the Playground is live",
    description:
      "Try BudAI right now: an AI work assistant for Swedish and English workdays. Early preview, built in Sweden — join the waitlist for 10% off at launch.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#080a0f",
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
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
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
