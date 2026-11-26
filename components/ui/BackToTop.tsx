"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { getJourneyFrame, subscribeJourney } from "@/lib/experience/scroll";
import { useLang } from "@/components/ui/LanguageContext";

export default function BackToTop() {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);
  const progressRing = useRef<SVGCircleElement>(null);
  const updateProgress = useCallback((y: number) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, y / maxScroll));
    if (progressRing.current) {
      progressRing.current.style.strokeDashoffset = String(122.52 * (1 - progress));
      progressRing.current.dataset.scrollProgress = progress.toFixed(3);
    }
  }, []);

  useEffect(() => subscribeJourney((frame) => {
    setVisible(frame.y > 900);
    updateProgress(frame.y);
  }), [updateProgress]);

  useEffect(() => {
    if (visible) updateProgress(getJourneyFrame().y);
  }, [visible, updateProgress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
          className="fixed bottom-5 right-5 z-[25] w-11 h-11 rounded-xl glass-strong border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-accent-cyan hover:border-accent-cyan/30 hover:shadow-[0_0_24px_rgba(0,229,255,0.15)] transition-all"
          aria-label={lang === "sv" ? "Till toppen" : "Back to top"}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="19.5" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.25" />
            <circle ref={progressRing} data-scroll-progress="0" cx="22" cy="22" r="19.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeDasharray="122.52" strokeDashoffset="122.52" transform="rotate(-90 22 22)" />
          </svg>
          <ArrowUp className="relative z-10 w-4 h-4" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
