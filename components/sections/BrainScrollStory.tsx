"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { subscribeJourney } from "@/lib/experience/scroll";
import BrainFallback from "@/components/effects/BrainFallback";

/** Restores the original story's position, NOT its second renderer or scroll loop. */
export default function BrainScrollStory() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const section = useRef<HTMLElement>(null);
  useEffect(() => subscribeJourney(frame => {
    const p = frame.sections.signal ?? 0;
    section.current?.style.setProperty("--neural-progress", String(p));
    section.current?.setAttribute("data-journey-progress", p.toFixed(4));
  }), []);
  return (
    <section ref={section} id="signal" className="brain-journey" aria-labelledby="signal-title" data-brain-journey>
      <div className="brain-journey-sticky">
        <div className="neural-hud-top"><span className="chapter-label"><i />01 / {sv ? "IN I INTELLIGENSEN" : "INTO THE INTELLIGENCE"}</span><a href="#playground">{sv ? "Direkt till Playground" : "Skip to Playground"}<ArrowUpRight size={12} /></a></div>
        <div className="neural-entry-title"><span>BUDAI / NEURAL SYSTEM</span><h2 id="signal-title">{sv ? "Bakom varje svar." : "Behind every answer."}</h2><p>{sv ? "Scrolla in i intelligensen." : "Scroll into the intelligence."}<ArrowDown size={13} /></p></div>
        <div className="brain-journey-fallback" aria-hidden="true"><BrainFallback /></div>
        <div className="neural-crosshair" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="neural-exit-title"><span>{sv ? "TANKE → HANDLING" : "THOUGHT → ACTION"}</span><p>{sv ? "Nu är det din tur." : "Now make it yours."}</p><a href="#playground">{sv ? "Öppna den riktiga Playground" : "Enter the real Playground"}<ArrowDown size={15} /></a></div>
        <div className="neural-hud-bottom"><span>{sv ? "KONTEXT / KOPPLING / SVAR" : "CONTEXT / CONNECTION / RESPONSE"}</span><div><i /></div><span>01 — 03</span></div>
      </div>
    </section>
  );
}
