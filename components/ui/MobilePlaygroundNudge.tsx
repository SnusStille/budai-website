"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** A small mobile return path to the real Playground, shown only between sections. */
export default function MobilePlaygroundNudge() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("intelligence");
    const playground = document.getElementById("playground");
    if (!hero || !playground) return;
    let heroVisible = true;
    let playgroundVisible = false;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === playground) playgroundVisible = entry.isIntersecting;
      }
      setShow(!heroVisible && !playgroundVisible);
    }, { threshold: .08 });
    observer.observe(hero);
    observer.observe(playground);
    return () => observer.disconnect();
  }, []);

  if (!show) return null;
  return (
    <a className="mobile-playground-nudge md:hidden" href="#playground">
      <span>{lang === "sv" ? "Till Playground" : "Open Playground"}</span>
      <ArrowRight size={15} aria-hidden="true" />
    </a>
  );
}
