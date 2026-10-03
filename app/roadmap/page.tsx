import type { Metadata } from "next";
import RoadmapView from "@/components/sections/RoadmapView";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se";

export const metadata: Metadata = {
  title: "Status · what is ready in BudAI",
  description:
    "The honest status of the BudAI preview: what works today, what is being refined, and what we are only exploring — plus how we decide what ships next.",
  alternates: { canonical: `${siteUrl}/roadmap` },
  openGraph: {
    title: "Status · what is ready in BudAI",
    description:
      "What works today in the BudAI preview, what is being refined, and what we are exploring next.",
    url: `${siteUrl}/roadmap`,
    siteName: "BudAI",
    type: "website",
  },
};

export default function RoadmapPage() {
  return <RoadmapView />;
}
