export type Entry = { date: string; title: string; titleSv: string; items: string[]; itemsSv: string[] };

export const CHANGELOG: Entry[] = [
  {
    date: "2026-10-05",
    title: "This week",
    titleSv: "Den här veckan",
    items: ["Voice mode with a live orb", "Credits meter in the Playground", "Routines with fields", "Share a conversation with a read-only link", "Waitlist position and invites", "Keyboard shortcuts (press ?)", "New logo and a rebuilt loading screen", "A calmer, smaller waitlist form", "Ask box under the hero", "Feedback button", "Install BudAI as an app"],
    itemsSv: ["Röstläge med levande kula", "Credits-mätare i Playground", "Rutiner med fält", "Dela ett samtal med skrivskyddad länk", "Köplats och inbjudningar på väntelistan", "Tangentbordsgenvägar (tryck ?)", "Ny logotyp och ombyggd laddningsskärm", "Ett lugnare och mindre väntelistformulär", "Frågefält under hero", "Feedback-knapp", "Installera BudAI som app"],
  },
  {
    date: "2026-10",
    title: "Earlier this month",
    titleSv: "Tidigare i månaden",
    items: ["Live streaming replies", "Personas: Writer, Analyst, Coder, Translator", "Edit a sent message and branch the answer", "Export to Markdown, PDF and Word", "Plans with clear pros and limits"],
    itemsSv: ["Svar som streamas live", "Personer: Skribent, Analytiker, Kodare, Översättare", "Redigera ett skickat meddelande och förgrena svaret", "Export till Markdown, PDF och Word", "Paket med tydliga fördelar och begränsningar"],
  },
];
