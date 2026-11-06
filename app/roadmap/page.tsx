import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import RoadmapView from "@/components/site/RoadmapView";
import { localizedMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
    "/roadmap",
    { en: "BudAI public roadmap", sv: "BudAI:s publika roadmap" },
    { en: "See what is live in BudAI, what is in development and what is planned next—an honest public roadmap from Stilledev.", sv: "Se vad som är live i BudAI, vad som utvecklas och vad som är planerat härnäst — en ärlig publik roadmap från Stilledev." },
  );
}

export default function RoadmapPage() {
  return <SiteShell><RoadmapView /></SiteShell>;
}
