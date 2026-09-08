"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Surprise #2 — press "N" for a Nordic night-pulse:
 * brief aurora wash across the viewport + a quiet toast.
 * (Ignored while typing in inputs.)
 */
export default function ThemePulse() {
  const { lang } = useLang();
  const [flash, setFlash] = useState(false);
  const [note, setNote] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable)
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() !== "n") return;
      setFlash(true);
      setNote(true);
      setTimeout(() => setFlash(false), 1400);
      setTimeout(() => setNote(false), 3200);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] pointer-events-none"
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,229,255,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0,255,157,0.12), transparent 50%), radial-gradient(ellipse 50% 35% at 85% 60%, rgba(185,103,255,0.14), transparent 50%)",
              }}
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full glass-strong border border-accent-cyan/25 text-xs text-white/90 shadow-[0_0_24px_rgba(0,229,255,0.2)] pointer-events-none"
          >
            {lang === "sv" ? "✦ Nordiskt norrsken" : "✦ Nordic aurora"}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
