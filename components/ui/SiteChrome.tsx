"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

/** Skip link + back-to-top. The scroll handler is rAF-throttled and only re-renders when the button flips. */
export default function SiteChrome() {
  const { lang } = useLang();
  const [top, setTop] = useState(false);
  const queued = useRef(false);

  useEffect(() => {
    const on = () => {
      if (queued.current) return;
      queued.current = true;
      requestAnimationFrame(() => {
        queued.current = false;
        setTop(window.scrollY > 1400);
      });
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
      <button
        type="button"
        aria-label={lang === "sv" ? "Till toppen" : "Back to top"}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-5 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#07070e]/90 text-white/80 shadow-lg transition-all duration-300 hover:border-accent-cyan/40 hover:text-white md:flex ${
          top ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </>
  );
}
