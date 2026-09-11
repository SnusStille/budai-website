"use client";

import { Target, TrendingUp, Heart, Globe } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevMark } from "@/components/ui/BudAILogo";

const pillars = [
  {
    icon: Target,
    title: "Mission",
    titleSv: "Mission",
    desc: "Make advanced AI accessible to every person and company in Sweden — empower people, don't replace them.",
    descSv:
      "Gör avancerad AI tillgänglig för varje person och företag i Sverige — stärk människor, ersätt dem inte.",
    gradient: "from-accent-cyan to-accent-blue",
    accent: "text-accent-cyan",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    titleSv: "Tillväxt",
    desc: "BudAI evolves with every interaction — expanding capabilities alongside the teams it serves.",
    descSv:
      "BudAI växer med varje interaktion — utökar kapabiliteter tillsammans med teamen den tjänar.",
    gradient: "from-accent-purple to-accent-pink",
    accent: "text-accent-purple",
  },
  {
    icon: Heart,
    title: "Swedish values",
    titleSv: "Svenska värderingar",
    desc: "Transparency, sustainability, equality, innovation. Nordic-first privacy is non-negotiable.",
    descSv:
      "Transparens, hållbarhet, jämlikhet, innovation. Nordic-first integritet är icke-förhandlingsbart.",
    gradient: "from-accent-green to-accent-cyan",
    accent: "text-accent-green",
  },
  {
    icon: Globe,
    title: "Global path",
    titleSv: "Global väg",
    desc: "Start in Sweden, scale the Nordics, then empower ethical AI work worldwide.",
    descSv:
      "Starta i Sverige, skala Norden, sedan etiskt AI-arbete världen över.",
    gradient: "from-accent-pink to-accent-purple",
    accent: "text-accent-pink",
  },
];

export default function Vision() {
  const { lang } = useLang();

  return (
    <section className="relative section-hairline py-20 sm:py-28 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-14 md:mb-16">
          <span className="section-badge text-accent-green mb-4">
            {lang === "sv" ? "Vår vision" : "Our vision"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {lang === "sv" ? "AI-assistenten för " : "The AI assistant for "}
            <span className="text-gradient">{lang === "sv" ? "Sverige" : "Sweden"}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            {lang === "sv"
              ? "BudAI är inte bara ytterligare ett AI-verktyg. Det är en vision för hur människor och företag i Sverige ska arbeta — smartare, snabbare och mer mänskligt."
              : "BudAI is not just another AI tool. It is a vision for how people and companies in Sweden will work — smarter, faster, and more human."}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {pillars.map((p, i) => (
            <ScrollReveal key={p.title} delay={Math.min(i * 0.05, 0.2)}>
              <div className="group h-full">
                <SpotlightCard className="h-full">
                  <div className="p-6 md:p-7 h-full flex flex-col">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} p-[1px] mb-5 transition-transform duration-500 group-hover:scale-105`}
                    >
                      <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                        <p.icon className={`w-6 h-6 ${p.accent}`} />
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-white tracking-tight group-hover:text-accent-cyan transition-colors duration-300">
                      {lang === "sv" ? p.titleSv : p.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {lang === "sv" ? p.descSv : p.desc}
                    </p>
                    <div
                      className={`mt-5 h-px w-0 group-hover:w-full bg-gradient-to-r ${p.gradient} transition-all duration-500 opacity-60`}
                    />
                  </div>
                </SpotlightCard>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.15}>
          <div className="mt-16 md:mt-20 text-center">
            <blockquote className="text-xl md:text-3xl font-light italic text-white/70 max-w-4xl mx-auto leading-relaxed">
              {lang === "sv"
                ? '"Vi bygger inte bara en AI. Vi bygger framtidens arbete för Sverige — och så småningom, världen."'
                : '"We are not just building an AI. We are building the future of work for Sweden — and eventually, the world."'}
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl border border-white/15 shadow-[0_0_24px_rgba(0,229,255,0.2)] bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 flex items-center justify-center">
                <StilledevMark size={36} />
              </div>
              <div className="text-left">
                <div className="text-base font-medium text-accent-cyan">Stilledev</div>
                <div className="text-sm text-muted">
                  {lang === "sv" ? "Skaparna av BudAI · Sverige" : "Creators of BudAI · Sweden"}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
