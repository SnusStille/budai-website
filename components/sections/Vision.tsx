"use client";

import { motion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Vision() {
  return (
    <section id="vision" className="relative py-32 overflow-hidden bg-surface">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <ScrollReveal>
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-cyan mb-4">Our Vision</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            The AI Assistant for <span className="text-gradient">Everyone</span>
          </h2>
          <p className="text-lg text-muted mb-16 leading-relaxed">
            BudAI is not just a chatbot. BudAI is an advanced AI assistant that helps people and businesses work smarter, automate tasks, understand information, and unlock new possibilities with AI.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-20">
          <ScrollReveal delay={0.1}>
            <h3 className="text-xl font-semibold text-white mb-3">For Individuals</h3>
            <p className="text-muted leading-relaxed">
              Ask questions, learn new things, and get help with everyday tasks. BudAI is designed to be a powerful, accessible companion for your daily life.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <h3 className="text-xl font-semibold text-white mb-3">For Businesses</h3>
            <p className="text-muted leading-relaxed">
              Improve productivity, automate workflows, and analyze information. BudAI is built to become an intelligent digital employee for modern companies.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <blockquote className="relative p-8 rounded-3xl glass-strong border border-white/10">
            <div className="absolute top-0 left-8 w-16 h-[1px] bg-accent-cyan" />
            <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed mb-6">
              "This feels like the future of AI."
            </p>
            <footer className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center font-bold text-white text-xs">
                S
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white">Stilledev</div>
                <div className="text-xs text-muted">Creators of BudAI</div>
              </div>
            </footer>
          </blockquote>
        </ScrollReveal>
      </div>
    </section>
  );
}
