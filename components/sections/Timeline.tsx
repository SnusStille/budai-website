"use client";

import { motion } from "framer-motion";
import { Rocket, Code2, TestTube, Building2, Globe, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";

const stages = [
  {
    icon: Code2,
    title: "Core Development",
    titleSv: "Kärnutveckling",
    desc: "Building foundational AI architecture, neural networks, and core platform infrastructure.",
    descSv:
      "Bygger grundläggande AI-arkitektur, neurala nätverk och plattformens kärninfrastruktur.",
    status: "completed" as const,
    date: "Q3 2025",
  },
  {
    icon: TestTube,
    title: "Alpha Testing",
    titleSv: "Alfatestning",
    desc: "Internal testing with select partners. Refining models and stress-testing systems.",
    descSv:
      "Intern testning med utvalda partners. Förfinar modeller och stresstestar system.",
    status: "completed" as const,
    date: "Q4 2025",
  },
  {
    icon: Rocket,
    title: "Developer Preview",
    titleSv: "Utvecklarförhandsvisning",
    desc: "Limited public access for developers and early adopters. Gathering feedback and iterating.",
    descSv:
      "Begränsad publik åtkomst för utvecklare och early adopters. Samlar feedback och itererar.",
    status: "current" as const /* live */,
    date: "Q1 2026",
  },
  {
    icon: Building2,
    title: "Enterprise Beta",
    titleSv: "Företagsbeta",
    desc: "Expanded access for Swedish companies. Full feature set with enterprise security.",
    descSv:
      "Utökad åtkomst för svenska företag. Full funktionsuppsättning med enterprise-säkerhet.",
    status: "upcoming" as const,
    date: "Q2 2026",
  },
  {
    icon: Globe,
    title: "Public Launch",
    titleSv: "Publik lansering",
    desc: "Full public release with complete features, API access, and dedicated support.",
    descSv:
      "Full publik release med kompletta funktioner, API-åtkomst och dedikerad support.",
    status: "upcoming" as const,
    date: "Q3 2026",
  },
];

export default function Timeline() {
  const { lang } = useLang();

  return (
    <section id="roadmap" className="relative py-28 md:py-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-pink/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16 md:mb-20">
          <span className="section-badge text-accent-pink mb-4">Roadmap</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {lang === "sv" ? "Bygger" : "Building the"}{" "}
            <span className="text-gradient">{lang === "sv" ? "framtiden" : "Future"}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {lang === "sv"
              ? "Vår resa för att revolutionera hur svenska företag arbetar med AI."
              : "Our journey to revolutionize how Swedish companies work with AI."}
          </p>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-cyan/40 via-accent-purple/40 to-accent-green/15" />

          <div className="space-y-12 md:space-y-14">
            {stages.map((s, i) => {
              const left = i % 2 === 0;
              const done = s.status === "completed";
              const current = s.status === "current";

              return (
                <ScrollReveal key={s.title} delay={i * 0.08}>
                  <div
                    className={`relative flex items-center gap-8 ${
                      left ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`flex-1 pl-16 md:pl-0 ${left ? "md:text-right" : "md:text-left"}`}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        className={`inline-block p-6 rounded-2xl glass panel-premium text-left ${
                          current
                            ? "border-accent-cyan/30 shadow-[0_0_48px_rgba(0,229,255,0.1)]"
                            : "border-white/[0.07]"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 mb-3 ${
                            left ? "md:flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              done
                                ? "bg-accent-green/15"
                                : current
                                  ? "bg-accent-cyan/15"
                                  : "bg-white/5"
                            }`}
                          >
                            <s.icon
                              className={`w-5 h-5 ${
                                done
                                  ? "text-accent-green"
                                  : current
                                    ? "text-accent-cyan"
                                    : "text-muted"
                              }`}
                            />
                          </div>
                          <div className={left ? "md:text-right" : ""}>
                            <span
                              className={`text-xs font-mono ${
                                current ? "text-accent-cyan" : "text-muted/60"
                              }`}
                            >
                              {s.date}
                            </span>
                            <h3 className="text-lg font-semibold text-white">
                              {lang === "sv" ? s.titleSv : s.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted leading-relaxed max-w-sm">
                          {lang === "sv" ? s.descSv : s.desc}
                        </p>
                        {current && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-[11px] font-medium text-accent-cyan">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-cyan" />
                            </span>
                            {lang === "sv" ? "Pågår" : "In Progress"}
                          </div>
                        )}
                        {done && (
                          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-accent-green/80">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {lang === "sv" ? "Klar" : "Completed"}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Center node */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 ${
                          done
                            ? "bg-accent-green border-accent-green shadow-[0_0_12px_rgba(0,255,157,0.5)]"
                            : current
                              ? "bg-accent-cyan border-accent-cyan shadow-[0_0_16px_rgba(0,229,255,0.6)]"
                              : "bg-background border-white/20"
                        }`}
                      />
                    </div>

                    <div className="hidden md:block flex-1" />
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
