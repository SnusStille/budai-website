"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

const STREAMABLE_EMBED = "https://streamable.com/e/bhs4y1";

/** The creator-provided Streamable film, revealed gently as it enters the story. */
export default function ShowcaseFilm() {
  const { lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const sv = lang === "sv";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="showcase-film-section"
      aria-labelledby="showcase-film-title"
      data-revealed={revealed}
    >
      <div className="showcase-film-heading">
        <div>
          <p className="showcase-film-eyebrow">STILLEDEV / SHOWCASE</p>
          <h2 id="showcase-film-title">{sv ? "Där idéer tar form." : "Where ideas take shape."}</h2>
        </div>
        <p className="showcase-film-description">
          {sv
            ? "En inblick i idéerna och hantverket bakom Stilledev."
            : "A glimpse into the ideas and craft behind Stilledev."}
        </p>
      </div>
      <div className="showcase-film-frame">
        <iframe
          src={STREAMABLE_EMBED}
          title={sv ? "Stilledevs showcasefilm" : "Stilledev showcase film"}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
