"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, ArrowRight, X } from "lucide-react";

export default function BuddyCard({ className = "" }: { className?: string }) {
  const [hovered, setHovered] = useState(false);

  const scrollToPlayground = () => {
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`${className} relative flex items-center justify-end group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-[calc(100%+16px)] whitespace-nowrap"
          >
            <div className="relative glass-strong px-4 py-2.5 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
              <p className="text-sm font-medium text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                Ask BudAI anything
              </p>
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-surface border-t border-r border-white/10 rotate-45" style={{ background: "rgba(8, 8, 15, 0.9)" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={scrollToPlayground}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-accent-cyan to-accent-purple p-0.5 shadow-[0_0_30px_rgba(0,229,255,0.25)] transition-all hover:shadow-[0_0_40px_rgba(185,103,255,0.4)]"
        aria-label="Open AI Playground"
      >
        <div className="absolute inset-0 rounded-full bg-black/20" />
        <Bot className="relative z-10 h-6 w-6 text-white" />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-green shadow-[0_0_10px_rgba(0,255,157,0.5)]">
          <span className="h-2 w-2 rounded-full bg-white" />
        </span>
      </motion.button>
    </div>
  );
}
