"use client";

import { ArrowDown, ArrowRight, FileText, Languages, Network, Zap } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevLink } from "@/components/ui/BudAILogo";

/** Landing hero paired with the persistent single-owner 3D Neural Brain stage. */
export default function Hero() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const chips = [
    {
      icon: FileText,
      label: sv ? "Privat · skriv & planera" : "Personal · write & plan",
      region: 0,
      prompt: sv
        ? "Hjälp mig skriva ett tydligt och vänligt mejl."
        : "Help me write a clear, friendly email.",
    },
    {
      icon: Zap,
      label: sv ? "Företag · automatisera" : "Business · automate",
      region: 2,
      prompt: sv
        ? "Hjälp mig göra en återkommande arbetsuppgift till tydliga steg."
        : "Help me turn a recurring work task into clear steps.",
    },
    {
      icon: Languages,
      label: "SV / EN",
      region: 1,
      prompt: sv
        ? "Hjälp mig skriva om en kort text på svenska och engelska med samma ton."
        : "Help me rewrite a short text in Swedish and English with the same tone.",
    },
    {
      icon: Network,
      label: sv ? "Minne & röst" : "Memory & voice",
      region: 3,
      prompt: sv
        ? "Hjälp mig formulera hur jag vill att mina svar ska vara."
        : "Help me describe how I like my responses to be written.",
    },
  ];
  const focusRegion = (region: number) => {
    window.dispatchEvent(new CustomEvent("budai:brain-region", { detail: region }));
  };
  const activateChipPrompt = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("budai:prompt", { detail: prompt }));
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="intelligence" className="hero-universe" aria-labelledby="hero-title">
      <div className="hero-light" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          <i className="signal-dot" aria-hidden="true" />
          {t.hero.badge}
          <span className="hero-edition">BUDAI / 01 · THE SPARK</span>
        </div>
        <h1 id="hero-title">
          <span>{t.hero.title1}</span>
          <span className="hero-title-accent">{t.hero.title2}</span>
        </h1>
        <p className="hero-locale">
          {sv
            ? "Varje handling börjar med en signal. Byggd i Sverige för arbete på svenska och engelska."
            : "Every action starts with a signal. Built in Sweden for Swedish and English work."}
        </p>
        <p className="hero-description">{t.hero.subtitle}</p>
        <div className="hero-actions">
          <a href="#playground" className="btn-primary inline-flex items-center gap-3">
            <span>{t.hero.ctaPrimary}</span>
            <ArrowRight size={17} />
          </a>
          <a href="#waitlist" className="hero-secondary">
            {t.hero.ctaSecondary}
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="hero-features">
          {chips.map(({ icon: Icon, label, region, prompt }) => (
            <span
              key={label}
              role="button"
              tabIndex={0}
              data-hero-brain-region={region}
              onPointerEnter={() => focusRegion(region)}
              onPointerLeave={() => focusRegion(-1)}
              onFocus={() => focusRegion(region)}
              onBlur={() => focusRegion(-1)}
              onClick={() => activateChipPrompt(prompt)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activateChipPrompt(prompt);
                }
              }}
            >
              <Icon size={13} />
              {label}
            </span>
          ))}
        </div>
        <p className="hero-product-note">
          {sv
            ? "En arbetsyta för ditt eget fokus idag och teamets flöden imorgon — prova gratis som gäst (12/dag) eller logga in gratis (80/dag) för användarstyrt minne, historik och bildanalys."
            : "One workspace for personal focus today and team workflows tomorrow — try free as a guest (12/day) or sign in free (80/day) for user-controlled memory, history, and vision."}
        </p>
        <p className="hero-credit">
          {sv ? "Utvecklad av " : "Built by "}
          <StilledevLink /> <span>·</span> Sweden
        </p>
      </div>
      <div className="hero-bottom">
        <span>
          <i /> 01 — {sv ? "GNISTAN · INTELLIGENSKÄRNAN" : "THE SPARK · INTELLIGENCE CORE"}
        </span>
        <a href="#playground">
          {sv ? "Från tanke till handling" : "From intelligence to action"}
          <ArrowDown size={14} />
        </a>
      </div>
    </section>
  );
}
