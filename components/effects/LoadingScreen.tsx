"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { markIntroDone } from "./introState";
import BrainPoster from "./BrainPoster";
import { INTRO_MS, INTRO_REVEAL_MS, INTRO_READY_MS, INTRO_SESSION_KEY } from "@/lib/experience/intro";
import { refreshJourney, subscribeJourney } from "@/lib/experience/scroll";
import { clamp, smooth } from "@/lib/experience/timeline";
import type { BrainMotion } from "@/lib/experience/brain";

const useClientLayoutEffect=typeof window!=="undefined"?useLayoutEffect:useEffect;

type Phase="pending"|"preparing"|"playing"|"revealing"|"done";
type Role="intro"|"journey"|null;
type Renderer=typeof import("./BrainFlight")["default"];

/** One opening owner. There is deliberately NO hero scene state.
 * The opening is disposed at completion; only the separate, visible #signal
 * narrative can subsequently request the same canonical brain renderer.
 */
export default function LoadingScreen() {
  const pathname=usePathname();
  const [phase,setPhase]=useState<Phase>("pending");
  const phaseRef=useRef<Phase>("pending");
  const [role,setRole]=useState<Role>(null),roleRef=useRef<Role>(null);
  const [Renderer,setRenderer]=useState<Renderer|null>(null);
  const [ready,setReady]=useState(false);
  const readyRef=useRef(false),disabled=useRef(false),failed=useRef(false);
  const stage=useRef<HTMLDivElement|null>(null);
  const motion=useRef<BrainMotion>({kind:"intro",progress:0});
  const finish=useRef<(immediate?:boolean)=>void>(()=>{}),begin=useRef<()=>void>(()=>{});
  const requestRole=(next:Role)=>{
    if(roleRef.current===next)return;
    roleRef.current=next;readyRef.current=false;setReady(false);setRole(next);
  };

  useEffect(()=>{
    if(pathname!=="/")return;
    let live=true,raf=0,readiness=0,reveal=0,watchdog=0,closing=false;
    const root=document.documentElement;
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const nav=navigator as Navigator&{connection?:{saveData?:boolean}};
    const bootstrap=(window as Window&{__budaiIntroGuard?:number}).__budaiIntroGuard;
    clearTimeout(bootstrap);
    const change=(next:Phase)=>{phaseRef.current=next;setPhase(next);if(next!=="done")root.dataset.budaiIntro=next;};
    let restoreFocus=false;
    const preparedAt=performance.now();
    const complete=()=>{
      if(!live||phaseRef.current==="done")return;
      closing=true;cancelAnimationFrame(raf);clearTimeout(readiness);clearTimeout(reveal);clearTimeout(watchdog);
      begin.current=()=>{};finish.current=()=>{};
      requestRole(null);change("done");root.dataset.brainState="idle";
      try{sessionStorage.setItem(INTRO_SESSION_KEY,"1");}catch{/* optional */}
      const main=document.getElementById("main");
      if(main){main.inert=false;main.removeAttribute("aria-busy");if(restoreFocus)main.focus({preventScroll:true});}

    };
    const end=(immediate=false)=>{
      if(!live||closing||phaseRef.current==="done")return;
      closing=true;cancelAnimationFrame(raf);clearTimeout(readiness);
      restoreFocus=!!document.activeElement?.closest("[data-global-loader]");
      change("revealing");
      reveal=window.setTimeout(complete,immediate?0:INTRO_REVEAL_MS);
    };
    finish.current=end;
    begin.current=()=>{
      // A late shader/import cannot restart a completed or timed-out opening.
      if(!live||closing||phaseRef.current!=="preparing")return;
      if(root.dataset.budaiIntro==="done"){complete();return;}
      if(performance.now()-preparedAt>INTRO_READY_MS){requestRole(null);end();return;}
      clearTimeout(readiness);change("playing");
      const started=performance.now();
      const tick=(now:number)=>{
        if(!live||closing)return;
        const p=clamp((now-started)/INTRO_MS);
        motion.current={kind:"intro",progress:p};
        if(p>=1)end();else raf=requestAnimationFrame(tick);
      };
      raf=requestAnimationFrame(tick);
    };
    const preferences=()=>{
      disabled.current=media.matches||!!nav.connection?.saveData;
      if(disabled.current){requestRole(null);end(true);}
      refreshJourney();
    };
    disabled.current=media.matches||!!nav.connection?.saveData;
    const shouldOpen=(root.dataset.budaiIntro==="preparing"||root.dataset.budaiIntro==="playing")&&!disabled.current;
    if(shouldOpen){
      change("preparing");motion.current={kind:"intro",progress:0};requestRole("intro");
      // Preparation uses a raster of THIS seeded model at THIS exact first pose,
      // not the former, unrelated hand-drawn SVG or a logo/suspense fallback.
      readiness=window.setTimeout(()=>{requestRole(null);end();},INTRO_READY_MS);
      watchdog=window.setTimeout(complete,INTRO_READY_MS+INTRO_MS+INTRO_REVEAL_MS+250);
    }else complete();
    const key=(e:KeyboardEvent)=>{if(e.key==="Escape")end(disabled.current);};
    window.addEventListener("keydown",key);media.addEventListener("change",preferences);
    return()=>{
      live=false;cancelAnimationFrame(raf);clearTimeout(readiness);clearTimeout(reveal);clearTimeout(watchdog);
      window.removeEventListener("keydown",key);media.removeEventListener("change",preferences);
      begin.current=()=>{};finish.current=()=>{};requestRole(null);
    };
  },[pathname]);

  useEffect(()=>{
    if(pathname!=="/")return;
    return subscribeJourney(frame=>{
      if(phaseRef.current!=="done")return;
      const section=document.getElementById("signal");
      // Eligibility is based on the actual current DOM, not a cached pre-route
      // journey frame. No stale scroll restoration can wake a hero brain.
      const rect=section?.getBoundingClientRect();
      const inStory=!!rect&&scrollY>1&&frame.active!=="intelligence"&&rect.top<innerHeight*.72&&rect.bottom>innerHeight*.08;
      const p=frame.sections.signal??0;
      const engaged=!!document.activeElement?.closest("[data-playground-arrival]")&&frame.active==="playground";
      const direct=location.hash==="#playground"&&frame.y>=(frame.bounds.playground?.top??Infinity)-frame.height*.4;
      const opacity=engaged||direct?0:1-smooth((p-.86)/.14);
      const wanted=inStory&&opacity>.002&&!disabled.current&&!failed.current;
      if(wanted)motion.current={kind:"journey",progress:p,entry:1};
      requestRole(wanted?"journey":null);
      rootState(wanted?readyRef.current?"ready":"pending":failed.current||disabled.current?"fallback":"idle");
      if(stage.current&&rect){
        stage.current.style.opacity=String(opacity);
        stage.current.style.clipPath=`inset(${Math.max(0,rect.top)}px 0 ${Math.max(0,innerHeight-rect.bottom)}px 0)`;
      }
    });
  },[pathname]);

  useClientLayoutEffect(()=>{
    if(pathname!=="/"||phase!=="done")return;
    // Publish completion only AFTER React removes the opening canvas/surface.
    // DOM observers, route subscribers and the browser see one atomic handoff.
    document.documentElement.dataset.budaiIntro="done";
    markIntroDone();refreshJourney();
  },[phase,pathname]);

  const needRenderer=role!==null;
  useEffect(()=>{
    if(!needRenderer||Renderer)return;
    let live=true;
    import("./BrainFlight").then(module=>{if(live)setRenderer(()=>module.default);}).catch(()=>{
      if(!live)return;failed.current=true;requestRole(null);rootState("fallback");finish.current();
    });
    return()=>{live=false;};
  },[needRenderer,Renderer]);

  useEffect(()=>{
    const main=document.getElementById("main");if(!main||pathname!=="/")return;
    const busy=phase==="preparing"||phase==="playing";
    main.inert=busy;if(busy)main.setAttribute("aria-busy","true");else main.removeAttribute("aria-busy");
    return()=>{main.inert=false;main.removeAttribute("aria-busy");};
  },[phase,pathname]);

  const onReady=()=>{
    readyRef.current=true;setReady(true);
    if(roleRef.current==="intro")begin.current();
    else if(roleRef.current==="journey"){rootState("ready");refreshJourney();}
  };
  const onFail=()=>{
    failed.current=true;requestRole(null);rootState("fallback");finish.current();refreshJourney();
  };
  if(pathname!=="/")return null;
  const Scene=Renderer;
  const canvas=Scene?<Scene mode="intro" motion={motion} active onReady={onReady} onFail={onFail}/>:null;
  return <>
    {phase!=="done"&&<div className="opening-surface" data-global-loader data-opening-phase={phase} role="status" aria-label="Entering BudAI" aria-live="polite">
      <div className="opening-brain-frame">
        {!ready&&<BrainPoster opening/>}
        {role==="intro"&&canvas}
      </div>
      <div className="opening-credit"><span>STILLEDEV</span><span>NEURAL SYSTEM / 001</span></div>
      <div className="opening-caption"><span>INTELLIGENCE → INTERACTION</span><button type="button" onClick={()=>finish.current()}>Skip intro <kbd>esc</kbd></button></div>
    </div>}
    {role==="journey"&&<div ref={node=>{
      stage.current=node;
      const rect=document.getElementById("signal")?.getBoundingClientRect();
      if(node&&rect)node.style.clipPath=`inset(${Math.max(0,rect.top)}px 0 ${Math.max(0,innerHeight-rect.bottom)}px 0)`;
    }} className="brain-passage-stage" data-intelligence-stage data-scene-role="journey" aria-hidden="true">{canvas}</div>}
  </>;
}
function rootState(state:string){document.documentElement.dataset.brainState=state;}
