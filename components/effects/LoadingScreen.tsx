"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import BudAILogo from "@/components/ui/BudAILogo";
import BrainFlight from "@/components/effects/BrainFlight";
import { useLang } from "@/components/ui/LanguageContext";

const MIN_VISIBLE_MS = 1350;
const REDUCED_MIN_VISIBLE_MS = 650;
const MAX_WAIT_MS = 8000;
const FADE_MS = 360;
const INTRO_TRAVEL_MS = 2100;
const INTRO_PROGRESS_LIMIT = 0.64;
const WORD = "BudAI";
const GLYPHS = "01<>{}/=+*#";

/** The original BudAI wordmark scramble, with a still, legible reduced-motion form. */
function ScrambleWordmark() {
  const [letters, setLetters] = useState<string[]>(() => WORD.split("").map(() => ""));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLetters(WORD.split(""));
      return;
    }

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

/**
 * The root provider owns this for the whole document. The original WebGL2 brain
 * is loaded only for the intro; route readiness and the first brain frame are
 * coordinated, but no page waits for the rest of the site's 3D assets.
 */
export default function LoadingScreen() {
  const { lang } = useLang();
  const pathname = usePathname();
  const sv = lang === "sv";
  const [show, setShow] = useState(true);
  const [out, setOut] = useState(false);
  const [takingLonger, setTakingLonger] = useState(false);
  const [brainProgress, setBrainProgress] = useState(0);
  const [brainRendered, setBrainRendered] = useState(false);
  const [brainFailed, setBrainFailed] = useState(false);
  const brainReady = useRef(false);
  const finish = useRef<() => void>(() => {});

  const announceBrainReady = useCallback(() => {
    if (brainReady.current) return;
    brainReady.current = true;
    setBrainRendered(true);
    window.dispatchEvent(new Event("budai:loading-brain-ready"));
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // BrainFlight draws one still frame under reduced motion.
      setBrainProgress(0.08);
      return;
    }

    let raf = 0;
    let lastUpdate = 0;
    const started = performance.now();
    const tick = (now: number) => {
      if (!lastUpdate || now - lastUpdate >= 32) {
        const fraction = Math.min(1, (now - started) / INTRO_TRAVEL_MS);
        setBrainProgress(fraction * INTRO_PROGRESS_LIMIT);
        lastUpdate = now;
      }
      if (now - started < INTRO_TRAVEL_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.budaiStartupComplete === "true") {
      setShow(false);
      return;
    }
    document.documentElement.dataset.budaiStarting = "true";
    let cancelled = false;
    let finished = false;
    let routeReady = pathname !== "/status" || document.querySelector("[data-budai-route-ready]") !== null;
    let brainHasDrawn = brainReady.current;
    let fadeTimer = 0;
    let maxTimer = 0;
    let readyRaf = 0;
    let longTimer = 0;
    let routeRaf1 = 0;
    let routeRaf2 = 0;
    const shownAt = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const dismiss = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(maxTimer);
      window.clearTimeout(longTimer);
      cancelAnimationFrame(readyRaf);
      cancelAnimationFrame(routeRaf1);
      cancelAnimationFrame(routeRaf2);
      window.removeEventListener("budai:experience-ready", onExperienceReady);
      window.removeEventListener("budai:loading-brain-ready", onBrainReady);
      reducedMotion.removeEventListener("change", onMotionChange);
      setOut(true);
      const fadeDuration = reducedMotion.matches ? 0 : FADE_MS;
      fadeTimer = window.setTimeout(() => {
        document.documentElement.dataset.budaiStartupComplete = "true";
        delete document.documentElement.dataset.budaiStarting;
        window.dispatchEvent(new Event("budai:startup-complete"));
        setShow(false);
      }, fadeDuration);
    };
    finish.current = dismiss;

    const readyToLeave = () => {
      if (cancelled || finished || !routeReady || !brainHasDrawn || readyRaf) return;
      const minimum = reducedMotion.matches ? REDUCED_MIN_VISIBLE_MS : MIN_VISIBLE_MS;
      const checkMinimumDwell = () => {
        readyRaf = 0;
        if (cancelled || finished) return;
        if (performance.now() - shownAt >= minimum) {
          dismiss();
          return;
        }
        readyRaf = requestAnimationFrame(checkMinimumDwell);
      };
      readyRaf = requestAnimationFrame(checkMinimumDwell);
    };

    const onExperienceReady = () => {
      routeReady = true;
      readyToLeave();
    };
    const onBrainReady = () => {
      brainHasDrawn = true;
      readyToLeave();
    };
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) dismiss();
    };

    window.addEventListener("budai:experience-ready", onExperienceReady);
    window.addEventListener("budai:loading-brain-ready", onBrainReady);
    reducedMotion.addEventListener("change", onMotionChange);

    // For regular routes, wait for React to hydrate and paint the route shell.
    // Status exposes a server-rendered readiness marker, so its heavy flight is
    // intentionally deferred until this short intro has left the screen.
    if (pathname !== "/status") {
      routeRaf1 = requestAnimationFrame(() => {
        routeRaf2 = requestAnimationFrame(onExperienceReady);
      });
    }

    longTimer = window.setTimeout(() => setTakingLonger(true), 3500);
    // If a device cannot create WebGL or the lazy chunk stalls, the loader still exits.
    maxTimer = window.setTimeout(dismiss, MAX_WAIT_MS);
    readyToLeave();

    return () => {
      cancelled = true;
      window.clearTimeout(fadeTimer);
      window.clearTimeout(maxTimer);
      window.clearTimeout(longTimer);
      cancelAnimationFrame(readyRaf);
      cancelAnimationFrame(routeRaf1);
      cancelAnimationFrame(routeRaf2);
      window.removeEventListener("budai:experience-ready", onExperienceReady);
      window.removeEventListener("budai:loading-brain-ready", onBrainReady);
      reducedMotion.removeEventListener("change", onMotionChange);
      finish.current = () => {};
    };
  }, [pathname]);

  if (!show) return null;

  const onBrainFailure = () => {
    setBrainFailed(true);
    announceBrainReady();
  };

  return (
    <div
      id="budai-startup-screen"
      role="status"
      aria-live="polite"
      aria-label={sv ? "BudAI laddas" : "Loading BudAI"}
      data-exiting={out ? "true" : undefined}
      className="budai-startup-screen fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#020205] text-white transition-[opacity,filter,visibility] duration-[360ms] ease-out"
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "#020205", color: "#fff" }}
    >
      <div className="ai-grid absolute inset-0 opacity-25" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(0,229,255,0.16),transparent_58%)]" aria-hidden="true" />
      <div className="startup-brain-stage" aria-hidden="true">
        {(!brainRendered || brainFailed) && (
          <div className="startup-neural-scene">
            <span className="startup-neural-ring startup-neural-ring-a" />
            <span className="startup-neural-ring startup-neural-ring-b" />
            <span className="startup-neural-ring startup-neural-ring-c" />
            <span className="startup-neural-core" />
          </div>
        )}
        {!brainFailed && (
          <BrainFlight
            mode="intro"
            progress={brainProgress}
            activity={Math.min(1, brainProgress * 1.5)}
            onReady={announceBrainReady}
            onFail={onBrainFailure}
          />
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(24rem 20rem at 8% 68%, rgba(0,229,255,.075), transparent 72%), radial-gradient(26rem 22rem at 92% 72%, rgba(139,112,255,.08), transparent 72%)" }}
        aria-hidden="true"
      />

      {/* Stilledev signature and current BudAI signal mark. */}
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
