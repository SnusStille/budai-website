import type { AccentId, EffortId, PersonaId, StyleId } from "./types";

type Lang = "sv" | "en";

/* ── Personas ─────────────────────────────────────────────── */

export type Persona = {
  id: PersonaId;
  label: Record<Lang, string>;
  blurb: Record<Lang, string>;
  glyph: string;
  accent: string;
};

export const PERSONAS: Persona[] = [
  {
    id: "core",
    label: { sv: "Core", en: "Core" },
    blurb: { sv: "Allround — skriva, tänka, planera", en: "All-round — write, think, plan" },
    glyph: "◈",
    accent: "#87e9df",
  },
  {
    id: "writer",
    label: { sv: "Skribent", en: "Writer" },
    blurb: { sv: "Publicerbar text och rubriker", en: "Publishable copy and headlines" },
    glyph: "✎",
    accent: "#e9a5c5",
  },
  {
    id: "analyst",
    label: { sv: "Analytiker", en: "Analyst" },
    blurb: { sv: "Beslut, risk och källkritik", en: "Decisions, risk, sources" },
    glyph: "◑",
    accent: "#a0bffa",
  },
  {
    id: "builder",
    label: { sv: "Byggare", en: "Builder" },
    blurb: { sv: "Kod, arkitektur och felsökning", en: "Code, architecture, debugging" },
    glyph: "⌘",
    accent: "#a8e2b7",
  },
  {
    id: "coach",
    label: { sv: "Coach", en: "Coach" },
    blurb: { sv: "Mål i små tydliga steg", en: "Goals into small clear steps" },
    glyph: "◎",
    accent: "#f1d98f",
  },
  {
    id: "studio",
    label: { sv: "Studio", en: "Studio" },
    blurb: { sv: "Kreativa idéer och bildprompter", en: "Creative ideas and image prompts" },
    glyph: "✦",
    accent: "#b9a8f6",
  },
];

/* ── Response styles ─────────────────────────────────────── */

export const STYLE_OPTIONS: { id: StyleId; label: Record<Lang, string>; hint: Record<Lang, string> }[] = [
  { id: "balanced", label: { sv: "Naturlig", en: "Natural" }, hint: { sv: "BudAIs vanliga ton", en: "BudAI's default voice" } },
  { id: "concise", label: { sv: "Kort", en: "Short" }, hint: { sv: "Svar i 60–110 ord", en: "60–110 words" } },
  { id: "creative", label: { sv: "Kreativ", en: "Creative" }, hint: { sv: "Lekfull och bildrik", en: "Playful, vivid" } },
  { id: "precise", label: { sv: "Exakt", en: "Precise" }, hint: { sv: "Fakta och osäkerhet", en: "Facts & uncertainty" } },
  { id: "stepbystep", label: { sv: "Steg för steg", en: "Step by step" }, hint: { sv: "Numrerad väg framåt", en: "Numbered path" } },
];

export const EFFORT_OPTIONS: { id: EffortId; label: Record<Lang, string>; hint: Record<Lang, string> }[] = [
  { id: "quick", label: { sv: "Snabb", en: "Quick" }, hint: { sv: "Svar direkt", en: "Instant answer" } },
  { id: "balanced", label: { sv: "Balanserad", en: "Balanced" }, hint: { sv: "Djup och fart", en: "Depth and speed" } },
  { id: "deep", label: { sv: "Djup", en: "Deep" }, hint: { sv: "Mer tid, mer djup", en: "More time, more depth" } },
];

export const ACCENTS: { id: AccentId; label: string; from: string; to: string }[] = [
  { id: "aurora", label: "Aurora", from: "#87e9df", to: "#b9a8f6" },
  { id: "violet", label: "Violet", from: "#b9a8f6", to: "#e9a5c5" },
  { id: "mint", label: "Mint", from: "#a8e2b7", to: "#87e9df" },
  { id: "sunset", label: "Sunset", from: "#f1d98f", to: "#e9a5c5" },
  { id: "ice", label: "Ice", from: "#a0bffa", to: "#87e9df" },
];

