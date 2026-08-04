"use client";

import { motion } from "framer-motion";
import { Sparkles, Crown, Zap } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function Waitlist() {
  return (
    <section id="waitlist" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-purple/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4">Pricing & Plans</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Premium plans are <span className="text-gradient">coming soon</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            BudAI is currently in beta. Enjoy the free experience today, and get ready to unlock more BudAI capabilities soon.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative p-8 md:p-12 rounded-3xl glass-strong overflow-hidden border border-white/[0.06] text-center">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/8 to-accent-purple/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-accent-green/8 to-accent-cyan/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Future Premium Features</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                  <Zap className="w-5 h-5 text-accent-cyan shrink-0" />
                  <span className="text-sm text-white/90">Increased AI usage limits</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                  <Sparkles className="w-5 h-5 text-accent-purple shrink-0" />
                  <span className="text-sm text-white/90">Advanced Email Agent integration</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
