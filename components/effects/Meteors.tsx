"use client";

import { useState, useEffect } from "react";

// Sparse, slow shooting-star streaks — a common accent on premium AI/dev
// landing pages (Vercel, Linear, and friends all use some variant of this).
// Pure CSS animation, no per-frame JS, so it's effectively free.
export default function Meteors({ count = 8 }: { count?: number }) {
  const [enabled, setEnabled] = useState(false);
  const [meteors] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 50 - 5,
      left: Math.random() * 100,
      delay: Math.random() * 9,
      duration: 3.5 + Math.random() * 2.5,
    }))
  );

  useEffect(() => {
    setEnabled(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-[3] pointer-events-none overflow-hidden" aria-hidden="true">
      {meteors.map((m) => (
        <span
          key={m.id}
          className="meteor"
          style={{
            top: `${m.top}%`,
            left: `${m.left}%`,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
