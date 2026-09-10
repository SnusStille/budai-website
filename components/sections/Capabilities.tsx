"use client";

import { useState } from "react";
import {
  Bot,
  FileText,
  BarChart3,
  Headphones,
  Megaphone,
  Users,
  Workflow,
  BrainCircuit,
  Lightbulb,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useLang } from "@/components/ui/LanguageContext";

const capabilities = [
  {
    icon: Bot,
    title: "Task Automation",
    titleSv: "Uppgiftsautomatisering",
    desc: "Eliminate repetitive work. BudAI automates daily operations, data entry, and routine processes so your team focuses on what matters.",
    descSv:
      "Eliminera repetitivt arbete. BudAI automatiserar dagliga operationer, datainmatning och rutinprocesser så att ditt team kan fokusera på det som spelar roll.",
    gradient: "from-accent-cyan to-accent-blue",
    accent: "text-accent-cyan",
  },
  {
    icon: FileText,
    title: "Document Generation",
    titleSv: "Dokumentgenerering",
    desc: "Create reports, proposals, emails, and internal documents in seconds. Professional quality, tailored to your company voice.",
    descSv:
      "Skapa rapporter, offerter, mejl och interna dokument på sekunder. Professionell kvalitet, anpassad till ditt företags röst.",
    gradient: "from-accent-purple to-accent-pink",
    accent: "text-accent-purple",
  },
  {
    icon: BarChart3,
    title: "Data Analysis",
    titleSv: "Dataanalys",
    desc: "Transform raw business data into actionable insights. Spot trends, forecast outcomes, and make data-driven decisions faster.",
    descSv:
      "Omvandla rå affärsdata till handlingsbara insikter. Upptäck trender, prognostisera resultat och ta datadrivna beslut snabbare.",
    gradient: "from-accent-green to-accent-cyan",
    accent: "text-accent-green",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    titleSv: "Kundsupport",
    desc: "AI-powered support that understands context, resolves issues, and escalates intelligently. Available 24/7 in Swedish and English.",
    descSv:
      "AI-driven support som förstår kontext, löser problem och eskalerar intelligent. Tillgänglig dygnet runt på svenska och engelska.",
    gradient: "from-accent-pink to-accent-purple",
    accent: "text-accent-pink",
  },
  {
    icon: Megaphone,
    title: "Marketing Content",
    titleSv: "Marknadsinnehåll",
    desc: "Generate campaigns, social posts, ad copy, and SEO content that resonates with your Swedish audience and drives results.",
    descSv:
      "Generera kampanjer, sociala inlägg, annonstexter och SEO-innehåll som resonerar med din svenska målgrupp och driver resultat.",
    gradient: "from-accent-cyan to-accent-purple",
    accent: "text-accent-cyan",
  },
  {
    icon: Users,
    title: "Employee Assistant",
    titleSv: "Medarbetarassistent",
    desc: "Every employee gets a personal AI assistant for research, scheduling, writing, and problem-solving.",
    descSv:
      "Varje medarbetare får en personlig AI-assistent för research, schemaläggning, skrivande och problemlösning.",
    gradient: "from-accent-green to-accent-pink",
    accent: "text-accent-green",
  },
  {
    icon: Workflow,
    title: "Workflow Optimization",
    titleSv: "Arbetsflödesoptimering",
    desc: "Analyze and streamline your business processes. Identify bottlenecks and get AI-recommended improvements.",
    descSv:
      "Analysera och strömlinjeforma dina affärsprocesser. Identifiera flaskhalsar och få AI-rekommenderade förbättringar.",
    gradient: "from-accent-purple to-accent-cyan",
    accent: "text-accent-purple",
  },
  {
    icon: BrainCircuit,
    title: "Digital Assistant",
    titleSv: "Digital assistent",
    desc: "A unified AI hub that connects to your tools, answers questions, manages tasks, and keeps your business running smoothly.",
    descSv:
      "En enhetlig AI-hubb som kopplar till dina verktyg, svarar på frågor, hanterar uppgifter och håller verksamheten igång smidigt.",
    gradient: "from-accent-pink to-accent-green",
    accent: "text-accent-pink",
  },
  {
    icon: Lightbulb,
    title: "Problem Solving",
    titleSv: "Problemlösning",
    desc: "Complex business challenges? BudAI breaks them down, researches solutions, and presents clear, actionable recommendations.",
    descSv:
      "Komplexa affärsutmaningar? BudAI bryter ner dem, undersöker lösningar och presenterar tydliga, handlingsbara rekommendationer.",
    gradient: "from-accent-cyan to-accent-pink",
    accent: "text-accent-cyan",
  },
];

