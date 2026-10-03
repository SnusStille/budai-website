"use client";

import {
  PenLine,
  Scale,
  CalendarDays,
  Sparkles,
  Search,
  Lightbulb,
  Mic,
  Shuffle,
  History,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { START_ACTIONS, INSPIRE_PROMPTS, type StartAction } from "@/lib/playground/prompts";

const ICONS: Record<StartAction["icon"], typeof PenLine> = {
  write: PenLine,
  analyze: Scale,
  plan: CalendarDays,
  create: Sparkles,
  research: Search,
  brainstorm: Lightbulb,
  vision: Sparkles,
  voice: Mic,
};

function greeting(lang: "sv" | "en") {
  const h = new Date().getHours();
  if (lang === "sv") {
    if (h < 5) return "Sent. BudAI är vaken.";
    if (h < 11) return "God morgon.";
    if (h < 17) return "Hur kan BudAI hjälpa?";
    return "God kväll.";
  }
  if (h < 5) return "Late. BudAI is awake.";
  if (h < 11) return "Good morning.";
  if (h < 17) return "How can BudAI help?";
  return "Good evening.";
}

export default function EmptyState({
  lang,
  onPrompt,
  onVoice,
  resume,
}: {
  lang: "sv" | "en";
  onPrompt: (prompt: string) => void;
  onVoice: () => void;
  resume?: { title: string; onOpen: () => void } | null;
}) {
  const actions = START_ACTIONS[lang].slice(0, 4);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-10 sm:py-16">
      <div className="relative mb-7">
        <div
          aria-hidden
          className="absolute inset-[-40%] rounded-full bg-accent-cyan/[0.14] blur-3xl pointer-events-none"
        />
        <BudAILogo size="lg" animated />
      </div>
      <h1 className="text-[1.85rem] sm:text-[2.35rem] font-semibold tracking-[-0.04em] text-white text-center leading-tight">
        {greeting(lang)}
      </h1>
      <p className="mt-3 text-[15px] text-white/42 text-center max-w-md leading-relaxed">
        {lang === "sv"
          ? "Skriv, planera och tänk — på svenska och engelska."
          : "Write, plan, and think — in English and Swedish."}
      </p>

      {resume && (
        <button
          type="button"
          onClick={resume.onOpen}
          className="mt-6 inline-flex items-center gap-2 max-w-md px-3.5 py-2 rounded-full border border-white/[0.1] bg-white/[0.03] text-[12px] text-white/65 hover:text-white hover:border-white/20 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
          <span className="truncate">
            {lang === "sv" ? "Fortsätt" : "Resume"}
            <span className="text-white/35"> · </span>
            {resume.title}
          </span>
        </button>
      )}

      <div className="mt-10 flex flex-wrap items-stretch justify-center gap-2 w-full max-w-xl">
        {actions.map((c) => {
          const Icon = ICONS[c.icon] || Sparkles;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPrompt(c.prompt)}
              className="pg-start-card group text-left rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 min-w-[148px] flex-1"
            >
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-accent-cyan/[0.08] border border-accent-cyan/12 mb-2">
                <Icon className="w-3.5 h-3.5 text-accent-cyan" />
              </span>
              <div className="text-[13px] font-medium text-white/92">{c.title}</div>
              <div className="text-[11px] text-white/38 mt-0.5 leading-snug">{c.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => {
            const pool = INSPIRE_PROMPTS[lang];
            const pick = pool[Math.floor(Math.random() * pool.length)];
            onPrompt(pick);
          }}
          className="inline-flex items-center gap-2 text-[12px] text-white/38 hover:text-white transition-colors"
        >
          <span className="w-7 h-7 rounded-full border border-white/12 flex items-center justify-center">
            <Shuffle className="w-3.5 h-3.5" />
          </span>
          {lang === "sv" ? "Ge mig en uppgift" : "Give me a task"}
        </button>
        <button
          type="button"
          onClick={onVoice}
          className="inline-flex items-center gap-2 text-[12px] text-white/38 hover:text-white transition-colors"
        >
          <span className="w-7 h-7 rounded-full border border-white/12 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5" />
          </span>
          {lang === "sv" ? "Eller prata" : "Or speak"}
        </button>
      </div>
    </div>
  );
}
