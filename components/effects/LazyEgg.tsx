"use client";

import dynamic from "next/dynamic";
import {useEffect,useState} from "react";
const Egg=dynamic(()=>import("./LogoEasterEgg"),{ssr:false});

/** Keep optional, user-triggered brand play, but allocate no FX canvases or
 * animation code during opening/landing. First intent is replayed after loading.
 */
export default function LazyEgg(){
  const [intent,setIntent]=useState<{el?:HTMLElement|null}|null>(null);
  useEffect(()=>{
    if(intent)return;
    const activate=(event:Event)=>{if(document.documentElement.dataset.budaiIntro!=="done")return;setIntent((event as CustomEvent<{el?:HTMLElement|null}>).detail??{});};
    window.addEventListener("budai:logo-click",activate);
    return()=>window.removeEventListener("budai:logo-click",activate);
  },[intent]);
  return intent?<Egg initialIntent={intent}/>:null;
}
