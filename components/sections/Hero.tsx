"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Languages, Zap, ChevronDown } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import Magnetic from "@/components/ui/Magnetic";
import { isIntroDone, subscribeIntro } from "@/components/effects/introState";
import NeuralCinema from "@/components/effects/NeuralCinema";
import { StilledevLink } from "@/components/ui/BudAILogo";

/**
 * Opening: BudAI's living neural core next to the promise, with the Playground
 * one click away. The core is a single WebGL scene (NeuralCinema) — the same engine
 * the scroll chapter uses, so the whole site shares one visual language.
 */
export default function Hero() {
  const { t, lang } = useLang();
  const [isMobile, setIsMobile] = useState(false);
  const [introReady, setIntroReady] = useState(isIntroDone);

  useEffect(() => subscribeIntro(() => setIntroReady(true)), []);

  // Safety: if the intro never reports back, never leave the hero blank.
  useEffect(() => {
    if (introReady) return;
    const id = window.setTimeout(() => setIntroReady(true), 3600);
    return () => window.clearTimeout(id);
  }, [introReady]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const chips =
    lang === "sv"
      ? [
          { icon: FileText, label: "Privat · skriv & planera", color: "text-accent-cyan" },
          { icon: Zap, label: "Företag · automatisera", color: "text-accent-green" },
          { icon: Languages, label: "EN · SV", color: "text-accent-purple" },
        ]
      : [
          { icon: FileText, label: "Personal · write & plan", color: "text-accent-cyan" },
          { icon: Zap, label: "Business · automate", color: "text-accent-green" },
          { icon: Languages, label: "EN · SV", color: "text-accent-purple" },
        ];

  const accent =
    "titleAccent" in t.hero && typeof (t.hero as { titleAccent?: string }).titleAccent === "string"
      ? (t.hero as { titleAccent: string }).titleAccent
      : lang === "sv"
        ? "Sverige"
        : "Sweden";

  if (!introReady) {
    return <section className="relative min-h-[100svh]" aria-hidden />;
  }

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ambient atmosphere — cheap CSS, no canvas */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute left-[58%] top-[16%] h-[46vw] max-h-[560px] w-[46vw] max-w-[560px] -translate-x-1/2 rounded-full bg-accent-cyan/[0.07] blur-[120px]" />
          <div className="absolute bottom-[6%] right-0 h-[30vw] max-h-[380px] w-[30vw] max-w-[380px] rounded-full bg-accent-purple/[0.06] blur-[100px]" />
        </div>

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6">
          {/* ---------------- copy ---------------- */}
          <div className="relative z-10 order-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-accent-green/25 px-4 py-2 glass-strong shadow-[0_0_40px_rgba(45,212,191,0.08)] sm:mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-70" />
                <span className="relative inline-flex h-full w-full rounded-full bg-accent-green" />
              </span>
              <span className="text-xs font-medium text-accent-green sm:text-sm">{t.hero.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-2xl text-[2.5rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-6xl lg:mx-0 lg:text-[4.1rem]"
            >
              <span className="block text-white/95">{t.hero.title1}</span>
              <span className="mt-1 block">
                <span className="text-gradient">{t.hero.title2}</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-4 text-sm font-medium text-muted sm:text-base"
            >
              {lang === "sv" ? "För " : "For "}
              <span className="font-semibold text-accent-cyan">{accent}</span>
              {lang === "sv" ? " · och Norden" : " · and the Nordics"}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg lg:mx-0"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32 }}
              className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:justify-start"
            >
              <Magnetic>
                <a
                  href="#playground"
                  className="btn-primary inline-flex items-center gap-2 !px-7 !py-3.5 text-sm shadow-[0_0_40px_rgba(0,229,255,0.2)] sm:text-base"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Magnetic>
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm text-white/85 transition-colors hover:border-accent-cyan/30 hover:bg-white/[0.05] sm:text-base"
              >
                {t.hero.ctaSecondary}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-start"
            >
              {chips.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[11px] text-muted sm:text-xs"
                >
                  <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
                  {c.label}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.46 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted/60 lg:justify-start"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1">
                <span className="font-medium text-accent-green">10%</span>
                <span className="text-muted/40">·</span>
                <span>{lang === "sv" ? "early access vid join" : "early access on join"}</span>
              </span>
              <span>{lang === "sv" ? "Utvecklad av " : "Built by "}</span>
              <StilledevLink />
            </motion.p>
          </div>

          {/* ---------------- living core ---------------- */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[4%] order-2 h-[52svh] opacity-40 [mask-image:radial-gradient(circle_at_50%_45%,#000_42%,transparent_76%)] lg:relative lg:inset-auto lg:top-auto lg:order-2 lg:mx-auto lg:h-auto lg:aspect-square lg:w-full lg:max-w-[560px] lg:opacity-100 lg:[mask-image:none]"
            aria-hidden
          >
            <div className="absolute inset-0">
              <NeuralCinema mode="hero" />
            </div>

            {/* HUD frame — only on the large layout, where the core has its own column */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <div className="absolute left-2 top-2 h-8 w-8 border-l border-t border-accent-cyan/25" />
              <div className="absolute right-2 top-2 h-8 w-8 border-r border-t border-accent-cyan/25" />
              <div className="absolute bottom-2 left-2 h-8 w-8 border-b border-l border-accent-cyan/25" />
              <div className="absolute bottom-2 right-2 h-8 w-8 border-b border-r border-accent-cyan/25" />
              <div className="absolute inset-[14%] rounded-full border border-dashed border-white/[0.06] logo-ambient-spin" style={{ animationDuration: "58s" }} />
              <div className="absolute inset-[24%] rounded-full border border-accent-cyan/10" />
            </div>

            <p className="absolute inset-x-0 bottom-1 hidden justify-center font-mono text-[10px] uppercase tracking-[0.34em] text-accent-cyan/60 lg:flex">
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
              {lang === "sv" ? "neural core · live" : "neural core · live"}
            </p>
          </div>
        </div>

        <motion.a
          href="#neural"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute -bottom-2 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-muted/40 transition-colors hover:text-accent-cyan sm:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">
            {lang === "sv" ? "Skrolla" : "Scroll"}
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.a>
      </div>

      {isMobile && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />
      )}
    </section>
  );
}
