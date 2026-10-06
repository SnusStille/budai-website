"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

/** Thin scroll-progress line + a mobile "Try the Playground" bar that hides while the Playground is on screen. */
export default function SiteChrome() {
  const { lang } = useLang();
  const [p, setP] = useState(0);
  const [cta, setCta] = useState(false);
  const [top, setTop] = useState(false);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? window.scrollY / max : 0);
      document.documentElement.style.setProperty("--sy", String(Math.round(window.scrollY)));
      const r = document.getElementById("playground")?.getBoundingClientRect();
      const inPg = !!r && r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      setCta(window.scrollY > 500 && !inPg);
      setTop(window.scrollY > 1400);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <a href="#playground" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-accent-cyan focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#020205]">
        Skip to the Playground
      </a>
      <a
        href="#playground"
        className={`md:hidden fixed bottom-4 inset-x-4 z-50 rounded-full bg-accent-cyan py-3 text-center text-sm font-semibold text-[#020205] shadow-lg shadow-accent-cyan/20 transition-all duration-300 ${
          cta ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        {lang === "sv" ? "Prova Playground" : "Try the Playground"}
      </a>
      <button
        type="button"
        aria-label={lang === "sv" ? "Till toppen" : "Back to top"}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-5 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#05050b]/80 text-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-accent-cyan/40 hover:text-white md:flex ${
          top ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </>
  );
}
