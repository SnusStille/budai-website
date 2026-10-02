import type { AiActivity, Conversation } from "@/lib/playground/types";

export type Lang = "sv" | "en";

/* ─── prompt presets ──────────────────────────────────── */

export type IntentPreset = {
  id: string;
  label: string;
  hint: string;
  prefix: string;
  mode: "single" | "dual";
};

/** Tones that are actually sent to the API as a system-level prefix. */
export const INTENT_PRESETS: Record<Lang, IntentPreset[]> = {
  sv: [
    { id: "chat", label: "Chatt", hint: "Vardaglig hjälp", prefix: "", mode: "single" },
    {
      id: "research",
      label: "Research",
      hint: "Strukturerat och djupare",
      prefix:
        "Arbeta som research-assistent. Strukturera med: Sammanfattning, Nyckelpunkter, Antaganden, Nästa steg. Var konkret.\n\nFråga: ",
      mode: "single",
    },
    {
      id: "create",
      label: "Skapa",
      hint: "Färdig text i skarp ton",
      prefix:
        "Skriv i skarp, publicerbar ton. Ge en färdig leverans (inte meta-råd).\n\nUppgift: ",
      mode: "single",
    },
    {
      id: "analyze",
      label: "Analys",
      hint: "Beslut, risk och rekommendation",
      prefix:
        "Analysera systematiskt. Använd rubriker, bullets och en tydlig rekommendation.\n\nCase: ",
      mode: "single",
    },
    { id: "dual", label: "2 vinklar", hint: "Två svar att välja mellan", prefix: "", mode: "dual" },
  ],
  en: [
    { id: "chat", label: "Chat", hint: "Everyday help", prefix: "", mode: "single" },
    {
      id: "research",
      label: "Research",
      hint: "Deeper and structured",
      prefix:
        "Act as a research assistant. Structure with: Summary, Key points, Assumptions, Next steps. Be concrete.\n\nQuestion: ",
      mode: "single",
    },
    {
      id: "create",
      label: "Create",
      hint: "Finished copy, sharp voice",
      prefix:
        "Write in a sharp, publishable voice. Deliver a finished piece (not meta-advice).\n\nTask: ",
      mode: "single",
    },
    {
      id: "analyze",
      label: "Analyze",
      hint: "Decisions, risk, recommendation",
      prefix: "Analyze systematically. Use headings, bullets, and a clear recommendation.\n\nCase: ",
      mode: "single",
    },
    { id: "dual", label: "2 angles", hint: "Two replies to pick from", prefix: "", mode: "dual" },
  ],
};

export type ExamplePrompt = {
  id: string;
  icon: "mail" | "bulb" | "chart" | "brain" | "flag" | "calendar";
  title: string;
  blurb: string;
  prompt: string;
};

/** "What can BudAI help you with?" — clicking fills the composer, never auto-sends. */
export const EXAMPLE_PROMPTS: Record<Lang, ExamplePrompt[]> = {
  sv: [
    {
      id: "email",
      icon: "mail",
      title: "Skriv ett professionellt mejl",
      blurb: "Varmt, kort och tydligt",
      prompt:
        "Skriv ett professionellt och varmt mejl till en kund som fått vänta två dagar på svar. Håll det kort, be om ursäkt utan att göra det stort, och ge ett tydligt nästa steg med datum.",
    },
    {
      id: "brainstorm",
      icon: "bulb",
      title: "Brainstorma en idé",
      blurb: "Konkreta förslag, inte klyschor",
      prompt:
        "Brainstorma tio sätt att använda AI i ett litet svenskt konsultbolag. Rangordna efter snabbast värde och nämn en realistisk risk per förslag.",
    },
    {
      id: "analyze",
      icon: "chart",
      title: "Analysera en text",
      blurb: "Insikter och luckor",
      prompt:
        "Sammanfatta texten nedan, lyft de tre viktigaste insikterna och peka på det som saknas. Text: ",
    },
    {
      id: "explain",
      icon: "brain",
      title: "Förklara något svårt",
      blurb: "Enkelt utan att bli fel",
      prompt:
        "Förklara hur en AI-assistent faktiskt fungerar som om jag var nyfiken men helt oteknisk. Använd en vardaglig liknelse, undvik facktermer och avsluta med tre praktiska exempel.",
    },
    {
      id: "swedish",
      icon: "flag",
      title: "Hjälp mig skriva på svenska",
      blurb: "Rätta, förklara, förbättra",
      prompt:
        "Jag vill skriva bättre svenska. Förbättra texten nedan, förklara dina tre viktigaste ändringar och ge ett mer naturligt alternativ. Text: ",
    },
    {
      id: "plan",
      icon: "calendar",
      title: "Planera min dag",
      blurb: "Fokusblock och buffert",
      prompt:
        "Jag har sex timmar djuparbete, två möten och en deadline imorgon. Bygg en realistisk dagsplan med prioriteringar, pauser och buffert.",
    },
  ],
  en: [
    {
      id: "email",
      icon: "mail",
      title: "Write a professional email",
      blurb: "Warm, short and clear",
      prompt:
        "Write a professional and warm email to a client who has waited two days for an answer. Keep it short, apologize without making it big, and give one clear next step with a date.",
    },
    {
      id: "brainstorm",
      icon: "bulb",
      title: "Brainstorm an idea",
      blurb: "Concrete, not clichés",
      prompt:
        "Brainstorm ten ways a small Swedish consulting firm could use AI. Rank by fastest value and name one realistic risk per idea.",
    },
    {
      id: "analyze",
      icon: "chart",
      title: "Analyze a text",
      blurb: "Insights and gaps",
      prompt:
        "Summarize the text below, highlight the three most important insights, and point out what is missing. Text: ",
    },
    {
      id: "explain",
      icon: "brain",
      title: "Explain something hard",
      blurb: "Simple without being wrong",
      prompt:
        "Explain how an AI assistant actually works to someone curious but completely non-technical. Use an everyday analogy, avoid jargon, and end with three practical examples.",
    },
    {
      id: "swedish",
      icon: "flag",
      title: "Help me write in Swedish",
      blurb: "Correct, explain, improve",
      prompt:
        "I want to write better Swedish. Improve the text below, explain your three most important changes, and give a more natural alternative. Text: ",
    },
    {
      id: "plan",
      icon: "calendar",
      title: "Plan my day",
      blurb: "Focus blocks and buffers",
      prompt:
        "I have six hours of deep work, two meetings, and a deadline tomorrow. Build a realistic day plan with priorities, breaks, and buffers.",
    },
  ],
};

