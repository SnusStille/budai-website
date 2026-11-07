"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, Code2 } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { subscribeJourney } from "@/lib/experience/scroll";
import ProgressiveEditor from "@/components/experience/ProgressiveEditor";
import StilledevLabs from "@/components/sections/StilledevLabs";

export default function About() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const status = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeJourney((frame) => {
    const p = frame.sections.about ?? 0;
    status.current?.style.setProperty("--builder-progress", String(p));
    if (status.current) status.current.dataset.step = String(Math.min(2, Math.floor(p * 3)));
  }), []);

  const realityPills = [
    {
      num: "01",
      label: sv ? "Webbgränssnitt" : "Website interface",
      prompt: sv
        ? "Skapa en typsäker React- och Tailwind-komponent för en tvåspråkig produktsektion med tydlig hierarki."
        : "Create a type-safe React and Tailwind component for a bilingual product section with clear visual hierarchy.",
    },
    {
      num: "02",
      label: sv ? "Live-dashboard" : "Live dashboard",
      prompt: sv
        ? "Designa en strukturerad KPI-dashboard med nyckeltal, trendindikatorer och sammanfattande insikter."
        : "Design a structured KPI dashboard layout with key metrics, trend indicators, and executive takeaways.",
    },
    {
      num: "03",
      label: sv ? "Mobilvy" : "Mobile interface",
      prompt: sv
        ? "Föreslå en responsiv mobilvy med tumvänlig navigering, tydliga kort och noll horisontell scroll."
        : "Propose a responsive mobile view with thumb-friendly navigation, clean cards, and zero horizontal overflow.",
    },
    {
      num: "04",
      label: sv ? "Strukturerat flöde" : "Structured workflow",
      prompt: sv
        ? "Bygg ett steg-för-steg-arbetsflöde i TypeScript som validerar indata och returnerar en åtgärdsplan."
        : "Build a step-by-step TypeScript workflow that validates input and returns a structured action plan.",
    },
  ];

  const launchArchetypePrompt = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("budai:prompt", { detail: prompt }));
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="about" className="builder-section" aria-labelledby="builder-title">
      <div className="builder-scroll-track" id="builder-scene">
        <div className="builder-sticky">
          <div className="builder-heading">
            <span className="chapter-label"><i />04 / {sv ? "FRÅN TANKE TILL VERKLIGHET · BYGGAREN" : "FROM THOUGHT TO REALITY · THE BUILDER"}</span>
            <h2 id="builder-title">{sv ? "Från en tanke." : "From a thought."}<br /><span>{sv ? "Till något verkligt." : "To something real."}</span></h2>
            <p>{sv ? "Från en kort specifikation till typsäker kod, gränssnitt och strukturerade arbetsflöden — byggd med samma arkitektur som driver BudAI." : "From a short brief to type-safe code, interfaces, and structured workflows — built with the same architecture that powers BudAI."}</p>
            <div className="reality-creation-pills" data-thought-to-reality>
              {realityPills.map((pill) => (
                <span
                  key={pill.num}
                  role="button"
                  tabIndex={0}
                  onClick={() => launchArchetypePrompt(pill.prompt)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      launchArchetypePrompt(pill.prompt);
                    }
                  }}
                >
                  <b>{pill.num}</b>
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
          <div className="builder-fallback-workspace" aria-hidden="true">
            <div className="fallback-side-screen"><Code2 /><span>BUDAI / CORE</span><i /><i /><i /></div>
            <div className="fallback-central-screen"><ProgressiveEditor /></div>
            <div className="fallback-side-screen"><span>LOCAL / DEVELOPMENT</span><i /><i /><i /><i /></div>
            <div className="fallback-desk" />
          </div>
          <div className="builder-scene-caption">
            <span><i />{sv ? "EN ORIGINALMILJÖ I 3D" : "AN ORIGINAL 3D ENVIRONMENT"}</span>
            <span>{sv ? "Förberett exempel · inte ett live-svar" : "Prepared example · not a live AI response"}</span>
          </div>
          <div ref={status} className="builder-sequence" data-step="0">
            <div className="builder-sequence-line"><span /></div>
            <span><b>01</b>{sv ? "Initiera" : "Initialize"}</span>
            <span><b>02</b>{sv ? "Skapa" : "Compose"}</span>
            <span><b>03</b>{sv ? "Utforska" : "Explore"}</span>
            <a href="#stilledev-labs" aria-label={sv ? "Utforska Stilledev Labs" : "Explore Stilledev Labs"}><ArrowDown size={15} /></a>
          </div>
        </div>
      </div>

      <StilledevLabs />
    </section>
  );
}
