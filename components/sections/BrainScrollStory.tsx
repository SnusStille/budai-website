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
  const stageModules = [
    "core.module(\"01-write.ts\") · SV ↔ EN",
    "core.module(\"05-memory.ts\") · user-controlled",
    "core.module(\"03-decide.ts\") · risk & next step",
    "core.module(\"06-multimodal.ts\") · vision + voice",
  ];
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
    const skip=node.querySelector<HTMLAnchorElement>(".neural-hud-top>a");
    if(skip){skip.tabIndex=enhanced&&p>.79?-1:0;skip.setAttribute("aria-hidden",String(enhanced&&p>.79));}
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
        <div className="neural-hud-top"><span className="chapter-label"><i />02 · {sv?"KONTEXTEN · SIGNAL & MINNE":"THE CONTEXT · SIGNAL & MEMORY"}</span><a href="#playground">{sv?"Direkt till Playground":"Skip to Playground"}<ArrowUpRight size={12}/></a></div>
        <div className="neural-entry-title">
          <span>{sv?"SIGNAL → TVÅ SPRÅK → ANVÄNDARSTYRT MINNE":"SIGNAL → TWO LANGUAGES → USER-CONTROLLED MEMORY"}</span>
          <h2 id="signal-title">{sv?"En signal får sammanhang.":"A signal gains context."}</h2>
          <p className="signal-meaning">{sv?"Svenska och engelska möts naturligt i samma tråd utan att tappa ton. Med ett konto sparar det användarstyrda minnet bara det du själv väljer att behålla — aldrig allt automatiskt.":"Swedish and English flow naturally in the same thread without losing tone. With an account, user-controlled memory keeps only the facts you choose to save — never everything by default."}</p>
          <div className="signal-meaning-chips"><span>{sv?"Svenska + Engelska":"Swedish + English"}</span><span>{sv?"Användarstyrt minne":"User-controlled memory"}</span><span>{sv?"Strukturerat svar":"Structured action"}</span></div>
        </div>
        {poster&&<div className="brain-journey-fallback" aria-hidden="true"><BrainPoster/></div>}
        <div className="original-brain-tour" data-original-brain-tour>
          {ORIGINAL_BRAIN_STAGES.map((stage,i)=>{
            const copy=sv?stage.sv:stage.en;
            return <div key={i} className="original-brain-stage" data-original-stage={i}>
              <span>0{i+1} / 04 · {sv?"NEURAL RUNDTUR":"NEURAL TOUR"}</span>
              <h3>{copy.title}</h3>
              <p>{copy.body}</p>
              <code className="neural-stage-module">{stageModules[i]}</code>
            </div>;
          })}
          <div className="original-brain-stage neural-digital-synthesis" data-digital-synthesis aria-hidden="true">
            <span>{sv?"KAPITEL 05 · DIN IDÉ BÖRJAR HÄR":"CHAPTER 05 · YOUR IDEA STARTS HERE"}</span>
            <h3>{sv?"Du har sett vad som är möjligt.":"You've seen what's possible."}</h3>
            <p>{sv?"Nu kan du skapa något eget direkt i den riktiga BudAI Playground nedan.":"Now make something of your own in the live BudAI Playground ahead."}</p>
            <code className="neural-stage-module">{"budai.playground.connect({ stream: true, memory: 'user_controlled' })"}</code>
          </div>
        </div>

        <div className="neural-hud-bottom"><span>{sv?"FÖLJ SIGNALEN":"FOLLOW THE SIGNAL"}</span><div><i/></div><span>INPUT → OUTPUT</span></div>
      </div>
    </section>
  );
}
