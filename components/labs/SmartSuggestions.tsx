"use client";

/**
 * Smart Suggestions — discrete context-aware reply chips that appear
 * below the AI's message. Suggestions are generated client-side based
 * on the last AI question; they are NEVER shown as the AI's answer,
 * just as shortcuts the customer can click.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";

interface Props {
  lastMessage: string;
  onPick: (text: string) => void;
  lang: "sv" | "en";
  stage: string;
  visible?: boolean;
}

const svSuggestions: Record<string, string[]> = {
  budget: ["Cirka 10 000–30 000 kr", "Cirka 30 000–80 000 kr", "Osäker, vill diskutera först"],
  timeline: ["Inom 1 månad", "Inom 3 månader", "Ingen brådska"],
  company: ["Ja, för ett företag", "Nej, ett privat projekt", "För en ny startup"],
  audience: ["Privatpersoner (B2C)", "Företagskunder (B2B)", "Både och"],
  platform: ["Webb", "Mobilapp", "Webbapplikation", "FiveM-server", "Roblox", "Vet inte än"],
  mvp: ["Jag vill börja litet (MVP)", "Jag vill ha alla funktioner direkt", "Vet inte — vad rekommenderar du?"],
  meeting: ["Boka gärna ett möte", "Jag föredrar e-post först"],
  yesno: ["Ja", "Nej", "Delvis"],
};
const enSuggestions: Record<string, string[]> = {
  budget: ["Around €1k–€3k", "Around €3k–€8k", "Not sure, let's discuss first"],
  timeline: ["Within 1 month", "Within 3 months", "No rush"],
  company: ["Yes, for a company", "No, a personal project", "For a new startup"],
  audience: ["Consumers (B2C)", "Businesses (B2B)", "Both"],
  platform: ["Website", "Mobile app", "Web application", "FiveM server", "Roblox", "Not sure yet"],
  mvp: ["I want to start small (MVP)", "I want all features at once", "Not sure — what do you recommend?"],
  meeting: ["Happy to book a call", "I prefer email first"],
  yesno: ["Yes", "No", "Partly"],
};

function detectIntent(text: string): string | null {
  const lower = text.toLowerCase();
  // Order matters: more specific patterns first
  if (/budget|kostar|pris|pengar|kostnad|investering|price|cost|how much|spend/i.test(lower)) return "budget";
  if (/tidsplan|tid|deadline|lansering|leverans|när|when|timeline|deadline|launch|timeframe/i.test(lower)) return "timeline";
  if (/företag|verksamhet|organisation|bolag|company|business|organization|firm/i.test(lower)) return "company";
  if (/målgrupp|användare|kund|vem använder|audience|users?|customers?|who will/i.test(lower)) return "audience";
  if (/plattform|app|hemsida|webbsajt|webbapp|mobil|fivem|roblox|platform|website|mobile|native/i.test(lower)) return "platform";
  if (/mvp|första version|börja liten|minimum|first version|start small|scope/i.test(lower)) return "mvp";
  if (/möte|boka|ring|call|möte|prata|meeting|talk|book/i.test(lower)) return "meeting";
  if (/ställer du|har du rätt|förstår du|stämmer det|bekräfta|does that sound|agree|correct\?|confirm\?/i.test(lower)) return "yesno";
  return null;
}

export default function SmartSuggestions({ lastMessage, onPick, lang, visible = true }: Props) {
  const suggestions = useMemo(() => {
    const intent = detectIntent(lastMessage);
    if (!intent) return [];
    const bank = lang === "sv" ? svSuggestions : enSuggestions;
    return bank[intent] || [];
  }, [lastMessage, lang]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="ss-wrap"
    >
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