/* ── Slash commands ──────────────────────────────────────── */

export type SlashCommand = {
  id: string;
  cmd: string;
  icon: string;
  label: Record<Lang, string>;
  hint: Record<Lang, string>;
  template: Record<Lang, string>;
  /** switch a tool on when the command runs */
  tool?: "image" | "concise" | "stepbystep" | "precise" | "creative";
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "image",
    cmd: "/bild",
    icon: "🖼",
    label: { sv: "Skapa bild", en: "Create image" },
    hint: { sv: "Generera en bild från en beskrivning", en: "Generate an image from a description" },
    template: { sv: "", en: "" },
    tool: "image",
  },
  {
    id: "summary",
    cmd: "/sammanfatta",
    icon: "≡",
    label: { sv: "Sammanfatta", en: "Summarize" },
    hint: { sv: "Kärnan i tre punkter + nästa steg", en: "Three bullets + next step" },
    template: {
      sv: "Sammanfatta följande i tre punkter och avsluta med ett tydligt nästa steg:\n\n",
      en: "Summarise the following in three bullets and end with one clear next step:\n\n",
    },
  },
  {
    id: "translate",
    cmd: "/översätt",
    icon: "⇄",
    label: { sv: "Översätt", en: "Translate" },
    hint: { sv: "Naturlig ton, inte ordagrant", en: "Natural tone, not word-for-word" },
    template: {
      sv: "Översätt till naturlig engelska med samma ton och rytm — inte ordagrant:\n\n",
      en: "Translate into natural Swedish with the same tone and rhythm — not word-for-word:\n\n",
    },
  },
  {
    id: "email",
    cmd: "/mejl",
    icon: "✉",
    label: { sv: "Skriv mejl", en: "Write email" },
    hint: { sv: "Färdigt utkast med ämnesrad", en: "Finished draft with subject" },
    template: {
      sv: "Skriv ett färdigt mejl med ämnesrad. Kontext: ",
      en: "Write a finished email with a subject line. Context: ",
    },
  },
  {
    id: "code",
    cmd: "/kod",
    icon: "⌘",
    label: { sv: "Kod", en: "Code" },
    hint: { sv: "Skriv eller granska kod", en: "Write or review code" },
    template: {
      sv: "Skriv produktionsklar kod med korta kommentarer. Beskriv vad den gör och hur den körs.\n\nUppgift: ",
      en: "Write production-ready code with short comments. Explain what it does and how to run it.\n\nTask: ",
    },
  },
  {
    id: "explain",
    cmd: "/förklara",
    icon: "◇",
    label: { sv: "Förklara enkelt", en: "Explain simply" },
    hint: { sv: "Som för en nyfiken nybörjare", en: "As for a curious beginner" },
    template: {
      sv: "Förklara detta enkelt med en vardaglig jämförelse, som för en nyfiken nybörjare:\n\n",
      en: "Explain this simply with an everyday analogy, for a curious beginner:\n\n",
    },
  },
  {
    id: "brainstorm",
    cmd: "/idér",
    icon: "✷",
    label: { sv: "Brainstorma", en: "Brainstorm" },
    hint: { sv: "Fem idéer + hur de testas", en: "Five ideas + how to test them" },
    template: {
      sv: "Ge fem kreativa men realistiska idéer. Lägg till en mening per idé om hur den kan testas snabbt.\n\nÄmne: ",
      en: "Give five creative but realistic ideas. Add one line per idea on how to test it quickly.\n\nTopic: ",
    },
  },
  {
    id: "plan",
    cmd: "/plan",
    icon: "☑",
    label: { sv: "Gör en plan", en: "Make a plan" },
    hint: { sv: "Vecka, projekt eller lansering", en: "Week, project or launch" },
    template: {
      sv: "Lägg upp en tydlig plan med tidsblock, beroenden och en definition av klart:\n\nMål: ",
      en: "Lay out a clear plan with time blocks, dependencies and a definition of done:\n\nGoal: ",
    },
  },
  {
    id: "table",
    cmd: "/tabell",
    icon: "▦",
    label: { sv: "Gör en tabell", en: "Make a table" },
    hint: { sv: "Strukturera som markdown-tabell", en: "Structure as a markdown table" },
    template: {
      sv: "Strukturera detta som en markdown-tabell med tre kolumner: Alternativ, Fördelar, Risker.\n\nUnderlag: ",
      en: "Structure this as a markdown table with three columns: Option, Upside, Risk.\n\nMaterial: ",
    },
  },
  {
    id: "review",
    cmd: "/granska",
    icon: "✓",
    label: { sv: "Granska", en: "Review" },
    hint: { sv: "Feedback med prioriteringar", en: "Feedback with priorities" },
    template: {
      sv: "Granska detta och ge feedback i tre nivåer: måste, borde, kan. Var konkret.\n\nUnderlag: ",
      en: "Review this and give feedback in three tiers: must, should, could. Be specific.\n\nMaterial: ",
    },
  },
  {
    id: "quiz",
    cmd: "/quiz",
    icon: "★",
    label: { sv: "Quiz", en: "Quiz" },
    hint: { sv: "Testa dina kunskaper", en: "Test your knowledge" },
    template: {
      sv: "Gör ett quiz med fem frågor och svar längst ned i en detalj som är lätt att dölja.\n\nÄmne: ",
      en: "Make a quiz with five questions and answers hidden at the bottom.\n\nTopic: ",
    },
  },
];

