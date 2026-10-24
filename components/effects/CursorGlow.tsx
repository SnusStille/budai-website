"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -400, y: -400 });
  const currentRef = useRef({ x: -400, y: -400 });

  useEffect(() => {
    // Respect users who've asked for less motion, and skip on touch devices
    // where there's no real cursor to glow.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || isTouch) return;

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Pause the loop when the tab isn't visible to save CPU/battery.
    let running = true;
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) rafRef.current = requestAnimationFrame(update);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Single persistent rAF loop that reads mouse position from a ref —
    // no React state, no re-renders on every pixel of mouse movement.
    const update = () => {
      // Light easing so the glow trails smoothly instead of teleporting.
      currentRef.current.x += (mouseRef.current.x - currentRef.current.x) * 0.15;
      currentRef.current.y += (mouseRef.current.y - currentRef.current.y) * 0.15;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentRef.current.x - 160}px, ${currentRef.current.y - 160}px, 0)`;
      }
      if (running) rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none z-[5] hidden lg:block"
      style={{
        background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 68%)",
        willChange: "transform",
        contain: "strict",
      }}
    />
  );
}
