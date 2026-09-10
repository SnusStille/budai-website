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
    onCompleteRef.current();
    setTimeout(() => setVisible(false), 320);
  };

  useEffect(() => {
    const failsafe = setTimeout(finish, 3000);

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
      p = Math.min(100, p + (p < 50 ? 5.2 : p < 82 ? 2.8 : 4.2));
      setProgress(p);
      setStep(Math.min(5, Math.floor((p / 100) * 6)));
      if (p >= 100) {
        clearTimeout(failsafe);
        finish();
        return;
      }
      timer = window.setTimeout(tick, 44);
    };

    timer = window.setTimeout(tick, 40);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(failsafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    "Initializing synapse core…",
    "Loading language models…",
    "Calibrating pipelines…",
    "Securing Nordic edge…",
    "Warming inference path…",
    "BudAI is ready.",
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label="Loading BudAI"
        >
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08),transparent_55%)]" />
          <div className="absolute top-[38%] left-[52%] w-[300px] h-[300px] bg-accent-purple/[0.08] rounded-full blur-[100px] pointer-events-none" />

          {/* Decorative rings behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] w-[280px] h-[280px] pointer-events-none" aria-hidden>
            <span className="absolute inset-0 rounded-full border border-white/[0.06] logo-orbit-2d" style={{ animationDuration: "24s" }} />
            <span className="absolute inset-6 rounded-full border border-dashed border-accent-cyan/15 logo-orbit-2d" style={{ animationDuration: "18s", animationDirection: "reverse" }} />
            <span className="absolute inset-12 rounded-full border border-accent-purple/10 logo-orbit-2d" style={{ animationDuration: "30s" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6">
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-10"
            >
              <BudAILogo size="xl" animated />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-1.5"
            >
              Bud<span className="text-accent-cyan">AI</span>
            </motion.h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted/55 mb-8 font-medium">
              Stilledev · Sweden
            </p>

            <p className="text-sm text-muted font-mono mb-6 h-5 text-center tracking-wide">
              {steps[step]}
            </p>

            <div className="w-80 max-w-[85vw] space-y-2">
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full rounded-full loading-bar-shimmer transition-[width] duration-100 ease-out"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundImage:
                      "linear-gradient(90deg, #00e5ff, #b967ff, #00ff9d, #00e5ff)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted/45 tabular-nums">
                <span>{Math.min(Math.round(progress), 100)}%</span>
                <span>v0.93 · neural boot</span>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-1.5 mt-6">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= step ? "w-4 bg-accent-cyan/80" : "w-1.5 bg-white/10"
                  }`}
                />
              ))}
            </div>

            {progress > 0 && progress < 100 && (
              <button
                type="button"
                onClick={finish}
                className="mt-8 text-[11px] text-muted/35 hover:text-muted transition-colors"
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