/* ── Prompt library ──────────────────────────────────────── */

export type LibraryCategory = "work" | "write" | "code" | "think" | "play";

export type LibraryPrompt = {
  id: string;
  category: LibraryCategory;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
  icon: string;
};

export const LIBRARY_CATEGORIES: { id: LibraryCategory; label: Record<Lang, string> }[] = [
  { id: "work", label: { sv: "Jobbet", en: "Work" } },
  { id: "write", label: { sv: "Skriva", en: "Writing" } },
  { id: "code", label: { sv: "Kod", en: "Code" } },
  { id: "think", label: { sv: "Tänka", en: "Thinking" } },
  { id: "play", label: { sv: "Kreativt", en: "Creative" } },
];

export const LIBRARY_PROMPTS: LibraryPrompt[] = [
  {
    id: "inbox",
    category: "work",
    icon: "✉",
    title: { sv: "Töm inkorgen på 20 min", en: "Clear the inbox in 20 min" },
    body: {
      sv: "Hjälp mig prioritera en full inkorg. Ge mig en 20-minutersplan, färdiga svar för de tre vanligaste mejlen och en regel för vad jag kan ignorera.",
      en: "Help me triage a full inbox. Give me a 20-minute plan, ready replies for the three most common emails, and a rule for what I can ignore.",
    },
  },
  {
    id: "meeting",
    category: "work",
    icon: "◷",
    title: { sv: "Mötesagenda som håller tiden", en: "A meeting agenda that holds time" },
    body: {
      sv: "Gör en agenda för ett 30-minutersmöte med fyra personer. Varje punkt ska ha minutbudget, syfte och vem som äger den.",
      en: "Build an agenda for a 30-minute, four-person meeting. Each item needs a minute budget, a purpose and an owner.",
    },
  },
  {
    id: "status",
    category: "work",
    icon: "◔",
    title: { sv: "Veckorapport på 5 rader", en: "Five-line weekly report" },
    body: {
      sv: "Skriv en veckorapport i fem rader: vad som är klart, vad som är i rörelse, vad som blockerar, vad jag behöver hjälp med, nästa vecka.",
      en: "Write a weekly update in five lines: done, in motion, blocked, help needed, next week.",
    },
  },
  {
    id: "rewrite",
    category: "write",
    icon: "✎",
    title: { sv: "Skriv om så det låter som jag", en: "Rewrite it closer to my voice" },
    body: {
      sv: "Skriv om texten nedan så den blir kortare, varmare och mer konkret. Behåll mina poänger men stryk floskler. Visa före/efter.\n\nText:",
      en: "Rewrite the text below to be shorter, warmer and more concrete. Keep my points, cut filler. Show before/after.\n\nText:",
    },
  },
  {
    id: "subject",
    category: "write",
    icon: "◈",
    title: { sv: "Rubriker som klickar", en: "Headlines that click" },
    body: {
      sv: "Ge tio rubrikförslag i tre stilar: nyfiken, konkret och konträr. Förklara på en rad varför varje fungerar.\n\nÄmne:",
      en: "Give ten headline options across three styles: curious, concrete, contrarian. One line on why each works.\n\nTopic:",
    },
  },
  {
    id: "followup",
    category: "write",
    icon: "↩",
    title: { sv: "Uppföljning utan att tjata", en: "Follow up without nagging" },
    body: {
      sv: "Skriv ett vänligt uppföljningsmejl som inte känns påträngande. Ge två varianter: kort och varmare. Kontext:",
      en: "Write a friendly follow-up that doesn't feel pushy. Give two versions: short and warmer. Context:",
    },
  },
  {
    id: "debug",
    category: "code",
    icon: "⌘",
    title: { sv: "Felsök ett felsteg", en: "Debug an error" },
    body: {
      sv: "Här är ett fel och relevant kod. Förklara trolig orsak, visa minsta fix och hur jag verifierar att det är löst.\n\nFel:",
      en: "Here's an error and the relevant code. Explain the likely cause, show the smallest fix, and how to verify it.\n\nError:",
    },
  },
  {
    id: "review-code",
    category: "code",
    icon: "✓",
    title: { sv: "Kodgranskning med prio", en: "Code review with priorities" },
    body: {
      sv: "Granska koden: säkerhet, läsbarhet, prestanda och tester. Sortera som måste / borde / kan med konkreta diff-förslag.\n\nKod:",
      en: "Review the code for security, readability, performance and tests. Sort as must / should / could with concrete diffs.\n\nCode:",
    },
  },
  {
    id: "explain-code",
    category: "code",
    icon: "◇",
    title: { sv: "Förklara kodbasen för en ny", en: "Explain the codebase to a newcomer" },
    body: {
      sv: "Förklara vad den här koden gör för någon som är ny i projektet. Börja med en mening, sedan flödet steg för steg.\n\nKod:",
      en: "Explain what this code does to someone new to the project. Start with one sentence, then the flow step by step.\n\nCode:",
    },
  },
  {
    id: "decision",
    category: "think",
    icon: "◑",
    title: { sv: "Beslut med två alternativ", en: "A decision with two options" },
    body: {
      sv: "Jag väljer mellan två alternativ. Ställ upp en tabell med antaganden, kostnad, risk och vad som måste vara sant för att varje val ska lyckas. Rekommendera ett.\n\nVal:",
      en: "I'm choosing between two options. Build a table with assumptions, cost, risk and what must be true for each to succeed. Recommend one.\n\nOptions:",
    },
  },
  {
    id: "premortem",
    category: "think",
    icon: "⚠",
    title: { sv: "Premortem: vad kan gå fel?", en: "Premortem: what could go wrong?" },
    body: {
      sv: "Gör en premortem på projektet nedan. Anta att det misslyckades om sex månader — lista de fem troligaste orsakerna och den billigaste motåtgärden för varje.\n\nProjekt:",
      en: "Run a premortem on the project below. Assume it failed in six months — list the five most likely causes and the cheapest counter-move for each.\n\nProject:",
    },
  },
  {
    id: "learn",
    category: "think",
    icon: "◐",
    title: { sv: "Lär mig något på 15 minuter", en: "Teach me something in 15 minutes" },
    body: {
      sv: "Lär mig grunderna i detta på 15 minuter. Dela upp i tre block, ge en övning per block och en fråga jag ska kunna svara på efteråt.\n\nÄmne:",
      en: "Teach me the basics of this in 15 minutes. Split into three blocks, one exercise each, and a question I should be able to answer afterwards.\n\nTopic:",
    },
  },
  {
    id: "story",
    category: "play",
    icon: "✦",
    title: { sv: "Berättelse i sex meningar", en: "A story in six sentences" },
    body: {
      sv: "Skriv en berättelse i exakt sex meningar. Första meningen ska vara vardaglig, sista ska vända allt.\n\nUtgångspunkt:",
      en: "Write a story in exactly six sentences. The first should be ordinary, the last should turn everything.\n\nStarting point:",
    },
  },
  {
    id: "image-prompt",
    category: "play",
    icon: "🖼",
    title: { sv: "Bildprompt i hög kvalitet", en: "A high-quality image prompt" },
    body: {
      sv: "Skriv en detaljerad bildprompt: motiv, ljus, objektiv, känsla och stil. En rad, engelska, redo att klistra in.\n\nIdé:",
      en: "Write a detailed image prompt: subject, light, lens, mood, style. One paragraph, English, ready to paste.\n\nIdea:",
    },
  },
  {
    id: "names",
    category: "play",
    icon: "◎",
    title: { sv: "Namn och tagline", en: "Names and a tagline" },
    body: {
      sv: "Föreslå tio namn och tre taglines. Blanda svenska och engelska, förklara känslan i varje namn på en rad.\n\nProdukt:",
      en: "Suggest ten names and three taglines. Mix Swedish and English, one line on the feeling of each.\n\nProduct:",
    },
  },
];

