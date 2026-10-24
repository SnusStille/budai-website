"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeScroll } from "@/lib/cinema/scroll";
import type { SceneId } from "@/lib/cinema/timeline";

/**
 * Mount children only when they are about to become visible.
 * Used for the two genuinely heavy preserved features (the live BudAI playground and the
 * waitlist form) so the film never waits on them.
 */
export function useNearViewport<T extends HTMLElement>(rootMargin = "700px") {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);
  return { ref, near };
}

/** True once the element has been scrolled into view — drives the CSS reveal layer. */
export function useReveal<T extends HTMLElement>(threshold = 0.16) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, shown };
}

/**
 * True when the address bar asked for this element by hash. Sections that mount lazily use it
 * so a deep link written before the film existed (/#playground, /#waitlist) still lands.
 */
export function useHashTarget(id: string) {
  const [hit, setHit] = useState(false);
  useEffect(() => {
    if (window.location.hash === `#${id}`) setHit(true);
  }, [id]);
  return hit;
}

/** Which scene owns the frame. Re-renders only when the scene actually changes. */
export function useActiveScene() {
  const [scene, setScene] = useState<SceneId>("arrival");
  useEffect(
    () =>
      subscribeScroll((s) => {
        setScene((prev) => (prev === s.scene ? prev : s.scene));
      }),
    []
  );
  return scene;
}

/** Normalised scroll velocity — used for one-off DOM reactions (never per-frame state). */
export function useScrollFlag(threshold = 0.05) {
  const [moving, setMoving] = useState(false);
  useEffect(
    () =>
      subscribeScroll((s) => {
        const m = s.vel > threshold;
        setMoving((prev) => (prev === m ? prev : m));
      }),
    [threshold]
  );
  return moving;
}


/**
 * Hydration-safe: the first client render must match the server (false), then correct itself.
 * Anything gated on this should be additive, never required for content to exist.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}
