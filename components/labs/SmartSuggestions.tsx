"use client";

/**
 * Smart Suggestions — discrete context-aware reply chips that appear
 * below the AI's message. Client-side intent detection; suggestions are
 * NEVER presented as the AI's own answer, only as one-tap shortcuts.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";

interface Props {
  lastMessage: string;
  onPick: (text: string) => void;
  lang: "sv" | "en";
  stage: string;
}

const sv: Record<string, string[]> = {
  budget: ["Cirka 10 000–30 000 kr", "Cirka 30 000–80 000 kr", "Över 100 000 kr", "Osäker, vill diskutera först"],
  timeline: ["Inom 1 månad", "Inom 3 månader", "Inom 6 månader", "Ingen brådska"],
  company: ["Ja, för ett företag", "Nej, ett privat projekt", "För en ny startup", "För en ideell förening"],
  audience: ["Privatpersoner (B2C)", "Företagskunder (B2B)", "Både och", "Internt i företaget", "Spelare (gamers)"],
  platform: ["En webbplats", "En webbapplikation", "En mobilapp", "En FiveM-server", "Ett Roblox-spel", "Vet inte än"],
  mvp: ["Jag vill börja litet (MVP)", "Jag vill ha alla funktioner direkt", "Vad rekommenderar du?"],
  meeting: ["Boka gärna ett möte", "Jag föredrar e-post först", "Ring mig"],
  yesno: ["Ja", "Nej", "Delvis"],
  existing: ["Jag har en befintlig webbplats", "Vi har ett system vi vill bygga vidare på", "Vi vill migrera från en annan plattform", "Jag vill bara ha rådgivning"],
  design: ["Ja, jag har design/skisser", "Jag vill ha hjälp med design", "Jag har en referenssajt"],
  name: ["Oliver", "Jag heter [namn]", "Företaget heter [namn]"],
};
const en: Record<string, string[]> = {
  budget: ["Around €1k–€3k", "Around €3k–€8k", "Over €10k", "Not sure, let's discuss first"],
  timeline: ["Within 1 month", "Within 3 months", "Within 6 months", "No rush"],
  company: ["Yes, for a company", "No, a personal project", "For a new startup", "For a non-profit"],
  audience: ["Consumers (B2C)", "Businesses (B2B)", "Both", "Internal team", "Gamers"],
  platform: ["A website", "A web application", "A mobile app", "A FiveM server", "A Roblox game", "Not sure yet"],
  mvp: ["I want to start small (MVP)", "I want all features at once", "What do you recommend?"],
  meeting: ["Happy to book a call", "I prefer email first", "Call me"],
  yesno: ["Yes", "No", "Partly"],
  existing: ["I have an existing website", "We have a system to extend", "We want to migrate from another platform", "I just want advice"],
  design: ["Yes, I have designs/wireframes", "I want help with design", "I have a reference site"],
  name: ["Sure, my name is...", "The company is called...", "I'll stay anonymous for now"],
};

function detectIntents(text: string): string[] {
  const lower = text.toLowerCase();
  const intents: string[] = [];
  if (/budget|kostar|pris|pengar|kostnad|investering|price|cost|how much|spend|betala/i.test(lower)) intents.push("budget");
  if (/tidsplan|tid|deadline|lansering|leverans|när.*vara klart|when.*ready|timeline|deadline|launch|timeframe|hur snabbt|how soon/i.test(lower)) intents.push("timeline");
  if (/ditt företag|ert företag|vilken typ av.*projekt|company|business|organization|firm|för företag|privat|startup|entrepren/i.test(lower)) intents.push("company");
  if (/målgrupp|användare|kund|vem använder|vem är det för|audience|users?|customers?|who will|who is it for/i.test(lower)) intents.push("audience");
  if (/plattform|app|hemsida|webbsajt|webbapp|mobil|fivem|roblox|platform|website|mobile|native|vad för typ av|what kind of/i.test(lower)) intents.push("platform");
  if (/mvp|första version|börja liten|minimum|first version|start small|scope|börja med|start with/i.test(lower)) intents.push("mvp");
  if (/möte|boka|ring|samtal|call|möte|prata|meeting|talk|book|video|zoom|teams/i.test(lower)) intents.push("meeting");
  if (/ställer du|har du rätt|förstår du|stämmer det|bekräfta|does that sound|agree|correct\?|confirm\?|does that make sense/i.test(lower)) intents.push("yesno");
  if (/befintlig|redan har|nuvarande|existing|current|migrera|migrate|förbättra|improve|vidare|extend/i.test(lower)) intents.push("existing");
  if (/design|skiss|wireframe|figma|utseende|look and feel|referens|reference|style/i.test(lower)) intents.push("design");
  if (/vad heter du|ditt namn|what's your name|your name|vem är du|who are you|kan jag få ditt namn/i.test(lower)) intents.push("name");
  return intents.slice(0, 2); // max 2 categories at once to avoid overwhelming
}

export default function SmartSuggestions({ lastMessage, onPick, lang, stage }: Props) {
  const suggestions = useMemo(() => {
    const intents = detectIntents(lastMessage);
    if (intents.length === 0) return [];
    const bank = lang === "sv" ? sv : en;
    const all: string[] = [];
    const seen = new Set<string>();
    for (const i of intents) {
      for (const s of (bank[i] || [])) {
        if (!seen.has(s)) { seen.add(s); all.push(s); }
      }
    }
    return all.slice(0, 5);
  }, [lastMessage, lang]);

  if (suggestions.length === 0) return null;
  if (stage === "submitted" || stage === "closed") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="ss-wrap"
    >
      <span className="ss-label">
        {lang === "sv" ? "Snabbsvar" : "Quick reply"}
      </span>
      {suggestions.map((s, i) => (
        <motion.button
          key={s}
          type="button"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          className="ss-chip"
          onClick={() => onPick(s)}
        >
          {s}
        </motion.button>
      ))}
    </motion.div>
  );
}