/* ── Follow-up chips ─────────────────────────────────────── */

export const FOLLOW_UPS: { id: string; label: Record<Lang, string>; prompt: Record<Lang, string> }[] = [
  {
    id: "shorter",
    label: { sv: "Kortare", en: "Shorter" },
    prompt: { sv: "Gör om svaret mycket kortare — max fem punkter.", en: "Redo that much shorter — five bullets max." },
  },
  {
    id: "example",
    label: { sv: "Ge ett exempel", en: "Give an example" },
    prompt: { sv: "Ge ett konkret exempel som visar detta i praktiken.", en: "Give one concrete example showing this in practice." },
  },
  {
    id: "deeper",
    label: { sv: "Djupare", en: "Go deeper" },
    prompt: { sv: "Gå djupare på det viktigaste och förklara varför.", en: "Go deeper on the most important part and explain why." },
  },
  {
    id: "checklist",
    label: { sv: "Gör en checklista", en: "Make a checklist" },
    prompt: { sv: "Omvandla detta till en praktisk checklista jag kan bocka av.", en: "Turn this into a practical checklist I can tick off." },
  },
  {
    id: "counter",
    label: { sv: "Utmana mig", en: "Challenge me" },
    prompt: { sv: "Argumentera mot din egen slutsats och berätta när den andra vägen är bättre.", en: "Argue against your own conclusion and tell me when the other path wins." },
  },
  {
    id: "translate",
    label: { sv: "Översätt", en: "Translate" },
    prompt: { sv: "Översätt hela svaret till naturlig engelska.", en: "Translate the whole answer into natural Swedish." },
  },
];

