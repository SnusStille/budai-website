"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** One-time tip after load — discoverability for ⌘K */
export default function KeyboardHint() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    try {
      if (localStorage.getItem("budai-cmdk-hint") === "1") return;
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 4200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("budai-cmdk-hint", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[30] hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl glass-strong border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/80">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/15 bg-white/[0.04]">
              <Command className="w-3 h-3" />K
            </span>
            <span className="text-muted">
              {lang === "sv" ? "öppnar kommandopaletten" : "opens the command palette"}
            </span>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 rounded-md text-muted hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
