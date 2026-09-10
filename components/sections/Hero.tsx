"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Code2, Zap, Shield, ChevronDown, Command } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import Magnetic from "@/components/ui/Magnetic";
import AICore from "@/components/effects/AICore";
import { StilledevLink } from "@/components/ui/BudAILogo";

export default function Hero() {
  const { t, lang } = useLang();
  const [isMobile, setIsMobile] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setWordIndex(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % t.hero.words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [t.hero.words]);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-24 pb-16">
      {!isMobile && (
        <>
          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[70vw] max-w-[900px] h-[50vw] max-h-[520px] bg-accent-cyan/[0.07] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[8%] w-[40vw] max-w-[420px] h-[40vw] max-h-[420px] bg-accent-purple/[0.05] rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-strong mb-8 sm:mb-10 border border-accent-green/25 shadow-[0_0_40px_rgba(0,255,157,0.08)]"
        >
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-70 bg-accent-green animate-ping" />
            <span className="relative inline-flex rounded-full h-full w-full bg-accent-green" />
          </span>
          <span className="text-xs sm:text-sm font-medium text-accent-green">{t.hero.badge}</span>
          <span className="w-px h-3.5 bg-white/10" />
          <span className="text-xs sm:text-sm text-muted flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md bg-white/[0.06] border border-accent-cyan/25 text-accent-cyan tracking-wide">
              v0.93
            </span>
            <span className="hidden sm:inline">93% to launch</span>
          </span>
        </motion.div>

        <motion.a
          href="#waitlist"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="mx-auto -mt-5 sm:-mt-6 mb-7 sm:mb-9 block w-fit text-[11px] sm:text-xs text-muted/70 hover:text-accent-green transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.02] hover:border-accent-green/25">
            <span className="text-accent-green/90 font-medium">10%</span>
            <span className="text-muted/40">·</span>
            <span>
              {lang === "sv" ? "early access vid join" : "early access on join"}
            </span>
          </span>
        </motion.a>

        <AICore isMobile={isMobile} />

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
          className="text-[2.6rem] leading-[1.08] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[-0.03em] mb-5 sm:mb-6 text-white"
        >
          <span className="block text-white/95">{t.hero.title1}</span>
          <span className="relative block mt-1.5 h-[1.15em] overflow-visible">
            <AnimatePresence mode="wait">
              <motion.span
                key={t.hero.words[wordIndex]}
                initial={{ y: "40%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-40%", opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative inline-block text-gradient-shimmer"
              >
                {t.hero.words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-3 leading-relaxed"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-sm text-muted/55 mb-10 sm:mb-12 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_#00e5ff]" />
          {lang === "sv" ? "Utvecklad av" : "Developed by"}{" "}
          <StilledevLink />
          <span className="text-muted/30">·</span>
          <span>Sweden</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16"
        >
          <Magnetic>
            <a href="#waitlist" className="btn-primary text-base sm:text-lg !px-7 sm:!px-8 !py-3.5 sm:!py-4 group w-full sm:w-auto">
              <span className="flex items-center justify-center gap-2">
                {t.hero.ctaSecondary}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </Magnetic>
          <Magnetic strength={0.18}>
            <a href="#playground" className="btn-ghost text-base sm:text-lg !px-7 sm:!px-8 !py-3.5 sm:!py-4 w-full sm:w-auto">
              {t.hero.ctaPrimary}
            </a>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {[
            { icon: Sparkles, label: "AI-Driven", color: "text-accent-cyan" },
            { icon: Code2, label: "Code Generation", color: "text-accent-purple" },
            { icon: Zap, label: "Automation", color: "text-accent-green" },
            { icon: Shield, label: "Enterprise-Ready", color: "text-accent-pink" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + i * 0.06, duration: 0.35 }}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass border border-white/[0.07] text-xs sm:text-sm text-white/70 hover:text-white hover:border-white/15 transition-colors duration-300"
            >
              <item.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.color}`} />
              {item.label}
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
            );
          }}
          className="mt-10 hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-muted/50 hover:text-muted border border-transparent hover:border-white/10 hover:bg-white/[0.03] transition-all font-mono"
        >
          <Command className="w-3 h-3" />K
          <span className="text-muted/35">{lang === "sv" ? "kommandopalett" : "command palette"}</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <a
            href="#capabilities"
            className="flex flex-col items-center gap-1.5 text-muted/35 hover:text-muted/70 transition-colors"
            aria-label="Scroll to capabilities"
          >
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <ChevronDown className="w-5 h-5 opacity-80" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
