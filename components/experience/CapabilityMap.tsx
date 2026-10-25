"use client";

import { useState } from "react";
import { ArrowUpRight, AudioLines, BarChart3, FileText, Languages, Network, Workflow } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

export default function CapabilityMap() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [active, setActive] = useState(-1);
  const capabilities = [
    { icon: FileText, title: sv ? "Skriv" : "Write", detail: sv ? "Mejl, rapporter, förslag." : "Emails, reports, proposals." },
    { icon: Workflow, title: sv ? "Automatisera" : "Automate", detail: sv ? "Rutiner till tydliga steg." : "Routines into clear steps." },
    { icon: BarChart3, title: sv ? "Besluta" : "Decide", detail: sv ? "Sammanfattningar och nästa steg." : "Summaries and next steps." },
    { icon: Languages, title: sv ? "Svenska + engelska" : "Swedish + English", detail: sv ? "Byt språk. Behåll tonen." : "Switch language. Keep the tone." },
    { icon: Network, title: sv ? "Minne" : "Memory", detail: sv ? "Sparar det du väljer." : "Keeps what you choose." },
    { icon: AudioLines, title: sv ? "Bild och röst" : "Vision and voice", detail: sv ? "Ladda upp bilder, prata in." : "Upload images, speak prompts." },
  ];
  const focus = (index: number) => { setActive(index); window.dispatchEvent(new CustomEvent("budai:capability-focus", { detail: index })); };
  return (
    <div className="capability-matrix" data-active={active}>
      <div className="capability-matrix-header"><span>02 / CAPABILITY ARCHITECTURE</span><span>ONE CORE. MANY POSSIBILITIES.</span></div>
      <div className="capability-network" aria-hidden="true"><div className="capability-network-core"><Network size={25} /></div>{capabilities.map((_, i) => <i key={i} />)}</div>
      <div className="capability-modules">{capabilities.map(({ icon: Icon, title, detail }, i) => (
        <a href="#playground" className="capability-module" key={title} onPointerEnter={() => focus(i)} onPointerLeave={() => focus(-1)} onFocus={() => focus(i)} onBlur={() => focus(-1)}>
          <span className="capability-module-number">0{i + 1}<Icon size={18} /></span><strong>{title}</strong><span>{detail}</span><ArrowUpRight className="capability-arrow" size={15} />
        </a>
      ))}</div>
      <p className="capability-matrix-note">{sv ? "Utforska en förmåga i Playground" : "Explore a capability in the Playground"}<ArrowUpRight size={12} /></p>
    </div>
  );
}
