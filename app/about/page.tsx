import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import AboutView from "@/components/site/AboutView";
import { localizedMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
    "/about",
    { en: "About the company — Independent software & AI", sv: "Om företaget — Oberoende mjukvara & AI" },
    { en: "Meet Stilledev, an independent Swedish technology and software brand building intelligent digital experiences and the BudAI workspace.", sv: "Möt Stilledev, ett oberoende svenskt teknik- och mjukvaruvarumärke som bygger intelligenta digitala upplevelser och BudAI-arbetsytan." },
  );
}

export default function AboutPage() {
  return <SiteShell><AboutView /></SiteShell>;
}
