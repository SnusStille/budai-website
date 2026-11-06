import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import LabsView from "@/components/site/LabsView";
import { localizedMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
    "/labs",
    { en: "Projects & Stilledev Labs", sv: "Projekt & Stilledev Labs" },
    { en: "Explore BudAI, the Confluence neural identity and real engineering experiments from independent Swedish software studio Stilledev.", sv: "Utforska BudAI, den neurala Confluence-identiteten och verkliga tekniska experiment från oberoende svenska mjukvarustudion Stilledev." },
  );
}

export default function LabsPage() {
  return <SiteShell><LabsView /></SiteShell>;
}
