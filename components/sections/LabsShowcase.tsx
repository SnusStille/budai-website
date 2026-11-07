"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";

function StockVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const node = video.current;
    if (!node) return;
    const start = () => { if (media.matches) node.pause(); else void node.play().catch(() => {}); };
    start();
    media.addEventListener("change", start);
    return () => { media.removeEventListener("change", start); node.pause(); };
  }, []);
  return <video ref={video} src={src} poster={poster} muted loop playsInline controls preload="none" aria-label={label} />;
}

export default function LabsShowcase({ sv }: { sv: boolean }) {
  return <div className="lab-feature-grid">
    <article className="lab-feature lab-feature-estate">
      <div className="lab-feature-media"><StockVideo src="/labs-media/real-estate.mp4" poster="/labs-media/real-estate.jpg" label={sv ? "Illustrativ fastighetsfilm, uppspelningskontroller" : "Illustrative real estate video, playback controls"} /><span className="lab-feature-number">01 / REAL ESTATE</span></div>
      <div className="lab-feature-body"><div className="lab-feature-label"><span>{sv ? "UTVALT PROJEKT" : "FEATURED PROJECT"}</span><span><LockKeyhole size={12} /> {sv ? "PRIVAT" : "PRIVATE"}</span></div><h3>Julia Stille<br />Real Estate<span>.</span></h3><p>{sv ? "En digital arbetsyta för fastighetsarbete, från objekt och kunder till visningar och uppföljning." : "A digital workspace for real estate work, from properties and clients to viewings and follow-up."}</p><div className="lab-feature-tags"><span>REAL ESTATE</span><span>WORKSPACE</span><span>DESIGN + CODE</span></div></div>
    </article>
    <article className="lab-feature lab-feature-harvis">
      <div className="lab-feature-media"><StockVideo src="/labs-media/harvis.mp4" poster="/labs-media/harvis.jpg" label={sv ? "Illustrativ teknikfilm, uppspelningskontroller" : "Illustrative technology video, playback controls"} /><span className="lab-feature-number">02 / DIGITAL</span></div>
      <div className="lab-feature-body"><div className="lab-feature-label"><span>{sv ? "UTVALT PROJEKT" : "FEATURED PROJECT"}</span><span><LockKeyhole size={12} /> {sv ? "PRIVAT" : "PRIVATE"}</span></div><h3>Harvis<span>.</span></h3><p>{sv ? "Ett digitalt projekt i Labs samling, där idéer och teknik möts. Mer information delas när den är redo." : "A digital project in the Labs collection, where ideas and technology meet. More details will be shared when ready."}</p><div className="lab-feature-tags"><span>DIGITAL</span><span>PROJECT</span><span>DESIGN + CODE</span></div></div>
    </article>
    <p className="lab-feature-credit">{sv ? "Illustrativa stockfilmer, inte inspelningar av projekten." : "Illustrative stock footage, not recordings of the projects."} <a href="https://www.pexels.com/video/luxurious-modern-home-with-pool-and-palm-view-39576513/" target="_blank" rel="noopener noreferrer">Alef Morais / Pexels <ArrowUpRight size={11} /></a> · <a href="https://www.pexels.com/video/cg-animation-of-circuit-board-11041434/" target="_blank" rel="noopener noreferrer">Soumya / Pexels <ArrowUpRight size={11} /></a></p>
  </div>;
}
