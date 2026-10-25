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
    {
      icon: FileText,
      title: sv ? "Skriv" : "Write",
      detail: sv ? "Mejl, rapporter, förslag." : "Emails, reports, proposals.",
      telemetry: sv ? "MODUL 01 · REDAKTIONELL SYNTES" : "MODULE 01 · EDITORIAL SYNTHESIS",
      architecture: sv ? "Skiktade dokumentplan + strukturflöde" : "Layered document planes + structural flow",
    },
    {
      icon: Workflow,
      title: sv ? "Automatisera" : "Automate",
      detail: sv ? "Rutiner till tydliga steg." : "Routines into clear steps.",
      telemetry: sv ? "MODUL 02 · SEKVENTIELL PIPELINE" : "MODULE 02 · SEQUENTIAL PIPELINE",
      architecture: sv ? "Fyra kopplade exekveringssteg" : "Four interlocked execution stages",
    },
    {
      icon: BarChart3,
      title: sv ? "Besluta" : "Decide",
      detail: sv ? "Sammanfattningar och nästa steg." : "Summaries and next steps.",
      telemetry: sv ? "MODUL 03 · ANALYTISKT PRISMA" : "MODULE 03 · ANALYTICAL PRISM",
      architecture: sv ? "Konvergerande val → rekommenderad väg" : "Converging options → recommended vector",
    },
    {
      icon: Languages,
      title: sv ? "Svenska + engelska" : "Swedish + English",
      detail: sv ? "Byt språk. Behåll tonen." : "Switch language. Keep the tone.",
      telemetry: sv ? "MODUL 04 · TVÅSPRÅKIG RESONANS" : "MODULE 04 · BILINGUAL RESONANCE",
      architecture: sv ? "Synkroniserad SV / EN dubbelhelix" : "Synchronized SV / EN double-helix bridge",
    },
    {
      icon: Network,
      title: sv ? "Minne" : "Memory",
      detail: sv ? "Sparar det du väljer." : "Keeps what you choose.",
      telemetry: sv ? "MODUL 05 · KRISTALLINT MINNESVALV" : "MODULE 05 · CRYSTALLINE MEMORY VAULT",
      architecture: sv ? "Fyra lagrade kontextskikt med konto" : "Four retained context strata with account",
    },
    {
      icon: AudioLines,
      title: sv ? "Bild och röst" : "Vision and voice",
      detail: sv ? "Ladda upp bilder, prata in." : "Upload images, speak prompts.",
      telemetry: sv ? "MODUL 06 · OPTISK APERTUR & RÖSTVÅG" : "MODULE 06 · OPTICAL APERTURE & VOICE WAVE",
      architecture: sv ? "Visuell analys + direkt röstinmatning" : "Visual analysis + direct voice dictation",
    },
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
  const currentCap = capabilities[active] ?? capabilities[0];

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
                  <stop offset="0%" stopColor="#9cecf9" stopOpacity="0.52" />
                  <stop offset="60%" stopColor="#3c89a3" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#020205" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g transform="scale(1,-1)">
                <circle cx="-1.26" cy="0" r="1.05" fill="url(#cap-core-glow)" />
                <line x1="-1.26" y1="-2.05" x2="-1.26" y2="2.05" stroke="#72cee3" strokeOpacity="0.36" strokeWidth="0.016" />
                <ellipse cx="-1.26" cy="0" rx="0.62" ry="0.36" fill="none" stroke="#86e4f7" strokeOpacity="0.62" strokeWidth="0.016" transform="rotate(-22 -1.26 0)" />
                <ellipse cx="-1.26" cy="0" rx="0.80" ry="0.46" fill="none" stroke="#a4b2ee" strokeOpacity="0.46" strokeWidth="0.013" transform="rotate(24 -1.26 0)" />
                <polygon points="-1.26,-0.38 -0.90,0 -1.26,0.38 -1.62,0" fill="#143448" fillOpacity="0.92" stroke="#a8f3ff" strokeOpacity="0.88" strokeWidth="0.02" />
                <circle cx="-1.26" cy="0" r="0.13" fill="#ecfcff" fillOpacity="0.98" />
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const y = (2.5 - i) * 0.72;
                  const isFocused = active === i;
                  return (
                    <g key={i}>
                      <path
                        d={`M -1.26 ${y * 0.16} C -0.88 ${y * 0.76}, -0.38 ${y}, 0.05 ${y}`}
                        fill="none"
                        stroke={isFocused ? "#b8f7ff" : "#6ecce2"}
                        strokeOpacity={isFocused ? "0.95" : "0.42"}
                        strokeWidth={isFocused ? "0.028" : "0.016"}
                      />
                      <circle cx="-0.38" cy={y} r={isFocused ? "0.16" : "0.12"} fill="none" stroke={isFocused ? "#d8faff" : "#8ce2f4"} strokeOpacity={isFocused ? "0.92" : "0.54"} strokeWidth="0.016" />
                      <rect x="0.12" y={y - 0.16} width="0.82" height="0.32" rx="0.04" fill="#153245" fillOpacity={isFocused ? "0.75" : "0.38"} stroke={isFocused ? "#a8f3ff" : "#75a6b8"} strokeOpacity={isFocused ? "0.85" : "0.4"} strokeWidth="0.014" />
                    </g>
                  );
                })}
                {rows.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={p.lane === active ? 0.032 : 0.02} fill={p.lane === active ? "#d4f7ff" : "#75a6b8"} fillOpacity={p.lane === active ? 0.95 : 0.45} />
                ))}
              </g>
            </svg>
          </div>
          <div className="capability-viewport-top"><span>BUDAI / INTELLIGENCE CORE &amp; PATHWAYS</span><span>001 — 006</span></div>
          <div className="capability-active-readout">
            <span className="capability-readout-kicker"><i />{currentCap.telemetry}</span>
            <strong>{currentCap.title}</strong>
            <small>{currentCap.architecture}</small>
          </div>
          <div className="capability-viewport-bottom"><span>{sv ? "EN GEMENSAM INTELLIGENSKÄRNA" : "ONE SHARED INTELLIGENCE CORE"}</span><span>CORE → PATHWAY → MODULE</span></div>
        </div>
      </div>
    </div>
  );
}
