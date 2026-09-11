"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Globe, Sparkles, Shield, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";

const STAGES = [
  {
    id: "se",
    region: { sv: "Sverige", en: "Sweden" },
    title: { sv: "Grundad här", en: "Rooted here" },
    body: {
      sv: "BudAI börjar i svensk arbetsvardag — mejl, möten, beslut — på det språk du faktiskt använder.",
      en: "BudAI starts in real Swedish workdays — mail, meetings, decisions — in the language you actually use.",
    },
    belief: {
      sv: "Tillgänglig AI för varje person och bolag, inte bara tech-jättar.",
      en: "Accessible AI for every person and company — not only tech giants.",
    },
  },
  {
    id: "nordic",
    region: { sv: "Norden", en: "Nordics" },
    title: { sv: "Nordic-first", en: "Nordic-first" },
    body: {
      sv: "Integritet, transparens och tillit är inte features — de är grunden. GDPR är utgångspunkt, inte eftertanke.",
      en: "Privacy, transparency, and trust are not features — they are the foundation. GDPR is the starting point, not an afterthought.",
    },
    belief: {
      sv: "Människan först. AI som förstärker omdöme — ersätter det inte.",
      en: "Human-first. AI that amplifies judgment — never replaces it.",
    },
  },
  {
    id: "world",
    region: { sv: "Världen", en: "World" },
    title: { sv: "Etisk skala", en: "Ethical scale" },
    body: {
      sv: "Från Sverige och Norden utåt — samma standard för kvalitet, språk och ansvar när BudAI växer.",
      en: "From Sweden and the Nordics outward — the same bar for quality, language, and responsibility as BudAI grows.",
    },
    belief: {
      sv: "Långsiktig ambition utan att tappa det mänskliga.",
      en: "Long-term ambition without losing the human core.",
    },
  },
];

const PILLARS = [
  {
    icon: Sparkles,
    k: { sv: "Mission", en: "Mission" },
    v: {
      sv: "Gör avancerad AI begriplig och användbar i svensk vardag.",
      en: "Make advanced AI clear and useful in everyday Swedish work.",
    },
  },
  {
    icon: Heart,
    k: { sv: "Människa", en: "Human" },
    v: {
      sv: "Stärk människor. Skriv, tänk och besluta snabbare — med dig i centrum.",
      en: "Empower people. Write, think, and decide faster — with you at the center.",
    },
  },
  {
    icon: Shield,
    k: { sv: "Tillit", en: "Trust" },
    v: {
      sv: "Nordic-first integritet. Du äger minne, historik och gränser.",
      en: "Nordic-first privacy. You own memory, history, and boundaries.",
    },
  },
  {
    icon: Globe,
    k: { sv: "Riktning", en: "Direction" },
    v: {
      sv: "Sverige → Norden → världen. Stegvis, ärligt, hållbart.",
      en: "Sweden → Nordics → world. Stepwise, honest, durable.",
    },
  },
];

