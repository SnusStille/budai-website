"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Languages, Zap, Shield, ChevronDown } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import Magnetic from "@/components/ui/Magnetic";
import AICore from "@/components/effects/AICore";
import { StilledevLink } from "@/components/ui/BudAILogo";

export default function Hero() {
  const { t, lang } = useLang();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const chips =
    lang === "sv"
      ? [
          { icon: FileText, label: "Utkast & dokument", color: "text-accent-cyan" },
          { icon: Zap, label: "Automatisering", color: "text-accent-green" },
          { icon: Languages, label: "EN · SV", color: "text-accent-purple" },
          { icon: Shield, label: "Nordic-first", color: "text-accent-pink" },
        ]
      : [
          { icon: FileText, label: "Drafts & docs", color: "text-accent-cyan" },
          { icon: Zap, label: "Automation", color: "text-accent-green" },
          { icon: Languages, label: "EN · SV", color: "text-accent-purple" },
          { icon: Shield, label: "Nordic-first", color: "text-accent-pink" },
        ];

  const accent =
    "titleAccent" in t.hero && typeof (t.hero as { titleAccent?: string }).titleAccent === "string"
      ? (t.hero as { titleAccent: string }).titleAccent
      : lang === "sv"
        ? "Sverige"
        : "Sweden";

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
          transition={{ duration: 0.55, delay: 0.12 }}
          className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-strong mb-6 sm:mb-8 border border-accent-green/25 shadow-[0_0_40px_rgba(0,255,157,0.08)]"
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
            <span className="hidden sm:inline">93%</span>
          </span>
        </motion.div>

        <motion.a
          href="#waitlist"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="mx-auto mb-6 sm:mb-8 block w-fit text-[11px] sm:text-xs text-muted/70 hover:text-accent-green transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.07] bg-white/[0.02] hover:border-accent-green/25">
            <span className="text-accent-green/90 font-medium">10%</span>
            <span className="text-muted/40">·</span>
            <span>{lang === "sv" ? "early access vid join" : "early access on join"}</span>
          </span>
        </motion.a>

        {/* Single product mark — no rotating headline words */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex justify-center mb-5 sm:mb-7"
        >
          <AICore isMobile={isMobile} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="text-[2.45rem] leading-[1.08] sm:text-6xl md:text-7xl lg:text-[4.75rem] font-bold tracking-[-0.035em] mb-5 sm:mb-6 text-white max-w-4xl mx-auto"
        >
          <span className="block text-white/95">{t.hero.title1}</span>
          <span className="block mt-1">
            <span className="text-gradient">{t.hero.title2}</span>
          </span>
          <span className="mt-3 block text-base sm:text-lg md:text-xl font-medium tracking-normal text-muted">
            {lang === "sv" ? "För " : "For "}
            <span className="text-accent-cyan font-semibold">{accent}</span>
            {lang === "sv" ? " · och Norden" : " · and the Nordics"}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          <Magnetic>
            <a
              href="#playground"
              className="btn-primary inline-flex items-center gap-2 !px-7 !py-3.5 text-sm sm:text-base shadow-[0_0_40px_rgba(0,229,255,0.2)]"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Magnetic>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm sm:text-base text-white/85 hover:border-accent-cyan/30 hover:bg-white/[0.05] transition-colors"
          >
            {t.hero.ctaSecondary}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8"
        >
          {chips.map((c) => (
            <span
              key={c.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] text-[11px] sm:text-xs text-muted"
            >
              <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
              {c.label}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-xs text-muted/50"
        >
          {lang === "sv" ? "Utvecklad av " : "Built by "}
          <StilledevLink />
          <span className="text-muted/30"> · </span>
          Sweden
        </motion.p>

        <motion.a
          href="#capabilities"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted/40 hover:text-accent-cyan transition-colors hidden sm:flex flex-col items-center gap-1"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.a>
      </div>
    </section>
  );
}
