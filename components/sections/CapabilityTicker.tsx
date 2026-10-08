"use client";

import { useLang } from "@/components/ui/LanguageContext";

/**
 * Thin capability ticker between the intro and the Playground.
 * Decorative (aria-hidden) — it repeats what the page already says, in motion,
 * so the product feels alive without adding noise for screen readers.
 */
const EN = [
  "Write an email",
  "Plan my week",
  "Summarize a report",
  "Translate SV ↔ EN",
  "Analyze an image",
  "Automate a routine",
  "Draft a proposal",
  "Explain a decision",
  "Turn notes into a plan",
  "Speak instead of type",
];

const SV = [
  "Skriv ett mejl",
  "Planera veckan",
  "Sammanfatta en rapport",
  "Översätt SV ↔ EN",
  "Analysera en bild",
  "Automatisera en rutin",
  "Skriv ett förslag",
  "Förklara ett beslut",
  "Anteckningar → plan",
  "Prata i stället för att skriva",
];

export default function CapabilityTicker() {
  const { lang } = useLang();
  const items = lang === "sv" ? SV : EN;
  const row = [...items, ...items];

  return (
    <div
      aria-hidden
      className="marquee-mask marquee-hover-pause relative z-10 mb-10 overflow-hidden border-y border-white/[0.05] bg-white/[0.015] py-3"
    >
      <div className="marquee-track gap-8 px-4">
        {row.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="flex shrink-0 items-center gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-muted/55"
          >
            {label}
            <span
              className={`h-1 w-1 rounded-full ${
                i % 3 === 0 ? "bg-accent-cyan/50" : i % 3 === 1 ? "bg-accent-purple/50" : "bg-accent-green/40"
              }`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
