"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/components/ui/LanguageContext";

const EVENTS_SV = [
  "Tokeniserar…",
  "Embeddings (Nordic)…",
  "Attention: 32 heads",
  "KV-cache 94%",
  "Säkerhet: OK",
  "STO latency 11ms",
  "v0.93 ready",
];

const EVENTS_EN = [
  "Tokenizing…",
  "Nordic embeddings…",
  "Attention: 32 heads",
  "KV-cache 94%",
  "Security: OK",
  "STO latency 11ms",
  "v0.93 ready",
];

/** Compact AI activity chip — bottom-left, smaller than before */
export default function AIActivityHUD() {
  const { lang } = useLang();
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const events = lang === "sv" ? EVENTS_SV : EVENTS_EN;

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || reduced) return;
    setShow(true);
    const t = setInterval(() => setIdx((i) => (i + 1) % events.length), 3000);
    return () => clearInterval(t);
  }, [events.length]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[25] hidden lg:block pointer-events-none">
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg glass-strong border border-white/[0.06] shadow-[0_6px_24px_rgba(0,0,0,0.3)] max-w-[200px]">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-cyan" />
        </span>
        <div className="min-w-0 overflow-hidden h-3.5">
          <AnimatePresence mode="wait">
            <motion.p
              key={events[idx]}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="text-[10px] font-mono text-white/65 truncate leading-none"
            >
              {events[idx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
