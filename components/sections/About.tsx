"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Check, Code2, Copy, Github, Mail } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import { EXAMPLE_SOURCE } from "@/lib/experience/code";
import { subscribeJourney } from "@/lib/experience/scroll";
import ProgressiveEditor from "@/components/experience/ProgressiveEditor";

const STACK = ["Next.js", "TypeScript", "Tailwind", "Supabase", "Claude API"];

export default function About() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const status = useRef<HTMLDivElement>(null);
  const [copiedSource, setCopiedSource] = useState(false);

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

  const copyExampleSource = () => {
    void navigator.clipboard?.writeText(EXAMPLE_SOURCE).then(() => {
      setCopiedSource(true);
      window.setTimeout(() => setCopiedSource(false), 1600);
    });
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
            <a href="#builder-profile" aria-label={sv ? "Möt byggaren" : "Meet the builder"}><ArrowDown size={15} /></a>
          </div>
        </div>
      </div>

      <div id="builder-profile" className="builder-profile">
        <ScrollReveal>
          <span className="chapter-label">THE HUMAN BEHIND THE INTELLIGENCE</span>
          <h3>{sv ? "10 år av kod." : "10 years of code."}<br /><span className="text-gradient">{sv ? "2 år av BudAI." : "2 years of BudAI."}</span></h3>
          <div className="builder-facts"><span><b>10</b>{sv ? "år av kodande" : "years of coding"}</span><span><b>02</b>{sv ? "år med BudAI" : "years on BudAI"}</span><span><b>SV / EN</b>{sv ? "Tvåspråkig" : "Bilingual"}</span></div>
        </ScrollReveal>
        <ScrollReveal delay={.1}>
          <p>{sv ? "Jag är Stilledev. Efter tio år som mjukvaruutvecklare — och de senaste två med fullt fokus på BudAI — har målet varit tydligt: att bygga en arbetsyta som hanterar svenska och engelska naturligt, respekterar din integritet med användarstyrt minne och förvandlar komplexa frågor till konkret handling. Idag är BudAI en öppen utvecklarförhandsvisning som vi bygger vidare steg för steg." : "I'm Stilledev. Over ten years of writing software — and the last two focused entirely on BudAI — my goal has been clear: build a workspace that handles Swedish and English naturally, respects your privacy with user-controlled memory, and turns complex questions into clear action. Today BudAI is an open developer preview, evolving step by step into the everyday AI workspace for individuals and teams."}</p>
          <div className="builder-stack">{STACK.map((item) => <span key={item}>{item}</span>)}</div>
          <ul className="builder-values">{(sv ? ["Kod i produktionskvalitet", "Integritet först", "Öppet på GitHub"] : ["Production-grade code", "Privacy first", "Open on GitHub"]).map((item) => <li key={item}>{item}</li>)}</ul>
          <div className="builder-links">
            <a
              href="#playground"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("budai:prompt", {
                    detail: sv
                      ? "Skapa en tydlig lanseringsplan på svenska och engelska med milstolpar, risker och nästa steg."
                      : "Create a clear bilingual launch plan in Swedish and English with milestones, risks, and next steps.",
                  })
                )
              }
            >
              {sv ? "Prova exemplet i Playground" : "Try this prompt in Playground"}
              <ArrowRight size={13} />
            </a>
            <a href="https://github.com/SnusStille/budai-website" target="_blank" rel="noopener noreferrer"><Github size={15} />GitHub<ArrowRight size={13} /></a>
            <a href="mailto:Stilleinc@hotmail.com"><Mail size={15} />{sv ? "Kontakt" : "Contact"}</a>
          </div>
          <details className="builder-source-details">
            <summary>{sv ? "Läs kodexemplet" : "Read the code example"}<Code2 size={14} /></summary>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="!mt-0">{sv ? "Ett illustrativt anrop till Playground. Koden på skärmen körs inte och gör inga nätverksanrop." : "An illustrative request to the Playground. The code on the monitor is not executed and makes no network requests."}</p>
              <button
                type="button"
                onClick={copyExampleSource}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 font-mono text-[10px] text-accent-cyan transition-colors hover:border-accent-cyan/50 hover:text-white"
              >
                {copiedSource ? <Check size={11} /> : <Copy size={11} />}
                {copiedSource ? (sv ? "Kopierad" : "Copied") : (sv ? "Kopiera TS" : "Copy TS")}
              </button>
            </div>
            <pre tabIndex={0}><code>{EXAMPLE_SOURCE}</code></pre>
          </details>
        </ScrollReveal>
      </div>
    </section>
  );
}
