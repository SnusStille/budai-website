"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUpRight, X, MessageCircle } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

const DISMISS_KEY = "budai-buddy-popup-dismissed";
const COOKIE_KEY = "budai-cookies";
const SHOW_AFTER_MS = 5000;

export default function BuddyCard({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);
  const [raised, setRaised] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => {
      setRaised(!localStorage.getItem(COOKIE_KEY));
      setVisible(true);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.5, type: "spring", damping: 20, stiffness: 300 }}
          className={`${className} fixed ${raised ? "bottom-24 md:bottom-28" : "bottom-6"} left-6 z-[30] w-[300px]`}
        >
          <div className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0d0d18]/95 to-[#08080f]/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden p-5">
            {/* Subtle glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-cyan/10 rounded-full blur-2xl pointer-events-none" />
            
            <button
              onClick={dismiss}
              aria-label={lang === "sv" ? "Stäng" : "Close"}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-muted/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative flex items-start gap-3.5 pr-6">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple shadow-[0_0_20px_rgba(0,229,255,0.2)] shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-[#0d0d18]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-snug">
                  {lang === "sv" ? "Testa din nya bästa vän" : "Try your new best friend"}
                </p>
                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  {lang === "sv" ? "Se vad BudAI kan göra på under en minut." : "See what BudAI can do in under a minute."}
                </p>
              </div>
            </div>

            <a
              href="#playground"
              onClick={dismiss}
              className="relative mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-white hover:bg-white/10 hover:border-accent-cyan/30 transition-all group/btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              {lang === "sv" ? "Testa BudAI" : "Try BudAI"}
              <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover/btn:text-accent-cyan group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}