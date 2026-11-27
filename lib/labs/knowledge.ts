/**
 * Stilledev Labs — Knowledge System
 *
 * Static reference data that BudAI and Oliver can draw on during consultations.
 * This is the v1 base — kept as typed constants in code. Future v2 can move
 * this to a Supabase table for admin editing without redeploys.
 *
 * Areas covered:
 * - Service starting price indications (BANDS only, never exact quotes)
 * - Typical tech stacks per category
 * - Known limitations / Oliver doesn't build: native mobile apps in Swift/Kotlin,
 *   AAA games, enterprise SAP integrations, crypto tokens.
 * - Process: how projects typically run
 */

export type PriceBand = "starter" | "small" | "medium" | "large";

export interface PriceBandDef {
  id: PriceBand;
  /** SEK band label shown in Swedish */
  sekLabelSv: string;
  /** GBP/EUR rough band for English speakers (Oliver operates from Sweden) */
  labelEn: string;
  /** Typical timeline */
  timelineSv: string;
  timelineEn: string;
}

export const PRICE_BANDS: PriceBandDef[] = [
  {
    id: "starter",
    sekLabelSv: "10 000 – 30 000 kr",
    labelEn: "€1k – €3k (approx)",
    timelineSv: "1–3 veckor",
    timelineEn: "1–3 weeks",
  },
  {
    id: "small",
    sekLabelSv: "30 000 – 80 000 kr",
    labelEn: "€3k – €8k (approx)",
    timelineSv: "3–6 veckor",
    timelineEn: "3–6 weeks",
  },
  {
    id: "medium",
    sekLabelSv: "80 000 – 200 000 kr",
    labelEn: "€8k – €20k (approx)",
    timelineSv: "6–12 veckor",
    timelineEn: "6–12 weeks",
  },
  {
    id: "large",
    sekLabelSv: "200 000 kr+",
    labelEn: "€20k+ (approx)",
    timelineSv: "3+ månader",
    timelineEn: "3+ months",
  },
];

/** Tech stacks Stilledev typically uses. BudAI should NOT invent other stacks. */
export const TECH_STACKS = {
  website: {
    stackSv: "Next.js (React) + TypeScript + Tailwind CSS. Publiceras på Vercel.",
    stackEn: "Next.js (React) + TypeScript + Tailwind CSS. Hosted on Vercel.",
    cms: "Sanity eller liknande headless CMS om kunden vill redigera innehåll själv.",
  },
  webapp: {
    stackSv: "Next.js + TypeScript + Supabase (Postgres/Auth) eller Prisma/Postgres. Eventuellt Redis för cache.",
    stackEn: "Next.js + TypeScript + Supabase (Postgres/Auth) or Prisma/Postgres. Redis for caching when needed.",
  },
  fivem: {
    stackSv: "Lua (FiveM scripting), eventuellt Node.js för externa tjänster. ESX/QBCore/vRP ramverk stöds.",
    stackEn: "Lua (FiveM scripting), Node.js for external services when needed. ESX/QBCore/vRP frameworks supported.",
  },
  roblox: {
    stackSv: "Luau (Roblox), Roblox Studio. Datastore Service för persistence.",
    stackEn: "Luau (Roblox), Roblox Studio. Datastore Service for persistence.",
  },
  ai_automation: {
    stackSv: "TypeScript + Anthropic Claude API / OpenAI, Supabase för vektorer vid RAG. Cron-jobb eller trigger-baserade flöden.",
    stackEn: "TypeScript + Anthropic Claude API / OpenAI, Supabase for vectors in RAG scenarios. Cron jobs or trigger-based flows.",
  },
};

/** Things Stilledev does NOT take on. BudAI should be transparent about these. */
export const OUT_OF_SCOPE = {
  sv: [
    "Nativa iOS/Android-appar i Swift/Kotlin (jag rekommenderar PWA eller React Native om det passar)",
    "Storskaliga AAA-spel eller spel med 100+ utvecklare",
    "Kryptovalutor, tokens och blockchain-projekt",
    "Företags-SAP/Oracle-integrationer",
    "Heltidsarbete på plats (endast frilansprojekt)",
  ],
  en: [
    "Native iOS/Android apps in Swift/Kotlin (I recommend PWA or React Native when appropriate)",
    "Large-scale AAA games or projects needing 100+ developers",
    "Cryptocurrencies, tokens and blockchain projects",
    "Enterprise SAP/Oracle integrations",
    "Full-time on-site work (freelance projects only)",
  ],
};

/** Process overview — what happens after they click "Kontakta mig" */
export const PROCESS = {
  sv: [
    "Du beskriver din idé i chatten här",
    "Jag går igenom underlaget personligen och återkommer inom 1 arbetsdag",
    "Vi har ett kortare första samtal (15–30 min) där vi går igenom din idé och dina mål",
    "Jag återkommer med en konkret offert, tidsplan och teknisk rekommendation",
    "Vid avtal startar vi projektet i fas 1 (MVP) med tydliga delmål och löpande avstämningar",
  ],
  en: [
    "You describe your idea in this chat",
    "I review the brief personally and get back within 1 working day",
    "We have a short initial call (15–30 min) to walk through your idea and goals",
    "I come back with a concrete quote, timeline and technical recommendation",
    "If we agree, phase 1 (MVP) starts with clear milestones and regular check-ins",
  ],
};
