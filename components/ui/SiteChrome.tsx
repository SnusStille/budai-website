"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Site chrome that must exist on every page: the accessible skip link.
 *
 * The floating back-to-top button lives in `components/ui/BackToTop.tsx`
 * (framer-motion, mobile + desktop) — it used to be duplicated here, which
 * made two buttons stack in the same corner on desktop.
 */
export default function SiteChrome() {
  const { lang } = useLang();
  const [announced, setAnnounced] = useState(false);
  const timer = useRef(0);

  // Announce route-level chrome changes softly for screen readers.
  useEffect(() => {
    setAnnounced(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAnnounced(true), 800);
    return () => window.clearTimeout(timer.current);
  }, [lang]);

  return (
    <>
      <a
        href="#playground"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-accent-cyan focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#020205] focus:shadow-[0_8px_30px_rgba(0,229,255,0.35)]"
      >
        {lang === "sv" ? "Hoppa till Playground" : "Skip to the Playground"}
      </a>
      <span aria-live="polite" className="sr-only">
        {announced ? (lang === "sv" ? "Sidan är redo" : "Page ready") : ""}
      </span>
    </>
  );
}
