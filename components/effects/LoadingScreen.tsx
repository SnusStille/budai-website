"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { markIntroDone } from "@/components/effects/introState";
import { INTRO_MS, INTRO_REVEAL_MS, INTRO_SESSION_KEY, nextIntroLetter } from "@/lib/experience/intro";
import BrainFallback from "./BrainFallback";
import { subscribeJourney, refreshJourney } from "@/lib/experience/scroll";
import { smooth, clamp } from "@/lib/experience/timeline";
import type { BrainMotion } from "@/lib/experience/brain";

const BrainFlight = dynamic(() => import("./BrainFlight"), { ssr: false });
type Phase = "pending" | "playing" | "revealing" | "done";

/**
 * One owner, one canvas, one clock. The brain is NOT unmounted at the handoff:
 * the very same canvas moves into the landing page. No section can launch an intro.
 */
export default function LoadingScreen() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("pending");
  const [letters, setLetters] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [renderBrain, setRenderBrain] = useState(false);
  const [ready, setReady] = useState(false);
  const [coreVisible, setCoreVisible] = useState(true);
  const coreVisibleRef = useRef(true);
  const readyRef = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const motion = useRef<BrainMotion>({ kind: "hero", progress: 0 });
  const progressBar = useRef<HTMLSpanElement>(null);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    if (pathname !== "/") { document.documentElement.dataset.budaiIntro = "done"; return; }
    let alive = true;
    let raf = 0;
    let exitTimer = 0;
    let assetTimer = 0;
    let safety = 0;
    let closing = false;
    let completed = false;
    let returnFocus = false;
    const root = document.documentElement;
    const win = window as Window & { __budaiIntroGuard?: number };
    clearTimeout(win.__budaiIntroGuard);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    setRenderBrain(!media.matches && !nav.connection?.saveData);
    setFallback(media.matches || !!nav.connection?.saveData);

    const complete = () => {
      if (!alive || completed) return;
      completed = true;
      // Timeout / reduced-motion completion is an entry too, not a replay on reload.
      try { sessionStorage.setItem(INTRO_SESSION_KEY, "1"); } catch { /* storage is optional */ }
      closing = true;
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(assetTimer);
      clearTimeout(safety);
      finish.current = () => {};
      root.dataset.budaiIntro = "done";
      if (returnFocus) {
        const main = document.getElementById("main");
        if (main) { main.inert = false; main.focus({ preventScroll: true }); }
      }
      motion.current = { kind: "hero", progress: 0 };
      setPhase("done");
      markIntroDone();
      refreshJourney();
    };
    const end = () => {
      if (closing || !alive) return;
      closing = true;
      returnFocus = !!document.activeElement?.closest("[data-global-loader]");
      cancelAnimationFrame(raf);
      clearTimeout(assetTimer);
      try { sessionStorage.setItem(INTRO_SESSION_KEY, "1"); } catch { /* storage is optional */ }
      setLetters(5);
      setPhase("revealing");
      root.dataset.budaiIntro = "revealing";
      exitTimer = window.setTimeout(complete, media.matches ? 0 : INTRO_REVEAL_MS);
    };
    finish.current = end;

    if (root.dataset.budaiIntro !== "playing" || media.matches) {
      complete();
    } else {
      setPhase("playing");
      motion.current = { kind: "intro", progress: 0 };
      const start = performance.now();
      let previousLetters = 0;
      let lastLetterAt = 0;
      setLetters(0);
      // Only the brain is relevant to this intro. Neither the developer room nor
      // the Playground is an asset dependency. A failed/slow GPU never gates entry.
      assetTimer = window.setTimeout(() => {
        if (!readyRef.current && alive) setFallback(true);
      }, 1600);
      const tick = (now: number) => {
        if (!alive || closing) return;
        const elapsed = now - start;
        motion.current = { kind: "intro", progress: clamp(elapsed / INTRO_MS) };
        const n = nextIntroLetter(previousLetters, elapsed, elapsed - lastLetterAt);
        if (n !== previousLetters) { previousLetters = n; lastLetterAt = elapsed; setLetters(n); }
        progressBar.current?.style.setProperty("transform", `scaleX(${Math.min(1, elapsed / INTRO_MS)})`);
        if (elapsed >= INTRO_MS && previousLetters === 5 && elapsed - lastLetterAt >= 260) end();
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") end(); };
    const onMotion = () => { if (media.matches) { setRenderBrain(false); setFallback(true); end(); } };
    window.addEventListener("keydown", onKey);
    media.addEventListener("change", onMotion);
    // A timeout, not just rAF: the page is released even in a background tab.
    if (!completed) safety = window.setTimeout(complete, INTRO_MS + INTRO_REVEAL_MS + 500);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      clearTimeout(assetTimer);
      clearTimeout(safety);
      window.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onMotion);
      finish.current = () => {};
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    return subscribeJourney(frame => {
      if (!stage.current || !frame.time) return;
      const signal = frame.bounds.signal;
      const p = frame.sections.signal ?? 0;
      const entering = signal ? smooth(clamp((frame.y - signal.top + frame.height * .9) / (frame.height * .9))) : 0;
      const opacity = 1 - smooth(clamp((p - .77) / .23));
      stage.current.style.setProperty("--core-entry", String(entering));
      stage.current.style.setProperty("--core-scroll", String(1 - opacity));
      stage.current.style.setProperty("--core-offset", "0px");
      stage.current.dataset.positioned = "true";
      document.documentElement.dataset.corePositioned = "true";
      const visible = opacity > .001;
      if (visible !== coreVisibleRef.current) { coreVisibleRef.current = visible; setCoreVisible(visible); }
      if (document.documentElement.dataset.budaiIntro === "done") {
        motion.current = { kind: entering > .001 ? "journey" : "hero", progress: p };
        stage.current.dataset.coreScene = entering > .001 ? "journey" : "hero";
      }
    });
  }, [pathname]);

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main || pathname !== "/") return;
    const active = document.documentElement.dataset.budaiIntro === "playing";
    main.inert = active;
    if (active) main.setAttribute("aria-busy", "true");
    else main.removeAttribute("aria-busy");
    return () => { main.inert = false; main.removeAttribute("aria-busy"); };
  }, [pathname, phase]);

  if (pathname !== "/") return null;

  return (
    <>
      <div className="intro-backdrop" aria-hidden="true" />
      <div ref={stage} className="intelligence-stage" data-intelligence-stage data-phase={phase} aria-hidden="true">
        <div className="intelligence-frame">
          <div className="intelligence-halo" />
          {(fallback || !renderBrain) && <BrainFallback />}
          {renderBrain && !fallback && (
            <BrainFlight mode="ambient" motion={motion} active={coreVisible || phase === "playing" || phase === "revealing"} settled={phase === "revealing" || phase === "done"} activity={phase === "playing" && letters >= 3 ? .5 : .08} onReady={() => { readyRef.current = true; setReady(true); }} onFail={() => setFallback(true)} />
          )}
          <span className="core-coordinate core-coordinate-a">NEURAL ARCHITECTURE / 001</span>
          <span className="core-coordinate core-coordinate-b">INTELLIGENCE → CREATION</span>
          <div className="core-caption"><span />{ready ? "CORE ACTIVE" : "INTELLIGENCE CORE"}<small>BUILT BY STILLEDEV · SWEDEN</small></div>
        </div>
      </div>
      {phase !== "done" && (
        <div className="intro-interface" data-global-loader role="status" aria-label="Initializing BudAI" aria-live="polite">
          <div className="intro-topline"><span>STILLEDEV</span><span>INTELLIGENCE, INITIALIZED.</span></div>
          <div className="intro-wordmark" aria-label="BUDAI">
            <span data-intro-word aria-hidden="true">{"BUDAI".slice(0, letters)}</span><i aria-hidden="true" />
          </div>
          <div className="intro-bottomline">
            <div className="intro-progress"><span ref={progressBar} /></div>
            <div><span>{letters < 5 ? "AWAKENING THE CORE" : "FROM INTELLIGENCE TO CREATION"}</span><button type="button" onClick={() => finish.current()}>Skip intro <kbd>esc</kbd></button></div>
          </div>
        </div>
      )}
    </>
  );
}