/** "Surprise me" pool — strong prompts that produce a good first impression. */
export const INSPIRE_PROMPTS: Record<Lang, string[]> = {
  sv: [
    "Skriv en skarp 5-punkts agenda för mitt första kundmöte om AI-assistenter — varm men proffsig.",
    "Jag drunknar i mejl. Ge mig ett 20-minuters system för att rensa inboxen utan att missa det viktiga.",
    "Omvandla den här idén till en one-pager: BudAI hjälper svenska SME att fatta snabbare beslut.",
    "Ge mig tre ärliga invändningar en CFO har mot AI-verktyg — och hur jag bemöter varje.",
    "Bygg en veckoplan: 3 deep-work-block, 2 möten, 1 review. Inkludera buffertar.",
    "Skriv ett kort, respektfullt nej-mejl till en förfrågan jag inte kan ta just nu.",
    "Förklara GDPR-medveten AI för en icke-teknisk VD på åtta meningar.",
    "Jag ska pitcha BudAI på 60 sekunder. Manus, pauser och en stark avslutning.",
  ],
  en: [
    "Write a sharp 5-point agenda for my first client meeting about AI assistants — warm but professional.",
    "I'm drowning in email. Give me a 20-minute system to clear the inbox without missing what matters.",
    "Turn this idea into a one-pager: BudAI helps Swedish SMEs make faster decisions.",
    "Give me three honest CFO objections to AI tools — and how I answer each.",
    "Build a week plan: 3 deep-work blocks, 2 meetings, 1 review. Include buffers.",
    "Write a short, respectful no-email to a request I can't take right now.",
    "Explain GDPR-minded AI to a non-technical CEO in 8 sentences.",
    "I need a 60-second BudAI pitch. Script, pauses, and a strong close.",
  ],
};

/* ─── helpers ─────────────────────────────────────────── */

export function activityLabel(a: AiActivity, lang: Lang): string {
  const map: Record<AiActivity, [string, string]> = {
    idle: ["", ""],
    thinking: ["Tänker", "Thinking"],
    reading_image: ["Läser bilden", "Reading the image"],
    analyzing: ["Analyserar", "Analyzing"],
    generating_image: ["Skapar bild", "Creating image"],
    remembering: ["Sparar minne", "Saving memory"],
    listening: ["Lyssnar", "Listening"],
    typing: ["Skriver", "Writing"],
    error: ["Fel", "Error"],
  };
  return lang === "sv" ? map[a][0] : map[a][1];
}

export type HistoryItem = Pick<
  Conversation,
  "id" | "title" | "updatedAt" | "createdAt" | "temporary" | "pinned"
>;

export function groupByDate(items: HistoryItem[], lang: Lang) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYday = startToday - 86400000;
  const startWeek = startToday - 7 * 86400000;
  const buckets: { label: string; items: typeof items }[] = [
    { label: lang === "sv" ? "Idag" : "Today", items: [] },
    { label: lang === "sv" ? "Igår" : "Yesterday", items: [] },
    { label: lang === "sv" ? "Senaste 7 dagarna" : "Previous 7 days", items: [] },
    { label: lang === "sv" ? "Äldre" : "Older", items: [] },
  ];
  for (const c of items) {
    if (c.updatedAt >= startToday) buckets[0].items.push(c);
    else if (c.updatedAt >= startYday) buckets[1].items.push(c);
    else if (c.updatedAt >= startWeek) buckets[2].items.push(c);
    else buckets[3].items.push(c);
  }
  return buckets.filter((b) => b.items.length);
}

/** Long/structured answers get a Workspace side panel on desktop. */
export function isWorkspaceWorthy(content: string): boolean {
  if (!content || content.length < 280) return false;
  if (/```[\s\S]*?```/.test(content)) return true;
  const lines = content.split("\n").filter((l) => l.trim());
  const structured = lines.filter((l) => /^(\s*[-*•]|\s*\d+[.)]|#{1,3}\s)/.test(l)).length >= 4;
  return structured || content.length >= 520;
}

export function workspaceTitle(content: string, lang: Lang): string {
  const m = content.match(/^#{1,3}\s+(.+)$/m);
  if (m) return m[1].trim().slice(0, 64);
  const code = content.match(/```(\w+)?/);
  if (code)
    return lang === "sv" ? `Kod${code[1] ? ` · ${code[1]}` : ""}` : `Code${code[1] ? ` · ${code[1]}` : ""}`;
  const first = content.replace(/\s+/g, " ").trim().slice(0, 48);
  return first + (content.length > 48 ? "…" : "");
}

export function fileToBase64(file: File): Promise<{ b64: string; media: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = String(r.result || "");
      const m = res.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
      if (!m) reject(new Error("bad image"));
      else resolve({ b64: m[2], media: m[1] });
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** Server rejects single messages above 4000 chars — keep the composer honest. */
export const MAX_MESSAGE_CHARS = 4000;
