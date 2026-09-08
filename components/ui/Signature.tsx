"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * BIG SURPRISE — Konami code unlocks a floating signature card
 * from Stilledev. Also available by typing "stille" (like budai egg).
 */
export default function Signature() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const KONAMI = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let ki = 0;
    let buf = "";

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable)
        return;

      // Konami
      if (e.key === KONAMI[ki]) {
        ki++;
        if (ki === KONAMI.length) {
          ki = 0;
          setOpen(true);
          document.documentElement.classList.add("egg-flash");
          setTimeout(() => document.documentElement.classList.remove("egg-flash"), 1200);
        }
      } else {
        ki = e.key === KONAMI[0] ? 1 : 0;
      }

      // type "stille"
      if (e.key.length === 1) {
        buf = (buf + e.key.toLowerCase()).slice(-6);
        if (buf === "stille") {
          setOpen(true);
          buf = "";
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ scale: 0.9, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="relative z-10 w-full max-w-sm rounded-2xl glass-strong border border-accent-cyan/25 p-6 shadow-[0_0_80px_rgba(0,229,255,0.2)] text-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent-cyan/20 rounded-full blur-3xl pointer-events-none" />

            <p className="text-[11px] font-mono text-accent-cyan/80 mb-3 tracking-widest uppercase">
              Founder note
            </p>
            <h3 className="text-xl font-bold text-white mb-2">
              {lang === "sv" ? "Byggt i Sverige." : "Built in Sweden."}
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-5">
              {lang === "sv"
                ? "BudAI är inte bara kod — det är en vision om hur arbete ska kännas. Tack för att du tittar in. Hör av dig om du vill bygga framtiden med oss."
                : "BudAI isn’t just code — it’s a vision for how work should feel. Thanks for stopping by. Reach out if you want to build the future with us."}
            </p>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-sm font-bold text-white shadow-[0_0_20px_rgba(0,229,255,0.35)]">
                S
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-accent-cyan">Stilledev</div>
                <div className="text-[11px] text-muted">Creator of BudAI</div>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <a
                href="https://discord.com/users/353944097301594123"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !px-4 !py-2 text-xs"
              >
                <span>Discord</span>
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost !px-4 !py-2 text-xs"
              >
                {lang === "sv" ? "Stäng" : "Close"}
              </button>
            </div>
            <p className="mt-4 text-[10px] text-muted/40 font-mono">
              tip: konami · or type “stille”
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
