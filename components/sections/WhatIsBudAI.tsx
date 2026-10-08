"use client";

import { ArrowRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** One clear answer to "what is this?" right under the hero. */
export default function WhatIsBudAI() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const steps: [string, string, string][] = sv
    ? [
        ["1", "Fråga", "Skriv eller prata"],
        ["2", "Få svar", "Direkt, på svenska eller engelska"],
        ["3", "Använd", "Kopiera, exportera eller dela"],
      ]
    : [
        ["1", "Ask", "Type or speak"],
        ["2", "Get an answer", "Instantly, in Swedish or English"],
        ["3", "Use it", "Copy, export or share"],
      ];

  return (
    <section
      id="what-is-budai"
      aria-label={sv ? "Vad BudAI är" : "What BudAI is"}
      className="relative z-10 mx-auto mb-10 max-w-4xl scroll-mt-24 px-4 text-center sm:px-6"
    >
      <p className="mx-auto max-w-2xl text-base text-white/85 sm:text-lg">
        {sv
          ? "BudAI är en AI-assistent för vardagligt arbete. Be den skriva, planera, sammanfatta eller analysera, på svenska eller engelska."
          : "BudAI is an AI assistant for everyday work. Ask it to write, plan, summarize or analyze, in Swedish or English."}
      </p>

      <ol className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-stretch sm:gap-3">
        {steps.map(([n, title, desc], i) => (
          <li key={n} className="flex items-center justify-center gap-3">
            <div className="lift group flex flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-accent-cyan/25 hover:bg-accent-cyan/[0.04]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-cyan/15 font-mono text-xs text-accent-cyan transition-colors group-hover:bg-accent-cyan/25">
                {n}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{title}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight
                aria-hidden
                className="hidden h-4 w-4 shrink-0 text-white/25 sm:block"
              />
            )}
          </li>
        ))}
      </ol>

      <p className="mt-5 text-xs text-muted">
        {sv ? "Gratis att prova idag. Ingen registrering behövs." : "Free to try today. No signup needed."}
      </p>
    </section>
  );
}
