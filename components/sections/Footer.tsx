"use client";

import StatusPill from "@/components/ui/StatusPill";
import { Github, MessageSquare, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import BudAILogo, { StilledevLink, StilledevMark } from "@/components/ui/BudAILogo";
import Link from "next/link";
import { useLang } from "@/components/ui/LanguageContext";

const groups = (lang: string) => [
  {
    title: lang === "sv" ? "Produkt" : "Product",
    links: [
      { label: lang === "sv" ? "Förmågor" : "Capabilities", href: "#capabilities" },
      { label: "AI Playground", href: "#playground" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: lang === "sv" ? "Företag" : "Company",
    links: [
      { label: "Stilledev", href: "https://stilledev.se", external: true },
      { label: lang === "sv" ? "Byggaren" : "Builder", href: "#about" },
      { label: lang === "sv" ? "Early access" : "Early access", href: "#waitlist" },
      { label: lang === "sv" ? "Prissättning" : "Pricing", href: "#waitlist" },
      { label: lang === "sv" ? "Kontakt" : "Contact", href: "mailto:noreply@stilledev.se" },
      { label: lang === "sv" ? "Skicka feedback" : "Send feedback", href: "mailto:Stilleinc@hotmail.com?subject=BudAI%20preview%20feedback" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: lang === "sv" ? "Integritetspolicy" : "Privacy Policy", href: "/legal/privacy" },
      { label: lang === "sv" ? "Användarvillkor" : "Terms of Service", href: "/legal/terms" },
      { label: lang === "sv" ? "Cookiepolicy" : "Cookie Policy", href: "/legal/cookies" },
      { label: "GDPR", href: "/legal/gdpr" },
    ],
  },
];

const socials = [
  { icon: Github, href: "https://github.com/SnusStille", label: "GitHub" },
  { icon: MessageSquare, href: "https://discord.com/users/353944097301594123", label: "Discord" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:noreply@stilledev.se", label: "Email Stilledev" },
];

export default function Footer() {
  const { lang, t } = useLang();
  const groupsData = groups(lang);


  return (
    <footer className="relative border-t border-white/[0.04]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" aria-label="BudAI home" className="flex items-center gap-2.5 mb-5 group">
              <BudAILogo size="md" animated />
              <span className="text-xl font-bold tracking-tight">
                Bud<span className="text-accent-cyan">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-6">
              {lang === "sv"
                ? "En avancerad AI-plattform som hjälper svenska företag och privatpersoner att spara tid, automatisera uppgifter och förbättra arbetsflöden."
                : "An advanced AI platform that helps Swedish companies and individuals save time, automate tasks, and improve workflows."}
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 hover:border-accent-cyan/20 border border-transparent transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {groupsData.map((g, gi) => (
            <div key={g.title}>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`h-1.5 w-1.5 rounded-full ${["bg-accent-cyan", "bg-accent-purple", "bg-accent-green"][gi % 3]}`} />
                {g.title}
              </h4>
              <ul className="space-y-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/legal/") ? (
                      <Link href={l.href} className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-white">
                        {l.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        target={"external" in l && l.external ? "_blank" : undefined}
                        rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
                        className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-white"
                      >
                        {l.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">{t.footer.rights}</p>
          <p className="text-sm text-muted flex items-center gap-1.5">
            {lang === "sv" ? "Utvecklad av" : "Developed by"}{" "}
            <StilledevLink showMark />
            <span className="text-muted/30">·</span>
            <span className="text-xs">Sweden</span>
          </p>
        </div>
      </div>

      <div className="flex justify-center pb-4"><StatusPill /></div>
  <div className="relative h-20 sm:h-36 overflow-hidden select-none pointer-events-none" aria-hidden>
        <span className="absolute inset-x-0 -bottom-3 sm:-bottom-6 text-center font-bold tracking-tighter leading-none text-[24vw] sm:text-[17vw] bg-gradient-to-b from-white/[0.12] via-accent-cyan/[0.05] to-transparent bg-clip-text text-transparent">
          BudAI
        </span>
      </div>
    </footer>
  );
}
