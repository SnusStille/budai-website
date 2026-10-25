"use client";

import { ArrowDown, ArrowRight, FileText, Languages, Zap } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevLink } from "@/components/ui/BudAILogo";

/** Semantic landing content; the single persistent brain is owned by LoadingScreen. */
export default function Hero() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const chips = [
    { icon: FileText, label: sv ? "Privat · skriv & planera" : "Personal · write & plan" },
    { icon: Zap, label: sv ? "Företag · automatisera" : "Business · automate" },
    { icon: Languages, label: "SV / EN" },
  ];

  return (
    <section id="intelligence" className="hero-universe" aria-labelledby="hero-title">
      <div className="hero-architecture" aria-hidden="true"><span /><span /><span /></div>
      <div className="hero-content">
        <div className="hero-eyebrow"><span className="signal-dot" />{t.hero.badge}<span className="hero-edition">BUDAI / 01</span></div>
        <h1 id="hero-title">
          <span>{t.hero.title1}</span>
          <span className="hero-title-accent">{t.hero.title2}</span>
        </h1>
        <p className="hero-locale">{sv ? "För Sverige. Och det som kommer härnäst." : "For Sweden. And what comes next."}</p>
        <p className="hero-description">{t.hero.subtitle}</p>
        <div className="hero-actions">
          <a href="#playground" className="btn-primary inline-flex items-center gap-3"><span>{t.hero.ctaPrimary}</span><ArrowRight size={17} /></a>
          <a href="#waitlist" className="hero-secondary">{t.hero.ctaSecondary}<ArrowRight size={16} /></a>
        </div>
        <div className="hero-features">{chips.map(({ icon: Icon, label }) => <span key={label}><Icon size={13} />{label}</span>)}</div>
        <p className="hero-product-note">{sv ? "En yta för dig hemma och för teamet på jobbet — inte ännu ett generiskt chatbot-skal." : "One surface for you at home and the team at work — not another generic chatbot shell."}</p>
        <p className="hero-credit">{sv ? "Utvecklad av " : "Built by "}<StilledevLink /> <span>·</span> Sweden</p>
      </div>
      <div className="hero-bottom">
        <span><i /> 00 — {sv ? "INTELLIGENS" : "THE INTELLIGENCE CORE"}</span>
        <a href="#playground">{sv ? "Från tanke till handling" : "From intelligence to action"}<ArrowDown size={14} /></a>
      </div>
    </section>
  );
}
