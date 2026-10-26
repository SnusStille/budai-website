"use client";

import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background text-white">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#060d17]/90 p-8 shadow-2xl">
        <div className="flex justify-center mb-5">
          <BudAILogo size="lg" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-pink mb-2">
          {sv ? "SYSTEMAVBROTT · FEL" : "SYSTEM INTERRUPT · ERROR"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          {sv ? "Något gick fel" : "Something went wrong"}
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          {sv
            ? "Ett oväntat fel uppstod när vyn skulle visas. Försök igen eller gå tillbaka till BudAI."
            : "An unexpected error occurred while rendering this view. Try again, or return to the main BudAI workspace."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-full bg-accent-cyan px-5 py-2.5 text-sm font-semibold text-[#020205] hover:opacity-90 transition-opacity">
            {sv ? "Försök igen" : "Try again"}
          </button>
          <a href="/" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/85 hover:text-white hover:border-accent-cyan/40 transition-colors">
            {sv ? "Ladda om startsidan" : "Reload home"}
          </a>
        </div>
      </div>
    </main>
  );
}
