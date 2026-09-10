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
    setTimeout(() => setVisible(false), 280);
  };

  useEffect(() => {
    // Hard failsafe — never trap the user on the loader
    const failsafe = setTimeout(finish, 2800);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearTimeout(failsafe);
      finish();
      return;
    }

    let p = 0;
    let cancelled = false;
    let timer = 0;

    const tick = () => {
      if (cancelled || doneRef.current) return;
      // Smooth deterministic ramp (no random stalls)
      p = Math.min(100, p + (p < 55 ? 5.5 : p < 85 ? 3.2 : 4.5));
      setProgress(p);
      setStep(Math.min(5, Math.floor((p / 100) * 6)));
      if (p >= 100) {
        clearTimeout(failsafe);
        finish();
        return;
      }
      timer = window.setTimeout(tick, 42);
    };

    timer = window.setTimeout(tick, 30);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(failsafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    "Booting neural core…",
    "Loading language models…",
    "Calibrating pipelines…",
    "Securing edge links…",
    "Syncing Nordic nodes…",
    "BudAI is ready.",
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          role="status"
          aria-live="polite"
          aria-label="Loading BudAI"
        >
          <div className="absolute inset-0 grid-bg opacity-25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-accent-cyan/[0.09] rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-[42%] left-[48%] w-[280px] h-[280px] bg-accent-purple/[0.07] rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center px-6">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-9"
            >
              <BudAILogo size="xl" animated />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1.5">
              Bud<span className="text-accent-cyan">AI</span>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted/60 mb-7 font-medium">
              Stilledev · Sweden
            </p>

            <p className="text-sm text-muted font-mono mb-6 h-5 text-center">{steps[step]}</p>

            <div className="w-72 max-w-[80vw] h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.06]">
              <div
                className="h-full rounded-full loading-bar-shimmer transition-[width] duration-100 ease-out"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundImage:
                    "linear-gradient(90deg, #00e5ff, #b967ff, #00ff9d, #00e5ff)",
                }}
              />
            </div>

            <p className="text-xs text-muted/50 mt-3 font-mono tabular-nums">
              {Math.min(Math.round(progress), 100)}% · v0.93
            </p>

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
