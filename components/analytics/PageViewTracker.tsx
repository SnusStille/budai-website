"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readConsent, subscribeConsent } from "@/lib/consent";
/** Consent-gated, GDPR-minimal page-view beacon. No IP/UA/fingerprint stored server-side. */
export default function PageViewTracker(){
  const pathname=usePathname(); const last=useRef("");
  useEffect(()=>{
    const send=()=>{
      if(readConsent()!=="accepted"||!pathname||pathname.startsWith("/admin")||last.current===pathname) return;
      last.current=pathname;
      let sid=sessionStorage.getItem("stilledev-session"); if(!sid||sid.length<16){ sid=crypto.randomUUID()+crypto.randomUUID().slice(0,8); sessionStorage.setItem("stilledev-session",sid); }
      fetch("/api/analytics/collect",{method:"POST",headers:{"Content-Type":"application/json"},keepalive:true,body:JSON.stringify({path:pathname,referrer:document.referrer||"",session:sid,consent:true})}).catch(()=>{});
    };
    send(); return subscribeConsent(()=>{ last.current=""; send(); });
  },[pathname]);
  return null;
}
