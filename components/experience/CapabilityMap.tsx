"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, AudioLines, BarChart3, FileText, Languages, Network, Workflow } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { subscribeJourney } from "@/lib/experience/scroll";
import { capabilityRecords } from "@/lib/experience/information-patterns";
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

  const rows = capabilityRecords();
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
          <div className="capability-drawing-fallback">
            <svg viewBox="-1.9 -2.4 3.8 4.8" aria-hidden="true">
              <defs>
                <radialGradient id="cap-core-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#9cecf9" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#3c89a3" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#020205" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g transform="scale(1,-1)">
                <circle cx="-1.32" cy="0" r="0.95" fill="url(#cap-core-glow)" />
                <line x1="-1.32" y1="-2.0" x2="-1.32" y2="2.0" stroke="#72cee3" strokeOpacity="0.3" strokeWidth="0.015" />
                <ellipse cx="-1.32" cy="0" rx="0.54" ry="0.32" fill="none" stroke="#7ddbef" strokeOpacity="0.48" strokeWidth="0.014" transform="rotate(-22 -1.32 0)" />
                <ellipse cx="-1.32" cy="0" rx="0.72" ry="0.42" fill="none" stroke="#9caae8" strokeOpacity="0.36" strokeWidth="0.012" transform="rotate(24 -1.32 0)" />
                <polygon points="-1.32,-0.32 -1.0,0 -1.32,0.32 -1.64,0" fill="#112c3e" fillOpacity="0.88" stroke="#95ebfa" strokeOpacity="0.82" strokeWidth="0.018" />
                <circle cx="-1.32" cy="0" r="0.11" fill="#dafaff" fillOpacity="0.95" />
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const y = (2.5 - i) * 0.72;
                  const isFocused = active === i;
                  return (
                    <g key={i}>
                      <path
                        d={`M -1.32 ${y * 0.18} C -0.98 ${y * 0.75}, -0.68 ${y}, -0.42 ${y} L 0.35 ${y}`}
                        fill="none"
                        stroke={isFocused ? "#b4f5ff" : "#7ad6ea"}
                        strokeOpacity={isFocused ? "0.9" : "0.38"}
                        strokeWidth={isFocused ? "0.024" : "0.014"}
                      />
                      <circle cx="-0.42" cy={y} r={isFocused ? "0.14" : "0.11"} fill="none" stroke={isFocused ? "#ccf8ff" : "#8ce2f4"} strokeOpacity={isFocused ? "0.88" : "0.52"} strokeWidth="0.014" />
                    </g>
                  );
                })}
                {rows.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={p.lane === active ? 0.032 : 0.022} fill={p.lane === active ? "#d4f7ff" : "#75a6b8"} fillOpacity={p.lane === active ? 0.95 : 0.62} />
                ))}
              </g>
            </svg>
          </div>
          <div className="capability-viewport-top"><span>BUDAI / INFORMATION FIELD</span><span>001 — 006</span></div>
          <div className="capability-viewport-bottom"><span>{sv ? "EN GEMENSAM INTELLIGENS" : "ONE SHARED INTELLIGENCE"}</span><span>SIGNAL → STRUCTURE</span></div>
        </div>
      </div>
    </div>
  );
}
