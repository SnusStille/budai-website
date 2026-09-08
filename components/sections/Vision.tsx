"use client";

import { Target, TrendingUp, Heart, Globe } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useLang } from "@/components/ui/LanguageContext";

const pillars = [
  {
    icon: Target,
    title: "Mission",
    titleSv: "Mission",
    desc: "To make advanced AI accessible to every person and company in Sweden, regardless of size or technical expertise. We believe AI should empower, not replace, human potential.",
    descSv:
      "Att göra avancerad AI tillgänglig för varje person och företag i Sverige, oavsett storlek eller teknisk expertis. Vi tror att AI ska stärka — inte ersätta — mänsklig potential.",
    gradient: "from-accent-cyan to-accent-blue",
    accent: "text-accent-cyan",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    titleSv: "Tillväxt",
    desc: "BudAI will continuously evolve—learning from every interaction, expanding capabilities, and growing alongside the people and businesses it serves.",
    descSv:
      "BudAI kommer att utvecklas kontinuerligt — lära av varje interaktion, utöka kapabiliteter och växa tillsammans med de människor och företag den tjänar.",
    gradient: "from-accent-purple to-accent-pink",
    accent: "text-accent-purple",
  },
  {
    icon: Heart,
    title: "Swedish Values",
    titleSv: "Svenska värderingar",
    desc: "Built with Swedish principles at its core: transparency, sustainability, equality, and innovation. Data stays in the Nordics. Privacy is non-negotiable.",
    descSv:
      "Byggd med svenska principer i kärnan: transparens, hållbarhet, jämlikhet och innovation. Data stannar i Norden. Integritet är icke-förhandlingsbart.",
    gradient: "from-accent-green to-accent-cyan",
    accent: "text-accent-green",
  },
  {
    icon: Globe,
    title: "Global Impact",
    titleSv: "Global påverkan",
    desc: "Starting in Sweden, scaling to the Nordics, and eventually empowering people and businesses worldwide with ethical, powerful AI solutions.",
    descSv:
      "Startar i Sverige, skalas till Norden, och stärker så småningom människor och företag världen över med etiska, kraftfulla AI-lösningar.",
    gradient: "from-accent-pink to-accent-purple",
    accent: "text-accent-pink",
  },
];

export default function Vision() {
  const { lang } = useLang();

  return (
    <section className="relative py-28 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-14 md:mb-18">
          <span className="section-badge text-accent-green mb-4">
            {lang === "sv" ? "Vår vision" : "Our Vision"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {lang === "sv" ? "AI-assistenten för " : "The AI Assistant for "}
            <span className="text-gradient">{lang === "sv" ? "Sverige" : "Sweden"}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            {lang === "sv"
              ? "BudAI är inte bara ytterligare ett AI-verktyg. Det är en vision för hur människor och företag i Sverige ska arbeta i framtiden — smartare, snabbare och mer mänskligt än någonsin."
              : "BudAI is not just another AI tool. It is a vision for how people and companies in Sweden will work in the future—smarter, faster, and more human than ever before."}
          </p>
        </ScrollReveal>

        {/* Same SpotlightCard language as Capabilities (top cards) */}
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

        <ScrollReveal delay={0.2}>
          <div className="mt-16 md:mt-20 text-center">
            <blockquote className="text-xl md:text-3xl font-light italic text-white/70 max-w-4xl mx-auto leading-relaxed">
              {lang === "sv"
                ? '"Vi bygger inte bara en AI. Vi bygger framtidens arbete för Sverige — och så småningom, världen."'
                : '"We are not just building an AI. We are building the future of work for Sweden—and eventually, the world."'}
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white font-bold text-lg shadow-[0_0_24px_rgba(0,229,255,0.25)]">
                S
              </div>
              <div className="text-left">
                <div className="text-base font-medium text-accent-cyan">Stilledev</div>
                <div className="text-sm text-muted">
                  {lang === "sv" ? "Skaparna av BudAI" : "Creators of BudAI"}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
