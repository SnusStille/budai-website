"use client";

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

export default function Capabilities() {
  const { t, lang } = useLang();
  return (
    <section id="capabilities" className="relative py-20 sm:py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-14 md:mb-18">
          <span className="section-badge text-accent-cyan mb-5">{t.capabilities.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {t.capabilities.title}{" "}
            <span className="text-gradient">{t.capabilities.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.capabilities.subtitle}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {capabilities.map((cap, i) => (
            <ScrollReveal key={cap.title} delay={Math.min(i * 0.04, 0.28)}>
              <div className="group h-full">
                <SpotlightCard className="h-full">
                  <div className="p-6 h-full flex flex-col">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.gradient} p-[1px] mb-5 transition-transform duration-500 group-hover:scale-105`}
                    >
                      <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                        <cap.icon className={`w-5.5 h-5.5 w-6 h-6 ${cap.accent}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white tracking-tight group-hover:text-accent-cyan transition-colors duration-300">
                      {lang === "sv" ? cap.titleSv : cap.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {lang === "sv" ? cap.descSv : cap.desc}
                    </p>
                    <div
                      className={`mt-5 h-px w-0 group-hover:w-full bg-gradient-to-r ${cap.gradient} transition-all duration-500 opacity-60`}
                    />
                  </div>
                </SpotlightCard>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
