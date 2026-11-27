"use client";

import { useEffect, useRef } from "react";

/** One restrained 3D orbit behind the brain; no competing particles, grids or canvases. */
export default function AmbientDepthField() {
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = field.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = 0, y = 0;
    const render = () => {
      frame = 0;
      if (document.documentElement.classList.contains("budai-ambient-paused")) return;
      el.style.setProperty("--ambient-pointer-x", `${x}deg`);
      el.style.setProperty("--ambient-pointer-y", `${y}deg`);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = ((event.clientX / Math.max(1, innerWidth)) - .5) * 3;
      y = ((event.clientY / Math.max(1, innerHeight)) - .5) * -2;
      if (!frame) frame = requestAnimationFrame(render);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div ref={field} className="universe-depth-field" aria-hidden="true">
      <div className="ambient-depth-rig">
        <svg className="ambient-orbit" viewBox="0 0 1200 800" fill="none">
          <ellipse className="ambient-orbit-track" cx="620" cy="400" rx="490" ry="205" />
          <ellipse className="ambient-orbit-trace" cx="620" cy="400" rx="490" ry="205" />
        </svg>
      </div>
    </div>
  );
}
