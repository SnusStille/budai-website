"use client";

import { ArrowUpRight, Brain, Languages, PenLine, Workflow, Sparkles } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { prefillPlayground } from "@/lib/playground/events";

type Capability = {
  title: string;
  description: string;
  example: string;
  prompt: string;
  icon: typeof PenLine;
  tone: string;
  number: string;
};

export default function Capabilities() {
  const { lang } = useLang();
  const isSv = lang === "sv";
  const cards: Capability[] = isSv
    ? [
        {
          number: "01",
          title: "Skriv",
          description: "Få fart på mejl, texter och dokument — från en tom sida till ett första utkast.",
          example: "Gör den här kunduppdateringen tydlig och vänlig.",
          prompt: "Hjälp mig skriva en tydlig och vänlig uppdatering till en kund om att leveransen blir försenad en dag.",
          icon: PenLine,
          tone: "capability-card--mint",
        },
        {
          number: "02",
          title: "Tänk",
          description: "Sortera tankar, utforska alternativ och ta dig vidare när något känns rörigt.",
          example: "Hjälp mig jämföra två sätt att lösa problemet.",
          prompt: "Jag väljer mellan att göra en uppgift själv eller ta hjälp. Hjälp mig jämföra alternativen, riskerna och nästa steg.",
          icon: Brain,
          tone: "capability-card--lilac",
        },
        {
          number: "03",
          title: "Skapa",
          description: "Brainstorma koncept, hitta nya vinklar och utveckla en idé till något konkret.",
          example: "Ge mig tre koncept för en lugnare måndagsstart.",
          prompt: "Brainstorma fem enkla sätt att göra måndagsmötet mer fokuserat och mindre stressigt. Ge varje idé en kort förklaring.",
          icon: Sparkles,
          tone: "capability-card--peach",
        },
        {
          number: "04",
          title: "Förenkla flöden",
          description: "Bryt ner återkommande arbete i tydliga steg och upptäck vad som kan automatiseras framöver.",
          example: "Gör en enkel checklista av den här rutinen.",
          prompt: "Skapa en tydlig checklista för att förbereda ett veckomöte: samla status, fånga hinder, välja beslut och skicka uppföljning.",
          icon: Workflow,
          tone: "capability-card--blue",
        },
      ]
    : [
        {
          number: "01",
          title: "Write",
          description: "Get moving on emails, copy, and documents — from a blank page to a useful first draft.",
          example: "Make this client update clear and warm.",
          prompt: "Help me write a clear, warm update to a client explaining that delivery will be one day late.",
          icon: PenLine,
          tone: "capability-card--mint",
        },
        {
          number: "02",
          title: "Think",
          description: "Sort through ideas, explore options, and find a next step when things feel tangled.",
          example: "Help me compare two ways to solve this.",
          prompt: "I'm choosing between doing a task myself or getting help. Compare the options, risks, and next steps.",
          icon: Brain,
          tone: "capability-card--lilac",
        },
        {
          number: "03",
          title: "Create",
          description: "Brainstorm concepts, find a fresh angle, and turn an early idea into something concrete.",
          example: "Give me three ideas for a calmer Monday.",
          prompt: "Brainstorm five simple ways to make a Monday team meeting more focused and less stressful. Briefly explain each idea.",
          icon: Sparkles,
          tone: "capability-card--peach",
        },
        {
          number: "04",
          title: "Simplify workflows",
          description: "Break recurring work into clear steps and spot what could be automated in the future.",
          example: "Turn this routine into a simple checklist.",
          prompt: "Create a clear checklist for preparing a weekly team meeting: collect updates, surface blockers, choose decisions, and send a follow-up.",
          icon: Workflow,
          tone: "capability-card--blue",
        },
      ];

  return (
    <section id="about" className="about-section section-hairline relative scroll-mt-24 overflow-hidden">
      <div className="about-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="about-intro grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <div>
            <span className="section-kicker">
              <Languages className="h-3.5 w-3.5" />
              {isSv ? "Vad är BudAI?" : "What is BudAI?"}
            </span>
            <h2 className="section-heading mt-5">
              {isSv ? "En arbetsassistent för" : "An AI work assistant for"}{" "}
              <span className="text-gradient">{isSv ? "riktiga arbetsdagar." : "real workdays."}</span>
            </h2>
          </div>
          <div className="about-copy max-w-2xl lg:justify-self-end">
            <p>
              {isSv
                ? "BudAI hjälper dig skriva, tänka, skapa och få ordning på återkommande uppgifter — på svenska och engelska. Det här är en tidig produktförhandsvisning: testa det som finns och hjälp oss förstå vad som bör byggas härnäst."
                : "BudAI helps you write, think, create, and make sense of recurring tasks — in Swedish and English. This is an early product preview: try what is here and help us learn what to build next."}
            </p>
            <div className="about-meta">
              <span>{isSv ? "Svenska + engelska" : "Swedish + English"}</span>
              <span>{isSv ? "Byggs fortfarande" : "Still being built"}</span>
              <span>{isSv ? "Människa i förarsätet" : "Human in the loop"}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-16">
          {cards.map((card) => (
            <article key={card.number} className={`capability-card ${card.tone}`}>
              <div className="capability-card-top">
                <div className="capability-icon"><card.icon className="h-[18px] w-[18px]" /></div>
                <span className="capability-number">{card.number}</span>
              </div>
              <h3>{card.title}</h3>
              <p className="capability-description">{card.description}</p>
              <div className="capability-example">
                <span className="capability-example-mark">“</span>
                <span>{card.example}</span>
              </div>
              <a
                href="#playground"
                className="capability-link"
                onClick={() => prefillPlayground(card.prompt)}
              >
                <span>{isSv ? "Prova ett exempel" : "Try an example"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>

        <div className="about-note mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {isSv
              ? "AI kan missa saker. Granska alltid resultat innan du använder dem i viktigt arbete."
              : "AI can get things wrong. Review outputs before using them for important work."}
          </p>
          <a href="#waitlist" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white">
            {isSv ? "Hjälp till att forma nästa steg" : "Help shape what comes next"}
            <ArrowUpRight className="h-4 w-4 text-[var(--cyan)]" />
          </a>
        </div>
      </div>
    </section>
  );
}
