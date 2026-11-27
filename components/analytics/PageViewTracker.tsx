"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readConsent, subscribeConsent } from "@/lib/consent";
import { trackBusinessEvent } from "@/lib/analytics/events";
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
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("mailto:")) trackBusinessEvent("contact_email_click");
      else if (/^\/(?:sv\/)?contact(?:\/|$)/.test(href)) trackBusinessEvent("contact_cta_click");
      else if (href === "#waitlist") trackBusinessEvent("waitlist_cta_click");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
