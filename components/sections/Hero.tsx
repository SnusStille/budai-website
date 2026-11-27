"use client";
import { LIMITS } from "@/lib/limits";

import { ArrowDown, ArrowRight, Check, Copy, FileText, Languages, Mail, Network, Pause, Play, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import StockholmClock from "@/components/ui/StockholmClock";
import { CONTACT_EMAIL } from "@/lib/contact";

/** Landing hero paired with the persistent single-owner 3D Neural Brain stage. */
export default function Hero() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const [motionPaused, setMotionPaused] = useState(false);
  const [emailCopyState, setEmailCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const copyContactEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setEmailCopyState("copied");
    } catch {
      setEmailCopyState("failed");
    }
  };

  const openShowreel = () => window.dispatchEvent(new Event("budai:show-film"));

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
  return (
    <section id="intelligence" className="hero-universe" aria-labelledby="hero-title">
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
        <div className="hero-utility-actions" role="group" aria-label={sv ? "Snabba genvägar" : "Quick actions"}>
          <a className="hero-contact" href={sv ? "/sv/contact" : "/contact"}>
            <span className="hero-contact-icon"><Mail size={15} aria-hidden="true" /></span>
            <span><small>{sv ? "KONTAKTA STILLEDEV" : "CONTACT STILLEDEV"}</small><b>{sv ? "Kontakta oss" : "Contact us"}</b></span>
            <ArrowRight size={14} aria-hidden="true" />
          </a>
          <button type="button" className="hero-film-trigger" onClick={openShowreel} title={sv ? "Öppna filmen nere i hörnet (V)" : "Open the corner film player (V)"}>
            <span className="hero-film-icon"><Play size={14} fill="currentColor" aria-hidden="true" /></span>
            <span><small>{sv ? "STILLEDEV / FILM 01" : "STILLEDEV / FILM 01"}</small><b>{sv ? "Se filmen" : "Watch the film"}</b></span>
            <kbd aria-hidden="true">V</kbd>
          </button>
          <button type="button" className="hero-email-copy" onClick={copyContactEmail} aria-label={emailCopyState === "copied" ? (sv ? "E-postadressen kopierad" : "Email address copied") : (sv ? `Kopiera ${CONTACT_EMAIL}` : `Copy ${CONTACT_EMAIL}`)}>
            <span className="hero-email-copy-icon">{emailCopyState === "copied" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}</span>
            <span><small aria-live="polite">{emailCopyState === "copied" ? (sv ? "KOPIERAD" : "COPIED") : emailCopyState === "failed" ? (sv ? "KOPIERING EJ TILLGÄNGLIG" : "COPY UNAVAILABLE") : (sv ? "KOPIERA E-POST" : "COPY EMAIL")}</small><b>{CONTACT_EMAIL}</b></span>
          </button>
        </div>
        <div className="hero-features" aria-label={sv ? "Prova en idé i Playground" : "Try an idea in Playground"}>
          <span className="hero-feature-hint">
            <span>{sv ? "VÄLJ EN IDÉ ATT BÖRJA MED" : "PICK AN IDEA TO GET STARTED"} <ArrowRight size={12} aria-hidden="true" /></span>
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
          {sv ? "Grundat av " : "Founded by "}
          <a href={sv ? "/sv/oliver-stille" : "/oliver-stille"} className="text-accent-cyan hover:text-white">Oliver Stille</a>
          <span> · </span>
          <a href="#about" className="text-accent-cyan hover:text-white">Stilledev</a>
          <span> · </span>{sv ? "Sverige" : "Sweden"}
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
