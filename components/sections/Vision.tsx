"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, Heart, Globe } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import MarkerUnderline from "@/components/ui/MarkerUnderline";

const pillars = [
  { icon: Target, title: "Mission", desc: "To make advanced AI accessible to every person and company in Sweden, regardless of size or technical expertise. We believe AI should empower, not replace, human potential.", gradient: "from-accent-cyan to-accent-blue", accent: "text-accent-cyan", glow: "shadow-[0_0_30px_rgba(0,229,255,0.1)]" },
  { icon: TrendingUp, title: "Growth", desc: "BudAI will continuously evolve—learning from every interaction, expanding capabilities, and growing alongside the people and businesses it serves.", gradient: "from-accent-purple to-accent-pink", accent: "text-accent-purple", glow: "shadow-[0_0_30px_rgba(185,103,255,0.1)]" },
  { icon: Heart, title: "Swedish Values", desc: "Built with Swedish principles at its core: transparency, sustainability, equality, and innovation. Data stays in the Nordics. Privacy is non-negotiable.", gradient: "from-accent-green to-accent-cyan", accent: "text-accent-green", glow: "shadow-[0_0_30px_rgba(0,255,157,0.1)]" },
  { icon: Globe, title: "Global Impact", desc: "Starting in Sweden, scaling to the Nordics, and eventually empowering people and businesses worldwide with ethical, powerful AI solutions.", gradient: "from-accent-pink to-accent-purple", accent: "text-accent-pink", glow: "shadow-[0_0_30px_rgba(255,107,157,0.1)]" },
];

export default function Vision() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">Our Vision</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            The AI Assistant for <span className="relative inline-block">Sweden<MarkerUnderline color="#00ff9d" /></span>
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            BudAI is not just another AI tool. It is a vision for how people and companies in Sweden will work in the future—smarter, faster, and more human than ever before.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group relative h-full holo-card rounded-2xl p-8 ${p.glow} hover:shadow-[0_0_40px_rgba(0,229,255,0.08)] transition-shadow duration-500`}
              >
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${p.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.gradient} p-[1px] mb-6`}>
                  <div className="w-full h-full rounded-xl bg-surface flex items-center justify-center">
                    <p.icon className={`w-7 h-7 ${p.accent}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-accent-cyan transition-colors duration-300">{p.title}</h3>
                <p className="text-muted leading-relaxed">{p.desc}</p>
                <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-white/5 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-20 text-center">
            <blockquote className="text-2xl md:text-3xl font-light italic text-white/70 max-w-4xl mx-auto leading-relaxed">
              "We are not just building an AI. We are building the future of work for Sweden—and eventually, the world."
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
