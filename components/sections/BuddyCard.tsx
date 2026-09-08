"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

const DISMISS_KEY = "budai-buddy-popup-dismissed";
const SHOW_AFTER_MS = 5000;

export default function BuddyCard({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
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
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, type: "spring", damping: 18 }}
          // The cookie banner now lives centered at the bottom, so this can
          // just sit in its corner without needing to dodge it.
          className={`${className} fixed bottom-4 right-4 z-[30] w-[290px]`}
        >
          <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#12121c] to-[#0a0a12] shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />

            <button
              onClick={dismiss}
              aria-label={lang === "sv" ? "Stäng" : "Close"}
              className="absolute top-3 right-3 p-1 rounded-lg text-muted/60 hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative flex items-start gap-3 p-4 pb-3">
              <div className="relative shrink-0">
                <BudAILogo size="md" animated={false} />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-[#0a0a12]" />
              </div>
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-sm font-semibold text-white leading-snug">
                  {lang === "sv" ? "Testa din nya bästa vän" : "Try your new best friend"}
                </p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  {lang === "sv" ? "Se vad BudAI kan göra på under en minut." : "See what BudAI can do in under a minute."}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <a
                href="#playground"
                onClick={dismiss}
                className="relative flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {lang === "sv" ? "Testa BudAI" : "Try BudAI"}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
