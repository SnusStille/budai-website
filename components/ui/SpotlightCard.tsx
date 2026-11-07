"use client";

import { useRef, type ReactNode } from "react";

/** Card with a soft cursor-following glow and restrained 3D perspective depth. */
export default function SpotlightCard({
  children,
  className = "",
  tilt = true,
  maxTilt = 4.5,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        if (
          tilt &&
          !window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches
        ) {
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(960px) rotateY(${(px * maxTilt).toFixed(2)}deg) rotateX(${(-py * maxTilt).toFixed(2)}deg) translateY(-3px)`;
        }
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
      className={`group relative overflow-hidden transition-transform duration-300 ease-out ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(0,229,255,0.12), transparent 70%)" }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
