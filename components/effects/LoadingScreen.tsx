"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import BudAILogo from "@/components/ui/BudAILogo";
import { StilledevMark } from "@/components/ui/BudAILogo";

const STEPS_EN = [
  "Initializing BudAI core…",
  "Loading Nordic language pack…",
  "Securing privacy edge…",
  "Ready · v0.93",
];

const STEPS_SV = [
  "Initierar BudAI-kärna…",
  "Laddar nordiskt språkpaket…",
  "Säkrar integritetskant…",
  "Redo · v0.93",
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [steps, setSteps] = useState<string[]>(STEPS_EN);
  const [skipLabel, setSkipLabel] = useState("Skip →");
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setProgress(100);
    setStep(Math.max(0, steps.length - 1));
    try {
      sessionStorage.setItem("budai-intro-seen", "1");
    } catch {
      /* */
    }
    onCompleteRef.current();
    setTimeout(() => setVisible(false), 280);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("budai-lang");
      const navSv = (navigator.language || "").toLowerCase().startsWith("sv");
      const useSv = saved === "sv" || (!saved && navSv);
      if (useSv) {
        setSteps(STEPS_SV);
        setSkipLabel("Hoppa över →");
      }
    } catch {
      /* */
    }

    // Instant if already seen or reduced motion
    try {
      if (sessionStorage.getItem("budai-intro-seen") === "1") {
        finish();
        return;
      }
    } catch {
      /* */
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    const failsafe = setTimeout(finish, 2200);
    let p = 0;
    let cancelled = false;
    let timer = 0;

    const tick = () => {
      if (cancelled || doneRef.current) return;
      p = Math.min(100, p + (p < 55 ? 7 : p < 88 ? 4 : 6));
      setProgress(p);
      setStep(Math.min(3, Math.floor((p / 100) * 4)));
      if (p >= 100) {
        clearTimeout(failsafe);
        finish();
        return;
      }
      timer = window.setTimeout(tick, 36);
    };

    timer = window.setTimeout(tick, 30);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(failsafe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label="Loading BudAI"
        >
          <div className="absolute inset-0 grid-bg opacity-15" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.07),transparent_55%)]" />

          <div className="relative z-10 flex flex-col items-center px-6">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 relative"
            >
              <div
                aria-hidden
                className="absolute inset-[-28%] rounded-full border border-dashed border-accent-cyan/25 pointer-events-none logo-ambient-spin"
              />
              <div
                aria-hidden
                className="absolute inset-[-14%] rounded-full border border-accent-purple/15 pointer-events-none"
              />
              <BudAILogo size="xl" animated />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
              Bud<span className="text-accent-cyan">AI</span>
            </h1>
            <p className="text-xs text-muted/70 mb-3 tracking-wide">
              Nordic AI work assistant
            </p>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted/55 mb-8 font-medium">
              <StilledevMark size={14} />
              <span>Stilledev · Sweden</span>
            </div>

            <p className="text-sm text-muted font-mono mb-5 h-5 text-center tracking-wide">
              {steps[Math.min(step, steps.length - 1)]}
            </p>

            <div className="w-64 max-w-[80vw]">
              <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full rounded-full transition-[width] duration-75 ease-out"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundImage:
                      "linear-gradient(90deg, #00e5ff, #b967ff, #00ff9d)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-mono text-muted/40 tabular-nums">
                <span>{Math.min(Math.round(progress), 100)}%</span>
                <span>v0.93</span>
              </div>
            </div>

            {progress > 8 && progress < 100 && (
              <button
                type="button"
                onClick={finish}
                className="mt-7 text-[11px] text-muted/40 hover:text-muted transition-colors"
              >
                {skipLabel}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
