import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
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
    "Meet BudAI, an AI work assistant in early preview. Write, think, create, and move everyday work forward in Swedish and English. Built in Sweden by Stilledev.",
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
    title: "BudAI — AI work assistant in early preview",
    description:
      "Try BudAI’s interactive Playground. An AI work assistant in early preview, built in Sweden for Swedish and English workdays.",
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
    title: "BudAI — AI work assistant in early preview",
    description:
      "Try BudAI’s interactive Playground. An AI work assistant in early preview, built in Sweden for Swedish and English workdays.",
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
