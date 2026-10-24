"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Native-scroll-preserving smooth wheel scrolling, synchronized for the WebGL story. */
export default function LenisScroll() {
  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return undefined;

    const lenis = new Lenis({
      lerp: 0.085,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      anchors: true,
      syncTouch: false,
      touchMultiplier: 1,
      prevent: (node) => !!node.closest("[data-lenis-prevent]"),
    });

    let raf = 0;
    let running = true;
    const tick = (time: number) => {
      if (!running) return;
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        lenis.stop();
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        lenis.start();
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    motionPreference.addEventListener("change", onMotionChange);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      motionPreference.removeEventListener("change", onMotionChange);
      lenis.destroy();
    };
  }, []);

  return null;
}
