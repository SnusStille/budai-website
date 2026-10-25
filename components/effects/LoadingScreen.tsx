"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { markIntroDone } from "./introState";
import BrainPoster from "./BrainPoster";
import { INTRO_MS, INTRO_REVEAL_MS, INTRO_READY_MS, INTRO_SESSION_KEY } from "@/lib/experience/intro";
import { refreshJourney, subscribeJourney } from "@/lib/experience/scroll";
import { clamp, smooth } from "@/lib/experience/timeline";
import type { BrainDriver } from "./BrainFlight";
import type { BrainMotion } from "@/lib/experience/brain";

const useClientLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Phase = "pending" | "preparing" | "playing" | "revealing" | "done";
type Role = "intro" | "hero" | "journey" | null;
type Renderer = typeof import("./BrainFlight")["default"];

/**
 * Single owner, single WebGL2 canvas, single clock across:
 *   opening (intro) → landing page hero (hero) → neural scroll passage (journey).
 * The brain is never unmounted/remounted between intro, hero, and journey,
 * and sleeps completely (0 GPU draws) once the user reaches the Playground and below.
 */
export default function LoadingScreen() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("pending");
  const phaseRef = useRef<Phase>("pending");
  const [role, setRole] = useState<Role>(null);
  const roleRef = useRef<Role>(null);
  const [Renderer, setRenderer] = useState<Renderer | null>(null);
  const [ready, setReady] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const gpu = useRef<BrainDriver | null>(null);
  const [sceneVisible, setSceneVisible] = useState(false);
  const visibleRef = useRef(false);
  const readyRef = useRef(false);
  const disabled = useRef(false);
  const failed = useRef(false);
  const stage = useRef<HTMLDivElement | null>(null);
  const openingRef = useRef<HTMLDivElement | null>(null);
  const motion = useRef<BrainMotion>({ kind: "intro", progress: 0, entry: 0 });
  const finish = useRef<(immediate?: boolean) => void>(() => {});
  const begin = useRef<() => void>(() => {});

  const requestRole = (next: Role) => {
    if (roleRef.current === next) return;
    roleRef.current = next;
    if (next === null) {
      readyRef.current = false;
      setReady(false);
      visibleRef.current = false;
      setSceneVisible(false);
    } else if (next === "intro") {
      visibleRef.current = true;
      setSceneVisible(true);
    }
    setRole(next);
  };

  const drive = (now: number) => {
    const context = gpu.current;
    if (!context || !visibleRef.current) return;
    context.draw(now);
  };

  useEffect(() => {
    if (pathname !== "/") return;
    let live = true, raf = 0, readiness = 0, reveal = 0, watchdog = 0, closing = false;
    const root = document.documentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const bootstrap = (window as Window & { __budaiIntroGuard?: number }).__budaiIntroGuard;
    clearTimeout(bootstrap);

    const change = (next: Phase) => {
      phaseRef.current = next;
      setPhase(next);
      if (next !== "done") root.dataset.budaiIntro = next;
    };

    let restoreFocus = false;
    const preparedAt = performance.now();

    const syncPostIntro = () => {
      if (disabled.current || failed.current) {
        requestRole(null);
        setFallbackMode(true);
        rootState("fallback");
        return;
      }
      const signal = document.getElementById("signal")?.getBoundingClientRect();
      const capabilities = document.getElementById("capabilities")?.getBoundingClientRect();
      const playground = document.getElementById("playground")?.getBoundingClientRect();
      const inCapabilitiesOrBelow = capabilities ? capabilities.top <= window.innerHeight * 0.75 : false;
      if (inCapabilitiesOrBelow) {
        requestRole(null);
        rootState("idle");
        return;
      }
      const inPlayground = playground ? playground.top <= 80 : false;
      const entering = signal
        ? smooth(clamp((-signal.top + window.innerHeight * 0.88) / (window.innerHeight * 0.88)))
        : 0;
      const nextRole: Role = entering > 0.001 ? "journey" : "hero";
      const visible = !inPlayground;
      motion.current = { kind: nextRole, progress: entering > 0.001 ? (inPlayground ? 1 : 0) : 0, entry: entering };
      visibleRef.current = visible;
      setSceneVisible(visible);
      requestRole(nextRole);
      if (stage.current) {
        stage.current.style.setProperty("--core-entry", String(entering));
        stage.current.style.setProperty("--core-scroll", visible ? "0" : "1");
        stage.current.dataset.coreScene = nextRole;
      }
      rootState(visible ? (readyRef.current ? "ready" : "pending") : "idle");
      if (visible && readyRef.current) drive(performance.now());
    };

    const complete = () => {
      if (!live || phaseRef.current === "done") return;
      restoreFocus ||= !!document.activeElement?.closest("[data-global-loader]");
      closing = true;
      cancelAnimationFrame(raf);
      clearTimeout(readiness);
      clearTimeout(reveal);
      clearTimeout(watchdog);
      begin.current = () => {};
      finish.current = () => {};
      syncPostIntro();
      change("done");
      try { sessionStorage.setItem(INTRO_SESSION_KEY, "1"); } catch { /* optional */ }
      const main = document.getElementById("main");
      if (main) {
        main.inert = false;
        main.removeAttribute("aria-busy");
        if (restoreFocus) main.focus({ preventScroll: true });
      }
    };

    const end = (immediate = false) => {
      if (!live || closing || phaseRef.current === "done") return;
      closing = true;
      cancelAnimationFrame(raf);
      clearTimeout(readiness);
      restoreFocus = !!document.activeElement?.closest("[data-global-loader]");
      if (!disabled.current && !failed.current && readyRef.current) {
        motion.current = { kind: "intro", progress: 1, entry: 0 };
        drive(performance.now());
      }
      change("revealing");
      reveal = window.setTimeout(complete, immediate ? 0 : INTRO_REVEAL_MS);
    };

    finish.current = end;
    begin.current = () => {
      if (!live || closing || phaseRef.current !== "preparing") return;
      if (root.dataset.budaiIntro === "done") { complete(); return; }
      if (performance.now() - preparedAt > INTRO_READY_MS) {
        failed.current = true;
        setFallbackMode(true);
        requestRole(null);
        end(true);
        return;
      }
      clearTimeout(readiness);
      change("playing");
      const started = performance.now();
      const tick = (now: number) => {
        if (!live || closing) return;
        const p = clamp((now - started) / INTRO_MS);
        motion.current = { kind: "intro", progress: p, entry: 0 };
        if (openingRef.current) {
          openingRef.current.style.setProperty("--opening-progress", p.toFixed(4));
          openingRef.current.dataset.nameStage =
            p < 0.14 ? "opening" : p < 0.66 ? "forming" : p < 0.88 ? "settled" : "entering";
        }
        drive(now);
        if (p >= 1) end();
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const preferences = () => {
      disabled.current = media.matches || !!nav.connection?.saveData;
      setFallbackMode(disabled.current || failed.current);
      if (disabled.current) {
        requestRole(null);
        rootState("fallback");
        end(true);
      } else if (phaseRef.current === "done" && !failed.current) {
        syncPostIntro();
      }
      refreshJourney();
    };

    disabled.current = media.matches || !!nav.connection?.saveData;
    setFallbackMode(disabled.current);
    const shouldOpen = (root.dataset.budaiIntro === "preparing" || root.dataset.budaiIntro === "playing") && !disabled.current;

    if (shouldOpen) {
      change("preparing");
      motion.current = { kind: "intro", progress: 0, entry: 0 };
      requestRole("intro");
      readiness = window.setTimeout(() => {
        if (!readyRef.current) {
          failed.current = true;
          setFallbackMode(true);
          requestRole(null);
        }
        end();
      }, INTRO_READY_MS);
      watchdog = window.setTimeout(complete, INTRO_READY_MS + INTRO_MS + INTRO_REVEAL_MS + 250);
    } else {
      complete();
    }

    const key = (e: KeyboardEvent) => { if (e.key === "Escape") end(disabled.current); };
    window.addEventListener("keydown", key);
    media.addEventListener("change", preferences);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      clearTimeout(readiness);
      clearTimeout(reveal);
      clearTimeout(watchdog);
      window.removeEventListener("keydown", key);
      media.removeEventListener("change", preferences);
      begin.current = () => {};
      finish.current = () => {};
      requestRole(null);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    return subscribeJourney(
      frame => {
        if (phaseRef.current !== "done") return;
        const signal = frame.bounds.signal;
        const playground = frame.bounds.playground;
        const capabilities = frame.bounds.capabilities;
        const p = frame.sections.signal ?? 0;
        const entering = signal
          ? smooth(clamp((frame.y - signal.top + frame.height * 0.88) / (frame.height * 0.88)))
          : 0;
        const inCapabilitiesOrBelow = capabilities
          ? frame.y >= capabilities.top - frame.height * 0.25
          : false;
        const engaged = !!document.activeElement?.closest("[data-playground-arrival]") && frame.active === "playground";
        const direct = location.hash === "#playground" && frame.y >= (playground?.top ?? Infinity) - frame.height * 0.4;
        const opacity = inCapabilitiesOrBelow || engaged || direct
          ? 0
          : entering <= 0.001
            ? 1
            : 1 - smooth((p - 0.84) / 0.14);

        if (stage.current) {
          stage.current.style.setProperty("--core-entry", String(entering));
          stage.current.style.setProperty("--core-scroll", String(1 - opacity));
          stage.current.dataset.positioned = "true";
          document.documentElement.dataset.corePositioned = "true";
        }

        if (disabled.current || failed.current) {
          if (visibleRef.current) { visibleRef.current = false; setSceneVisible(false); }
          requestRole(null);
          rootState("fallback");
          return;
        }

        if (inCapabilitiesOrBelow) {
          if (visibleRef.current) { visibleRef.current = false; setSceneVisible(false); }
          requestRole(null);
          rootState("idle");
          return;
        }

        const nextRole: Role = entering > 0.001 ? "journey" : "hero";
        const visible = opacity > 0.002;
        if (visible !== visibleRef.current) {
          visibleRef.current = visible;
          setSceneVisible(visible);
        }
        motion.current = { kind: nextRole, progress: entering > 0.001 ? p : 0, entry: entering };
        requestRole(nextRole);
        if (stage.current) {
          stage.current.dataset.coreScene = nextRole;
        }
        rootState(visible ? (readyRef.current ? "ready" : "pending") : "idle");
        if (visible && readyRef.current) drive(frame.time * 1000);
      },
      {
        phase: "render",
        continuous: () => (roleRef.current === "hero" || roleRef.current === "journey") && visibleRef.current && phaseRef.current === "done",
      }
    );
  }, [pathname]);

  useClientLayoutEffect(() => {
    if (pathname !== "/" || phase !== "done") return;
    document.documentElement.dataset.budaiIntro = "done";
    markIntroDone();
    refreshJourney();
  }, [phase, pathname]);

  const needRenderer = role !== null && !disabled.current && !failed.current;
  useEffect(() => {
    if (!needRenderer || Renderer) return;
    let live = true;
    import("./BrainFlight")
      .then(module => { if (live && !failed.current && !disabled.current) setRenderer(() => module.default); })
      .catch(() => {
        if (!live) return;
        failed.current = true;
        setFallbackMode(true);
        requestRole(null);
        rootState("fallback");
        finish.current(true);
      });
    return () => { live = false; };
  }, [needRenderer, Renderer]);

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main || pathname !== "/") return;
    const busy = phase === "preparing" || phase === "playing";
    main.inert = busy;
    if (busy) main.setAttribute("aria-busy", "true");
    else main.removeAttribute("aria-busy");
    return () => {
      main.inert = false;
      main.removeAttribute("aria-busy");
    };
  }, [phase, pathname]);

  const onReady = () => {
    if (failed.current || disabled.current) return;
    readyRef.current = true;
    setReady(true);
    rootState("ready");
    if (roleRef.current === "intro") begin.current();
    else if (roleRef.current === "hero" || roleRef.current === "journey") {
      drive(performance.now());
      refreshJourney();
    }
  };

  const onFail = () => {
    failed.current = true;
    setFallbackMode(true);
    requestRole(null);
    rootState("fallback");
    finish.current(true);
    refreshJourney();
  };

  if (pathname !== "/") return null;
  const Scene = Renderer;

  return (
    <>
      {phase !== "done" && (
        <div
          ref={openingRef}
          className="opening-surface"
          data-global-loader
          data-opening-phase={phase}
          data-name-stage="opening"
          role="status"
          aria-label="Entering BudAI"
          aria-live="polite"
        >
          <div className="opening-brain-frame">
            {!ready && <BrainPoster opening />}
          </div>
          <div className="opening-credit">
            <span>STILLEDEV</span>
            <span>NEURAL SYSTEM / 001</span>
          </div>
          <div className="opening-identity" data-opening-identity aria-hidden="true">
            <div className="opening-identity-stage">
              <span className="opening-identity-kicker">THE INTELLIGENCE SYSTEM</span>
              <div className="opening-identity-name" data-opening-name="BudAI">
                <span className="opening-char opening-char-1">B</span>
                <span className="opening-char opening-char-2">u</span>
                <span className="opening-char opening-char-3">d</span>
                <span className="opening-char opening-char-4 opening-char-accent">A</span>
                <span className="opening-char opening-char-5 opening-char-accent">I</span>
                <i className="opening-identity-cursor" />
                <i className="opening-identity-sweep" />
              </div>
              <i className="opening-identity-horizon" />
              <span className="opening-identity-sub">DEVELOPED BY STILLEDEV · SWEDEN</span>
            </div>
          </div>
          <div className="opening-caption">
            <span>INTELLIGENCE → INTERACTION</span>
            <button type="button" onClick={() => finish.current()}>
              Skip intro <kbd>esc</kbd>
            </button>
          </div>
        </div>
      )}
      <div
        ref={stage}
        className="intelligence-stage"
        data-intelligence-stage
        data-phase={phase}
        data-scene-role={role ?? "idle"}
        data-scene-sleeping={!sceneVisible}
        aria-hidden="true"
      >
        <div className="intelligence-frame">
          <div className="intelligence-halo" />
          {!ready && !fallbackMode && phase === "done" && <BrainPoster />}
          {Scene && role !== null && !fallbackMode && (
            <Scene
              mode="intro"
              motion={motion}
              driver={gpu}
              active={sceneVisible}
              onReady={onReady}
              onFail={onFail}
            />
          )}
          <span className="core-coordinate core-coordinate-a">NEURAL ARCHITECTURE / 001</span>
          <span className="core-coordinate core-coordinate-b">INTELLIGENCE → INTERACTION</span>
          <div className="core-caption">
            <span />
            BUDAI NEURAL CORE · ACTIVE
            <small>DEVELOPED BY STILLEDEV · SWEDEN</small>
          </div>
        </div>
      </div>
    </>
  );
}

function rootState(state: string) {
  document.documentElement.dataset.brainState = state;
}
