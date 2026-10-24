"use client";

import Link from "next/link";
import { ArrowDown, ArrowLeft, Globe2 } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import StatusJourney from "@/components/status/StatusJourney";
import StatusReadout from "@/components/status/StatusReadout";

export default function StatusPageClient() {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";

  return (
    <main id="main-content" className="status-page relative min-h-screen overflow-x-clip text-white">
      <div className="status-page-atmosphere" aria-hidden="true" />
      <header className="relative z-20 border-b border-white/[0.07] bg-[#04060b]/65 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg text-white outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent-cyan/70" aria-label={sv ? "Till BudAI-startsidan" : "Back to BudAI home"}>
            <BudAILogo size="sm" animated />
            <span className="text-sm font-bold tracking-tight">Bud<span className="text-accent-cyan">AI</span></span>
            <span className="ml-1 hidden border-l border-white/15 pl-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 sm:inline">{sv ? "Status" : "Status"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="mr-1 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 sm:flex">
              <Globe2 className="h-3 w-3" aria-hidden="true" />
              {sv ? "Sverige · Stockholm" : "Sweden · Stockholm"}
            </div>
            <div className="flex items-center rounded-full border border-white/10 bg-black/30 p-0.5" role="group" aria-label={sv ? "Välj språk" : "Choose language"}>
              {(["en", "sv"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  className={`min-h-8 min-w-10 rounded-full px-2.5 font-mono text-[10px] font-semibold transition-colors ${lang === code ? "bg-white/10 text-white" : "text-white/45 hover:text-white"}`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href="/" className="ml-1 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-3.5 text-xs text-white/65 transition hover:border-accent-cyan/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/70 sm:px-4">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{sv ? "Till BudAI" : "Back to BudAI"}</span>
              <span className="sm:hidden">BudAI</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:pb-14 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.46fr)] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-accent-cyan/75">
              <span className="status-live-dot" aria-hidden="true" />
              {sv ? "BudAI · systemöversikt" : "BudAI · system overview"}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              {sv ? "Från signal till svar." : "From signal to response."}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
              {sv
                ? "En genomresa genom hur BudAI tar emot, formar och levererar arbete. Scrolla genom de rumsliga kapitlen — avsluta med kontroller som säger exakt vad de mäter."
                : "A continuous journey through how BudAI receives, shapes and delivers work. Move through the spatial chapters, then see exactly what the live checks measure."}
            </p>
          </div>
          <a href="#journey-heading" className="group inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-white/60 transition hover:border-accent-cyan/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/70 lg:mb-1">
            <span>{sv ? "Börja resan" : "Begin the journey"}</span>
            <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-7 max-w-3xl border-l border-accent-cyan/40 pl-4 text-xs leading-relaxed text-white/40">
          {sv
            ? "Statuskontrollerna verifierar webbappen och rapporterar serverkonfiguration. De testar inte externa AI-leverantörers tillgänglighet."
            : "Status checks verify the web app and report server configuration. They do not test external AI-provider availability."}
        </p>
      </div>

      <StatusJourney />
      <StatusReadout />

      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 text-xs text-white/35 sm:flex-row sm:items-center">
          <p>{sv ? "BudAI · Stilledev · Förhandsversion" : "BudAI · Stilledev · Developer preview"}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="mailto:noreply@stilledev.se" aria-label={sv ? "E-post till Stilledev" : "Email Stilledev"} className="transition-colors hover:text-accent-cyan">noreply@stilledev.se</a>
            <Link href="/" className="transition-colors hover:text-accent-cyan">{sv ? "Tillbaka till startsidan" : "Return to the BudAI home page"}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
