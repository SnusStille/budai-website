"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, AudioLines, BarChart3, FileText, Languages, Network, Workflow } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { subscribeJourney } from "@/lib/experience/scroll";
import { BUDAI_MARK_PATH } from "@/lib/brand";
import { clamp } from "@/lib/experience/timeline";

export default function CapabilityMap() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(-1);
  const [scrollActive, setScrollActive] = useState(0);
  const [hover, setHover] = useState(-1);
  const active = hover >= 0 ? hover : scrollActive;
  const capabilities = [
    { icon: FileText, title: sv ? "Skriv" : "Write", detail: sv ? "Mejl, rapporter, förslag." : "Emails, reports, proposals." },
    { icon: Workflow, title: sv ? "Automatisera" : "Automate", detail: sv ? "Rutiner till tydliga steg." : "Routines into clear steps." },
    { icon: BarChart3, title: sv ? "Besluta" : "Decide", detail: sv ? "Sammanfattningar och nästa steg." : "Summaries and next steps." },
    { icon: Languages, title: sv ? "Svenska + engelska" : "Swedish + English", detail: sv ? "Byt språk. Behåll tonen." : "Switch language. Keep the tone." },
    { icon: Network, title: sv ? "Minne" : "Memory", detail: sv ? "Sparar det du väljer." : "Keeps what you choose." },
    { icon: AudioLines, title: sv ? "Bild och röst" : "Vision and voice", detail: sv ? "Ladda upp bilder, prata in." : "Upload images, speak prompts." },
  ];
  const prompts = sv ? [
    "Hjälp mig skriva ett tydligt och vänligt mejl.",
    "Hjälp mig göra en återkommande arbetsuppgift till tydliga steg.",
    "Hjälp mig jämföra två alternativ och välja nästa steg.",
    "Hjälp mig skriva om en kort text på svenska och engelska med samma ton.",
    "Hjälp mig formulera hur jag vill att mina svar ska vara.",
    "Vad kan du hjälpa mig förstå från en bild? Jag bifogar den sedan.",
  ] : [
    "Help me write a clear, friendly email.",
    "Help me turn a recurring work task into clear steps.",
    "Help me compare two options and choose a next step.",
    "Help me rewrite a short text in Swedish and English with the same tone.",
    "Help me describe how I like my responses to be written.",
    "What can you help me understand from an image? I will attach one next.",
  ];
  useEffect(() => subscribeJourney(frame => {
    const el = root.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = clamp(-rect.top / Math.max(1, rect.height - frame.height + 100));
    el.dataset.progress = p.toFixed(4);
    el.style.setProperty("--capability-progress", String(p));
    const i = Math.min(5, Math.floor(p * 6));
    if (i !== previous.current) { previous.current = i; setScrollActive(i); }
  }), []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("budai:capability-focus", { detail: active }));
    return () => { window.dispatchEvent(new CustomEvent("budai:capability-focus", { detail: -1 })); };
  }, [active]);
  return (
    <div ref={root} className="capability-system" data-active={active} data-capability-system>
      <div className="capability-sticky">
        <div className="capability-index">
          <div className="capability-matrix-header"><span>03 / INTELLIGENCE, ASSEMBLED</span><span>06 MODULES</span></div>
          <h3>{sv ? "Ett system." : "One system."}<br /><span>{sv ? "Många möjligheter." : "Many possibilities."}</span></h3>
          <div className="capability-modules">{capabilities.map(({ icon: Icon, title, detail }, i) => (
            <a href="#playground" className={`capability-module ${active === i ? "is-active" : ""}`} key={i} onClick={() => window.dispatchEvent(new CustomEvent("budai:prompt", { detail: prompts[i] }))} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(-1)} onFocus={() => setHover(i)} onBlur={() => setHover(-1)}>
              <b>0{i + 1}</b><Icon size={16} /><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight className="capability-arrow" size={14} />
            </a>
          ))}</div>
          <p className="capability-matrix-note">{sv ? "Utforska i den riktiga Playground" : "Explore in the real Playground"}<ArrowUpRight size={12} /></p>
        </div>
        <div className="capability-viewport" aria-hidden="true" data-capability-viewport>
          <div className="capability-drawing-fallback"><svg viewBox="0 0 360 480" fill="none"><path d={BUDAI_MARK_PATH} transform="translate(28 192) scale(2.3)" fill="#a8c5ce"/>{[0,1,2,3,4,5].map(i=><g key={i}><path d={`M65 228C180 228 190 ${55+i*74} 280 ${55+i*74}`} stroke="#729aa9" strokeWidth="1.5"/><path d={`M65 228C180 228 190 ${55+i*74} 280 ${55+i*74}`} stroke="#b5d6df" strokeWidth=".5"/><rect x="279" y={40+i*74} width="34" height="30" rx="2" stroke="#96bac8"/><path d={`M286 ${51+i*74}h20m-20 7h14`} stroke="#96bac8"/></g>)}</svg></div>
          <div className="capability-viewport-top"><span>BUDAI / SIGNAL MANIFOLD</span><span>001 — 006</span></div>
          <div className="capability-viewport-bottom"><span>{sv ? "EN GEMENSAM INTELLIGENS" : "ONE SHARED INTELLIGENCE"}</span><span>SCROLL TO ASSEMBLE</span></div>
        </div>
      </div>
    </div>
  );
}
