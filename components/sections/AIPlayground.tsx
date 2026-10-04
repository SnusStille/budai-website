"use client";

import { Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import PlaygroundApp from "@/components/playground/PlaygroundApp";



export default function AIPlayground() {
  const { t, lang } = useLang();
  const isSv = lang === "sv";

  return (
    <section id="playground" className="pgx-section relative scroll-mt-24 overflow-hidden">
      <div className="pgx-section-glow" aria-hidden="true" />
      <div className="pgx-section-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[86rem] px-3 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto mb-5 max-w-2xl text-center sm:mb-7">
          <span className="pgx-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {t.playground.badge}
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-[36px] md:leading-[1.12]">
            {t.playground.title} <span className="text-gradient">{t.playground.titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            {isSv
              ? "Skriv, prata eller klistra in — BudAI svarar direkt. Börja utan konto."
              : "Type, talk or paste — BudAI answers right away. Start without an account."}
          </p>

        </ScrollReveal>


        <ScrollReveal>
          <PlaygroundApp />
        </ScrollReveal>
      </div>
    </section>
  );
}
