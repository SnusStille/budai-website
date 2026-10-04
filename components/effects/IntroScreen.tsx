"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { INTRO_SEEN_KEY } from "@/components/effects/introScript";

/**
 * The BudAI intro — a short, premium hand-off into the product.
 *
 * The overlay is always in the markup but hidden by CSS; the inline script in
 * `layout.tsx` unhides it *before* the first paint when this is a fresh session
 * on the home route. That means no flash of content, no hydration mismatch and
 * nothing at all for returning visitors. It plays for ~1.2s, can be skipped at
 * any time, and never renders when the user prefers reduced motion.
 */
export default function IntroScreen() {
  const pathname = usePathname();
  const { lang } = useLang();
  const isSv = lang === "sv";
  const [phase, setPhase] = useState<"boot" | "ready">("boot");

  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-intro")) return;

    let alive = true;
    const readyTimer = window.setTimeout(() => {
      if (alive) setPhase("ready");
    }, 640);
    const doneTimer = window.setTimeout(() => finish(), 1220);

    function finish() {
      document.documentElement.removeAttribute("data-intro");
      try {
        window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {
        /* storage unavailable */
      }
    }

    return () => {
      alive = false;
      window.clearTimeout(readyTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (pathname !== "/") return null;

  const dismiss = () => {
    document.documentElement.removeAttribute("data-intro");
    try {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div
      className="intro-screen"
      role="status"
      aria-live="polite"
      aria-label={isSv ? "BudAI startar" : "BudAI is starting"}
    >
      <div className="intro-aurora" aria-hidden />
      <div className="intro-grid" aria-hidden />

      <div className="intro-center">
        <div className="intro-mark">
          <BudAILogo size="xl" animated boot />
        </div>

        <p className="intro-status">
          <span className={`intro-status-dot ${phase === "ready" ? "is-ready" : ""}`} aria-hidden />
          {phase === "ready" ? (isSv ? "REDO" : "READY") : isSv ? "INITIERAR BUDAI…" : "INITIALIZING BUDAI…"}
        </p>

        <div className="intro-bar" aria-hidden>
          <span className={phase === "ready" ? "is-done" : ""} />
        </div>
      </div>

      <button type="button" onClick={dismiss} className="intro-skip">
        {isSv ? "Hoppa över" : "Skip"}
      </button>
    </div>
  );
}
