"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLang } from "@/components/ui/LanguageContext";

const BrainFlight = dynamic(() => import("@/components/effects/BrainFlight"), { ssr: false });

/**
 * Scroll-bound brain tour. Each stage turns the brain to one region and lights it up.
 * Regions map to BudAI's real capabilities (write, memory, decide, voice & vision).
 * Written from scratch for BudAI; no third-party code or assets.
 */
const STAGES = [
  {
    sv: { title: "Skriv", body: "Mejl, rapporter och förslag på några sekunder." },
    en: { title: "Write", body: "Emails, reports and proposals in seconds." },
  },
  {
    sv: { title: "Minne", body: "BudAI kommer ihåg det du väljer att spara." },
    en: { title: "Memory", body: "Remembers what you choose to keep." },
  },
  {
    sv: { title: "Beslut", body: "Sammanfattningar, risker och nästa steg." },
    en: { title: "Decide", body: "Summaries, risks and next steps." },
  },
  {
    sv: { title: "Röst & syn", body: "Ladda upp bilder och prata i stället för att skriva." },
    en: { title: "Voice & vision", body: "Upload images and speak instead of typing." },
  },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function BrainScrollStory() {
  const { lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const span = el.offsetHeight - window.innerHeight;
        const scrolled = -el.getBoundingClientRect().top;
        setP(reduced || span <= 0 ? 0 : clamp01(scrolled / span));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  const focus = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));

  return (
    <section
      ref={sectionRef}
      aria-label={lang === "sv" ? "Vad BudAI kan" : "What BudAI can do"}
      className="relative h-[320vh] bg-background"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <BrainFlight mode="story" focus={focus} progress={p} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[10%] flex justify-center px-6">
          <div className="relative h-44 w-full max-w-xl text-center">
            {STAGES.map((s, i) => {
              const center = (i + 0.5) / STAGES.length;
              const o = clamp01(1 - Math.abs(p - center) / (0.5 / STAGES.length));
              const copy = lang === "sv" ? s.sv : s.en;
              return (
                <div
                  key={i}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}
                  aria-hidden={o < 0.5}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-cyan/70">
                    {String(i + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
                  </span>
                  <h2 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight text-white [text-shadow:0_0_40px_rgba(0,229,255,0.35)]">
                    {copy.title}
                  </h2>
                  <p className="mt-3 text-base sm:text-lg text-muted">{copy.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
