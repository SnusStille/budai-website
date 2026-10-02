"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/components/ui/LanguageContext";

/** Minimal scroll indicator for the four parts of the story. */
export default function SectionDots() {
  const { t } = useLang();
  const [active, setActive] = useState<string | null>("playground");
  const [visible, setVisible] = useState(false);

  const SECTIONS = [
    { id: "playground", label: t.nav.playground },
    { id: "budai", label: t.nav.product },
    { id: "vision", label: t.nav.vision },
    { id: "waitlist", label: t.nav.waitlist },
  ];

  useEffect(() => {
    let rects: { id: string; top: number; bottom: number }[] = [];
    let raf = 0;

    const measure = () => {
      const next: { id: string; top: number; bottom: number }[] = [];
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        next.push({ id: s.id, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY });
      }
      if (next.length) rects = next;
    };

    const pick = () => {
      if (!rects.length) measure();
      setVisible(window.scrollY > window.innerHeight * 0.45);
      if (!rects.length) return;
      const line = window.scrollY + window.innerHeight * 0.35;
      let current = rects[0].id;
      for (const r of rects) if (line >= r.top - 100) current = r.id;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = rects[rects.length - 1].id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        pick();
      });
    };
    const onResize = () => {
      measure();
      pick();
    };

    measure();
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Sections mount/resize late (dynamic Playground import).
    const t1 = window.setTimeout(onResize, 700);
    const t2 = window.setTimeout(onResize, 1800);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  return (
    <motion.nav
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 8 }}
      transition={{ duration: 0.25 }}
      className="fixed right-5 top-1/2 z-[20] hidden -translate-y-1/2 flex-col gap-3.5 lg:flex"
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-label="Section navigation"
    >
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="group relative flex items-center justify-end"
          aria-label={s.label}
          aria-current={active === s.id ? "true" : undefined}
        >
          <span className="pointer-events-none absolute right-5 whitespace-nowrap rounded-md border border-white/10 bg-black/85 px-2.5 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            {s.label}
          </span>
          <span
            className={`block rounded-full transition-all duration-200 ${
              active === s.id
                ? "h-2.5 w-2.5 bg-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.7)]"
                : "h-1.5 w-1.5 bg-white/25 group-hover:bg-white/50"
            }`}
          />
        </button>
      ))}
    </motion.nav>
  );
}
