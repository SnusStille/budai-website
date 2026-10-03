"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import BudAILogo from "@/components/ui/BudAILogo";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem("budai-intro-seen", "1");
    } catch {
      /* */
    }
    onCompleteRef.current();
    setTimeout(() => setVisible(false), 240);
  };

  useEffect(() => {
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

    const failsafe = setTimeout(finish, 720);
    return () => clearTimeout(failsafe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          role="status"
          aria-live="polite"
          aria-label="Loading BudAI"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.07),transparent_55%)]" />
          <div className="relative z-10 flex flex-col items-center px-6">
            <BudAILogo size="xl" animated />
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Bud<span className="text-accent-cyan">AI</span>
            </h1>
            <p className="mt-2 text-sm text-white/40">AI work assistant</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
