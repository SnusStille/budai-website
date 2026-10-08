import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

const META: Record<string, { title: string; description: string }> = {
  privacy: {
    title: "Privacy Policy",
    description:
      "How BudAI handles your data — GDPR, EU storage, what we collect and how to request access or deletion.",
  },
  terms: {
    title: "Terms of Service",
    description:
      "The terms for using the BudAI developer preview — what you can expect from us and what we expect from you.",
  },
  cookies: {
    title: "Cookie Policy",
    description:
      "Which cookies and local storage BudAI uses, why they are needed, and how you can control them.",
  },
  gdpr: {
    title: "GDPR",
    description:
      "Your GDPR rights as a BudAI user — access, rectification, erasure, portability and how to contact us.",
  },
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const meta = META[params.slug];
  if (!meta) return { title: "Legal", robots: { index: false, follow: true } };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${siteUrl}/legal/${params.slug}` },
    openGraph: {
      title: `${meta.title} · BudAI`,
      description: meta.description,
      url: `${siteUrl}/legal/${params.slug}`,
      type: "article",
    },
  };
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
