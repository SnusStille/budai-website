"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

export default function BuddyCard({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href="#playground"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 1.5, type: "spring", damping: 15 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${className} group relative flex items-center gap-0 rounded-2xl border border-accent-cyan/20 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-xl shadow-[0_0_30px_rgba(0,229,255,0.12),0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.22),0_8px_32px_rgba(0,0,0,0.4)] hover:border-accent-cyan/40 overflow-hidden`}
    >
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-2xl border border-accent-cyan/20 animate-ping opacity-20" />

      {/* Icon */}
      <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0">
        <Sparkles className="w-6 h-6 text-white" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple animate-pulse opacity-30" />
      </div>

      {/* Expandable text on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0 }}
            animate={{ width: "auto", opacity: 1, paddingLeft: 12, paddingRight: 12 }}
            exit={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">
                {lang === "sv" ? "Testa mig!" : "Try me!"}
              </span>
              <span className="text-[10px] text-accent-cyan/70">
                {lang === "sv" ? "AI Playground →" : "AI Playground →"}
              </span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-accent-cyan shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
}