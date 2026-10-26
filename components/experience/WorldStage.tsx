"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isIntroDone, subscribeIntro } from "@/components/effects/introState";
import { subscribeJourney } from "@/lib/experience/scroll";
import { clamp, smooth, worldOpacityAt } from "@/lib/experience/timeline";
import ProgressiveEditor from "./ProgressiveEditor";
import CapabilityStudioScreen from "./CapabilityStudioScreen";

type World = ReturnType<typeof import("@/lib/experience/world").createWorld>;

/** Expensive code is fetched only near the Playground, never as an intro dependency. */
export default function WorldStage() {
  const host = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const [near, setNear] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [screen, setScreen] = useState<HTMLDivElement | null>(null);
  const [capScreen, setCapScreen] = useState<HTMLDivElement | null>(null);
  const [mode, setMode] = useState("poster");
  const [visualMode, setVisualMode] = useState<"desktop-3d" | "mobile-3d" | "fallback">("fallback");

  useEffect(() => {
    setIntroDone(isIntroDone());
    return subscribeIntro(() => setIntroDone(true));
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(
    () =>
      subscribeJourney(frame => {
        // Pre-warm the 3D world as soon as the user enters the Playground so scrolling into Capabilities never stalls.
        if (frame.chapter > 1.85 || (frame.sections.playground ?? 0) > 0.15) setNear(true);
      }),
    []
  );

  useEffect(() => {
    if (reduced) {
      setVisualMode("fallback");
      document.documentElement.dataset.visualMode = "fallback";
      return;
    }
    if (!introDone || !near || !host.current) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData || (nav.deviceMemory ?? 8) < 2) {
      setMode("fallback");
      setVisualMode("fallback");
      document.documentElement.dataset.worldState = "fallback";
      document.documentElement.dataset.visualMode = "fallback";
      return;
    }
    let alive = true;
    let world: World | null = null;
    let unsubscribe = () => {};
    const element = document.createElement("div");
    element.className = "world-editor-mount";
    const capElement = document.createElement("div");
    capElement.className = "world-capability-mount";
    const fail = () => {
      if (!alive) return;
      unsubscribe();
      world?.dispose();
      world = null;
      setScreen(null);
      setCapScreen(null);
      setMode("fallback");
      setVisualMode("fallback");
      document.documentElement.dataset.worldState = "fallback";
      document.documentElement.dataset.visualMode = "fallback";
    };
    import("@/lib/experience/world")
      .then(({ createWorld }) => {
        if (!alive || !host.current) return;
        try {
          world = createWorld(host.current, element, fail, capElement);
          setScreen(element);
          setCapScreen(capElement);
          setMode("ready");
          const initialTier = window.innerWidth < 768 ? "mobile-3d" : "desktop-3d";
          setVisualMode(initialTier);
          document.documentElement.dataset.worldState = "ready";
          document.documentElement.dataset.visualMode = initialTier;
          unsubscribe = subscribeJourney(
            frame => {
              try {
                world?.update(frame);
                const tier = frame.width < 768 ? "mobile-3d" : "desktop-3d";
                if (document.documentElement.dataset.visualMode !== tier) {
                  document.documentElement.dataset.visualMode = tier;
                  setVisualMode(tier);
                }
              } catch {
                fail();
              }
            },
            {
              continuous: frame => worldOpacityAt(frame) > 0.001 && (frame.closing ?? 0) < 0.999,
              phase: "render",
            }
          );
        } catch {
          fail();
        }
      })
      .catch(fail);
    return () => {
      alive = false;
      unsubscribe();
      world?.dispose();
      setScreen(null);
      setCapScreen(null);
      document.documentElement.dataset.worldState = "poster";
    };
  }, [introDone, near, reduced]);

  useEffect(
    () =>
      subscribeJourney(frame => {
        const root = document.documentElement;
        const bridge = smooth(clamp((frame.chapter - 2.02) / 0.86, 0, 1));
        root.style.setProperty("--journey-progress", String(frame.progress));
        root.style.setProperty("--journey-phase", String(frame.chapter));
        root.style.setProperty("--journey-shift", `${-frame.y * 0.025}px`);
        root.style.setProperty("--bridge-progress", bridge.toFixed(4));
        root.dataset.chapter = frame.active;
      }),
    []
  );

  return (
    <>
      <div
        ref={host}
        className="universe-world"
        data-world-state={reduced ? "reduced" : mode}
        data-visual-mode={reduced || mode === "fallback" ? "fallback" : visualMode}
        aria-hidden="true"
      />
      {screen && createPortal(<ProgressiveEditor />, screen)}
      {capScreen && createPortal(<CapabilityStudioScreen />, capScreen)}
      <div className="universe-grade" aria-hidden="true" />
    </>
  );
}
