"use client";

import { useEffect, useState } from "react";
import { lastCinema, LEADER_MS } from "@/lib/cinema/bus";
import { scrollToScene } from "@/lib/cinema/scroll";
import { usePrefersReducedMotion } from "@/components/cinema/motion";
import { useLang } from "@/components/ui/LanguageContext";
import Scene from "./Scene";

/**
 * SCENE A — THE ARRIVAL.
 * The brand is not pasted on the world: the logotype is what the light field settles into
 * (see lib/cinema/mark.ts). The DOM carries the statement, the accessible brand name and the
 * calls to action; the 3D layer carries the mark. Neither duplicates the other.
 */
export default function Arrival() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const reduced = usePrefersReducedMotion();
  const [go, setGo] = useState(false);

  useEffect(() => {
    // the leader already advanced the world's intro; if it finished before we mounted, go now
    if ((lastCinema("intro") ?? 0) >= 0.985) {
      setGo(true);
      return;
    }
    const id = window.setTimeout(() => setGo(true), reduced ? 0 : LEADER_MS + 120);
    return () => clearTimeout(id);
  }, [reduced]);

  return (
    <Scene id="arrival" titleId="arrival-title" className="st-arrival">
      <div className="st-shell st-arrival__grid">
        <header className="st-arrival__meta">
          <span className="st-mono">59.3293° N · 18.0686° E</span>
          <span className="st-mono">{sv ? "Studio — en person, noll överlämningar" : "Studio — one person, zero hand-offs"}</span>
          <a href="/budai" className="st-chip st-chip--live">
            <i className="st-dot" aria-hidden />
            {sv ? "BudAI-spelleken är igång" : "BudAI playground is live"}
          </a>
        </header>

        {/* space held for the light mark, so the page never shifts when the world boots */}
        <div className="st-arrival__reserve" aria-hidden>
          {!go && !reduced && <span className="st-arrival__wait">forming</span>}
        </div>

        <div className={`st-arrival__type st-lines ${go ? "is-in" : ""}`}>
          <h1 id="arrival-title" className="st-display st-h1 st-display--tight text-center">
            <span className="sr-only">STILLEDEV — </span>
            <span className="st-line">
              <span style={{ ["--i" as string]: 0 }}>Software,</span>
            </span>
            <span className="st-line">
              <span style={{ ["--i" as string]: 1 }} className="text-[color:var(--st-signal)]">
                directed.
              </span>
            </span>
          </h1>
          <p className="st-lede st-fade mx-auto mt-7 text-center" style={{ ["--i" as string]: 3 }}>
            {sv
              ? "Vi bygger AI-produkter, automatisering och gränssnitt som beter sig som formgivna objekt — i Stockholm, för Sverige och Norden. Det du just rullade igenom är en enda kamera rörande sig genom en enda scen."
              : "We build AI products, automation and interfaces that behave like designed objects — from Stockholm, for Sweden and the Nordics. What you just scrolled through is one camera travelling through one scene."}
          </p>
          <div className="st-fade mt-9 flex flex-wrap items-center justify-center gap-3" style={{ ["--i" as string]: 4 }}>
            <button type="button" className="st-btn" onClick={() => scrollToScene("works")}>
              {sv ? "Se arbetena" : "See the work"}
              <span className="arrow" aria-hidden>
                →
              </span>
            </button>
            <button type="button" className="st-btn st-btn--ghost" onClick={() => scrollToScene("construction")}>
              {sv ? "Prova BudAI live" : "Try BudAI live"}
            </button>
          </div>
        </div>

        <footer className="st-arrival__foot">
          <span className="st-num">01 / 07</span>
          <button
            type="button"
            className="st-arrival__scroll"
            onClick={() => scrollToScene("descent")}
            aria-label={sv ? "Skrolla till nästa scen" : "Scroll to the next scene"}
          >
            <span className="st-mono">{sv ? "Skrolla — kameran följer efter" : "Scroll — the camera follows"}</span>
            <span className="st-arrival__cue" aria-hidden />
          </button>
          <span className="st-mono">{sv ? "Nästa: 02 Premiss" : "Next: 02 Premise"}</span>
        </footer>
      </div>
    </Scene>
  );
}
