"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

const MIN_VISIBLE_MS = 1250;
const MAX_WAIT_MS = 9000;
const FADE_MS = 360;
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
 * Server-rendered so the recognizable BudAI intro is present before hydration.
 * It leaves only after the document, fonts and server-rendered route shell are
 * ready, with a minimum dwell and a hard safety timeout. The root Providers
 * instance survives App Router navigation, so this never replays on client routes.
 */
export default function LoadingScreen() {
  const { lang } = useLang();
  const pathname = usePathname();
  const sv = lang === "sv";
  const [show, setShow] = useState(true);
  const [out, setOut] = useState(false);
  const [takingLonger, setTakingLonger] = useState(false);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    if (document.documentElement.dataset.budaiStartupComplete === "true") {
      setShow(false);
      return;
    }
    document.documentElement.dataset.budaiStarting = "true";
    let cancelled = false;
    let finished = false;
    let pageReady = pathname !== "/status" || document.querySelector("[data-budai-route-ready]") !== null;
    let documentReady = document.readyState === "complete";
    let fontsReady = !document.fonts || document.fonts.status === "loaded";
    let fadeTimer = 0;
    let maxTimer = 0;
    let readyRaf = 0;
    let longTimer = 0;
    let routeRaf1 = 0;
    let routeRaf2 = 0;
    const shownAt = performance.now();

    const dismiss = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(maxTimer);
      window.clearTimeout(longTimer);
      cancelAnimationFrame(readyRaf);
      cancelAnimationFrame(routeRaf1);
      cancelAnimationFrame(routeRaf2);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("budai:experience-ready", onExperienceReady);
      if (window.matchMedia) {
        window.matchMedia("(prefers-reduced-motion: reduce)").removeEventListener("change", onMotionChange);
      }
      setOut(true);
      const fadeDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : FADE_MS;
      fadeTimer = window.setTimeout(() => {
        document.documentElement.dataset.budaiStartupComplete = "true";
        delete document.documentElement.dataset.budaiStarting;
        window.dispatchEvent(new Event("budai:startup-complete"));
        setShow(false);
      }, fadeDuration);
    };
    finish.current = dismiss;

    const readyToLeave = () => {
      if (cancelled || finished || !documentReady || !fontsReady || !pageReady || readyRaf) return;
      const checkMinimumDwell = () => {
        readyRaf = 0;
        if (cancelled || finished) return;
        if (performance.now() - shownAt >= MIN_VISIBLE_MS) {
          dismiss();
          return;
        }
        readyRaf = requestAnimationFrame(checkMinimumDwell);
      };
      readyRaf = requestAnimationFrame(checkMinimumDwell);
    };
    if (!fontsReady && document.fonts) {
      void document.fonts.ready.then(() => {
        fontsReady = true;
        readyToLeave();
      }, () => {
        // A font failure should not strand the branded overlay.
        fontsReady = true;
        readyToLeave();
      });
    }

    const onLoad = () => {
      documentReady = true;
      readyToLeave();
    };
    const onExperienceReady = () => {
      pageReady = true;
      readyToLeave();
    };
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) dismiss();
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      dismiss();
      return () => {
        cancelled = true;
        window.clearTimeout(fadeTimer);
        finish.current = () => {};
      };
    }

    window.addEventListener("load", onLoad, { once: true });
    window.addEventListener("budai:experience-ready", onExperienceReady, { once: true });
    reducedMotion.addEventListener("change", onMotionChange);
    if (documentReady) onLoad();
    // For regular routes, wait until the hydrated route has had a chance to paint.
    // Status is ready once its server-rendered route shell is present.
    if (pathname !== "/status") {
      routeRaf1 = requestAnimationFrame(() => {
        routeRaf2 = requestAnimationFrame(onExperienceReady);
      });
    }

    longTimer = window.setTimeout(() => setTakingLonger(true), 4200);
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
      window.removeEventListener("load", onLoad);
      window.removeEventListener("budai:experience-ready", onExperienceReady);
      reducedMotion.removeEventListener("change", onMotionChange);
      finish.current = () => {};
    };
  }, [pathname]);

  if (!show) return null;

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
      <div className="startup-neural-scene" aria-hidden="true">
        <span className="startup-neural-ring startup-neural-ring-a" />
        <span className="startup-neural-ring startup-neural-ring-b" />
        <span className="startup-neural-ring startup-neural-ring-c" />
        <span className="startup-neural-core" />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(24rem 20rem at 8% 68%, rgba(0,229,255,.075), transparent 72%), radial-gradient(26rem 22rem at 92% 72%, rgba(139,112,255,.08), transparent 72%)" }}
        aria-hidden="true"
      />

      {/* Original Stilledev signature and current BudAI signal mark. */}
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

      {/* The sweep is intentionally indeterminate; it does not imply provider readiness. */}
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
