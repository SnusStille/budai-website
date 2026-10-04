"use client";

import { ArrowRight, BadgePercent, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { prefillPlayground } from "@/lib/playground/events";

const STARTERS: Record<"sv" | "en", { label: string; prompt: string }[]> = {
  sv: [
    { label: "Skriv ett professionellt mejl", prompt: "Skriv ett professionellt mejl till en kund som väntar på svar. Kort, varmt, tydligt nästa steg." },
    { label: "Planera min vecka", prompt: "Hjälp mig planera veckan: tre fokusblock, möten och återhämtning. Fråga vad jag jobbar med." },
    { label: "Förklara detta på svenska", prompt: "Förklara skillnaden mellan AI och maskininlärning på enkel svenska, med en vardaglig jämförelse." },
    { label: "Idé för mitt företag", prompt: "Ge mig fem konkreta idéer för hur ett litet svenskt företag kan spara tid med AI varje vecka." },
  ],
  en: [
    { label: "Write a professional email", prompt: "Write a professional email to a client who is waiting for an answer. Short, warm, clear next step." },
    { label: "Plan my week", prompt: "Help me plan my week: three focus blocks, meetings and recovery. Ask what I'm working on." },
    { label: "Explain this in Swedish", prompt: "Explain the difference between AI and machine learning in simple Swedish, with an everyday analogy." },
    { label: "An idea for my company", prompt: "Give me five concrete ideas for how a small Swedish company can save time with AI every week." },
  ],
};

export default function Hero() {
  const { lang } = useLang();
  const isSv = lang === "sv";

  return (
    <section id="home" className="hero-section relative isolate scroll-mt-24 overflow-hidden">
      <div className="hero-glow hero-glow--a absolute pointer-events-none" aria-hidden="true" />
      <div className="hero-glow hero-glow--b absolute pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[76rem] px-5 pb-4 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <BudAILogo size="md" animated motion="idle" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="hero-title mt-6"
          >
            Bud<span className="hero-title-accent">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="hero-lede"
          >
            {isSv
              ? "Din AI-assistent för svenska och engelska arbetsdagar. Testa direkt — utan konto."
              : "Your AI work assistant for Swedish and English workdays. Try it right now — no account."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="#playground" className="hero-cta is-primary">
              {isSv ? "Öppna Playground" : "Open the Playground"}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#waitlist" className="hero-cta">
              <BadgePercent className="h-4 w-4" />
              {isSv ? "10 % rabatt vid launch" : "10% off at launch"}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11.5px] text-white/40"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--pgx-a1,#3ee0cd)]" />
              {isSv ? "Tidig förhandsvisning" : "Early preview"}
            </span>
            <span className="hero-dot" aria-hidden />
            <span>{isSv ? "Byggt i Sverige av Stilledev" : "Built in Sweden by Stilledev"}</span>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {STARTERS[lang].map((starter, index) => (
              <motion.button
                key={starter.label}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                onClick={() => prefillPlayground(starter.prompt)}
                className="hero-starter"
                title={isSv ? "Fyll skrivfältet i Playground" : "Fill the Playground composer"}
              >
                {starter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
