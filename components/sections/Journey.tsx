"use client";

import { useEffect, useState } from "react";
import { Check, Rocket, Layers, Globe, ArrowUpRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { subscribeJourney } from "@/lib/experience/scroll";

/** Scroll illuminates the pathway; all actual milestones remain readable at all times. */
export default function Journey() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [scrollActive, setScrollActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected ?? scrollActive;
  useEffect(() => subscribeJourney((frame) => setScrollActive(Math.min(3, Math.floor((frame.sections.roadmap ?? 0) * 4)))), []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("budai:roadmap-focus", { detail: active }));
    return () => { window.dispatchEvent(new CustomEvent("budai:roadmap-focus", { detail: -1 })); };
  }, [active]);
  const stages = [
    { icon: Check, chip: sv ? "Klart" : "Done", title: sv ? "Grunden" : "The foundation", lead: sv ? "Det som redan fungerar." : "What already works.", items: sv ? ["Playground med live-svar", "Konton, minne och historik", "Bild, röst och export"] : ["Playground with live replies", "Accounts, memory and history", "Vision, voice and export"] },
    { icon: Rocket, chip: sv ? "Nu" : "Now", title: "Developer Preview", lead: sv ? "Gratis för alla att prova." : "Free for everyone to try.", items: sv ? ["Basic-paketet är gratis", "Din feedback styr nästa steg", "Förbättras varje vecka"] : ["The Basic plan is free", "Your feedback steers what's next", "Improved every week"] },
    { icon: Layers, chip: sv ? "Härnäst" : "Next", title: sv ? "Paket och team" : "Plans and teams", lead: sv ? "Mer användning, för dig och ditt företag." : "More usage, for you and your company.", items: sv ? ["Konsument- och Företagspaket", "Flera konton på delade credits", "Nordisk integritet: du äger ditt minne"] : ["Consumer and Business plans", "Multiple accounts on shared credits", "Nordic-first privacy: you own your memory"] },
    { icon: Globe, chip: sv ? "Målet" : "Goal", title: sv ? "AI för alla" : "AI for everyone", lead: sv ? "Tillgänglig för varje människa och företag." : "Accessible to every person and company.", items: sv ? ["Din nya ChatGPT, på ditt språk", "Växer steg för steg, ärligt", "Byggd för att hålla"] : ["Your new ChatGPT, in your language", "Growing step by step, honestly", "Built to last"] },
  ];

  return (
    <section id="roadmap" className="roadmap-section" aria-labelledby="roadmap-title">
      <span id="vision" className="absolute top-0" aria-hidden="true" />
      <div className="roadmap-container">
        <ScrollReveal className="roadmap-heading">
          <div><span className="chapter-label"><BudAILogo size="xs" animated={false} className="!h-4 !w-4" />06 / {sv ? "SYSTEMET UTVECKLAS" : "THE SYSTEM EVOLVES"}</span><h2 id="roadmap-title">{sv ? "Bara början." : "Only the beginning."}</h2></div>
          <p>{sv ? "Dit BudAI är på väg. Från svenska arbetsdagar till allas vardags-AI. Inga datum, bara ärliga framsteg." : "Where BudAI is going. From Swedish workdays to everyone's everyday AI. No dates, just honest progress."}</p>
        </ScrollReveal>
        <div className="roadmap-spatial-window" aria-hidden="true"><span>SWEDEN <i /> NORDICS <i /> WORLD</span><div className="roadmap-fallback-path"><i /><i /><i /><i /></div><span>EVOLVING IN PUBLIC / BUDAI</span></div>
        <ol className="roadmap-milestones" data-active={active}>
          {stages.map((stage, i) => (
            <li key={stage.title} className={active === i ? "roadmap-milestone is-active" : "roadmap-milestone"}>
              <div className="roadmap-node"><span>0{i + 1}</span><i /></div>
              <button type="button" aria-pressed={active === i} onClick={() => setSelected(selected === i ? null : i)} onPointerEnter={() => setSelected(i)} onPointerLeave={() => setSelected(null)} onFocus={() => setSelected(i)} onBlur={() => setSelected(null)}>
                <stage.icon size={17} /><span>{stage.chip}</span>{i === 1 && <em>{sv ? "Vi är här" : "We are here"}</em>}
              </button>
              <h3>{stage.title}</h3><p>{stage.lead}</p>
              <ul>{stage.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </li>
          ))}
        </ol>
        <div className="roadmap-resolution"><p>{sv ? "Mission: gör avancerad AI tydlig och användbar i vardagligt arbete." : "Mission: make advanced AI clear and useful in everyday work."}</p><a href="#playground">{sv ? "Var med från början" : "Be part of the beginning"}<ArrowUpRight size={15} /></a></div>
      </div>
    </section>
  );
}
