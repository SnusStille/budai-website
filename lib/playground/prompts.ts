import type { Mode } from "./types";

export const INTENT_PRESETS = {
  sv: [
    { id: "chat", label: "Chatt", hint: "Vardaglig hjälp", prefix: "", mode: "single" as Mode },
    {
      id: "research",
      label: "Research",
      hint: "Strukturerad research",
      prefix:
        "Arbeta som research-assistent. Strukturera med: Sammanfattning, Nyckelpunkter, Antaganden, Nästa steg. Var konkret.\n\nFråga: ",
      mode: "single" as Mode,
    },
    {
      id: "create",
      label: "Skapa",
      hint: "Text & pitch",
      prefix:
        "Skriv i skarp, publicerbar ton. Ge en färdig leverans (inte meta-råd).\n\nUppgift: ",
      mode: "single" as Mode,
    },
    {
      id: "analyze",
      label: "Analys",
      hint: "Beslut & risk",
      prefix:
        "Analysera systematiskt. Använd rubriker, bullets och tydlig rekommendation.\n\nCase: ",
      mode: "single" as Mode,
    },
    { id: "dual", label: "2 vinklar", hint: "Två svar att välja", prefix: "", mode: "dual" as Mode },
  ],
  en: [
    { id: "chat", label: "Chat", hint: "Everyday help", prefix: "", mode: "single" as Mode },
    {
      id: "research",
      label: "Research",
      hint: "Deeper structured",
      prefix:
        "Act as a research assistant. Structure with: Summary, Key points, Assumptions, Next steps. Be concrete.\n\nQuestion: ",
      mode: "single" as Mode,
    },
    {
      id: "create",
      label: "Create",
      hint: "Copy & drafts",
      prefix:
        "Write in a sharp, publishable voice. Deliver a finished piece (not meta-advice).\n\nTask: ",
      mode: "single" as Mode,
    },
    {
      id: "analyze",
      label: "Analyze",
      hint: "Decisions & risk",
      prefix:
        "Analyze systematically. Use headings, bullets, and a clear recommendation.\n\nCase: ",
      mode: "single" as Mode,
    },
    { id: "dual", label: "2 angles", hint: "Pick a reply", prefix: "", mode: "dual" as Mode },
  ],
} as const;

export type StartAction = {
  id: string;
  title: string;
  blurb: string;
  prompt: string;
  icon: "write" | "analyze" | "plan" | "create" | "research" | "brainstorm" | "vision" | "voice";
  needsImage?: boolean;
  voice?: boolean;
};

export const START_ACTIONS: Record<"sv" | "en", StartAction[]> = {
  sv: [
    {
      id: "write",
      icon: "write",
      title: "Skriv",
      blurb: "Mejl, pitch, underlag",
      prompt:
        "Skriv ett kort, varmt och proffsigt mejl som följer upp ett första möte om AI-stöd i vardagen — tre korta stycken och en tydlig nästa steg-fråga.",
    },
    {
      id: "analyze",
      icon: "analyze",
      title: "Analysera",
      blurb: "Beslut utan fluff",
      prompt:
        "Ge mig en ärlig SWOT för att rulla ut en AI-arbetsassistent i ett svenskt SME. Avsluta med en rekommendation.",
    },
    {
      id: "plan",
      icon: "plan",
      title: "Planera dagen",
      blurb: "Fokusblock & buffertar",
      prompt:
        "Jag har 6 timmar djupjobb, två möten och en deadline imorgon. Bygg en realistisk dagsplan med prioriteringar och buffertar.",
    },
    {
      id: "create",
      icon: "create",
      title: "Skapa",
      blurb: "En färdig leverans",
      prompt:
        "Skriv en one-pager för BudAI: problem, lösning, för vem, varför nu — skarp och publicerbar på svenska.",
    },
    {
      id: "research",
      icon: "research",
      title: "Research",
      blurb: "Strukturera ett ämne",
      prompt:
        "Förklara hur ett svenskt bolag kan införa AI i det dagliga arbetet utan att tappa kontroll. Sammanfattning, nyckelpunkter, antaganden, nästa steg.",
    },
    {
      id: "brainstorm",
      icon: "brainstorm",
      title: "Brainstorm",
      blurb: "Idéer med skärpa",
      prompt:
        "Ge mig sju originella, användbara sätt en nordisk produktchef kan använda BudAI en vanlig vecka. Inga klyschor.",
    },
  ],
  en: [
    {
      id: "write",
      icon: "write",
      title: "Write",
      blurb: "Email, pitch, brief",
      prompt:
        "Write a short, warm, professional follow-up email after a first meeting about AI at work — three tight paragraphs and a clear next-step question.",
    },
    {
      id: "analyze",
      icon: "analyze",
      title: "Analyze",
      blurb: "Decisions, not fluff",
      prompt:
        "Give me an honest SWOT for rolling out an AI work assistant in a Swedish SME. End with a recommendation.",
    },
    {
      id: "plan",
      icon: "plan",
      title: "Plan my day",
      blurb: "Focus blocks & buffers",
      prompt:
        "I have 6 hours of deep work, two meetings, and a deadline tomorrow. Build a realistic day plan with priorities and buffers.",
    },
    {
      id: "create",
      icon: "create",
      title: "Create",
      blurb: "A finished piece",
      prompt:
        "Write a one-pager for BudAI: problem, solution, who it's for, why now — sharp and publishable.",
    },
    {
      id: "research",
      icon: "research",
      title: "Research",
      blurb: "Structure a topic",
      prompt:
        "Explain how a Nordic company can adopt AI in daily work without losing control. Summary, key points, assumptions, next steps.",
    },
    {
      id: "brainstorm",
      icon: "brainstorm",
      title: "Brainstorm",
      blurb: "Ideas with an edge",
      prompt:
        "Give me seven original, useful ways a Nordic product lead could use BudAI in a normal week. No clichés.",
    },
  ],
};

export const INSPIRE_PROMPTS = {
  sv: [
    "Skriv en skarp 5-punkts agenda för mitt första kundmöte om AI-assistenter — varm men proffsig.",
    "Jag drunknar i mejl. Ge mig ett 20-minuters system för att rensa inboxen utan att missa det viktiga.",
    "Omvandla den här idén till en one-pager: BudAI hjälper svenska SME att fatta snabbare beslut.",
    "Ge mig tre ärliga invändningar en CFO har mot AI-verktyg — och hur jag bemöter varje.",
    "Bygg en veckoplan: 3 deep-work-block, 2 möten, 1 review. Inkludera buffertar.",
    "Skriv ett kort, respektfullt nej-mejl till en förfrågan jag inte kan ta just nu.",
    "Förklara GDPR-minded AI för en icke-teknisk VD på 8 meningar.",
    "Jag ska pitcha BudAI på 60 sekunder. Manus + pauser + en stark avslutning.",
  ],
  en: [
    "Write a sharp 5-point agenda for my first client meeting about AI assistants — warm but professional.",
    "I'm drowning in email. Give me a 20-minute system to clear the inbox without missing what matters.",
    "Turn this idea into a one-pager: BudAI helps Swedish SMEs make faster decisions.",
    "Give me three honest CFO objections to AI tools — and how I answer each.",
    "Build a week plan: 3 deep-work blocks, 2 meetings, 1 review. Include buffers.",
    "Write a short, respectful no-email to a request I can't take right now.",
    "Explain GDPR-minded AI to a non-technical CEO in 8 sentences.",
    "I need a 60-second BudAI pitch. Script + pauses + a strong close.",
  ],
} as const;
