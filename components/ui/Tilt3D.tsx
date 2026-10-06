"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Pointer-driven 3D tilt for a hero object. Eases toward the cursor; idle when nothing moves. */
export default function Tilt3D({ children, max = 12, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const loop = () => {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      el.style.transform = `perspective(900px) rotateY(${cx * max}deg) rotateX(${-cy * max}deg)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [max]);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
      {children}
    </div>
  );
}
