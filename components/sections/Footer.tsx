"use client";

import CompanionRestore from "@/components/ui/CompanionRestore";
import StatusPill from "@/components/ui/StatusPill";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Github, MessageSquare, Linkedin, Mail, ArrowUpRight } from "lucide-react";
import BudAIWordmark from "@/components/ui/BudAIWordmark";
import {subscribeJourney} from "@/lib/experience/scroll";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { openCookieSettings } from "@/lib/consent";

const groups = (lang: string) => [
  {
    title: lang === "sv" ? "Produkt" : "Product",
    links: [
      { label: lang === "sv" ? "Förmågor" : "Capabilities", href: "#capabilities" },
      { label: "AI Playground", href: "#playground" },
      { label: "Roadmap", href: "#roadmap" },
      { label: lang === "sv" ? "Väntelista" : "Waitlist", href: "#waitlist" },
    ],
  },
  {
    title: lang === "sv" ? "Företag" : "Company",
    links: [
      { label: "Labs", href: lang === "sv" ? "/sv/labs" : "/labs" },
      { label: lang === "sv" ? "Byggaren" : "Builder", href: "#about" },
      { label: lang === "sv" ? "Kontakt" : "Contact", href: lang === "sv" ? "/sv/contact" : "/contact" },
      { label: lang === "sv" ? "Vad är nytt" : "What's new", href: "/changelog" },
    ],
  },
  {
    title: lang === "sv" ? "Juridik" : "Legal",
    links: [
      { label: lang === "sv" ? "Integritetspolicy" : "Privacy Policy", href: "/legal/privacy" },
      { label: lang === "sv" ? "Användarvillkor" : "Terms of Service", href: "/legal/terms" },
      { label: lang === "sv" ? "Cookiepolicy" : "Cookie Policy", href: "/legal/cookies" },
      { label: "GDPR", href: "/legal/gdpr" },
      { label: lang === "sv" ? "Så hanteras dina data" : "How your data is handled", href: "/legal/data" },
    ],
  },
];

const socials = [
  { icon: Github, href: "https://github.com/SnusStille", label: "GitHub" },
  { icon: MessageSquare, href: "https://discord.com/users/353944097301594123", label: "Discord" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:Stilleinc@hotmail.com", label: "Email" },
];

export default function Footer() {
  const footer=useRef<HTMLElement>(null);
  useEffect(()=>subscribeJourney(frame=>{const el=footer.current;if(!el)return;const p=frame.closing??0;el.style.setProperty("--closing-progress",String(p));el.dataset.closingProgress=p.toFixed(4);}),[]);
  const { lang, t } = useLang();
  const groupsData = groups(lang);

  return (
    <footer ref={footer} id="continuation" className="site-footer relative border-t border-white/[0.04]">
      <div className="closing-composition">
        <div className="closing-field" aria-hidden="true"><span/><i data-outro-anchor/><span/></div>
        <span className="closing-kicker">{lang==="sv"?"SIGNALEN FORTSÄTTER":"THE SIGNAL CONTINUES"}</span>
        <h2>{lang==="sv"?"Fortsätt samtalet.":"Continue the conversation."}</h2>
        <p>{lang==="sv"?"Öppna Playground för att testa på svenska eller engelska — och var med när nästa steg byggs.":"Open the Playground to test live in Swedish or English — and help shape what gets built next."}</p>
        <a href="#playground">{lang==="sv"?"Tillbaka till Playground":"Back to Playground"}<ArrowUpRight size={15}/></a>
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-16">
        <div className="site-footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href={lang === "sv" ? "/sv" : "/"} aria-label={lang === "sv" ? "BudAI startsida" : "BudAI home"} className="flex items-center gap-2.5 mb-5 group">
              <BudAILogo size="md" animated />
              <BudAIWordmark className="text-xl" />
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-sm mb-6">
              {lang === "sv"
                ? "Utvecklad i Sverige av Stilledev för riktigt arbete på svenska och engelska — med live Playground, minne du kan styra och tydlig väg från tanke till handling."
                : "Built in Sweden by Stilledev for real work in Swedish and English — featuring a live Playground, memory you control, and a clear path from raw context to action."}
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  aria-label={s.label}
                  className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-white hover:bg-white/10 hover:border-accent-cyan/20 border border-transparent transition-all"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {groupsData.map((g, gi) => (
            <nav key={g.title} aria-label={g.title} className="site-footer-nav">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`h-1.5 w-1.5 rounded-full ${["bg-accent-cyan", "bg-accent-purple", "bg-accent-green"][gi % 3]}`} />
                {g.title}
              </h4>
              <ul className="space-y-1">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="min-h-8 text-sm text-muted hover:text-white focus-visible:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {l.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">{t.footer.rights}</p>
          <p className="text-sm text-muted flex items-center gap-1.5">
            {lang === "sv" ? "Utvecklad av" : "Developed by"}{" "}
            <span className="inline-flex items-center gap-1.5 text-accent-cyan font-medium"><StilledevMark size={16} />Stilledev EF</span>
            <span className="text-muted/30">·</span>
            <span className="text-xs">{lang === "sv" ? "Sverige" : "Sweden"}</span>
          </p>
          <CompanionRestore />
          <button
            type="button"
            onClick={openCookieSettings}
            className="text-xs text-muted underline decoration-white/20 underline-offset-4 hover:text-white transition-colors"
          >
            {lang === "sv" ? "Cookieinställningar" : "Cookie settings"}
          </button>
        </div>
      </div>

      <div className="flex justify-center pb-4"><StatusPill /></div>
      <div className="closing-endline" aria-hidden="true"><i/></div>
    </footer>
  );
}
