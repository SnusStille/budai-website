import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import BudAIView from "@/components/site/BudAIView";
import { localizedMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
    "/budai",
    { en: "BudAI — Intelligent AI workspace", sv: "BudAI — Intelligent AI-arbetsyta" },
    { en: "Explore the real BudAI workspace: bilingual AI conversations, editable drafts, memory you control, vision, voice and export tools, built in Sweden by Stilledev.", sv: "Utforska den verkliga BudAI-arbetsytan: tvåspråkiga AI-samtal, redigerbara utkast, minne du styr, bild, röst och exportverktyg, byggt i Sverige av Stilledev." },
  );
}

export default function BudAIPage() {
  return <SiteShell><BudAIView /></SiteShell>;
}
