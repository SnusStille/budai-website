"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "capabilities", label: "Capabilities" },
  { id: "playground", label: "Playground" },
  { id: "terminal", label: "Terminal" },
  { id: "waitlist", label: "Waitlist" },
  { id: "roadmap", label: "Roadmap" },
  { id: "status", label: "Status" },
];

export default function SectionDots() {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ratios = useRef<Record<string, number>>({});

  useEffect(() => {
    const pick = () => {
      const mid = window.scrollY + window.innerHeight * 0.35;
      let closest: string | null = null;
      let dist = Infinity;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (mid >= top - 60 && mid <= bottom + 40) {
          const d = Math.abs(top - mid);
          if (d < dist) {
            dist = d;
            closest = s.id;
          }
        }
      }
      if (closest) setActive(closest);
    };

    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );

    const observer =
      sections.length > 0
        ? new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                ratios.current[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
              }
              let best = "";
              let bestR = 0;
              for (const s of SECTIONS) {
                const r = ratios.current[s.id] ?? 0;
                if (r > bestR) {
                  bestR = r;
                  best = s.id;
                }
              }
              if (bestR >= 0.08 && best) setActive(best);
              else pick();
            },
            { rootMargin: "-35% 0px -50% 0px", threshold: [0, 0.15, 0.3, 0.5, 0.7] }
          )
        : null;

    sections.forEach((el) => observer?.observe(el));

    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.55);
      pick();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 10 }}
      transition={{ duration: 0.25 }}
      className="fixed right-5 top-1/2 -translate-y-1/2 z-[20] hidden lg:flex flex-col gap-3.5"
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-label="Section navigation"
    >
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => goTo(s.id)}
          className="group relative flex items-center justify-end"
          aria-label={`Go to ${s.label}`}
          aria-current={active === s.id ? "true" : undefined}
        >
          <span className="absolute right-5 whitespace-nowrap px-2.5 py-1 rounded-md bg-black/85 border border-white/10 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {s.label}
          </span>
          <span
            className={`block rounded-full transition-all duration-250 ${
              active === s.id
                ? "w-2.5 h-2.5 bg-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.7)]"
                : "w-1.5 h-1.5 bg-white/25 group-hover:bg-white/50"
            }`}
          />
        </button>
      ))}
    </motion.nav>
  );
}
