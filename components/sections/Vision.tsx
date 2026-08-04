"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, Heart, Globe } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";

export default function Vision() {
  const { t } = useLanguage();

  const pillars = [
    { icon: Target, title: t.vision.mission.title, desc: t.vision.mission.desc },
    { icon: TrendingUp, title: t.vision.growth.title, desc: t.vision.growth.desc },
    { icon: Heart, title: t.vision.values.title, desc: t.vision.values.desc },
    { icon: Globe, title: t.vision.impact.title, desc: t.vision.impact.desc },
  ];

  return (
    <section id="vision" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">{t.vision.eyebrow}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t.vision.title.split("AI")[0]}<span className="text-gradient">AI</span>{t.vision.title.split("AI")[1]}
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            {t.vision.description}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group p-8 rounded-2xl glass border border-white/[0.06] h-full hover:border-white/[0.1] transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-cyan/15 to-accent-purple/15 flex items-center justify-center mb-6 group-hover:from-accent-cyan/25 group-hover:to-accent-purple/25 transition-colors">
                  <p.icon className="w-7 h-7 text-accent-cyan" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{p.title}</h3>
                <p className="text-muted leading-relaxed">{p.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-20 text-center">
            <blockquote className="text-2xl md:text-3xl font-light italic text-white/70 max-w-4xl mx-auto leading-relaxed">
              "{t.vision.quote}"
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div className="text-left">
                <div className="text-base font-medium text-white">Stilledev</div>
                <div className="text-sm text-muted">Creators of BudAI</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
