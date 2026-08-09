"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "capabilities", label: "Capabilities" },
  { id: "playground", label: "Playground" },
  { id: "terminal", label: "Terminal" },
  { id: "waitlist", label: "Waitlist" },
  { id: "roadmap", label: "Roadmap" },
  { id: "status", label: "Status" },
];

// A quiet side-rail nav that tracks scroll position — the kind of detail
// premium product pages (Apple, Linear, Stripe) use so a long single-page
// site never feels like an endless, disorienting scroll. Purely additive:
// doesn't replace the top nav, just gives a persistent sense of "where am I".
export default function SectionDots() {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((el) => observer.observe(el));

    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
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
      transition={{ duration: 0.3 }}
      className="fixed right-5 top-1/2 -translate-y-1/2 z-[20] hidden lg:flex flex-col gap-4 pointer-events-none"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => goTo(s.id)}
          className="group relative flex items-center justify-end"
          aria-label={`Go to ${s.label}`}
        >
          <span className="absolute right-5 whitespace-nowrap px-2.5 py-1 rounded-md bg-black/80 border border-white/10 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {s.label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === s.id ? "w-2.5 h-2.5 bg-accent-cyan shadow-[0_0_8px_rgba(0,229,255,0.6)]" : "w-1.5 h-1.5 bg-white/25 group-hover:bg-white/50"
            }`}
          />
        </button>
      ))}
    </motion.nav>
  );
}
