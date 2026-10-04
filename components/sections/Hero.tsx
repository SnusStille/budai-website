"use client";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
export default function Hero() {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <section className="hero-final site-width" id="home">
      <div className="eyebrow">
        <span className="signal-dot" />
        {sv ? "EN FÖRHANDSTITT PÅ BUDAI" : "INTRODUCING THE BUDAI PREVIEW"}
      </div>
      <h1>
        {sv ? "Stora idéer." : "Big ideas."}
        <br />
        <span>{sv ? "Mindre vardagsjobb." : "Less busywork."}</span>
      </h1>
      <p>
        {sv
          ? "En AI-arbetsyta för det du vill få gjort. Skriv, tänk och ta nästa steg — tillsammans med BudAI."
          : "An AI workspace for the work that matters. Write, think, and move things forward — with BudAI by your side."}
      </p>
      <div className="hero-actions">
        <a className="primary-action" href="#playground">
          {sv ? "Prova BudAI" : "Try BudAI"}
          <ArrowDown size={17} />
        </a>
        <a className="quiet-action" href="#waitlist">
          {sv ? "Var med från början" : "Be part of what’s next"}
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="hero-meta">
        <span>{sv ? "Börja utan konto" : "No account to get started"}</span>
        <i />
        <span>{sv ? "Svenska & engelska" : "Swedish & English"}</span>
      </div>
      <div className="hero-margin-note" aria-hidden="true">
        <span>BUILT IN SWEDEN</span>
        <span>DESIGNED FOR YOUR EVERYDAY.</span>
      </div>
    </section>
  );
}
