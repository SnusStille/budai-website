"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import BudAILogo from "@/components/ui/BudAILogo";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setProgress(100);
    setStep(5);
    // Reveal app immediately so user is never stuck behind opacity:0
    onCompleteRef.current();
    setTimeout(() => setVisible(false), 320);
  };

  useEffect(() => {
    // Hard failsafe — never trap the user on the loader
    const failsafe = setTimeout(finish, 3200);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearTimeout(failsafe);
      finish();
      return;
    }

    let p = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled || doneRef.current) return;
      // Smooth deterministic ramp (no random stalls)
      p = Math.min(100, p + (p < 70 ? 4.5 : p < 92 ? 2.2 : 3.5));
      setProgress(p);
      setStep(Math.min(5, Math.floor((p / 100) * 6)));
      if (p >= 100) {
        clearTimeout(failsafe);
        finish();
        return;
      }
      timer = window.setTimeout(tick, 55);
    };

    let timer = window.setTimeout(tick, 40);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(failsafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    "Initializing neural core…",
    "Loading language models…",
    "Calibrating data pipelines…",
    "Establishing secure connections…",
    "Syncing Nordic data centers…",
    "BudAI is ready.",
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          role="status"
          aria-live="polite"
          aria-label="Loading BudAI"
        >
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-accent-cyan/[0.08] rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-10"
            >
              <BudAILogo size="xl" animated />
            </motion.div>

            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Bud<span className="text-accent-cyan">AI</span>
            </h1>

            <p className="text-sm text-muted font-mono mb-8 h-5">{steps[step]}</p>

            <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.04]">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-green rounded-full transition-[width] duration-100 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <p className="text-xs text-muted/50 mt-3 font-mono tabular-nums">
              {Math.min(Math.round(progress), 100)}% · v0.92
            </p>

            {/* Skip if somehow stalled */}
            {progress > 0 && progress < 100 && (
              <button
                type="button"
                onClick={finish}
                className="mt-6 text-[11px] text-muted/40 hover:text-muted transition-colors"
              >
                Skip intro →
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
