"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import BrainFlight from "@/components/effects/BrainFlight";

/**
 * Hero visual: the neural brain as the product's living core.
 *  - Hovering a region of the brain (or its card) lights that region and its card.
 *  - The brain gets busier while the AI is working (listens for "budai:activity").
 *  - Falls back to a soft glow if WebGL is unavailable.
 */

const REGIONS = [
  {
    sv: { t: "Skriv", d: "Mejl och rapporter" },
    en: { t: "Write", d: "Emails and reports" },
  },
  {
    sv: { t: "Minne", d: "Sparar det du väljer" },
    en: { t: "Memory", d: "Keeps what you choose" },
  },
  {
    sv: { t: "Beslut", d: "Sammanfattningar och nästa steg" },
    en: { t: "Decide", d: "Summaries and next steps" },
  },
  {
    sv: { t: "Röst & syn", d: "Bilder och tal" },
    en: { t: "Voice & vision", d: "Images and speech" },
  },
];

export default function HeroBrainPanel() {
  const { lang } = useLang();
  const [hovered, setHovered] = useState(-1);
  const [activity, setActivity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const update = () => setProgress(Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.9))));
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    const onActivity = (e: Event) => {
      const level = (e as CustomEvent<{ level: number }>).detail?.level ?? 0;
      setActivity(level > 0 ? 1 : 0);
    };
    window.addEventListener("budai:activity", onActivity);
    return () => window.removeEventListener("budai:activity", onActivity);
  }, []);

  const jumpToPlayground = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("playground")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden={failed}>
      {failed ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,229,255,0.14),transparent_60%)]" />
      ) : (
        <div className="absolute inset-0 opacity-[0.86] [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_82%)]">
          <BrainFlight
            mode="intro"
            progress={progress}
            focus={hovered}
            activity={activity}
            interactive
            onRegionHover={setHovered}
            onFail={() => setFailed(true)}
          />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-[6%] flex justify-center px-4">
        <div className="pointer-events-auto grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {REGIONS.map((r, i) => {
            const copy = lang === "sv" ? r.sv : r.en;
            const active = hovered === i;
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(-1)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(-1)}
                onClick={jumpToPlayground}
                className={`group rounded-xl border px-3 py-3 text-left backdrop-blur-sm transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan ${
                  active
                    ? "border-accent-cyan/70 bg-accent-cyan/10"
                    : "border-white/10 bg-black/30 hover:border-white/25"
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent-cyan/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-sm font-semibold text-white">{copy.t}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted">{copy.d}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