/* ── One-click transforms on an answer ───────────────────── */

export type Transform = {
  id: string;
  label: Record<Lang, string>;
  glyph: string;
  build: (text: string, lang: Lang) => string;
};

export const TRANSFORMS: Transform[] = [
  {
    id: "simplify",
    label: { sv: "Förenkla", en: "Simplify" },
    glyph: "◇",
    build: (text, lang) =>
      lang === "sv"
        ? `Skriv om svaret nedan så enkelt som möjligt, som för en nyfiken nybörjare. Behåll alla viktiga poänger.\n\n${text}`
        : `Rewrite the answer below as simply as possible, for a curious beginner. Keep every important point.\n\n${text}`,
  },
  {
    id: "bullets",
    label: { sv: "Punktlista", en: "Bullet list" },
    glyph: "≡",
    build: (text, lang) =>
      lang === "sv"
        ? `Gör om svaret nedan till en tydlig punktlista med max 7 punkter och en avslutande nästa-steg-rad.\n\n${text}`
        : `Turn the answer below into a clear bullet list of at most 7 points plus one next-step line.\n\n${text}`,
  },
  {
    id: "translate",
    label: { sv: "Översätt", en: "Translate" },
    glyph: "⇄",
    build: (text, lang) =>
      lang === "sv"
        ? `Översätt svaret nedan till naturlig engelska med samma ton. Svara med endast översättningen.\n\n${text}`
        : `Translate the answer below into natural Swedish with the same tone. Reply with the translation only.\n\n${text}`,
  },
  {
    id: "shorter",
    label: { sv: "Kortare", en: "Shorter" },
    glyph: "⤡",
    build: (text, lang) =>
      lang === "sv"
        ? `Korta ned svaret nedan till ungefär hälften utan att tappa innebörd.\n\n${text}`
        : `Cut the answer below to roughly half its length without losing meaning.\n\n${text}`,
  },
  {
    id: "actionable",
    label: { sv: "Gör den konkret", en: "Make it actionable" },
    glyph: "☑",
    build: (text, lang) =>
      lang === "sv"
        ? `Omvandla svaret nedan till konkreta handlingar: vad ska göras, i vilken ordning och hur det följs upp.\n\n${text}`
        : `Turn the answer below into concrete actions: what to do, in what order, and how to follow up.\n\n${text}`,
  },
];

