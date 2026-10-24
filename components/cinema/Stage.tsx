"use client";

import dynamic from "next/dynamic";

/**
 * The visual plate of the film: a CSS poster that is always there, the WebGL world on top of
 * it when WebGL is available, then the print grade over both so DOM and canvas share one lens.
 */
const CinemaWorld = dynamic(() => import("@/components/cinema/CinemaWorld"), {
  ssr: false,
  loading: () => null,
});

export default function Stage({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none" aria-hidden>
      <div className="st-poster">
        <div className="st-poster__glow" />
        <div className="st-poster__grid" />
        <span className={`st-poster__mark ${reduced ? "" : "is-alive"}`}>STILLEDEV</span>
        <div className="st-poster__scan" />
      </div>
      <CinemaWorld />
      <div className="st-vignette" />
      <div className="st-grain" />
    </div>
  );
}
