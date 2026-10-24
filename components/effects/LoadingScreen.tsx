"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

function FlightFallback() {
  return null;
}

const BrainFlight = dynamic(
  () => import("@/components/effects/BrainFlight").catch((error: unknown) => {
    if (process.env.NODE_ENV === "development") console.warn("[BudAI loader] brain-flight fallback", error);
    return { default: FlightFallback };
  }),
  { ssr: false }
);
const SEEN_KEY = "budai-startup-seen";

/** The original wordmark scramble, shortened so it never becomes a delay. */
function ScrambleWordmark() {
  const [letters, setLetters] = useState<string[]>(() => WORD.split("").map(() => ""));

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      setLetters(WORD.split("").map((letter, index) => {
        const begins = index * 75;
        if (elapsed < begins) return "";
        if (elapsed >= begins + 260) return letter;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }));
      if (elapsed < WORD.length * 75 + 260) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span role="img" aria-label={WORD}>
      {WORD.split("").map((letter, index) => (
        <span key={index} className="relative inline-block" aria-hidden="true">
          <span className="invisible">{letter}</span>
          <span className={`absolute inset-0 flex items-center justify-center ${index >= 3 ? "text-accent-cyan" : ""} ${letters[index] && letters[index] !== letter ? "font-mono opacity-60" : ""}`}>
            {letters[index]}
          </span>
        </span>
      ))}
    </span>
  );
}
const REVEAL_DELAY = 240;
const MAX_WAIT = 2600;
const FADE_MS = 320;
const WORD = "BudAI";
const GLYPHS = "01<>{}/=+*#";

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

      {/* Original production signature and wordmark, now paired with the current mark. */}
      <div className="pointer-events-none absolute inset-x-0 top-[6%] z-10 flex flex-col items-center gap-2 px-5 text-center sm:top-[8%]">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 sm:text-[11px]">
          Developed by <b className="font-bold text-accent-cyan [text-shadow:0_0_14px_rgba(0,229,255,0.6)]">Stilledev</b>
        </p>
        <p className="text-sm font-medium tracking-wide text-white/80 sm:text-xl">
          {sv ? "Din nya " : "Your new "}
          <span className="bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">ChatGPT</span>
        </p>
        <h1 className="flex items-center gap-3 text-5xl font-bold tracking-tight text-white [text-shadow:0_0_50px_rgba(0,229,255,0.45)] sm:text-7xl">
          <span aria-hidden="true"><BudAILogo size="sm" animated mode="thinking" /></span>
          <ScrambleWordmark />
        </h1>
      </div>

      {/* Original lower sweep, made indeterminate: no pretend model/API boot progress. */}
      <div className="absolute inset-x-0 bottom-[4%] z-10 flex flex-col items-center px-5 text-center">
        <div className="h-px w-64 overflow-hidden rounded-full bg-white/10 sm:w-72" aria-hidden="true">
          <span className="startup-light-sweep block h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-accent-cyan to-accent-purple" />
        </div>
        <p className="mt-3 min-h-5 text-xs text-white/45">
          {takingLonger
            ? sv ? "Det tar längre tid än väntat — fortsätt när du vill." : "Taking longer than expected — continue whenever you like."
            : sv ? "Laddar BudAI" : "Loading BudAI"}
        </p>
        <button
          type="button"
          onClick={() => finish.current()}
          className="pointer-events-auto mt-1 min-h-10 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60"
        >
          {sv ? "Klicka för att fortsätta" : "Click to skip"}
        </button>
      </div>
    </div>
  );
}
