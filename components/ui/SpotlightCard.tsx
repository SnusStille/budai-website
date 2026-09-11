"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

/**
 * Lightweight premium card — CSS hover only (no continuous springs).
 * Spotlight follows mouse via CSS variables; no Framer per-frame work.
 */
export default function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--spot-x", `${x}%`);
    el.style.setProperty("--spot-y", `${y}%`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative h-full rounded-2xl ${className}`}
      style={
        {
          "--spot-x": "50%",
          "--spot-y": "40%",
        } as React.CSSProperties
      }
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.04] to-white/[0.015] transition-[border-color,transform,box-shadow] duration-300 ease-out will-change-transform group-hover:-translate-y-1 group-hover:border-accent-cyan/25 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_40px_rgba(0,229,255,0.08)]">
        {/* Spotlight — pure CSS, no JS animation loop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--spot-x) var(--spot-y), rgba(0,229,255,0.12), transparent 45%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] group-hover:opacity-50 transition-opacity">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>
        <div className="relative z-[1] h-full">{children}</div>
      </div>
    </div>
  );
}
