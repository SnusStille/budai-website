"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

const SEEN_KEY = "budai-intro-seen";

/**
 * The BudAI intro — a short, premium hand-off into the product.
 * Shows once per browser session, on the home route only, never longer than
 * ~1.4s, and instantly for anyone who prefers reduced motion or has seen it.
 */
export default function IntroScreen() {
  const pathname = usePathname();
  const { lang } = useLang();
  const isSv = lang === "sv";
  const [state, setState] = useState<"hidden" | "boot" | "ready">("hidden");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    let seen = false;
    let reduced = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = true;
    }
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    if (seen || reduced) {
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }

    setVisible(true);
    setState("boot");
    const readyTimer = window.setTimeout(() => setState("ready"), 620);
    const doneTimer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 1250);
    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(doneTimer);
    };
  }, [pathname]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (pathname !== "/") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="intro-screen"
          role="status"
          aria-live="polite"
          aria-label={isSv ? "BudAI startar" : "BudAI is starting"}
        >
          <div className="intro-aurora" aria-hidden />
          <div className="intro-grid" aria-hidden />

          <div className="intro-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="intro-mark"
            >
              <BudAILogo size="xl" animated />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="intro-wordmark"
            >
              Bud<span>AI</span>
            </motion.h1>

            <p className="intro-status">
              <span className={`intro-status-dot ${state === "ready" ? "is-ready" : ""}`} aria-hidden />
              {state === "ready"
                ? isSv
                  ? "REDO"
                  : "READY"
                : isSv
                ? "INITIERAR BUDAI…"
                : "INITIALIZING BUDAI…"}
            </p>

            <div className="intro-bar" aria-hidden>
              <span className={state === "ready" ? "is-done" : ""} />
            </div>
          </div>

          <button type="button" onClick={dismiss} className="intro-skip">
            {isSv ? "Hoppa över" : "Skip"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
