"use client";

import { useEffect, useRef, useState } from "react";

import { pickQuality } from "@/lib/cinema/tokens";
import { markWidthFor } from "@/lib/cinema/timeline";
import { sampleWordmark, geometricMark } from "@/lib/cinema/mark";
import { subscribeScroll } from "@/lib/cinema/scroll";
import { onCinema, lastCinema } from "@/lib/cinema/bus";
import type { CinemaHandle } from "@/lib/cinema/world";

/**
 * One probe, then a throw-away context. If WebGL is missing, slow or blocked we simply never
 * mount three.js at all — the CSS poster underneath stays, and the page is the same page.
 */
function webglAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const probe = document.createElement("canvas");
    const gl =
      probe.getContext("webgl2") ||
      (probe.getContext("webgl", { failIfMajorPerformanceCaveat: false }) as WebGLRenderingContext | null);
    if (!gl) return false;
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function CinemaWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const [state, setState] = useState<"booting" | "live" | "poster">("booting");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!webglAvailable()) {
      setState("poster");
      return;
    }

    let disposed = false;
    let handle: CinemaHandle | null = null;
    let unsubScroll = () => {};
    let unsubBus = () => {};

    (async () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const saveData =
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
      const quality = pickQuality();

      // Sample the logotype into points. Kept off the critical path: the scene boots with the
      // nebula even if this is slow, and the mark appears when it lands.
      let mark = null;
      if (!saveData) {
        try {
          // framed from the arrival camera so the mark never overflows a phone or drowns
          // on an ultrawide — the composition is solved, not eyeballed per breakpoint
          const width = markWidthFor(window.innerWidth / Math.max(1, window.innerHeight));
          mark = await sampleWordmark({
            maxPoints: quality.markPoints,
            worldWidth: width,
            stretch: width < 7 ? 1.0 : 1.06,
            stride: coarse ? 4 : 3,
          });
        } catch {
          mark = null;
        }
      }
      if (disposed) return;
      if (!mark) mark = geometricMark(Math.min(quality.markPoints, coarse ? 2600 : 5200));

      // three.js is a separate chunk: nothing on this page's critical path touches it
      const { createCinemaWorld } = await import("@/lib/cinema/world");
      if (disposed) return;
      try {
        handle = createCinemaWorld(canvas, {
          quality,
          mark,
          reduceMotion: reduce,
          coarse,
          onStatus: (s) => setState(s === "lost" ? "poster" : "live"),
        });
      } catch {
        setState("poster");
        return;
      }

      // catch up on anything the DOM already announced while three.js was still loading
      const intro0 = lastCinema("intro");
      if (typeof intro0 === "number") handle?.setIntro(intro0);
      const hov0 = lastCinema("hover");
      if (typeof hov0 === "number") handle?.setHover(hov0);

      unsubScroll = subscribeScroll((s) =>
        handle?.setScroll({ p: s.p, index: s.index, t: s.t, vel: s.vel, ids: s.ids })
      );
      unsubBus = onCinema((e) => {
        if (!handle) return;
        if (e.type === "intro") handle.setIntro(e.value);
        else if (e.type === "hover") handle.setHover(e.value);
        else if (e.type === "paused") handle.setPaused(e.value);
      });
      setState("live");
      cleanup.current = () => {
        unsubScroll();
        unsubBus();
        handle?.dispose();
        handle = null;
      };
    })();

    return () => {
      disposed = true;
      cleanup.current?.();
      cleanup.current = null;
    };
  }, []);

  // while the world is booting the canvas is invisible, so the CSS poster carries the frame
  return (
    <canvas
      ref={canvasRef}
      className="st-canvas transition-opacity duration-[1400ms]"
      style={{ opacity: state === "live" ? 1 : 0 }}
      aria-hidden
      data-state={state}
    />
  );
}