export default function Vision() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <section className="relative section-hairline py-20 sm:py-28 md:py-32 overflow-hidden">
      {/* Ambient map glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(100vw,900px)] h-[500px] pointer-events-none">
        <div className="absolute inset-0 bg-accent-cyan/[0.04] rounded-full blur-[100px]" />
        <div className="absolute right-0 top-10 w-[40%] h-[40%] bg-accent-purple/[0.06] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <span className="section-badge text-accent-green mb-4">
            {lang === "sv" ? "Vår vision" : "Our vision"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {lang === "sv" ? "AI-arbete med " : "AI work with "}
            <span className="text-gradient">{lang === "sv" ? "svensk ryggrad" : "a Swedish spine"}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {lang === "sv"
              ? "BudAI är inte ytterligare ett generiskt AI-verktyg. Det är en övertygelse om hur arbete kan kännas — smartare, snabbare, mer mänskligt — från Sverige och ut."
              : "BudAI is not another generic AI tool. It is a belief about how work can feel — smarter, faster, more human — from Sweden outward."}
          </p>
        </ScrollReveal>

        {/* Story arc: Sweden → Nordics → World */}
        <ScrollReveal>
          <div className="relative rounded-3xl border border-white/[0.1] bg-[#07070e]/90 overflow-hidden mb-10 md:mb-12 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />

            {/* Path control */}
            <div className="flex flex-col lg:flex-row min-h-[320px]">
              <div className="lg:w-[42%] p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-white/[0.06] flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted/70 mb-4 font-medium">
                  {lang === "sv" ? "Resan" : "The path"}
                </div>

                {/* Node path */}
                <div className="relative flex-1 flex flex-col justify-center gap-0 py-2">
                  <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-accent-cyan/50 via-accent-purple/40 to-accent-green/30" />
                  {STAGES.map((s, i) => {
                    const on = active === i;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActive(i)}
                        onMouseEnter={() => {
                          if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                            setActive(i);
                          }
                        }}
                        className={`relative flex items-start gap-3.5 text-left py-3 pl-1 pr-2 rounded-xl transition-colors ${
                          on ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <span
                          className={`relative z-[1] w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            on
                              ? "border-accent-cyan/50 bg-accent-cyan/15 shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                              : "border-white/15 bg-[#0a0a12]"
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              on ? "bg-accent-cyan shadow-[0_0_8px_#00e5ff]" : "bg-white/25"
                            }`}
                          />
                        </span>
                        <span className="min-w-0 pt-1.5">
                          <span
                            className={`block text-[10px] font-mono uppercase tracking-wider mb-0.5 ${
                              on ? "text-accent-cyan" : "text-muted/50"
                            }`}
                          >
                            {lang === "sv" ? s.region.sv : s.region.en}
                          </span>
                          <span
                            className={`block text-sm sm:text-base font-semibold tracking-tight ${
                              on ? "text-white" : "text-white/70"
                            }`}
                          >
                            {lang === "sv" ? s.title.sv : s.title.en}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active stage canvas */}
              <div className="flex-1 p-5 sm:p-8 relative flex flex-col justify-center">
                <div className="absolute right-6 top-6 opacity-40 pointer-events-none hidden sm:block">
                  <BudAILogo size="lg" animated />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="relative max-w-lg"
                  >
                    <div className="inline-flex items-center gap-2 text-[11px] font-mono text-accent-cyan mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                      {active + 1} / {STAGES.length}
                      <ArrowRight className="w-3 h-3 opacity-50" />
                      {lang === "sv" ? stage.region.sv : stage.region.en}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                      {lang === "sv" ? stage.title.sv : stage.title.en}
                    </h3>
                    <p className="text-sm sm:text-base text-muted leading-relaxed mb-5">
                      {lang === "sv" ? stage.body.sv : stage.body.en}
                    </p>
                    <div className="rounded-2xl border border-accent-cyan/20 bg-accent-cyan/[0.05] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-wider text-accent-cyan/80 mb-1">
                        {lang === "sv" ? "Vi tror" : "We believe"}
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {lang === "sv" ? stage.belief.sv : stage.belief.en}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Mini progress dots mobile */}
                <div className="flex gap-2 mt-6 lg:hidden">
                  {STAGES.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === active ? "w-8 bg-accent-cyan" : "w-1.5 bg-white/20"
                      }`}
                      aria-label={s.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Belief pillars — denser, less generic cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
          {PILLARS.map((p, i) => (
            <ScrollReveal key={p.k.en} delay={Math.min(i * 0.04, 0.16)}>
              <SpotlightCard className="h-full">
                <div className="h-full rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4 sm:p-5 group">
                  <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <p.icon className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <div className="text-sm font-semibold text-white mb-1.5">
                    {lang === "sv" ? p.k.sv : p.k.en}
                  </div>
                  <p className="text-xs sm:text-[13px] text-muted leading-relaxed">
                    {lang === "sv" ? p.v.sv : p.v.en}
                  </p>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <blockquote className="text-xl md:text-2xl lg:text-3xl font-light text-white/75 leading-relaxed tracking-tight">
              {lang === "sv"
                ? "”Vi bygger inte hype. Vi bygger arbetsyta som respekterar nordisk tillit — och skalas utan att tappa den.”"
                : "“We are not building hype. We are building a work surface that respects Nordic trust — and scales without losing it.”"}
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border border-white/15 bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 flex items-center justify-center shadow-[0_0_24px_rgba(0,229,255,0.15)]">
                <StilledevMark size={28} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-accent-cyan">Stilledev</div>
                <div className="text-xs text-muted">
                  {lang === "sv" ? "BudAI · Sverige" : "BudAI · Sweden"}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
