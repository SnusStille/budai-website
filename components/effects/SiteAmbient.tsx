"use client";

import { useEffect, useState } from "react";

/**
 * The living backdrop: two slow aurora fields, a drifting grid and a faint
 * noise film. Pure CSS layers — no canvas, no scroll listeners, no layout
 * impact — and everything stops for `prefers-reduced-motion`.
 */
export default function SiteAmbient() {
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    try {
      setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
      setCalm(false);
    }
  }, []);

  return (
    <div className={`ambient-root ${calm ? "is-calm" : ""}`} aria-hidden="true">
      <span className="ambient-aurora ambient-aurora--a" />
      <span className="ambient-aurora ambient-aurora--b" />
      <span className="ambient-aurora ambient-aurora--c" />
      <span className="ambient-grid" />
      <span className="ambient-grain" />
      <span className="ambient-vignette" />
    </div>
  );
}
