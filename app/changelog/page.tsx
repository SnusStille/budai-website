import type { Metadata } from "next";
import { headers } from "next/headers";
import ChangelogView from "@/components/ui/ChangelogView";

// F1: the changelog is an indexable page, so its title/description follow the
// server-resolved language (the visible copy already does via LanguageContext).
export function generateMetadata(): Metadata {
  const sv = headers().get("x-budai-lang") === "sv";
  return {
    title: sv ? "Vad är nytt" : "What's new",
    description: sv
      ? "Ärlig ändringslogg för BudAI:s utvecklarförhandsvisning: vad som faktiskt har levererats och en ögonblicksbild av nuvarande funktioner, på svenska och engelska."
      : "An honest changelog for the BudAI developer preview: what has actually shipped, and a snapshot of the current features, in English and Swedish.",
    alternates: { canonical: "/changelog" },
    robots: { index: true, follow: true },
  };
}

export default function ChangelogPage() {
  return <ChangelogView />;
}
