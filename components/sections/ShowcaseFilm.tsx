"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Maximize2, Minimize2, Play, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

// Keep the user's original film and use only documented Streamable player options.
const STREAMABLE_EMBED = "https://streamable.com/e/bhs4y1";

/** A quiet, click-to-play corner dock; the film never occupies a page section. */
export default function ShowcaseFilm() {
  const { lang } = useLang();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [minimized, setMinimized] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [closed, setClosed] = useState(false);
  const sv = lang === "sv";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);

    const openFilm = () => {
      setClosed(false);
      setMinimized(false);
      setExpanded(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "v" || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.closest(".showcase-film-player") || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
      openFilm();
    };
    window.addEventListener("budai:show-film", openFilm);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      preference.removeEventListener("change", updatePreference);
      window.removeEventListener("budai:show-film", openFilm);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const streamableSrc = `${STREAMABLE_EMBED}?${reducedMotion ? "muted=1" : "autoplay=1&muted=1&loop=1"}`;
  const showFilm = () => {
    setClosed(false);
    setMinimized(false);
  };
  const closeFilm = () => {
    setExpanded(false);
    setClosed(true);
  };

  return (
    closed ? null : (
      <aside
        className={`showcase-film-player${expanded ? " is-expanded" : ""}${minimized ? " is-minimized" : ""}`}
        aria-label={sv ? "Stilledevs showcasefilm" : "Stilledev showcase film"}
        aria-modal={expanded ? "true" : undefined}
        role={expanded ? "dialog" : "region"}
        data-expanded={expanded}
        data-minimized={minimized}
        data-dock-visible="true"
      >
        {minimized ? (
          <div className="showcase-film-mini">
            <button type="button" className="showcase-film-mini-open" onClick={showFilm} aria-label={sv ? "Spela showcasefilmen" : "Play the showcase film"}>
              <span className="showcase-film-mini-play"><Play size={13} fill="currentColor" aria-hidden="true" /></span>
              <span className="showcase-film-mini-copy"><strong>STILLEDEV</strong><small>{sv ? "Kortfilm" : "Short film"}</small></span>
            </button>
            <a href="#playground">{sv ? "Prova" : "Try it"}<ArrowUpRight size={13} aria-hidden="true" /></a>
            <button type="button" className="showcase-film-control" onClick={closeFilm} aria-label={sv ? "Stäng filmspelaren" : "Close film player"} title={sv ? "Stäng" : "Close"}><X size={15} aria-hidden="true" /></button>
          </div>
        ) : (
          <div className="showcase-film-player-card">
            <div className="showcase-film-player-screen">
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
              <div className="showcase-film-player-controls">
                <span className="showcase-film-player-label">STILLEDEV <i>·</i> FILM 01</span>
                <div className="showcase-film-player-actions">
                  <button type="button" className="showcase-film-control" onClick={() => { setExpanded(false); setMinimized(true); }} aria-label={sv ? "Minimera filmspelaren" : "Minimize film player"} title={sv ? "Minimera" : "Minimize"}><Minimize2 size={14} aria-hidden="true" /></button>
                  <button type="button" className="showcase-film-control" onClick={() => setExpanded(value => !value)} aria-label={expanded ? (sv ? "Stäng storbild" : "Exit fullscreen") : (sv ? "Visa i storbild" : "View fullscreen")} title={expanded ? (sv ? "Återställ" : "Restore") : (sv ? "Storbild" : "Fullscreen")}>
                    {expanded ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
                  </button>
                  <button type="button" className="showcase-film-control" onClick={closeFilm} aria-label={sv ? "Stäng filmspelaren" : "Close film player"} title={sv ? "Stäng" : "Close"}><X size={14} aria-hidden="true" /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    )
  );
}
