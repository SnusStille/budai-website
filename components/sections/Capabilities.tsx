"use client";

import { ArrowRight, ArrowUpRight, BrainCircuit, FilePenLine, Image, Languages, ListChecks, PanelsTopLeft } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Waitlist from "./Waitlist";
import { LIMITS } from "@/lib/limits";

export default function Capabilities() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const capabilities = [
    {
      icon: FilePenLine,
      title: sv ? "Skriv och redigera" : "Write and refine",
      description: sv ? "Gör anteckningar till mejl, rapporter och förslag som är redo att redigera och använda." : "Turn notes into emails, reports and proposals ready to edit and use.",
      prompt: sv ? "Hjälp mig skriva ett tydligt och vänligt mejl." : "Help me write a clear, friendly email.",
    },
    {
      icon: ListChecks,
      title: sv ? "Analysera och besluta" : "Analyze and decide",
      description: sv ? "Jämför alternativ, synliga antaganden och risker, och få ett tydligt nästa steg." : "Compare options, surface assumptions and risks, and find a clear next step.",
      prompt: sv ? "Hjälp mig jämföra två alternativ med fördelar, risker och en rekommendation." : "Help me compare two options with trade-offs, risks and a recommendation.",
    },
    {
      icon: Languages,
      title: sv ? "Svenska + engelska" : "Swedish + English",
      description: sv ? "Växla språk i samma tråd och behåll ton, register och sammanhang." : "Switch languages in the same thread while preserving tone, register and context.",
      prompt: sv ? "Skriv ett kort projektmeddelande på svenska och engelska med samma ton." : "Write a short project update in Swedish and English with the same tone.",
    },
    {
      icon: BrainCircuit,
      title: sv ? "Minne du kontrollerar" : "Memory you control",
      description: sv ? "Spara beständiga preferenser med ett konto. Se, ändra, stäng av eller radera minnet." : "Remember durable preferences with an account. Review, edit, disable or delete memory.",
      prompt: sv ? "Hjälp mig formulera hur jag vill att mina svar ska vara." : "Help me describe how I like my responses to be written.",
    },
    {
      icon: Image,
      title: sv ? "Bild och röst" : "Vision and voice",
      description: sv ? "Diktera med webbläsarens röstinmatning och analysera bifogade bilder med ett konto." : "Dictate with browser speech input and analyze attached images with an account.",
      prompt: sv ? "Beskriv hur jag kan använda bildanalys för att förstå en skärmdump." : "Explain how I can use image analysis to understand a screenshot.",
    },
    {
      icon: PanelsTopLeft,
      title: sv ? "Workspace och export" : "Workspace and export",
      description: sv ? "Redigera längre svar, spara utkast och exportera eller dela det färdiga arbetet." : "Edit longer answers, save drafts, then export or share the finished work.",
      prompt: sv ? "Skapa ett strukturerat utkast med sammanfattning, åtgärder och checklista." : "Create a structured draft with a summary, actions and a checklist.",
    },
  ];

  const launch = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("budai:prompt", { detail: prompt }));
    document.getElementById("playground")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const plans = [
    {
      name: "Basic",
      status: sv ? "Tillgänglig nu" : "Available now",
      price: sv ? "Gratis under preview" : "Free during preview",
      description: sv ? "Den öppna utvecklarpreviewn för eget arbete." : "The open developer preview for individual work.",
      features: sv
        ? [`${LIMITS.guest.messagesPerDay} meddelanden/dag som gäst`, `${LIMITS.member.messagesPerDay}/dag med gratiskonto`, "Minne, historik och bildanalys med konto"]
        : [`${LIMITS.guest.messagesPerDay} guest messages/day`, `${LIMITS.member.messagesPerDay}/day with a free account`, "Memory, history and vision with an account"],
      href: "#playground",
      cta: sv ? "Öppna Playground" : "Open Playground",
    },
    {
      name: "Consumer",
      status: sv ? "Under utveckling" : "In development",
      price: sv ? "Pris ej satt" : "Pricing not set",
      description: sv ? "Mer kapacitet för regelbundet individuellt arbete." : "More capacity for regular individual work.",
      features: sv ? ["Högre dygnskapacitet", "Utökad historik och minneskapacitet", "Tidig tillgång till nya funktioner"] : ["Higher daily capacity", "Extended history and memory capacity", "Early access to new capabilities"],
      href: "#waitlist",
      cta: sv ? "Gå med i väntelistan" : "Join the waitlist",
    },
    {
      name: "Business",
      status: sv ? "Under utveckling" : "In development",
      price: sv ? "Pris ej satt" : "Pricing not set",
      description: sv ? "Planerade delade arbetsytor och teamflöden." : "Planned shared workspaces and team workflows.",
      features: sv ? ["Delade teamarbetsytor", "Återanvändbara teamplaybooks", "Planerade administratörskontroller"] : ["Shared team workspaces", "Reusable team playbooks", "Planned admin controls"],
      href: "#waitlist",
      cta: sv ? "Gå med i väntelistan" : "Join the waitlist",
    },
  ];

  return (
    <section id="capabilities" className="v2-section v2-capabilities" aria-labelledby="capabilities-title">
      <div className="v2-container">
        <ScrollReveal>
          <div className="v2-section-heading v2-split-heading">
            <div>
              <p className="v2-kicker">03 · {sv ? "ANVÄNDBART PÅ RIKTIGT" : "USEFUL IN PRACTICE"}</p>
              <h2 id="capabilities-title">{sv ? "Mindre friktion. Mer färdigt arbete." : "Less friction. More finished work."}</h2>
            </div>
            <p>{sv ? "Sex sammanhängande förmågor i samma yta. Välj ett exempel för att öppna det i den riktiga Playgrounden och lägg till din egen kontext." : "Six connected capabilities in the same surface. Choose an example to open it in the real Playground, then add your own context."}</p>
          </div>
        </ScrollReveal>

        <div className="v2-capability-grid">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <ScrollReveal key={capability.title} delay={index * 0.035}>
                <button type="button" className="capability-module v2-capability-card" onClick={() => launch(capability.prompt)}>
                  <span className="v2-capability-top"><Icon size={19} /><span>0{index + 1}</span></span>
                  <strong>{capability.title}</strong>
                  <span className="v2-capability-description">{capability.description}</span>
                  <span className="v2-capability-action">{sv ? "Prova i Playground" : "Try in Playground"}<ArrowUpRight size={14} /></span>
                </button>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal className="v2-access" delay={0.06}>
          <div className="v2-access-heading">
            <div><p className="v2-kicker">{sv ? "TILLGÅNG" : "ACCESS"}</p><h3>{sv ? "Börja gratis. Väx när du behöver." : "Start free. Grow when you need to."}</h3></div>
            <p>{sv ? "Consumer och Business är under utveckling. Priser har inte satts ännu." : "Consumer and Business are in development. Pricing has not been set yet."}</p>
          </div>
          <div className="v2-plan-grid" data-plan-comparison>
            {plans.map((plan) => (
              <article key={plan.name} className={`v2-plan-card plan-${plan.name.toLowerCase()}`}>
                <div className="v2-plan-title"><h4>{plan.name}</h4><span className={plan.name === "Basic" ? "is-live" : ""}>{plan.status}</span></div>
                <p className="v2-plan-price">{plan.price}</p>
                <p>{plan.description}</p>
                <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <a
                  href={plan.href}
                  onClick={() => {
                    if (plan.name === "Consumer" || plan.name === "Business") {
                      window.dispatchEvent(new CustomEvent("budai:waitlist-plan", {
                        detail: { accountType: plan.name === "Business" ? "company" : "individual", openDetails: plan.name === "Business" },
                      }));
                    }
                  }}
                >{plan.cta}<ArrowRight size={14} /></a>
              </article>
            ))}
          </div>
        </ScrollReveal>

        <Waitlist />
      </div>
    </section>
  );
}
