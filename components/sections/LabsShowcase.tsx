"use client";

import { useEffect, useRef } from "react";
import { ArrowDownRight, ArrowRight, Check, LockKeyhole } from "lucide-react";

/** Pauses away from view and never overrides a visitor's manual pause. */
function ConceptVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false, userPaused = false, systemPause = false;
    const pause = () => { if (!video.paused) { systemPause = true; video.pause(); } };
    const sync = () => {
      if (!inView || document.hidden || motion.matches) pause();
      else if (!userPaused) void video.play().catch(() => {});
    };
    const onPause = () => { if (systemPause) systemPause = false; else userPaused = true; };
    const onPlay = () => { userPaused = false; };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: .15 });
    observer.observe(video);
    video.addEventListener("pause", onPause); video.addEventListener("play", onPlay);
    motion.addEventListener("change", sync); document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); motion.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); video.removeEventListener("pause", onPause); video.removeEventListener("play", onPlay); video.pause(); };
  }, []);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline controls preload="metadata" aria-label={label} />;
}

export default function LabsShowcase({ sv }: { sv: boolean }) {
  return <div className="lab-showcases">
    <article id="estate-case" className="lab-case lab-case-estate">
      <div className="lab-case-head"><span>01 / {sv ? "EN SMARTARE ARBETSDAG" : "A SMARTER WORKDAY"}</span><span><LockKeyhole size={12} /> {sv ? "PRIVAT PROJEKT" : "PRIVATE PROJECT"}</span></div>
      <div className="lab-case-grid">
        <div className="lab-case-copy"><div className="lab-case-kicker">JULIA STILLE / REAL ESTATE</div><h3>{sv ? <>Mer tid för <em>människor.</em></> : <>More time for <em>people.</em></>}</h3><p>{sv ? "En digital arbetsplats som samlar objekt, kunder, leads och visningar. Mindre tid på att leta — mer tid till relationer och nästa affär." : "A digital workspace for properties, clients, leads and viewings. Less time searching, more time for relationships and the next opportunity."}</p>
          <ul><li><Check size={14} />{sv ? "Struktur för objekt och kunder" : "Clarity across properties and clients"}</li><li><Check size={14} />{sv ? "Leads, visningar och uppföljning" : "Leads, viewings and follow-ups"}</li><li><Check size={14} />{sv ? "AI-stöd för den dagliga överblicken" : "AI support for the daily overview"}</li></ul>
          <p className="lab-case-note">{sv ? "Vision: en assistent som kan möta kundernas frågor även på natten när Julia inte är tillgänglig. Filmen är en fiktiv produktvisualisering, inte en inspelning av Julia." : "The vision: an assistant that could welcome customer questions even at night when Julia is unavailable. The film is a fictional product visualisation, not footage of Julia."}</p>
        </div>
        <div className="lab-case-screen"><div className="lab-screen-bar"><span><i /><i /><i /></span><span>JULIA STILLE / WORKSPACE</span><ArrowDownRight size={14} /></div><ConceptVideo src="/labs-media/julia.mp4" poster="/labs-media/julia-poster.jpg" label={sv ? "Konceptfilm för Julia Stille Real Estate med uppspelningskontroller" : "Julia Stille Real Estate concept film with playback controls"} /><div className="lab-screen-caption"><span>{sv ? "PRODUKTVISUALISERING · FIKTIV DATA" : "PRODUCT VISUALISATION · FICTIONAL DATA"}</span><span>01 / 02</span></div></div>
      </div>
    </article>
    <article id="harvis-case" className="lab-case lab-case-harvis">
      <div className="lab-case-head"><span>02 / {sv ? "EN IDÉ I RÖRELSE" : "AN IDEA IN MOTION"}</span><span><LockKeyhole size={12} /> {sv ? "PRIVAT PROJEKT" : "PRIVATE PROJECT"}</span></div>
      <div className="lab-case-grid">
        <div className="lab-case-copy"><div className="lab-case-kicker">HARVIS / DIGITAL ASSISTANT</div><h3>{sv ? <>En extra <em>hjärna.</em></> : <>An extra <em>mind.</em></>}</h3><p>{sv ? "Harvis är idén om en personlig AI-assistent som hjälper till att skapa överblick, hantera dialoger och hålla arbetet i rörelse." : "Harvis is the idea of a personal AI assistant that helps create clarity, manage conversations and keep work moving."}</p>
          <ul><li><Check size={14} />{sv ? "Kan fånga upp frågor och förfrågningar" : "Could help capture questions and enquiries"}</li><li><Check size={14} />{sv ? "Kan sammanfatta och skapa struktur" : "Could summarise and create structure"}</li><li><Check size={14} />{sv ? "Kan förbereda nästa steg och uppföljning" : "Could help prepare next steps and follow-ups"}</li></ul>
          <p className="lab-case-note">{sv ? "Visad funktion och koppling till mäklarplattformen är en vision — inte ett löfte om en aktiv integration." : "The functionality and connection to the real estate workspace shown here are a vision, not a claim of a live integration."}</p>
        </div>
        <div className="lab-case-screen"><div className="lab-screen-bar"><span><i /><i /><i /></span><span>HARVIS / ASSISTANT</span><ArrowDownRight size={14} /></div><ConceptVideo src="/labs-media/harvis-concept.mp4" poster="/labs-media/harvis-concept-poster.jpg" label={sv ? "Konceptfilm för Harvis med uppspelningskontroller" : "Harvis concept film with playback controls"} /><div className="lab-screen-caption"><span>{sv ? "PRODUKTVISUALISERING · KONCEPT" : "PRODUCT VISUALISATION · CONCEPT"}</span><span>02 / 02</span></div></div>
      </div>
    </article>
    <div className="lab-duo"><div className="lab-duo-intro"><div className="lab-case-kicker">{sv ? "TVÅ IDÉER. ETT FLÖDE." : "TWO IDEAS. ONE FLOW."}</div><h3>{sv ? <>Bättre <em>tillsammans.</em></> : <>Better <em>together.</em></>}</h3><p>{sv ? "Mäklarplattformen skapar struktur. Harvis kan bli den extra hjälpen som tar hand om dialog och nästa steg. Tillsammans är de en vision om ett lugnare, mer sammanhängande arbetssätt." : "The real estate workspace creates structure. Harvis could become the extra help for conversations and next steps. Together, they form a vision for a calmer, more connected way to work."}</p></div><div className="lab-duo-steps"><div><span>01</span><strong>{sv ? "En fråga kommer in" : "A question comes in"}</strong><small>{sv ? "En kund tar kontakt." : "A customer reaches out."}</small></div><ArrowRight size={16} /><div><span>02</span><strong>{sv ? "Harvis hjälper till" : "Harvis assists"}</strong><small>{sv ? "Dialogen tas om hand." : "The conversation is picked up."}</small></div><ArrowRight size={16} /><div><span>03</span><strong>{sv ? "Julia får överblick" : "Julia sees the context"}</strong><small>{sv ? "Uppföljningen blir tydlig." : "The next step is clear."}</small></div></div><p className="lab-duo-disclaimer">{sv ? "Illustrerat framtidsscenario. Funktioner och integration beror på implementation och konfiguration." : "Illustrative future scenario. Features and integration depend on implementation and configuration."}</p></div>
  </div>;
}
