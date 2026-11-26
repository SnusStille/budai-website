"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { subscribeJourney } from "@/lib/experience/scroll";
import { ORIGINAL_BRAIN_STAGES } from "@/lib/experience/brain-story";
import { smooth } from "@/lib/experience/timeline";
import BrainPoster from "@/components/effects/BrainPoster";

/** Original four-stage tour recovered from 43f44c9, with the shared camera owner.
 * Semantic copy only: no private renderer, opening state, scroll listener or RAF.
 */
export default function BrainScrollStory() {
  const {lang}=useLang();
  const sv=lang==="sv";
  const section=useRef<HTMLElement>(null);
  const [poster,setPoster]=useState(true);
  useEffect(()=>subscribeJourney(frame=>{
    const node=section.current;if(!node)return;
    const p=frame.sections.signal??0;
    const save=Boolean((navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData);
    const state=document.documentElement.dataset.brainState;
    const enhanced=!frame.reduced&&!save&&state!=="fallback";
    node.dataset.enhanced=String(enhanced);
    const showPoster=(!enhanced||state!=="ready")&&p<.6;
    setPoster(previous=>previous===showPoster?previous:showPoster);
    node.style.setProperty("--neural-progress",String(p));
    node.dataset.journeyProgress=p.toFixed(4);
    const progress=node.querySelector<HTMLElement>(".neural-hud-bottom[role='progressbar']");
    progress?.setAttribute("aria-valuenow",String(Math.round(p*100)));
    const skip=node.querySelector<HTMLAnchorElement>(".neural-hud-top>a");
    if(skip){skip.tabIndex=enhanced&&p>.7?-1:0;skip.setAttribute("aria-hidden",String(enhanced&&p>.7));}
    node.querySelectorAll<HTMLElement>("[data-original-stage]").forEach((element,i)=>{
      const center=.16+i*.125;
      const opacity=smooth(1-Math.abs(p-center)/.06);
      element.style.setProperty("--stage-opacity",String(opacity));
      element.setAttribute("aria-hidden",String(enhanced&&opacity<.15));
    });
    const synth=node.querySelector<HTMLElement>("[data-digital-synthesis]");
    if(synth){
      const sOpacity=smooth(1-Math.abs(p-.69)/.07);
      synth.style.setProperty("--stage-opacity",String(sOpacity));
      synth.setAttribute("aria-hidden",String(enhanced&&sOpacity<.15));
    }
  }),[]);
  return (
    <section ref={section} id="signal" className="brain-journey" aria-labelledby="signal-title" data-brain-journey data-original-source="43f44c9">
      <div className="brain-journey-sticky">
        <div className="neural-hud-top"><span className="journey-route-label">{sv?"SIGNAL → SAMMANHANG → HANDLING":"SIGNAL → CONTEXT → ACTION"}</span><a href="#playground">{sv?"Gå direkt till arbetsytan":"Jump to the live workspace"}<ArrowUpRight size={12}/></a></div>
        <div className="neural-entry-title">
          <span>{sv?"SV ↔ EN · MINNE DU STYR":"SV ↔ EN · MEMORY YOU CONTROL"}</span>
          <h2 id="signal-title">{sv?"En signal får sammanhang.":"A signal gains context."}</h2>
          <p className="signal-meaning">{sv?"Växla mellan svenska och engelska utan att tappa tråden. Minnet är valfritt, redigerbart och kan raderas.":"Switch between Swedish and English without losing the thread. Memory is optional, editable and deletable."}</p>
        </div>
        {poster&&<div className="brain-journey-fallback" aria-hidden="true"><BrainPoster/></div>}
        <div className="original-brain-tour" data-original-brain-tour>
          {ORIGINAL_BRAIN_STAGES.map((stage,i)=>{
            const copy=sv?stage.sv:stage.en;
            return <div key={i} className="original-brain-stage" data-original-stage={i}>
              <h3>{copy.title}</h3>
              <p>{copy.body}</p>
            </div>;
          })}
          <div className="original-brain-stage neural-digital-synthesis" data-digital-synthesis aria-hidden="true">
            <span>{sv?"KAPITEL 05 · DIN IDÉ BÖRJAR HÄR":"CHAPTER 05 · YOUR IDEA STARTS HERE"}</span>
            <h3>{sv?"Du har sett vad som är möjligt.":"You've seen what's possible."}</h3>
            <p>{sv?"Nu kan du skapa något eget direkt i den riktiga BudAI Playground nedan.":"Now make something of your own in the live BudAI Playground ahead."}</p>
          </div>
        </div>

        <div className="neural-hud-bottom" role="progressbar" aria-label={sv?"Förlopp från signal till Playground":"Progress from signal to Playground"} aria-valuemin={0} aria-valuemax={100}>
          <span>{sv?"SIGNAL":"SIGNAL"}</span><div><i/></div><span>{sv?"PLAYGROUND":"PLAYGROUND"}</span>
        </div>
      </div>
    </section>
  );
}
