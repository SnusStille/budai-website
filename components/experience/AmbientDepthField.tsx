"use client";

import { useEffect, useRef } from "react";

const PARTICLES = [
  [8, 22, 2], [17, 74, 3], [28, 14, 2], [36, 58, 2], [45, 33, 3],
  [54, 82, 2], [63, 18, 2], [72, 66, 3], [83, 38, 2], [92, 80, 2],
] as const;

/** A cheap CSS-3D orbital field, deliberately behind the single existing brain scene. */
export default function AmbientDepthField() {
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = field.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
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
      x = ((event.clientX / Math.max(1, innerWidth)) - .5) * 5;
      y = ((event.clientY / Math.max(1, innerHeight)) - .5) * -4;
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
        <div className="ambient-orbit ambient-orbit-a"><i /><i /></div>
        <div className="ambient-orbit ambient-orbit-b"><i /><i /></div>
        <div className="ambient-orbit ambient-orbit-c"><i /></div>
        <div className="ambient-core"><i /><b /><span /></div>
        <div className="ambient-particles">
          {PARTICLES.map(([left, top, size], index) => <i key={index} style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${index * -1.7}s` }} />)}
        </div>
      </div>
    </div>
  );
}
