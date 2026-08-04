"use client";

import { motion } from "framer-motion";
import { Bot, FileText, BarChart3, Headphones, Megaphone, Users, Workflow, BrainCircuit, Lightbulb } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";

export default function Capabilities() {
  const { t } = useLanguage();

  const capabilities = [
    { icon: Bot, title: t.capabilities.taskAutomation.title, desc: t.capabilities.taskAutomation.desc, gradient: "from-accent-cyan to-accent-blue", accent: "text-accent-cyan", glow: "shadow-[0_0_30px_rgba(0,229,255,0.1)]" },
    { icon: FileText, title: t.capabilities.docGen.title, desc: t.capabilities.docGen.desc, gradient: "from-accent-purple to-accent-pink", accent: "text-accent-purple", glow: "shadow-[0_0_30px_rgba(185,103,255,0.1)]" },
    { icon: BarChart3, title: t.capabilities.dataAnalysis.title, desc: t.capabilities.dataAnalysis.desc, gradient: "from-accent-green to-accent-cyan", accent: "text-accent-green", glow: "shadow-[0_0_30px_rgba(0,255,157,0.1)]" },
    { icon: Headphones, title: t.capabilities.support.title, desc: t.capabilities.support.desc, gradient: "from-accent-pink to-accent-purple", accent: "text-accent-pink", glow: "shadow-[0_0_30px_rgba(255,107,157,0.1)]" },
    { icon: Megaphone, title: t.capabilities.marketing.title, desc: t.capabilities.marketing.desc, gradient: "from-accent-cyan to-accent-purple", accent: "text-accent-cyan", glow: "shadow-[0_0_30px_rgba(0,229,255,0.1)]" },
    { icon: Users, title: t.capabilities.assistant.title, desc: t.capabilities.assistant.desc, gradient: "from-accent-green to-accent-pink", accent: "text-accent-green", glow: "shadow-[0_0_30px_rgba(0,255,157,0.1)]" },
    { icon: Workflow, title: t.capabilities.workflow.title, desc: t.capabilities.workflow.desc, gradient: "from-accent-purple to-accent-cyan", accent: "text-accent-purple", glow: "shadow-[0_0_30px_rgba(185,103,255,0.1)]" },
    { icon: BrainCircuit, title: t.capabilities.digitalAssistant.title, desc: t.capabilities.digitalAssistant.desc, gradient: "from-accent-pink to-accent-green", accent: "text-accent-pink", glow: "shadow-[0_0_30px_rgba(255,107,157,0.1)]" },
    { icon: Lightbulb, title: t.capabilities.problemSolving.title, desc: t.capabilities.problemSolving.desc, gradient: "from-accent-cyan to-accent-pink", accent: "text-accent-cyan", glow: "shadow-[0_0_30px_rgba(0,229,255,0.1)]" },
  ];

  return (
    <section id="capabilities" className="relative py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-cyan mb-4">{t.capabilities.eyebrow}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t.capabilities.title.split("BudAI")[0]}<span className="text-gradient">BudAI</span>{t.capabilities.title.split("BudAI")[1]}
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t.capabilities.description}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap, i) => (
            <ScrollReveal key={cap.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group relative h-full holo-card rounded-2xl p-6 ${cap.glow} hover:shadow-[0_0_40px_rgba(0,229,255,0.08)] transition-shadow duration-500`}
              >
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${cap.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.gradient} p-[1px] mb-5`}>
                  <div className="w-full h-full rounded-xl bg-surface flex items-center justify-center">
                    <cap.icon className={`w-6 h-6 ${cap.accent}`} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-accent-cyan transition-colors duration-300">{cap.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{cap.desc}</p>
                <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-white/5 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
