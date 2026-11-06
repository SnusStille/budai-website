"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const BrainFlight = dynamic(() => import("@/components/effects/BrainFlight"), { ssr: false });

/**
 * The original Stilledev neural renderer, used as a quiet hero accent rather
 * than a scroll-blocking scene. A static frame remains for reduced motion,
 * save-data, slow devices and WebGL failure.
 */
export default function NeuralCore() {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const update = () => setEnabled(!motion.matches && !nav.connection?.saveData && (nav.deviceMemory ?? 8) >= 2);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  return (
    <div className="v2-neural" aria-hidden="true">
      <picture className="v2-neural-poster">
        <source media="(max-width: 767px)" srcSet="/brain/entry-mobile.webp" />
        <img src="/brain/entry-desktop.webp" alt="" width="1080" height="750" loading="eager" fetchPriority="high" />
      </picture>
      {enabled && !failed && (
        <BrainFlight mode="ambient" className="v2-neural-canvas" onFail={() => setFailed(true)} />
      )}
    </div>
  );
}
