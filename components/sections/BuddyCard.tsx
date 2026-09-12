"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, Tag } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

const DISMISS_KEY = "budai-buddy-popup-dismissed";
const SHOW_AFTER_MS = 4500;
const AUTO_HIDE_MS = 12000;

export default function BuddyCard({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const show = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hide = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(DISMISS_KEY, "true");
      } catch {
        /* ignore */
      }
    }, AUTO_HIDE_MS);
    return () => clearTimeout(hide);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`${className} fixed bottom-4 right-4 z-[30] w-[min(300px,calc(100vw-2rem))]`}
        >
          <div className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#12121c] to-[#0a0a12] shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />
            {/* Auto-hide progress */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-accent-cyan to-accent-purple"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: AUTO_HIDE_MS / 1000, ease: "linear" }}
            />

            <button
              type="button"
              onClick={dismiss}
              aria-label={lang === "sv" ? "Stäng" : "Close"}
              className="absolute top-3 right-3 p-1 rounded-lg text-muted/60 hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative flex items-start gap-3 p-4 pb-2">
              <div className="relative shrink-0">
                <BudAILogo size="md" animated />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green border-2 border-[#0a0a12]" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-semibold text-white leading-snug">
                  {lang === "sv" ? "Testa BudAI nu" : "Try BudAI now"}
                </p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  {lang === "sv"
                    ? "Live playground under preview — under en minut."
                    : "Live playground under preview — under a minute."}
                </p>
              </div>
            </div>

            <div className="px-4 pb-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] text-accent-green/90 font-medium">
                <Tag className="w-3 h-3" />
                {lang === "sv"
                  ? "10 % early access under preview"
                  : "10% early access during preview"}
              </div>
            </div>

            <div className="px-4 pb-4">
              <a
                href="#playground"
                onClick={dismiss}
                className="relative flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {lang === "sv" ? "Öppna playground" : "Open playground"}
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
