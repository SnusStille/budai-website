import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_SLUGS, LEGAL_TITLES, isLegalSlug } from "@/lib/legal-slugs";
import LegalView from "./LegalView";

// Only these five slugs exist. Anything else must be a real 404 — previously
// an unknown slug silently rendered the privacy policy with HTTP 200.
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  if (!isLegalSlug(params.slug)) return {};
  const title = LEGAL_TITLES[params.slug];
  return {
    title,
    description: `${title} for the BudAI developer preview, available in English and Swedish.`,
    alternates: { canonical: `/legal/${params.slug}` },
    robots: { index: true, follow: true },
  };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  if (!isLegalSlug(params.slug)) notFound();
  return <LegalView slug={params.slug} />;
}
