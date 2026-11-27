"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Maximize2, Minimize2, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

// Keep the user's original film and only use documented Streamable player options.
const STREAMABLE_EMBED = "https://streamable.com/e/bhs4y1";

/** The landing-page CTA opens a centered, portrait-first film dialog on demand. */
export default function ShowcaseFilm() {
  const { lang } = useLang();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const sv = lang === "sv";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);

    const showFilm = () => {
      setExpanded(false);
      setOpen(true);
    };
    window.addEventListener("budai:show-film", showFilm);
    return () => {
      preference.removeEventListener("change", updatePreference);
      window.removeEventListener("budai:show-film", showFilm);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setExpanded(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeFilm = () => {
    setOpen(false);
    setExpanded(false);
  };
  const streamableSrc = `${STREAMABLE_EMBED}?${reducedMotion ? "muted=1" : "autoplay=1&muted=1&loop=1"}`;

  if (!open) return null;

  return (
    <div className="showcase-film-overlay" onMouseDown={event => { if (event.target === event.currentTarget) closeFilm(); }}>
      <section
        className={`showcase-film-modal${expanded ? " is-expanded" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="showcase-film-dialog-title"
      >
        <header className="showcase-film-modal-header">
          <div>
            <p>STILLEDEV <span>·</span> FILM 01</p>
            <h2 id="showcase-film-dialog-title">{sv ? "En idé blir till." : "An idea, in motion."}</h2>
          </div>
          <div className="showcase-film-modal-actions">
            <button type="button" className="showcase-film-modal-control" onClick={() => setExpanded(value => !value)} aria-label={expanded ? (sv ? "Återställ storlek" : "Restore size") : (sv ? "Visa filmen större" : "Expand film")} title={expanded ? (sv ? "Återställ" : "Restore") : (sv ? "Visa större" : "Expand")}>
              {expanded ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
            </button>
            <button ref={closeButtonRef} type="button" className="showcase-film-modal-control" onClick={closeFilm} aria-label={sv ? "Stäng filmen" : "Close film"} title={sv ? "Stäng" : "Close"}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="showcase-film-modal-screen">
          {reducedMotion !== null && (
            <iframe
              src={streamableSrc}
              title={sv ? "Stilledevs showcasefilm" : "Stilledev showcase film"}
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
        <footer className="showcase-film-modal-footer">
          <p>{sv ? "En kort inblick i Stilledev." : "A short look inside Stilledev."}</p>
          <a href="#playground" onClick={closeFilm}>{sv ? "Prova Playground" : "Try the Playground"}<ArrowUpRight size={14} aria-hidden="true" /></a>
        </footer>
      </section>
    </div>
  );
}
