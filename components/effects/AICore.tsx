"use client";

import { motion } from "framer-motion";
import BudAILogo from "@/components/ui/BudAILogo";

/** Hero logo stage — a single BudAILogo with soft ambient motion. */
export default function AICore({ isMobile = false }: { isMobile?: boolean }) {
  const dim = isMobile ? 160 : 212;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.78 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto flex items-center justify-center"
      style={{ width: dim + 28, height: dim + 12 }}
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

      <div className="relative z-10 mt-1 transition-transform duration-300 hover:scale-[1.05]">
        <BudAILogo size="hero" animated />
      </div>
    </motion.div>
  );
}
