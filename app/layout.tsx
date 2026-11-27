import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import "./experience.css";
import "./contact.css";
import "./feedback.css";
import "./ambient-depth.css";
import "./showcase.css";
import "./founder-profile.css";
import "./page-chrome.css";
import "./home-surprises.css";
import "./faq.css";
import "./phone-welcome.css";
import Providers from "@/components/Providers";
import VercelAnalytics from "@/components/VercelAnalytics";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import { serviceClient } from "@/lib/supabase/service";
import SiteConfigBanner from "@/components/site/SiteConfigBanner";
import { introBootstrap } from "@/lib/experience/intro";
import { canonicalPath, hasLanguageAlternate, SWEDISH_PATH } from "@/lib/lang";
import { isPhoneUserAgent } from "@/lib/phone-gate";
import PhoneWelcome from "@/components/sections/PhoneWelcome";
import MobileProviders from "@/components/MobileProviders";
import { CONTACT_EMAIL } from "@/lib/contact";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se").replace(/\/$/, "");
const websiteId = `${siteUrl}/#website`;
const organizationId = `${siteUrl}/#organization`;
const personId = `${siteUrl}/#person`;
const founderUrl = `${siteUrl}/oliver-stille`;
const stilledevLogoUrl = `${siteUrl}/stilledev-mark-512.png`;

// One stable entity graph: company, person, website and the actual product.
// Public links in sameAs are limited to the GitHub and LinkedIn profiles already
// linked from Stilledev's own public footer.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: "Stilledev",
      url: siteUrl,
      publisher: { "@id": organizationId },
      inLanguage: ["en", "sv"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: "BudAI",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI work assistant for Swedish companies and individuals — write, automate, and think faster in Swedish and English.",
      url: siteUrl,
      author: { "@id": organizationId },
      offers: { "@type": "Offer", price: "0", priceCurrency: "SEK", description: "Developer preview" },
    },
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "Stilledev",
      url: siteUrl,
      email: CONTACT_EMAIL,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: stilledevLogoUrl,
        contentUrl: stilledevLogoUrl,
        width: 512,
        height: 512,
      },
      founder: { "@id": personId },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "business enquiries",
        email: CONTACT_EMAIL,
        availableLanguage: ["Swedish", "English"],
      },
      description: "Independent software studio in Sweden founded by Oliver Stille, building BudAI and digital AI products.",
    },
    {
      "@type": "Person",
      "@id": personId,
      name: "Oliver Stille",
      url: founderUrl,
      mainEntityOfPage: founderUrl,
      jobTitle: "Founder of Stilledev",
      description: "Oliver Stille founded Stilledev and works in digital development and AI.",
      worksFor: { "@id": organizationId },
      sameAs: [
        "https://github.com/SnusStille",
        "https://www.linkedin.com/in/oliver-stille-8bb48a403/",
      ],
    },
  ],
};

// F1: localized titles/descriptions for metadata. Body copy is translated by
// LanguageContext; this covers the parts crawlers and social previews read.
const META = {
  en: {
    description:
      "Stilledev is a Swedish software studio founded by Oliver Stille. Explore independent digital products and applied AI built in Sweden, including BudAI.",
    ogTitle: "Stilledev — BudAI by Oliver Stille",
    ogDescription:
      "A Swedish software studio founded by Oliver Stille, building independent digital products and applied AI.",
  },
  sv: {
    description:
      "Stilledev är en svensk mjukvarustudio grundad av Oliver Stille. Utforska fristående digitala produkter och tillämpad AI utvecklade i Sverige, bland annat BudAI.",
    ogTitle: "Stilledev — BudAI av Oliver Stille",
    ogDescription:
      "En svensk mjukvarustudio grundad av Oliver Stille som utvecklar fristående digitala produkter och tillämpad AI.",
  },
} as const;

