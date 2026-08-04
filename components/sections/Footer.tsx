"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Cpu,
  Github,
  MessageSquare,
  Linkedin,
  Mail,
  ArrowUpRight,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const [showBuddy, setShowBuddy] = useState(false);
  const { t } = useLanguage();

  const groups = [
    { title: "Product", links: [
      { label: t.nav.capabilities, href: "#capabilities" },
      { label: t.nav.playground, href: "#playground" },
      { label: t.nav.terminal, href: "#terminal" },
      { label: t.nav.roadmap, href: "#roadmap" },
      { label: t.nav.status, href: "#status" },
    ]},
    { title: "Company", links: [
      { label: "About Stilledev", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "mailto:Stilleinc@hotmail.com" },
    ]},
    { title: "Legal", links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ]},
  ];

  const socials = [
    { icon: Github, href: "https://github.com/SnusStille/budai-website", label: "GitHub" },
    { icon: MessageSquare, href: "#", label: "Discord" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "mailto:Stilleinc@hotmail.com", label: "Email" },
  ];

  return (
    <footer className="relative border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Bud<span className="text-accent-cyan">AI</span></span>
            </a>
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-6">
              {t.vision.description}
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 transition-colors">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{g.title}</h4>
              <ul className="space-y-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted hover:text-white transition-colors inline-flex items-center gap-1 group">
                      {l.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">© {new Date().getFullYear()} BudAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted flex items-center gap-1.5">
              Developed by <a href="https://github.com/SnusStille" className="text-accent-cyan font-medium hover:underline transition-all">Stilledev</a>
              <span className="text-muted/30">·</span>
              <span className="text-xs">Sweden</span>
            </p>

            <button
              onClick={() => setShowBuddy(true)}
              className="group relative flex items-center gap-2 bg-white/5 hover:bg-white/8 px-3 py-1 rounded-full transition-all"
              aria-label="About Buddy"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image src="/images/IMG_8854.JPG" alt="Buddy" width={32} height={32} className="object-cover w-8 h-8" />
              </div>
              <span className="text-sm text-white/90">Buddy</span>
            </button>
          </div>
        </div>
      </div>

      {showBuddy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBuddy(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 max-w-sm w-full rounded-2xl bg-black/80 border border-white/10 p-6 shadow-xl"
          >
            <button className="absolute top-3 right-3 text-white/80" onClick={() => setShowBuddy(false)} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden">
                <Image src="/images/IMG_8854.JPG" alt="Buddy the dog" width={80} height={80} className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">Buddy</div>
                <div className="text-sm text-muted/70">The dog who gave BudAI its name — a quiet hero and our team's mascot.</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted/60">Buddy loves walks, treats, and occasionally approving product names with a single bark. He's small, friendly, and the heart behind the brand.</p>
          </motion.div>
        </div>
      )}
    </footer>
  );
}
