"use client";

import { useEffect, useState } from "react";
import { onBrainActivity } from "@/lib/logo/activity";

/**
 * The living backdrop.
 *
 * Layers, in order: three slow aurora fields, a drifting grid, a handful of
 * code fragments that BudAI actually speaks, and a faint noise film. All CSS —
 * no canvas, no scroll listeners, no layout impact. The code fades in, drifts,
 * and fades out again, always behind the interface and never bright enough to
 * compete with text. Everything stops for `prefers-reduced-motion`, and the
 * whole field tightens up while BudAI is generating.
 */

const FRAGMENTS = [
  { text: "const response = await budai.generate()", top: "11%", left: "4%", size: "md", dir: "ltr", delay: "0s", dur: "78s" },
  { text: '<assistant thinking="true">', top: "27%", left: "70%", size: "sm", dir: "rtl", delay: "9s", dur: "92s" },
  { text: 'const language = "sv-SE"', top: "62%", left: "8%", size: "sm", dir: "ltr", delay: "16s", dur: "86s" },
  { text: "generateResponse({ creativity: 0.82 })", top: "78%", left: "58%", size: "md", dir: "rtl", delay: "23s", dur: "96s" },
  { text: "if (user.prompt) { budai.respond() }", top: "47%", left: "2%", size: "xs", dir: "ltr", delay: "31s", dur: "104s" },
  { text: "const answer = await budai.think()", top: "88%", left: "22%", size: "xs", dir: "ltr", delay: "38s", dur: "98s" },
  { text: "budai.stream({ lang: \"sv\" })", top: "17%", left: "72%", size: "xs", dir: "rtl", delay: "46s", dur: "110s" },
] as const;

export default function SiteAmbient() {
  const [calm, setCalm] = useState(false);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    try {
      setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
      setCalm(false);
    }
    return onBrainActivity(setThinking);
  }, []);

  return (
    <div
      className={`ambient-root ${calm ? "is-calm" : ""} ${thinking ? "is-thinking" : ""}`}
      aria-hidden="true"
    >
      <span className="ambient-aurora ambient-aurora--a" />
      <span className="ambient-aurora ambient-aurora--b" />
      <span className="ambient-aurora ambient-aurora--c" />
      <span className="ambient-grid" />

      {/* the code BudAI speaks, drifting slowly behind everything */}
      <span className="ambient-code">
        {FRAGMENTS.map((f) => (
          <span
            key={f.text}
            className={`ambient-code-line is-${f.size} is-${f.dir}`}
            style={{
              top: f.top,
              left: f.left,
              animationDelay: f.delay,
              animationDuration: f.dur,
            }}
          >
            {f.text}
          </span>
        ))}
      </span>

      {/* a few nodes with lines between them — sparse, never a constellation */}
      <svg className="ambient-nodes" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="12" y1="18" x2="34" y2="31" />
        <line x1="34" y1="31" x2="22" y2="56" />
        <line x1="72" y1="22" x2="86" y2="41" />
        <line x1="86" y1="41" x2="68" y2="62" />
        <line x1="48" y1="72" x2="66" y2="88" />
        <circle cx="12" cy="18" r="0.55" />
        <circle cx="34" cy="31" r="0.45" />
        <circle cx="22" cy="56" r="0.5" />
        <circle cx="72" cy="22" r="0.5" />
        <circle cx="86" cy="41" r="0.45" />
        <circle cx="68" cy="62" r="0.5" />
        <circle cx="48" cy="72" r="0.45" />
        <circle cx="66" cy="88" r="0.5" />
      </svg>

      <span className="ambient-grain" />
      <span className="ambient-vignette" />
    </div>
  );
}
