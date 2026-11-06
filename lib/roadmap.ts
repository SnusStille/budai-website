export type RoadmapStatus = "live" | "development" | "planned";
export type Localized = { en: string; sv: string };
export type RoadmapItem = {
  title: Localized;
  description: Localized;
  detail?: Localized;
};
export type RoadmapGroup = {
  status: RoadmapStatus;
  title: Localized;
  description: Localized;
  items: RoadmapItem[];
};

/**
 * Public product direction, deliberately without invented release dates.
 * Live entries must match the current repository and production capability.
 */
export const ROADMAP: RoadmapGroup[] = [
  {
    status: "live",
    title: { en: "Live", sv: "Live" },
    description: { en: "Available in the open developer preview today.", sv: "Tillgängligt i den öppna utvecklarpreviewn idag." },
    items: [
      {
        title: { en: "Bilingual AI conversations", sv: "Tvåspråkiga AI-samtal" },
        description: { en: "Streaming replies in Swedish and English with focused writing, research, creation and analysis modes.", sv: "Strömmande svar på svenska och engelska med fokuserade lägen för skrivande, research, skapande och analys." },
        detail: { en: "Research structures supplied context; it does not browse the web.", sv: "Research strukturerar given kontext och söker inte på webben." },
      },
      {
        title: { en: "Accounts, history and memory controls", sv: "Konton, historik och minneskontroller" },
        description: { en: "Free sign-in with thread history, durable memory, temporary chats and controls to edit, disable or delete memory.", sv: "Gratis inloggning med trådhistorik, beständigt minne, tillfälliga samtal och kontroller för att redigera, stänga av eller radera minne." },
      },
      {
        title: { en: "Vision, voice and Workspace", sv: "Bild, röst och Workspace" },
        description: { en: "Image analysis for accounts, browser voice dictation, editable long-form drafts, routines and export/share tools.", sv: "Bildanalys för konton, webbläsarbaserad röstdiktering, redigerbara längre utkast, rutiner samt export- och delningsverktyg." },
      },
    ],
  },
  {
    status: "development",
    title: { en: "In development", sv: "Under utveckling" },
    description: { en: "Active product directions; scope can change as the preview evolves.", sv: "Aktiva produktspår; omfattningen kan ändras när previewn utvecklas." },
    items: [
      {
        title: { en: "Individual paid plan", sv: "Betalplan för privatpersoner" },
        description: { en: "Higher daily capacity, extended history and memory capacity for regular individual work.", sv: "Högre dygnskapacitet samt utökad historik och minneskapacitet för regelbundet individuellt arbete." },
        detail: { en: "Pricing and launch timing have not been set.", sv: "Pris och lanseringsdatum är inte fastställda." },
      },
      {
        title: { en: "Shared team workflows", sv: "Delade teamarbetsflöden" },
        description: { en: "Shared team workspaces, reusable playbooks and a shared daily team limit.", sv: "Delade teamarbetsytor, återanvändbara playbooks och en gemensam dygnsgräns för teamet." },
      },
      {
        title: { en: "Ongoing preview refinement", sv: "Fortsatt förfining av previewn" },
        description: { en: "Reliability, response quality, accessibility and workflow improvements guided by real preview usage and feedback.", sv: "Tillförlitlighet, svarskvalitet, tillgänglighet och bättre arbetsflöden styrt av verklig användning och feedback i previewn." },
      },
    ],
  },
  {
    status: "planned",
    title: { en: "Planned", sv: "Planerat" },
    description: { en: "Longer-term direction, not a promise of timing or final scope.", sv: "Långsiktig riktning, inte ett löfte om tidpunkt eller slutlig omfattning." },
    items: [
      {
        title: { en: "Team governance", sv: "Teamadministration" },
        description: { en: "Company accounts, administrative controls and priority support for shared workspaces.", sv: "Företagskonton, administrativa kontroller och prioriterad support för delade arbetsytor." },
      },
      {
        title: { en: "Broader image-generation access", sv: "Bredare tillgång till bildgenerering" },
        description: { en: "Making the existing optional image-generation integration available more broadly, once deployment and operating considerations are ready.", sv: "Göra den befintliga valfria integrationen för bildgenerering bredare tillgänglig när drift och distribution är redo." },
        detail: { en: "Image analysis is already live; broader generation availability is not.", sv: "Bildanalys är redan live; bredare bildgenerering är inte tillgänglig ännu." },
      },
    ],
  },
];
