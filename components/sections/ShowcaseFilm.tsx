"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Maximize2, Minimize2, Play, X } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

// Keep the original, finished Streamable film; only the player parameters change.
const STREAMABLE_EMBED = "https://streamable.com/e/bhs4y1";

/** An editorial film feature with a persistent, controllable player dock. */
export default function ShowcaseFilm() {
  const { lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [closed, setClosed] = useState(false);
  const sv = lang === "sv";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

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

  const openFilm = () => {
    setClosed(false);
    setMinimized(false);
    setExpanded(true);
  };

  const playgroundLabel = sv ? "Prova Playground" : "Try the Playground";
  const tryLabel = sv ? "Testa nu" : "Try it now";
  const title = sv ? "En idé blir till." : "An idea, in motion.";
  const streamableSrc = `${STREAMABLE_EMBED}?${reducedMotion ? "muted=1&logo=0" : "autoplay=1&muted=1&loop=1&logo=0"}`;

  return (
    <>
      <section
        ref={sectionRef}
        className="showcase-film-section"
        aria-labelledby="showcase-film-title"
        data-revealed={revealed}
      >
        <div className="showcase-film-card">
          <div className="showcase-film-copy">
            <p className="showcase-film-eyebrow"><span /> STILLEDEV / FILM 01</p>
            <h2 id="showcase-film-title">{sv ? "Från tanke till något du kan använda." : "From a thought to something you can use."}</h2>
            <p className="showcase-film-description">
              {sv
                ? "En kort inblick i hur vi bygger verktyg som gör idéer enklare att förverkliga. Se filmen — och prova själv direkt efter."
                : "A short look at how we build tools that make ideas easier to bring to life. Watch the film, then try it for yourself."}
            </p>
            <div className="showcase-film-actions">
              <a className="showcase-film-try" href="#playground" onClick={() => { setExpanded(false); setMinimized(true); }}>
                {tryLabel}<ArrowDownRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <button type="button" className="showcase-film-art" onClick={openFilm} aria-label={sv ? "Öppna Stilledev-filmen i stort läge" : "Open the Stilledev film fullscreen"}>
            <span className="showcase-film-art-grid" aria-hidden="true" />
            <span className="showcase-film-art-orbit showcase-film-art-orbit-one" aria-hidden="true" />
            <span className="showcase-film-art-orbit showcase-film-art-orbit-two" aria-hidden="true" />
            <span className="showcase-film-art-core" aria-hidden="true"><Play size={22} fill="currentColor" /></span>
            <span className="showcase-film-art-index">SD<span>—</span>01</span>
            <span className="showcase-film-art-caption">{sv ? "EN IDÉ I RÖRELSE" : "AN IDEA IN MOTION"}</span>
          </button>
        </div>
      </section>

      {closed ? (
        <button type="button" className="showcase-film-reopen" onClick={() => { setClosed(false); setMinimized(false); }}>
          <Play size={13} fill="currentColor" aria-hidden="true" />
          <span>{sv ? "Visa filmen" : "Show film"}</span>
        </button>
      ) : (
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
              <button type="button" className="showcase-film-mini-open" onClick={() => setMinimized(false)} aria-label={sv ? "Öppna showcasefilmen" : "Expand showcase film"}>
                <span className="showcase-film-mini-play"><Play size={13} fill="currentColor" aria-hidden="true" /></span>
                <span className="showcase-film-mini-copy"><strong>STILLEDEV</strong><small>{sv ? "Visa filmen" : "Showreel"}</small></span>
              </button>
              <a href="#playground" onClick={() => setMinimized(true)}>{sv ? "Prova" : "Try it"}<ArrowUpRight size={13} aria-hidden="true" /></a>
              <button type="button" className="showcase-film-control" onClick={() => setClosed(true)} aria-label={sv ? "Stäng filmspelaren" : "Close film player"} title={sv ? "Stäng" : "Close"}><X size={15} aria-hidden="true" /></button>
            </div>
          ) : (
            <div className="showcase-film-player-card">
              <div className="showcase-film-player-top">
                <div className="showcase-film-player-brand"><BudAILogo size="xs" animated={false} className="showcase-film-player-mark" /><span><strong>BUDAI</strong><small>{sv ? "STILLEDEV / KORTFILM" : "STILLEDEV / SHORT FILM"}</small></span></div>
                <div className="showcase-film-player-controls">
                  <button type="button" className="showcase-film-control" onClick={() => { setExpanded(false); setMinimized(true); }} aria-label={sv ? "Minimera filmspelaren" : "Minimize film player"} title={sv ? "Minimera" : "Minimize"}><Minimize2 size={15} aria-hidden="true" /></button>
                  <button type="button" className="showcase-film-control" onClick={() => setExpanded(value => !value)} aria-label={expanded ? (sv ? "Stäng storbild" : "Exit fullscreen") : (sv ? "Visa i storbild" : "View fullscreen")} title={expanded ? (sv ? "Återställ" : "Restore") : (sv ? "Storbild" : "Fullscreen")}>
                    {expanded ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
                  </button>
                  <button type="button" className="showcase-film-control" onClick={() => { setExpanded(false); setClosed(true); }} aria-label={sv ? "Stäng filmspelaren" : "Close film player"} title={sv ? "Stäng" : "Close"}><X size={15} aria-hidden="true" /></button>
                </div>
              </div>
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
              </div>
              <div className="showcase-film-player-bottom">
                <p>{title}<span>{sv ? "En titt in i Stilledev" : "A look inside Stilledev"}</span></p>
                <a href="#playground" onClick={() => { setExpanded(false); setMinimized(true); }}>
                  {playgroundLabel}<ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
}