/**
 * F1: metadata is generated per request from the language the middleware
 * resolved. The root layout already reads headers() for the CSP nonce, so this
 * does not change static/dynamic behaviour of any route.
 */
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const sv = h.get("x-budai-lang") === "sv";
  const lang = sv ? "sv" : "en";
  const pathname = h.get("x-budai-path") || "/";
  const path = canonicalPath(pathname);
  const canonical = path === "/" ? siteUrl : `${siteUrl}${path}`;
  const copy = META[lang];
  // Admin SEO overrides (Admin -> Website & Content) win over code defaults when set.
  // Fail-safe: any DB problem falls back to the defaults above; rendering never depends on it.
  let seoTitle = "", seoDescription = "", seoImage = "";
  try {
    const sb = serviceClient();
    if (sb) {
      const timeout = new Promise<null>((r) => setTimeout(() => r(null), 900));
      const query = sb.from("site_settings").select("key,value").in("key", ["seo_title", "seo_description", "og_image"]).then(({ data }) => data);
      const rows = await Promise.race([query, timeout]);
      const get = (k: string) => { const v = (rows || []).find((r) => r.key === k)?.value as { value?: string } | undefined; return typeof v?.value === "string" ? v.value.slice(0, 300) : ""; };
      seoTitle = get("seo_title"); seoDescription = get("seo_description"); seoImage = get("og_image");
    }
  } catch { /* defaults */ }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seoTitle || (sv ? "Stilledev – svensk mjukvarustudio av Oliver Stille" : "Stilledev — Software studio by Oliver Stille"),
      template: "%s · BudAI",
    },
    description: seoDescription || copy.description,
    keywords: [
      "AI",
      "artificial intelligence",
      "Sweden",
      "Sverige",
      "business automation",
      "digital assistant",
      "software studio Sweden",
      "Oliver Stille",
      "Stilledev",
      "BudAI",
      "automatisering",
    ],
    authors: [{ name: "Oliver Stille" }, { name: "Stilledev" }],
    creator: "Oliver Stille · Stilledev",
    publisher: "Stilledev",
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: sv ? "sv_SE" : "en_US",
      alternateLocale: [sv ? "en_US" : "sv_SE"],
      url: canonical,
      siteName: "Stilledev",
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [
        {
          url: seoImage || "/stilledev-social.png",
          width: 1200,
          height: 630,
          alt: "Stilledev — software studio founded by Oliver Stille",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle,
      description: copy.ogDescription,
      images: [seoImage || "/stilledev-social.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      canonical,
      // Only the homepage has a real reciprocal language pair. Pointing every
      // page at /sv would invent URLs that do not exist.
      ...(hasLanguageAlternate(pathname)
        ? { languages: { en: siteUrl, sv: `${siteUrl}${SWEDISH_PATH}`, "x-default": siteUrl } }
        : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#020205",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  // The middleware generates a fresh nonce per request (see lib/csp.ts).
  const nonce = h.get("x-nonce") ?? undefined;
  const lang = h.get("x-budai-lang") === "sv" ? "sv" : "en";
  const phoneGate = isPhoneUserAgent(h.get("user-agent") || "");
  const path = canonicalPath(h.get("x-budai-path") || "/");
  // These pages have deliberate responsive layouts and must remain available
  // on phones, including direct entry to contact, Labs, and legal pages.
  const phoneAccessiblePage = path.startsWith("/legal/") || path === "/contact" || path === "/sv/contact" || path === "/labs" || path === "/sv/labs" || path === "/admin" || path.startsWith("/admin/");
  return (
    <html
      lang={lang}
      className="font-sans"
      suppressHydrationWarning
    >
      <head>
        {!phoneGate && <script id="budai-intro-policy" nonce={nonce} dangerouslySetInnerHTML={{ __html: introBootstrap }} />}
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
        {phoneGate ? <MobileProviders initialLang={lang}>{phoneAccessiblePage ? children : <PhoneWelcome normalizeLanguagePath />}</MobileProviders> : <Providers initialLang={lang}>{children}</Providers>}
        <SiteConfigBanner />
        <PageViewTracker />
        <VercelAnalytics enabled={process.env.VERCEL === "1"} />
      </body>
    </html>
  );
}
