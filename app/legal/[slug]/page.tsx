import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LEGAL_TITLES, LEGAL_TITLES_SV, isLegalSlug } from "@/lib/legal-slugs";
import LegalView from "./LegalView";

// Only these five slugs exist. Anything else must be a real 404 — previously
// an unknown slug silently rendered the privacy policy with HTTP 200.
// F1: this route is rendered per request (no generateStaticParams). Static
// generation froze page-level metadata in English at build time even though
// <html lang="sv"> was correct. The root layout is dynamic anyway (CSP nonce).

type LegalPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) return {};
  // F1: page-level metadata must follow the same server-resolved language as
  // the root layout, otherwise a Swedish page still has an English <title>.
  const sv = (await headers()).get("x-budai-lang") === "sv";
  const title = (sv ? LEGAL_TITLES_SV : LEGAL_TITLES)[slug];
  return {
    title,
    description: sv
      ? `${title} för BudAI:s utvecklarförhandsvisning, på svenska och engelska.`
      : `${title} for the BudAI developer preview, available in English and Swedish.`,
    alternates: { canonical: `/legal/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  return <LegalView slug={slug} />;
}
