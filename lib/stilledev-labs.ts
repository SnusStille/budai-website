export type LocalizedText = { en: string; sv: string };

// A public index of names only; destinations and private implementation details
// are intentionally not stored here. Short descriptions avoid unverified claims.
export const LAB_PROJECTS: { name: string; type: LocalizedText; description: LocalizedText }[] = [
  { name: "BudAI", type: { en: "AI workspace", sv: "AI-arbetsyta" }, description: { en: "A bilingual space for thinking and creating with AI.", sv: "En tvåspråkig plats för att tänka och skapa med AI." } },
  { name: "StilleAffe", type: { en: "Sales & coaching", sv: "Sälj & coachning" }, description: { en: "A workspace for sales, focus and follow-through.", sv: "En arbetsyta för försäljning, fokus och uppföljning." } },
  { name: "Anna’s Second Brain", type: { en: "Personal knowledge", sv: "Personlig kunskap" }, description: { en: "A personal space for ideas and organization.", sv: "En personlig plats för idéer och struktur." } },
  { name: "Harvis", type: { en: "AI assistant concept", sv: "AI-assistent · koncept" }, description: { en: "An idea for an assistant that supports conversations and brings structure to work.", sv: "En idé om en assistent som stöttar dialog och skapar struktur i arbetet." } },
  { name: "Julia Stille Real Estate", type: { en: "Real estate", sv: "Fastigheter" }, description: { en: "A workspace for properties, clients, leads and viewings.", sv: "En arbetsyta för objekt, kunder, leads och visningar." } },
];
