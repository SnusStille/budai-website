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
    const enhanced=!frame.reduced&&document.documentElement.dataset.brainState==="ready";
    node.dataset.enhanced=String(enhanced);
    setPoster(previous=>previous===!enhanced?previous:!enhanced);
    node.style.setProperty("--neural-progress",String(p));
    node.dataset.journeyProgress=p.toFixed(4);
    const skip=node.querySelector<HTMLAnchorElement>(".neural-hud-top>a");
    if(skip){skip.tabIndex=enhanced&&p>.79?-1:0;skip.setAttribute("aria-hidden",String(enhanced&&p>.79));}
    node.querySelectorAll<HTMLElement>("[data-original-stage]").forEach((element,i)=>{
      const center=.075+(i+.5)*.55/4;
      const opacity=smooth(1-Math.abs(p-center)/.06875);
      element.style.setProperty("--stage-opacity",String(opacity));
      element.setAttribute("aria-hidden",String(enhanced&&opacity<.15));
    });
  }),[]);
  return (
    <section ref={section} id="signal" className="brain-journey" aria-labelledby="signal-title" data-brain-journey data-original-source="43f44c9">
      <div className="brain-journey-sticky">
        <div className="neural-hud-top"><span className="chapter-label"><i />01 · SIGNAL</span><a href="#playground">{sv?"Direkt till Playground":"Skip to Playground"}<ArrowUpRight size={12}/></a></div>
        <div className="neural-entry-title">
          <span>{sv?"KONTEXT → MINNE → SVAR":"CONTEXT → MEMORY → RESPONSE"}</span>
          <h2 id="signal-title">{sv?"Ett sinne som lyssnar.":"A mind that listens."}</h2>
          <p className="signal-meaning">{sv?"BudAI läser frågan, håller tråden och svarar på svenska eller engelska. Med ett konto minns det vad som är värt att minnas.":"BudAI reads the question, keeps the thread and answers in Swedish or English. With an account, it remembers what is worth remembering."}</p>
          <div className="signal-meaning-chips"><span>{sv?"Kontext":"Context"}</span><span>{sv?"Minne":"Memory"}</span><span>{sv?"Två språk":"Two languages"}</span></div>
        </div>
        {poster&&<div className="brain-journey-fallback" aria-hidden="true"><BrainPoster/></div>}
        <div className="original-brain-tour" data-original-brain-tour>
          {ORIGINAL_BRAIN_STAGES.map((stage,i)=>{
            const copy=sv?stage.sv:stage.en;
            return <div key={i} className="original-brain-stage" data-original-stage={i}>
              <span>0{i+1} / 04 · {sv?"NEURAL RUNDTUR":"NEURAL TOUR"}</span><h3>{copy.title}</h3><p>{copy.body}</p>
            </div>;
          })}
        </div>

        <div className="neural-hud-bottom"><span>{sv?"FÖLJ SIGNALEN":"FOLLOW THE SIGNAL"}</span><div><i/></div><span>INPUT → OUTPUT</span></div>
      </div>
    </section>
  );
}
