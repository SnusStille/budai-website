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
    const update = () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const pastHero = hero.getBoundingClientRect().bottom < window.innerHeight * .35;
      const beforePlayground = playground.getBoundingClientRect().top > window.innerHeight * .58;
      setShow(mobile && pastHero && beforePlayground);
    };
    const observer = new IntersectionObserver(update, { threshold: .08 });
    observer.observe(hero);
    observer.observe(playground);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!show) return null;
  return (
    <a className="mobile-playground-nudge md:hidden" href="#playground">
      <span>{lang === "sv" ? "Till Playground" : "Open Playground"}</span>
      <ArrowRight size={15} aria-hidden="true" />
    </a>
  );
}