const FAQ = [
  {
    qSv: "Vad är BudAI?",
    qEn: "What is BudAI?",
    aSv: "En AI-plattform byggd för svenska företag och privatpersoner — automation, dokument, analys och assistenter i en yta.",
    aEn: "An AI platform built for Swedish companies and individuals — automation, documents, analytics, and assistants in one surface.",
  },
  {
    qSv: "När lanserar ni?",
    qEn: "When do you launch?",
    aSv: "Vi är i utvecklarförhandsvisning (v0.93 · 93%). Early-access öppnar i vågor via väntelistan.",
    aEn: "We're in developer preview (v0.93 · 93%). Early access opens in waves via the waitlist.",
  },
  {
    qSv: "Vad får jag med 10% early access?",
    qEn: "What's included with 10% early access?",
    aSv: "Kod BUDAI-EARLY-10 låses när du går med. Rabatten gäller vid lansering för founding members.",
    aEn: "Code BUDAI-EARLY-10 locks when you join. The discount applies at launch for founding members.",
  },
  {
    qSv: "Är det GDPR-vänligt?",
    qEn: "Is it GDPR-friendly?",
    aSv: "Ja — Nordic-first tänk, tydliga gränser för vad som skickas till modeller, och enterprise-säkerhet som mål.",
    aEn: "Yes — Nordic-first design, clear boundaries on model inputs, and enterprise-grade security as the target.",
  },
  {
    qSv: "Kan jag testa innan jag går med?",
    qEn: "Can I try before joining?",
    aSv: "Absolut — öppna Playground på den här sidan. Det är samma smak av motorn som går live.",
    aEn: "Yes — open the Playground on this page. It's the same flavor of the engine that goes live.",
  },
];

export default function Capabilities() {
  const { t, lang } = useLang();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="capabilities" className="relative py-20 sm:py-24 md:py-32">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(90vw,700px)] h-[400px] bg-accent-cyan/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <span className="section-badge text-accent-cyan mb-5">{t.capabilities.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {t.capabilities.title}{" "}
            <span className="text-gradient">{t.capabilities.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.capabilities.subtitle}
          </p>
        </ScrollReveal>

        {/* Clean 3-col capability cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {capabilities.map((cap, i) => (
            <ScrollReveal key={cap.title} delay={Math.min(i * 0.035, 0.25)}>
              <div className="group h-full">
                <SpotlightCard className="h-full">
                  <div className="relative p-6 h-full flex flex-col overflow-hidden">
                    <div
                      className={`absolute -top-20 -right-16 w-36 h-36 rounded-full bg-gradient-to-br ${cap.gradient} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500 blur-2xl pointer-events-none`}
                    />
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.gradient} p-[1px] mb-5 transition-transform duration-500 group-hover:scale-[1.06]`}
                    >
                      <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                        <cap.icon className={`w-6 h-6 ${cap.accent}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white tracking-tight group-hover:text-accent-cyan transition-colors duration-300">
                      {lang === "sv" ? cap.titleSv : cap.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {lang === "sv" ? cap.descSv : cap.desc}
                    </p>
                    <div
                      className={`mt-5 h-px w-0 group-hover:w-full bg-gradient-to-r ${cap.gradient} transition-all duration-500 opacity-70`}
                    />
                  </div>
                </SpotlightCard>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Common questions — directly under capabilities */}
        <div id="faq" className="mt-16 md:mt-20 max-w-3xl mx-auto scroll-mt-28">
          <ScrollReveal className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted/70 font-medium mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
              FAQ
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {lang === "sv" ? "Vanliga frågor" : "Common questions"}
            </h3>
          </ScrollReveal>

          <div className="space-y-2">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <ScrollReveal key={i} delay={i * 0.03}>
                  <div
                    className={`rounded-2xl border overflow-hidden transition-colors ${
                      isOpen
                        ? "border-accent-cyan/25 bg-accent-cyan/[0.04]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-[15px] font-medium text-white pr-2">
                        {lang === "sv" ? item.qSv : item.qEn}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-accent-cyan" : "text-muted"
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-4 sm:px-5 pb-4 text-sm text-muted leading-relaxed border-t border-white/[0.05] pt-3">
                          {lang === "sv" ? item.aSv : item.aEn}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
