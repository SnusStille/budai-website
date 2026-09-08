"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Surprise #1 — scroll-depth achievement toast.
 * Unlocks quietly when the visitor reaches ~70% of the page.
 */
export default function AchievementToast() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("budai-achievement-explorer")) return;
    } catch {
      /* ignore */
    }

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = window.scrollY / max;
      if (pct >= 0.7) {
        try {
          sessionStorage.setItem("budai-achievement-explorer", "1");
        } catch {
          /* ignore */
        }
        setOpen(true);
        window.removeEventListener("scroll", onScroll);
        setTimeout(() => setOpen(false), 6500);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const title = lang === "sv" ? "Achievement unlocked" : "Achievement unlocked";
  const body =
    lang === "sv"
      ? "Explorer — du har sett merparten av BudAI. Välkommen till grunden."
      : "Explorer — you've seen most of BudAI. Welcome to the foundation.";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: "-50%", scale: 0.94 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className="fixed bottom-20 sm:bottom-8 left-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-sm"
          role="status"
        >
          <div className="rounded-2xl glass-strong border border-accent-cyan/25 shadow-[0_0_40px_rgba(0,229,255,0.18)] p-4 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,229,255,0.35)]">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-accent-cyan/80 font-semibold mb-0.5">
                {title}
              </div>
              <p className="text-sm text-white leading-snug">{body}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-muted hover:text-white"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
