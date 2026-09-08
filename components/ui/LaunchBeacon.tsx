"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Surprise — idle beacon.
 * After ~45s on the page without leaving, a quiet launch-ready toast appears.
 * Also triggers once if the user focuses the window after being away.
 */
export default function LaunchBeacon() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("budai-beacon")) return;
    } catch {
      /* ignore */
    }

    const show = () => {
      try {
        if (sessionStorage.getItem("budai-beacon")) return;
        sessionStorage.setItem("budai-beacon", "1");
      } catch {
        /* ignore */
      }
      setOpen(true);
      setTimeout(() => setOpen(false), 7000);
    };

    const timer = setTimeout(show, 45000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          className="fixed bottom-24 right-4 sm:right-6 z-[70] w-[min(100%-2rem,20rem)]"
          role="status"
        >
          <div className="rounded-2xl glass-strong border border-accent-purple/30 shadow-[0_0_40px_rgba(185,103,255,0.2)] p-4 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-accent-purple font-semibold mb-0.5">
                {lang === "sv" ? "Beacon online" : "Beacon online"}
              </div>
              <p className="text-sm text-white leading-snug">
                {lang === "sv"
                  ? "BudAI v0.92 lyssnar. 92% till launch — du är tidig. Det är en bra sak."
                  : "BudAI v0.92 is listening. 92% to launch — you're early. That's a good thing."}
              </p>
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
