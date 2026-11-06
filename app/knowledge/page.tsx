import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import KnowledgeView from "@/components/site/KnowledgeView";
import { localizedMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
    "/knowledge",
    { en: "BudAI Knowledge Center", sv: "BudAI Kunskapscenter" },
    { en: "How BudAI works: AI models, memory, privacy, data handling, vision, voice, Workspace, limits and frequently asked questions.", sv: "Så fungerar BudAI: AI-modeller, minne, integritet, datahantering, bild, röst, Workspace, gränser och vanliga frågor." },
  );
}

export default function KnowledgePage() {
  return <SiteShell><KnowledgeView /></SiteShell>;
}
