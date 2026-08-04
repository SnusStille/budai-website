"use client";

import { motion } from "framer-motion";
import { Rocket, Code2, TestTube, Building2, Globe, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const stages = [
  { icon: Code2, title: "Core Development", desc: "Building foundational AI architecture, neural networks, and core platform infrastructure.", status: "completed", date: "Q3 2025" },
  { icon: TestTube, title: "Alpha Testing", desc: "Internal testing with select partners. Refining models and stress-testing systems.", status: "completed", date: "Q4 2025" },
  { icon: Rocket, title: "Developer Preview", desc: "Limited public access for developers and early adopters. Gathering feedback and iterating.", status: "current", date: "Q1 2026" },
  { icon: Building2, title: "Enterprise Beta", desc: "Expanded access for Swedish companies. Full feature set with enterprise security.", status: "upcoming", date: "Q2 2026" },
  { icon: Globe, title: "Public Launch", desc: "Full public release with complete features, API access, and dedicated support.", status: "upcoming", date: "Q3 2026" },
];

export default function Timeline() {
  return (
    <section id="roadmap" className="relative py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-pink mb-4">Roadmap</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Building the <span className="text-gradient">Future</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">Our journey to revolutionize how Swedish companies work with AI.</p>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-cyan/40 via-accent-purple/40 to-accent-green/20" />

          <div className="space-y-14">
            {stages.map((s, i) => {
              const left = i % 2 === 0;
              const done = s.status === "completed";
              const current = s.status === "current";

              return (
                <ScrollReveal key={s.title} delay={i * 0.1}>
                  <div className={`relative flex items-center gap-8 ${left ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${left ? "md:text-right" : "md:text-left"}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`inline-block p-6 rounded-2xl glass border border-white/[0.06] ${current ? "border-accent-cyan/20" : ""}`}
                      >
                        <div className={`flex items-center gap-3 mb-3 ${left ? "md:flex-row-reverse" : ""}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${done ? "bg-accent-green/15" : current ? "bg-accent-cyan/15" : "bg-white/5"}`}>
                            <s.icon className={`w-5 h-5 ${done ? "text-accent-green" : current ? "text-accent-cyan" : "text-muted"}`} />
                          </div>
                          <div>
                            <span className={`text-xs font-mono ${current ? "text-accent-cyan" : "text-muted"}`}>{s.date}</span>
                            <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
                        {current && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/10 text-xs text-accent-cyan font-medium">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-cyan" />
                            </span>
                            In Progress
                          </div>
                        )}
                      </motion.div>
                    </div>

                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                      <div className={`w-4 h-4 rounded-full border-2 ${done ? "bg-accent-green border-accent-green" : current ? "bg-accent-cyan border-accent-cyan shadow-[0_0_20px_rgba(0,229,255,0.5)]" : "bg-surface border-white/20"}`}>
                        {done && <CheckCircle2 className="w-3 h-3 text-background absolute -top-0.5 -left-0.5" />}
                      </div>
                    </div>

                    <div className="md:hidden absolute left-6 -translate-x-1/2 z-10">
                      <div className={`w-3 h-3 rounded-full ${done ? "bg-accent-green" : current ? "bg-accent-cyan" : "bg-white/20"}`} />
                    </div>

                    <div className="flex-1 hidden md:block" />
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