/* ── Selection actions (highlight text inside an answer) ─── */

export type SelectionAction = {
  id: string;
  label: Record<Lang, string>;
  glyph: string;
  build: (selection: string, lang: Lang) => string;
};

export const SELECTION_ACTIONS: SelectionAction[] = [
  {
    id: "explain",
    label: { sv: "Förklara", en: "Explain" },
    glyph: "◇",
    build: (text, lang) =>
      lang === "sv"
        ? `Förklara det här kort och tydligt, som för en nyfiken nybörjare:\n\n"${text}"`
        : `Explain this briefly and clearly, for a curious beginner:\n\n"${text}"`,
  },
  {
    id: "translate",
    label: { sv: "Översätt", en: "Translate" },
    glyph: "⇄",
    build: (text, lang) =>
      lang === "sv"
        ? `Översätt till naturlig engelska med samma ton:\n\n"${text}"`
        : `Translate into natural Swedish with the same tone:\n\n"${text}"`,
  },
  {
    id: "improve",
    label: { sv: "Förbättra text", en: "Improve writing" },
    glyph: "✎",
    build: (text, lang) =>
      lang === "sv"
        ? `Förbättra den här texten — tydligare, kortare och varmare — och visa före/efter:\n\n"${text}"`
        : `Improve this text — clearer, shorter, warmer — and show before/after:\n\n"${text}"`,
  },
  {
    id: "expand",
    label: { sv: "Utveckla", en: "Expand" },
    glyph: "✚",
    build: (text, lang) =>
      lang === "sv"
        ? `Utveckla det här till ett par konkreta stycken med exempel:\n\n"${text}"`
        : `Expand this into a few concrete paragraphs with examples:\n\n"${text}"`,
  },
];

/* ── Voice conversation mode ─────────────────────────────── */

export const VOICE_STATES: Record<Lang, Record<"idle" | "listening" | "thinking" | "speaking", string>> = {
  sv: {
    idle: "Tryck för att prata",
    listening: "Lyssnar…",
    thinking: "Tänker…",
    speaking: "BudAI svarar",
  },
  en: {
    idle: "Tap to talk",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "BudAI is speaking",
  },
};

