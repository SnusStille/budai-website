"use client";

import { Cpu, Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const groups = [
  { title: "Product", links: [
    { label: "Capabilities", href: "#capabilities" },
    { label: "AI Playground", href: "#playground" },
    { label: "Terminal", href: "#terminal" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "System Status", href: "#status" },
  ]},
  { title: "Company", links: [
    { label: "About Stilledev", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ]},
  { title: "Legal", links: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ]},
];

const socials = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
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
              An advanced AI platform that helps Swedish companies save time, automate tasks, improve workflows, and make businesses more efficient.
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
          <p className="text-sm text-muted">© 2026 BudAI. All rights reserved.</p>
          <p className="text-sm text-muted flex items-center gap-1.5">
            Developed by <span className="text-accent-cyan font-medium">Stilledev</span>
            <span className="text-muted/30">·</span>
            <span className="text-xs">Sweden</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
