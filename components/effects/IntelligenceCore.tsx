"use client";

import { useEffect, useRef } from "react";

/** A lightweight, section-local visual system: one core feeding purposeful paths. */
export default function IntelligenceCore({ quiet = false }: { quiet?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
      el.style.setProperty("--story", String(p));
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    return () => { removeEventListener("scroll", update); removeEventListener("resize", update); };
  }, []);

  const nodes = quiet ? [[82, 50], [68, 31], [68, 69]] : [[15, 20], [15, 50], [15, 80], [85, 20], [85, 50], [85, 80]];
  return (
    <div ref={ref} className={`intelligence-core ${quiet ? "intelligence-core--quiet" : ""}`} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`core-line-${quiet ? "q" : "c"}`} x1="0" x2="1">
            <stop stopColor="#00e5ff" stopOpacity=".15"/><stop offset=".55" stopColor="#00e5ff"/><stop offset="1" stopColor="#7c5cff" stopOpacity=".25"/>
          </linearGradient>
        </defs>
        {nodes.map(([x,y], i) => <path key={i} d={`M50 50 C${x < 50 ? 34 : 66} 50, ${x < 50 ? 30 : 70} ${y}, ${x} ${y}`} />)}
      </svg>
      <span className="intelligence-core__halo" />
      <span className="intelligence-core__center"><i /></span>
      {nodes.map(([x,y], i) => <span key={i} className="intelligence-core__node" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * -.55}s` }} />)}
      <span className="intelligence-core__signal" />
    </div>
  );
}
