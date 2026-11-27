"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Maximize2, Minimize2, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

// Preserve the original Streamable-hosted film. Its player branding cannot be
// removed through a supported embed option, so no overlay or fake cover is used.
const STREAMABLE_EMBED = "https://streamable.com/e/bhs4y1";
const FOCUSABLE = "a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex='-1'])";

/** A cinematic, portrait-first showcase that is opened only from the landing page. */
export default function ShowcaseFilm() {
  const { lang } = useLang();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const sv = lang === "sv";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);

    const showFilm = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setFrameReady(false);
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
    if (!open) {
      if (wasOpenRef.current) openerRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setExpanded(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        .filter(element => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
        ref={dialogRef}
        className={`showcase-film-modal${expanded ? " is-expanded" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="showcase-film-dialog-title"
        aria-describedby="showcase-film-dialog-description"
      >
        <header className="showcase-film-modal-header">
          <div className="showcase-film-heading">
            <p className="showcase-film-kicker"><span className="showcase-film-live-dot" /> STILLEDEV <i>·</i> SHOWCASE 01</p>
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

        <div className="showcase-film-modal-content">
          <div className={`showcase-film-modal-screen${frameReady ? " is-ready" : ""}`}>
            {!frameReady && <span className="showcase-film-screen-loading" aria-hidden="true"><i />{sv ? "LADDAR FILM" : "LOADING FILM"}</span>}
            {reducedMotion !== null && (
              <iframe
                src={streamableSrc}
                title={sv ? "Stilledevs showcasefilm" : "Stilledev showcase film"}
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setFrameReady(true)}
              />
            )}
          </div>

          <aside className="showcase-film-editorial">
            <p className="showcase-film-editorial-label">{sv ? "EN KORT STUDIOFILM" : "A SHORT STUDIO FILM"}</p>
            <h3>{sv ? "Det börjar med en idé." : "It starts with an idea."}</h3>
            <p id="showcase-film-dialog-description">
              {sv
                ? "En snabb inblick i Stilledev och det vi bygger — från första tanke till något du kan använda."
                : "A brief look inside Stilledev and what we build — from the first thought to something you can use."}
            </p>
            <div className="showcase-film-facts" aria-label={sv ? "Om Stilledev" : "About Stilledev"}>
              <div><span>{sv ? "BAS" : "BASED"}</span><b>{sv ? "Sverige" : "Sweden"}</b></div>
              <div><span>{sv ? "SPRÅK" : "LANGUAGES"}</span><b>SV <i>·</i> EN</b></div>
            </div>
            <a className="showcase-film-modal-cta" href="#playground" onClick={closeFilm}>
              {sv ? "Prova Playground" : "Try the Playground"}<ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <p className="showcase-film-footnote">{sv ? "Stilledev · Oberoende mjukvarustudio" : "Stilledev · Independent software studio"}</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