export const VOICE_TIPS: Record<Lang, string[]> = {
  sv: [
    "Fråga något och avbryt bara genom att börja prata igen.",
    "Röstsvar läses upp automatiskt — stäng av när du vill tyst.",
    "Perfekt för promenaden, bilen eller när händerna är upptagna.",
  ],
  en: [
    "Ask anything and interrupt simply by speaking again.",
    "Replies are read aloud automatically — turn it off any time.",
    "Made for walks, the car, or when your hands are full.",
  ],
};

/** Rotating prompt sparks for the empty state. */
export const SPARKS: Record<Lang, string[]> = {
  sv: [
    "Förklara BudAI för min mamma på tre meningar.",
    "Gör en veckoplan med fokusblock och pauser.",
    "Skriv ett säljmejl som låter som en människa.",
    "Sammanfatta en lång tråd till fem punkter.",
    "Ge mig tre idéer jag inte tänkt på.",
    "Översätt mitt CV till engelska utan floskler.",
    "Hjälp mig säga nej till ett möte, vänligt.",
  ],
  en: [
    "Explain BudAI to my mum in three sentences.",
    "Plan my week with focus blocks and breaks.",
    "Write a sales email that sounds human.",
    "Summarise a long thread into five bullets.",
    "Give me three ideas I haven't thought of.",
    "Rewrite my CV in Swedish without clichés.",
    "Help me say no to a meeting, kindly.",
  ],
};

/**
 * The four starters on the empty Playground.
 * Deliberately four, not sixteen: write, explain, brainstorm, plan.
 */
export const STARTERS: LibraryPrompt[] = [
  {
    id: "write",
    category: "write",
    icon: "✎",
    title: { sv: "Skriv", en: "Write" },
    body: {
      sv: "Skriv ett kort och tydligt utkast till ett mejl där jag tackar nej till ett möte och föreslår ett kortare samtal i stället.",
      en: "Write a short, clear draft of an email declining a meeting and proposing a shorter call instead.",
    },
  },
  {
    id: "explain",
    category: "think",
    icon: "◇",
    title: { sv: "Förklara", en: "Explain" },
    body: {
      sv: "Förklara skillnaden mellan en språkmodell och en vanlig sökmotor, som om jag vore ny på området. Använd ett vardagligt exempel.",
      en: "Explain the difference between a language model and a regular search engine, as if I were new to it. Use one everyday example.",
    },
  },
  {
    id: "brainstorm",
    category: "play",
    icon: "✳",
    title: { sv: "Brainstorma", en: "Brainstorm" },
    body: {
      sv: "Ge mig åtta idéer på namn till ett litet svenskt AI-verktyg för mötesanteckningar. Kort lista, en rad per idé.",
      en: "Give me eight possible names for a small Swedish AI tool for meeting notes. Short list, one line each.",
    },
  },
  {
    id: "plan",
    category: "work",
    icon: "◷",
    title: { sv: "Planera", en: "Plan" },
    body: {
      sv: "Lägg upp en plan för min arbetsdag i morgon: tre prioriterade uppgifter, två möten och en timme fokustid. Håll den kort.",
      en: "Lay out a plan for my workday tomorrow: three priorities, two meetings and one hour of focus time. Keep it short.",
    },
  },
];

export const PLACEHOLDERS: Record<Lang, string[]> = {
  sv: [
    "Skriv till BudAI…",
    "Beskriv vad du vill få gjort…",
    "Fråga vad som helst — eller skriv / för kommandon…",
    "Klistra in text, kod eller en idé…",
  ],
  en: [
    "Message BudAI…",
    "Describe what you want to get done…",
    "Ask anything — or type / for commands…",
    "Paste text, code or a rough idea…",
  ],
};

export const THINKING_STEPS: Record<Lang, string[]> = {
  sv: ["Läser din fråga", "Hämtar kontext", "Formulerar svar", "Kontrollerar detaljer", "Gör klart"],
  en: ["Reading your prompt", "Gathering context", "Shaping an answer", "Checking details", "Finishing up"],
};
