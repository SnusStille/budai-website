import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import FeedbackView from "@/components/site/FeedbackView";
import { localizedMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
    "/feedback",
    { en: "BudAI feedback portal", sv: "BudAI feedbackportal" },
    { en: "Suggest improvements, report bugs and request BudAI features through Stilledev’s real feedback channel.", sv: "Föreslå förbättringar, rapportera buggar och önska BudAI-funktioner genom Stilledevs verkliga feedbackkanal." },
  );
}

export default function FeedbackPage() {
  return <SiteShell><FeedbackView /></SiteShell>;
}
