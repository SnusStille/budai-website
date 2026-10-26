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
    {
      icon: Check,
      chip: sv ? "Klart" : "Done",
      title: sv ? "Grunden" : "The foundation",
      lead: sv ? "Live i utvecklarförhandsvisningen idag." : "Live in the developer preview today.",
      items: sv
        ? ["Playground med strömmande svar på SV / EN", "Gratis konto med användarstyrt minne & historik", "Bildanalys, röstdiktering och trådexport"]
        : ["Playground with streaming replies in SV / EN", "Free account with user-controlled memory & history", "Image analysis, voice dictation, and thread export"],
    },
    {
      icon: Rocket,
      chip: sv ? "Nu" : "Now",
      title: "Developer Preview",
      lead: sv ? "Öppen Basic-nivå för alla att testa." : "Open Basic tier for everyone to test.",
      items: sv
        ? ["Basic är gratis (12/dag gäst · 80/dag med konto)", "Verklig användning styr vad som prioriteras", "Löpande förbättringar av kvalitet och flöden"]
        : ["Basic is free (12/day guest · 80/day with account)", "Real usage steers what gets prioritized next", "Continuous improvements to quality and workflows"],
    },
    {
      icon: Layers,
      chip: sv ? "Härnäst" : "Next",
      title: sv ? "Paket och team" : "Plans and teams",
      lead: sv ? "Under utveckling för individer och företag." : "In development for individuals and teams.",
      items: sv
        ? ["Konsument- och Företagspaket med högre kapacitet", "Delade team-credits och gemensamma playbooks", "Samma integritetsprincip: du äger ditt minne"]
        : ["Consumer and Business plans with higher capacity", "Shared team credits and reusable playbooks", "Same privacy principle: you own your memory"],
    },
    {
      icon: Globe,
      chip: sv ? "Målet" : "Goal",
      title: sv ? "AI för vardagen" : "AI for everyday work",
      lead: sv ? "En pålitlig arbetsyta för individ och team." : "A dependable workspace for individuals and teams.",
      items: sv
        ? ["Vardagens AI-arbetsyta på svenska och engelska", "Utvecklas steg för steg utan tomma löften", "Byggd i Sverige av Stilledev för långsiktig nytta"]
        : ["The everyday AI workspace in Swedish and English", "Built step by step without empty hype", "Created in Sweden by Stilledev for lasting utility"],
    },
  ];

  return (
    <section id="roadmap" className="roadmap-section" aria-labelledby="roadmap-title">
      <span id="vision" className="absolute top-0" aria-hidden="true" />
      <div className="roadmap-container">
        <ScrollReveal className="roadmap-heading">
          <div><span className="chapter-label"><BudAILogo size="xs" animated={false} className="!h-4 !w-4" />05 / {sv ? "SYSTEMET UTVECKLAS" : "THE SYSTEM EVOLVES"}</span><h2 id="roadmap-title">{sv ? "Bara början." : "Only the beginning."}</h2></div>
          <p>{sv ? "Från dagens öppna förhandsvisning till utökade paket för individer och team. Inga påhittade datum — bara ärliga framsteg i den ordning de byggs." : "From today's open preview to expanded plans for individuals and teams. No invented launch dates — just transparent progress in the order it is built."}</p>
        </ScrollReveal>
        <div className="roadmap-spatial-window" aria-hidden="true">
          <span>SWEDEN <i /> NORDICS <i /> WORLD</span>
          <div className="roadmap-telemetry-rail">
            <span><b>01</b> FOUNDATION · LIVE</span>
            <i />
            <span><b>02</b> PREVIEW · OPEN</span>
            <i />
            <span><b>03</b> PLANS · IN DEV</span>
            <i />
            <span><b>04</b> WORKSPACE · HORIZON</span>
          </div>
          <div className="roadmap-fallback-path"><i /><i /><i /><i /></div>
          <span>EVOLVING IN PUBLIC / BUDAI</span>
        </div>
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
