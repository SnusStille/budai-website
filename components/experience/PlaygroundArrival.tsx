"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { playgroundArrivalAt, playgroundProjectionAt } from "@/lib/experience/brain";
import { subscribeJourney, refreshJourney } from "@/lib/experience/scroll";

/** The actual product DOM, not a second interface or screenshot. Camera distance
 * supplies its projection; a layout-stable anchor preserves normal page scrolling.
 */
export default function PlaygroundArrival({children,expanded,overlay=false}:{children:ReactNode;expanded:boolean;overlay?:boolean}) {
  const anchor=useRef<HTMLDivElement>(null),plane=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=anchor.current,surface=plane.current;
    if(!el||!surface)return;
    let intent=false,pointer=false;
    const commit=()=>{intent=true;refreshJourney();};
    const focus=()=>{if(!pointer)commit();};
    const down=()=>{pointer=true;};
    const up=()=>{pointer=false;};
    el.addEventListener("focusin",focus);
    el.addEventListener("pointerdown",down);
    el.addEventListener("click",commit);
    el.addEventListener("input",commit);
    window.addEventListener("pointerup",up);
    window.addEventListener("pointercancel",up);
    const unsubscribe=subscribeJourney(frame=>{
      const p=frame.sections.signal??1;
      if(p<.65)intent=false;
      const save=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData;
      const fallback=frame.reduced||save||document.documentElement.dataset.brainState==="fallback";
      const direct=location.hash==="#playground"&&frame.y>=(frame.bounds.playground?.top??Infinity)-frame.height*.4;
      const settled=expanded||overlay||intent||direct||fallback||!frame.bounds.signal;
      const arrival=settled?1:playgroundArrivalAt(p);
      const projection=playgroundProjectionAt(p);
      el.dataset.arrival=arrival.toFixed(4);
      el.dataset.expanded=String(expanded);
      el.style.setProperty("--product-arrival",String(arrival));
      surface.style.transform=arrival>=.999?"none":`perspective(1400px) translate3d(0,${(1-arrival)*32}px,${-projection.depth}px) rotateX(${projection.tilt}deg)`;
      // Expansion must escape its former transformed containing block and remain
      // above navigation. No interface remount: streams/history/input survive.
      const section=document.getElementById("playground");
      if(section)section.style.zIndex=expanded||overlay?"90":"";
    });
    return()=>{
      unsubscribe();el.removeEventListener("focusin",focus);el.removeEventListener("pointerdown",down);el.removeEventListener("click",commit);el.removeEventListener("input",commit);
      window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);
      const section=document.getElementById("playground");if(section)section.style.zIndex="";
    };
  },[expanded,overlay]);
  return <div ref={anchor} className="playground-arrival-anchor" data-playground-arrival><div ref={plane} className="playground-plane">{children}</div></div>;
}
