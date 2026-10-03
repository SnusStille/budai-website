"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import BudAILogo, { StilledevLink } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { prefillPlayground } from "@/lib/playground/events";

export default function Hero() {
  const { t, lang } = useLang();
  const reduceMotion = useReducedMotion();
  const isSv = lang === "sv";
  const prompts = isSv
    ? [
        {
          label: "Skriv ett mejl",
          prompt: "Skriv ett kort, varmt och tydligt mejl till en kund och be om feedback senast fredag.",
        },
        {
          label: "Planera veckan",
          prompt: "Hjälp mig planera veckan. Jag har två möten, en viktig deadline och vill hinna med fokuserat arbete.",
        },
        {
          label: "Förklara enkelt",
          prompt: "Förklara generativ AI enkelt för en kollega som inte jobbar med teknik.",
        },
      ]
    : [
        {
          label: "Write an email",
          prompt: "Write a short, warm, clear email to a client asking for feedback by Friday.",
        },
        {
          label: "Plan my week",
          prompt: "Help me plan my week. I have two meetings, an important deadline, and need time for focused work.",
        },
        {
          label: "Explain it simply",
          prompt: "Explain generative AI simply to a colleague who does not work in tech.",
        },
      ];

  const enterPreview = (prompt: string) => prefillPlayground(prompt);
  const reveal = reduceMotion ? false : { opacity: 0, y: 18 };

  return (
    <section id="home" className="hero-section relative isolate scroll-mt-24 overflow-hidden">
      <div className="hero-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="hero-glow hero-glow--a absolute pointer-events-none" aria-hidden="true" />
      <div className="hero-glow hero-glow--b absolute pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 xl:gap-20">
          <motion.div
            initial={reveal}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="eyebrow-pill mb-7">
              <span className="eyebrow-dot" aria-hidden="true" />
              <span>{t.hero.badge}</span>
              <span className="eyebrow-divider" aria-hidden="true" />
              <span className="text-white/55">{isSv ? "Byggs i Sverige" : "Built in Sweden"}</span>
            </div>

            <h1 className="hero-title mb-6">
              <span className="block">{t.hero.title1}</span>
              <span className="block hero-title-accent">{t.hero.title2}</span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              {t.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#playground" className="button-primary group">
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a href="#waitlist" className="button-secondary">
                <span>{t.hero.ctaSecondary}</span>
              </a>
            </div>

            <div className="hero-proof mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/48 sm:text-sm">
              <span>{isSv ? "Svenska + engelska" : "Swedish + English"}</span>
              <span className="hero-proof-separator" aria-hidden="true" />
              <span>{isSv ? "Testa utan konto" : "Try it without an account"}</span>
              <span className="hero-proof-separator" aria-hidden="true" />
              <span>{isSv ? "Fortfarande under utveckling" : "Still in development"}</span>
            </div>

            <p className="mt-6 text-xs text-white/38">
              {isSv ? "Utvecklad av " : "Made by "}
              <StilledevLink className="!text-white/65 hover:!text-white" />
              <span className="mx-1.5 text-white/25">·</span>
              {isSv ? "Sverige" : "Sweden"}
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hero-visual relative mx-auto w-full max-w-[590px]"
          >
            <div className="hero-orbit hero-orbit--outer" aria-hidden="true" />
            <div className="hero-orbit hero-orbit--inner" aria-hidden="true" />
            <div className="hero-product-card">
              <div className="hero-product-header">
                <div className="flex min-w-0 items-center gap-3">
                  <BudAILogo size="sm" animated />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold tracking-tight text-white">BudAI</div>
                    <div className="text-[11px] text-white/42">{isSv ? "Din AI-arbetsyta" : "Your AI workspace"}</div>
                  </div>
                </div>
                <span className="preview-label">{isSv ? "Förhandsvisning" : "Preview"}</span>
              </div>

              <div className="hero-product-body">
                <div className="hero-product-mark" aria-hidden="true">
                  <span className="hero-product-mark-glow" />
                  <BudAILogo size="lg" animated />
                </div>
                <div className="hero-product-copy">
                  <div className="hero-product-kicker">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isSv ? "Börja med det du har" : "Start with what you have"}
                  </div>
                  <h2>{isSv ? "Från första tanke till nästa steg." : "From first thought to next step."}</h2>
                  <p>
                    {isSv
                      ? "Skriv, tänk och forma idéer i ett samtal — på svenska eller engelska."
                      : "Write, think, and shape ideas in one conversation — in Swedish or English."}
                  </p>
                </div>
              </div>

              <div className="hero-prompt-area">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-white/45">
                    {isSv ? "Välj en startpunkt" : "Choose a starting point"}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                    {isSv ? "Exempel" : "Examples"}
                  </span>
                </div>
                <div className="space-y-2">
                  {prompts.map((item) => (
                    <a
                      key={item.label}
                      href="#playground"
                      onClick={() => enterPreview(item.prompt)}
                      className="hero-prompt-row group"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--cyan)]" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="hero-product-footer">
                <span className="inline-flex items-center gap-2">
                  <span className="hero-footer-dot" aria-hidden="true" />
                  {isSv ? "En produkt i utveckling" : "A product in progress"}
                </span>
                <span>SV <span className="text-white/20">/</span> EN</span>
              </div>
            </div>
            <div className="hero-float-note" aria-hidden="true">
              <span className="hero-float-note-mark"><Sparkles className="h-3.5 w-3.5" /></span>
              <span>{isSv ? "Enklare att komma igång" : "An easier place to start"}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <a
        href="#playground"
        className="hero-scroll-cue"
        aria-label={isSv ? "Fortsätt till Playground" : "Continue to the Playground"}
      >
        <span>{isSv ? "Testa själv" : "Try it yourself"}</span>
        <ArrowRight className="h-3.5 w-3.5 rotate-90" />
      </a>
    </section>
  );
}
