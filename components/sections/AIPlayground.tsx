"use client";

import { Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import PlaygroundApp from "@/components/playground/PlaygroundApp";

const RIBBON: Record<"sv" | "en", string[]> = {
  sv: ["Strömmande svar", "Svenska + engelska", "Röst & bild", "Promptbibliotek", "Fungerar utan konto"],
  en: ["Streaming answers", "Swedish + English", "Voice & images", "Prompt library", "Works without an account"],
};

export default function AIPlayground() {
  const { t, lang } = useLang();
  const isSv = lang === "sv";

  return (
    <section id="playground" className="pgx-section relative scroll-mt-24 overflow-hidden">
      <div className="pgx-section-glow" aria-hidden="true" />
      <div className="pgx-section-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[86rem] px-3 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto mb-7 max-w-3xl text-center sm:mb-10">
          <span className="pgx-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {t.playground.badge}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[44px] md:leading-[1.1]">
            {t.playground.title} <span className="text-gradient">{t.playground.titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            {isSv
              ? "Ett komplett arbetsbord: strömmande svar, roller, promptbibliotek, minne, röst, bilder och paneler. Allt i en tidig förhandsvisning — börja utan konto."
              : "A full workbench: streaming answers, personas, a prompt library, memory, voice, images and side panels. All in an early preview — start without an account."}
          </p>
          <div className="pgx-ribbon">
            {RIBBON[lang].map((item) => (
              <span key={item} className="pgx-ribbon-chip">
                <span className="pgx-ribbon-dot" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <PlaygroundApp />
        </ScrollReveal>
      </div>
    </section>
  );
}
