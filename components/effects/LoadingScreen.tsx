"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

const BrainFlight = dynamic(() => import("@/components/effects/BrainFlight"), { ssr: false });
const SEEN_KEY = "budai-startup-seen";
const REVEAL_DELAY = 240;
const MAX_WAIT = 2600;
const FADE_MS = 320;

/**
 * A real-load-aware introduction, not a timed fake loading sequence.
 * If the document is ready by hydration, nothing is shown. On slower first
 * loads it reveals after a short grace period and leaves when `window.load`
 * fires, with a hard timeout and an accessible skip action as safety valves.
 */
export default function LoadingScreen() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [show, setShow] = useState(false);
  const [out, setOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [takingLonger, setTakingLonger] = useState(false);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    let shown = false;
    let finished = false;
    let revealTimer = 0;
    let longTimer = 0;
    let maxTimer = 0;
    let fadeTimer = 0;
    let progressRaf = 0;
    let progressStart = 0;
    let lastProgressCommit = 0;

    const markSeen = () => {
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private browsing */ }
    };
    const cleanupAndFinish = () => {
      if (finished) return;
      finished = true;
      markSeen();
      window.clearTimeout(longTimer);
      window.clearTimeout(maxTimer);
      cancelAnimationFrame(progressRaf);
      if (!shown) return;
      setOut(true);
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => setShow(false), FADE_MS);
    };
    finish.current = cleanupAndFinish;

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch { /* private browsing */ }

    if (alreadySeen || reduced || nav.connection?.saveData || (nav.deviceMemory && nav.deviceMemory <= 2)) {
      markSeen();
      return () => {};
    }

    // Never cover an already-ready page. Wait only for a genuine initial load.
    if (document.readyState === "complete") {
      markSeen();
      return () => {};
    }

    const animateFlight = (now: number) => {
      if (!shown || finished) return;
      if (!progressStart) progressStart = now;
      const nextProgress = Math.min(1, (now - progressStart) / 1050);
      if (now - lastProgressCommit > 40) {
        lastProgressCommit = now;
        setProgress(nextProgress);
      }
      if (nextProgress < 1) progressRaf = requestAnimationFrame(animateFlight);
    };

    revealTimer = window.setTimeout(() => {
      if (finished) return;
      shown = true;
      setShow(true);
      progressRaf = requestAnimationFrame(animateFlight);
    }, REVEAL_DELAY);
    longTimer = window.setTimeout(() => setTakingLonger(true), 1500);
    maxTimer = window.setTimeout(cleanupAndFinish, MAX_WAIT);
    window.addEventListener("load", cleanupAndFinish, { once: true });
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) cleanupAndFinish();
    };
    motionPreference.addEventListener("change", onMotionChange);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(longTimer);
      window.clearTimeout(maxTimer);
      window.clearTimeout(fadeTimer);
      window.removeEventListener("load", cleanupAndFinish);
      motionPreference.removeEventListener("change", onMotionChange);
      cancelAnimationFrame(progressRaf);
      finish.current = () => {};
    };
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={sv ? "BudAI laddas" : "Loading BudAI"}
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#020205] transition-[opacity,filter] duration-300 ease-out ${
        out ? "pointer-events-none opacity-0 blur-sm" : "opacity-100"
      }`}
    >
      <div className="ai-grid absolute inset-0 opacity-25" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(0,229,255,0.16),transparent_58%)]" aria-hidden />
      <BrainFlight progress={progress} activity={progress * 0.35} />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-accent-cyan/[0.07] blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-accent-purple/[0.08] blur-[120px]" aria-hidden />

      {/* Original production identity, brought forward with the current BudAI mark. */}
      <div className="pointer-events-none absolute inset-x-0 top-[6%] z-10 flex flex-col items-center px-5 text-center sm:top-[7%]">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/40 sm:text-[11px]">
          Developed by <span className="font-semibold text-accent-cyan/85">Stilledev</span>
        </p>
        <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-4">
          <span aria-hidden="true"><BudAILogo size="md" animated mode="thinking" /></span>
          <h1 className="text-4xl font-bold tracking-[-0.045em] text-white sm:text-6xl">
            Bud<span className="text-gradient">AI</span>
          </h1>
        </div>
        <p className="mt-2 text-sm text-white/65 sm:mt-3 sm:text-base">
          {sv ? "Din AI-arbetskompanjon." : "Your AI work companion."}
        </p>
      </div>

      {/* Indeterminate by design: the camera flight is art direction, never a fake percentage. */}
      <div className="absolute inset-x-0 bottom-[5%] z-10 flex flex-col items-center px-5 text-center">
        <div className="h-px w-56 overflow-hidden rounded-full bg-white/10 sm:w-72" aria-hidden>
          <span className="startup-light-sweep block h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-accent-cyan to-accent-purple" />
        </div>
        <p className="mt-4 min-h-5 text-xs text-white/45">
          {takingLonger
            ? sv ? "Det tar lite längre tid — du kan fortsätta när som helst." : "Taking a little longer — you can continue whenever you like."
            : sv ? "Laddar BudAI" : "Loading BudAI"}
        </p>
        <button
          type="button"
          onClick={() => finish.current()}
          className="pointer-events-auto mt-2 min-h-10 rounded-full px-4 py-2 text-xs text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60"
        >
          {sv ? "Fortsätt till BudAI" : "Continue to BudAI"}
        </button>
      </div>
    </div>
  );
}
