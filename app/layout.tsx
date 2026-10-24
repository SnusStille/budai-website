import type { Metadata, Viewport } from "next";
// Typefaces are self-hosted from Fontsource packages (OFL-1.1): no third-party font
// request, no CLS, and the production build works without access to fonts.googleapis.com.
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/plus-jakarta-sans/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "./globals.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Stilledev",
  alternateName: "STILLEDEV",
  url: siteUrl,
  description:
    "Stilledev is a one-person creative technology studio in Stockholm, Sweden, building AI products and cinematic web interfaces.",
  email: "Stilleinc@hotmail.com",
  foundingLocation: { "@type": "Place", name: "Stockholm, Sweden" },
  sameAs: ["https://github.com/SnusStille"],
};

const productLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BudAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI work assistant for Swedish companies and individuals — write, automate, and think faster in Swedish and English.",
  url: `${siteUrl}/budai`,
  author: { "@type": "Organization", name: "Stilledev" },
  publisher: { "@type": "Organization", name: "Stilledev" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SEK",
    description: "Developer preview",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "STILLEDEV — software, directed",
    template: "%s · STILLEDEV",
  },
  description:
    "STILLEDEV is a Stockholm studio building AI products, automation and cinematic web interfaces — most visibly BudAI, an AI work assistant for Sweden and the Nordics.",
  keywords: [
    "Stilledev",
    "STILLEDEV",
    "AI studio Stockholm",
    "creative developer",
    "web development Sweden",
    "AI integration",
    "automatisering",
    "BudAI",
    "artificial intelligence",
    "Sverige",
    "React",
    "Next.js",
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
    siteName: "STILLEDEV",
    title: "STILLEDEV — software, directed",
    description:
      "AI products, automation and cinematic web interfaces, built in Stockholm. BudAI — an AI work assistant for Sweden and the Nordics — is live now.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "BudAI by Stilledev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STILLEDEV — software, directed",
    description:
      "AI products, automation and cinematic web interfaces from Stockholm. Try BudAI live.",
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
  themeColor: "#02050c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <body className="antialiased noise-overlay bg-background text-white">
        <a
          href="#main"
          className="absolute left-3 top-3 z-[200] -translate-y-16 focus:translate-y-0 px-4 py-2 rounded-lg bg-studio-signal text-black text-sm font-semibold transition-transform"
        >
          Skip to content to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([orgLd, productLd]) }}
        />
        <Providers>{children}</Providers>
        <VercelAnalytics />
      </body>
    </html>
  );
}
