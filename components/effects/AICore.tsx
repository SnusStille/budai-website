"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Hero logo stage — single BudAILogo, soft ambient motion only.
 * Click → Neural Core sheet (honest preview info).
 */
export default function AICore({ isMobile = false }: { isMobile?: boolean }) {
  const { lang } = useLang();
  const heroRef = useRef<HTMLDivElement>(null);

  const dim = isMobile ? 160 : 212;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.78 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mb-2 sm:mb-3 flex flex-col items-center"
        style={{ width: dim + 28, height: dim + 32 }}
      >
        <span
          aria-hidden
          className="absolute inset-[-8%] rounded-full pointer-events-none opacity-70 logo-ambient-spin"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(0,229,255,0.22) 12%, transparent 28%, rgba(124,92,255,0.18) 48%, transparent 62%, rgba(45,212,191,0.12) 78%, transparent 100%)",
            filter: "blur(14px)",
          }}
        />
        <span
          aria-hidden
          className="absolute inset-[6%] rounded-full pointer-events-none border border-accent-cyan/15 logo-pulse-ring"
        />
        <span
          aria-hidden
          className="absolute inset-[-4%] rounded-full pointer-events-none border border-dashed border-white/10 logo-ambient-spin"
          style={{ animationDuration: "40s", animationDirection: "reverse" }}
        />

        <div ref={heroRef} className="relative z-10 mt-1 transition-transform duration-300 hover:scale-[1.05] active:scale-[0.97]">
          <BudAILogo
            size="hero"
            animated
            interactive
            onClick={() => window.dispatchEvent(new CustomEvent("budai:logo-click", { detail: { el: heroRef.current } }))}
            label="BudAI"
          />
        </div>

        <p className="mt-4 text-[11px] sm:text-xs text-accent-cyan/70 font-mono tracking-wide animate-pulse">
          {lang === "sv" ? "● core online" : "● core online"}
        </p>
      </motion.div>

    </>
  );
}
