"use client";
import { LIMITS } from "@/lib/limits";

import { ArrowDown, ArrowRight, FileText, Languages, Mail, Network, Pause, Play, Shuffle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import StockholmClock from "@/components/ui/StockholmClock";

/** Landing hero paired with the persistent single-owner 3D Neural Brain stage. */
export default function Hero() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const [motionPaused, setMotionPaused] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("budai-ambient-paused", motionPaused);
    return () => document.documentElement.classList.remove("budai-ambient-paused");
  }, [motionPaused]);
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
  const surpriseMe = () => {
    const options = chips.map(chip => chip.prompt);
    activateChipPrompt(options[Math.floor(Math.random() * options.length)]);
  };

  return (
    <section id="intelligence" className="hero-universe" aria-labelledby="hero-title">
      <div className="hero-light" aria-hidden="true" />
      <svg className="hero-signal-sculpture" viewBox="0 0 720 520" fill="none" aria-hidden="true">
        <path className="hero-signal-path hero-signal-path-a" d="M18 342C130 342 126 170 252 170S390 385 500 286 605 120 704 120" />
        <path className="hero-signal-path hero-signal-path-b" d="M14 408C144 408 174 262 282 262S424 118 527 198 627 361 708 361" />
        <path className="hero-signal-path hero-signal-path-c" d="M84 90C194 90 205 211 318 211S455 431 562 431 644 280 710 280" />
        <path className="hero-signal-path hero-signal-trace" d="M18 342 252 170 500 286 704 120M14 408 282 262 527 198 708 361M84 90 318 211 562 431 710 280" />
        <circle className="hero-signal-node" cx="252" cy="170" r="4" />
        <circle className="hero-signal-node" cx="500" cy="286" r="5" />
        <circle className="hero-signal-node" cx="282" cy="262" r="3" />
        <circle className="hero-signal-node" cx="527" cy="198" r="4" />
        <circle className="hero-signal-node" cx="562" cy="431" r="3" />
      </svg>
      <div className="hero-content">
        <div className="hero-eyebrow">
          <i className="signal-dot" aria-hidden="true" />
          {t.hero.badge}
        </div>
        <h1 id="hero-title" tabIndex={-1}>
          <span>{t.hero.title1}</span>
          <span className="hero-title-accent">{t.hero.title2}</span>
        </h1>
        <p className="hero-locale">
          {sv
            ? "Byggd i Sverige för arbete på svenska och engelska."
            : "Built in Sweden for work in Swedish and English."}
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
        <a className="hero-contact" href={sv ? "/sv/contact" : "/contact"}>
          <span className="hero-contact-icon"><Mail size={15} aria-hidden="true" /></span>
          <span><small>{sv ? "KONTAKTA STILLEDEV" : "CONTACT STILLEDEV"}</small><b>{sv ? "Kontakta oss" : "Contact us"}</b></span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
        <div className="hero-features" aria-label={sv ? "Prova en idé i Playground" : "Try an idea in Playground"}>
          <span className="hero-feature-hint">
            <span>{sv ? "VÄLJ EN IDÉ ATT BÖRJA MED" : "PICK AN IDEA TO GET STARTED"} <ArrowRight size={12} aria-hidden="true" /></span>
            <button type="button" className="hero-surprise" onClick={surpriseMe}>
              <Shuffle size={12} aria-hidden="true" />{sv ? "Överraska mig" : "Surprise me"}
            </button>
          </span>
          {chips.map(({ icon: Icon, label, region, prompt }) => (
            <button
              type="button"
              key={label}
              title={sv ? "Fyll i en idé i Playground" : "Fill an idea into Playground"}
              data-hero-brain-region={region}
              onPointerEnter={() => focusRegion(region)}
              onPointerLeave={() => focusRegion(-1)}
              onFocus={() => focusRegion(region)}
              onBlur={() => focusRegion(-1)}
              onClick={() => activateChipPrompt(prompt)}
            >
              <Icon size={13} />
              {label} <ArrowRight className="hero-feature-arrow" size={12} aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="hero-product-note">
          {sv
            ? `Börja gratis som gäst (${LIMITS.guest.messagesPerDay} meddelanden per dag). Logga in för historik och minne du kan styra (${LIMITS.member.messagesPerDay} meddelanden per dag).`
            : `Start free as a guest (${LIMITS.guest.messagesPerDay} messages a day). Sign in for history and memory you can control (${LIMITS.member.messagesPerDay} messages a day).`}
        </p>
        <p className="hero-credit">
          {sv ? "Utvecklad av " : "Built by "}
          <a href="#about" className="text-accent-cyan hover:text-white">Stilledev</a> <span>·</span> Sweden
        </p>
        <StockholmClock />
      </div>
      <div className="hero-bottom">
        <span>
          <i /> {sv ? "FORTSÄTT NEDÅT FÖR ATT SE HUR DET FUNGERAR" : "SCROLL TO SEE HOW IT WORKS"}
        </span>
        <a href="#signal" aria-label={sv ? "Utforska hjärnan och signalens väg till Playground" : "Explore the brain and follow the signal to Playground"}>
          {sv ? "Utforska signalens väg" : "Explore the signal path"}
          <ArrowDown size={14} />
        </a>
        <button type="button" className="hero-motion-toggle" aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>
          {motionPaused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          {motionPaused ? (sv ? "Återuppta rörelse" : "Resume motion") : (sv ? "Pausa rörelse" : "Pause motion")}
        </button>
      </div>
    </section>
  );
}
