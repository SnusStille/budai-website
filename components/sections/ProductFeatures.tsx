"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Mail, MessageSquareText, LockKeyhole, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const features = [
  {
    icon: BrainCircuit,
    eyebrow: "Available in beta",
    title: "Contextual Memory",
    description: "BudAI can keep recent conversation context when memory is enabled, helping each interaction feel more natural and useful.",
    detail: "You stay in control — turn memory on or off directly in the Playground.",
    gradient: "from-accent-cyan to-accent-blue",
    accent: "text-accent-cyan",
  },
  {
    icon: Mail,
    eyebrow: "Coming soon",
    title: "AI Email Agent",
    description: "Connect your inbox to summarize conversations, surface important messages, and prepare thoughtful reply suggestions.",
    detail: "A future workspace for faster, more intelligent communication.",
    gradient: "from-accent-purple to-accent-pink",
    accent: "text-accent-purple",
  },
  {
    icon: MessageSquareText,
    eyebrow: "Coming soon",
    title: "BudAI Website Widget",
    description: "Give visitors a trusted AI guide that can answer questions, explain services, and turn curiosity into qualified leads.",
    detail: "Designed to be customizable, professional, and connected to your company knowledge.",
    gradient: "from-accent-green to-accent-cyan",
    accent: "text-accent-green",
  },
];

export default function ProductFeatures() {
  return (
    <section id="features" className="relative py-32 bg-surface overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.07),transparent_32%)]" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-cyan mb-4">Built to grow with you</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            More than a conversation. <span className="text-gradient">A foundation for intelligent work.</span>
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            BudAI is evolving from a powerful assistant into a connected AI platform — with memory, communication intelligence, and customer experiences built in.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="relative h-full rounded-3xl p-8 glass-strong border border-white/[0.08] overflow-hidden"
              >
                <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${feature.gradient} opacity-70`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-8`}>
                  <div className="w-full h-full rounded-xl bg-surface-elevated flex items-center justify-center">
                    <feature.icon className={`w-6 h-6 ${feature.accent}`} />
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${feature.accent} mb-3`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {feature.eyebrow}
                </span>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-muted leading-relaxed mb-5">{feature.description}</p>
                <p className="text-sm text-white/70 leading-relaxed border-t border-white/[0.06] pt-5">{feature.detail}</p>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2} className="mt-10">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="flex items-center gap-3 text-sm text-muted text-center sm:text-left">
              <LockKeyhole className="w-4 h-4 text-accent-cyan shrink-0" />
              Future capabilities will be opt-in, customizable, and designed around your control.
            </p>
            <a href="#waitlist" className="shrink-0 text-sm font-semibold text-white hover:text-accent-cyan transition-colors flex items-center gap-2">
              See what&apos;s next <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
