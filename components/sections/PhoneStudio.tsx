"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The phone shell is chosen by the root layout on navigation. */

import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { LIMITS } from "@/lib/limits";
import Waitlist from "@/components/sections/Waitlist";

/** A lightweight editorial counterpart to the desktop journey; Playground remains the same product. */
export default function PhoneStudio() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const capabilities = [
    ["Write", sv ? "Gör anteckningar till mejl, rapporter och förslag." : "Turn notes into emails, reports and proposals."],
    ["Automate", sv ? "Bryt ned återkommande uppgifter till tydliga steg." : "Break recurring tasks into repeatable steps."],
    ["Decide", sv ? "Jämför alternativ och hitta nästa steg." : "Compare options and find a next step."],
    ["SV / EN", sv ? "Arbeta på svenska och engelska i samma samtal." : "Work in Swedish and English in the same conversation."],
    ["Memory", sv ? "Med konto kan minnen sparas automatiskt. Du kan stänga av, redigera och radera dem." : "With an account, memories may be saved automatically. Turn them off, edit or delete them."],
    ["Vision & Voice", sv ? "Diktera frågor; bildanalys kräver ett konto." : "Dictate prompts; image analysis requires an account."],
  ];
  const prompts = [
    sv ? "Hjälp mig göra mina anteckningar till ett tydligt mejl. Fråga mig först vad jag vill säga." : "Help me turn my notes into a clear email. First ask me what I want to say.",
    sv ? "Hjälp mig bryta ned en återkommande uppgift i tydliga steg. Fråga mig vilken uppgift det gäller." : "Help me break a recurring task into clear steps. First ask me what the task is.",
    sv ? "Hjälp mig jämföra två alternativ. Fråga mig först vilka de är och vad som är viktigt för mig." : "Help me compare two options. First ask me what they are and what matters to me.",
    sv ? "Hjälp mig formulera ett meddelande på svenska och engelska. Fråga mig först vad det ska handla om." : "Help me write a message in Swedish and English. First ask me what it should be about.",
  ];
  const startPrompt = (prompt: string) => {
    const accepted = window.dispatchEvent(new CustomEvent("budai:prompt", { detail: prompt, cancelable: true }));
    if (accepted) document.getElementById("phone-chat")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };
  const plans = [
    ["Basic", sv ? "Tillgänglig i preview" : "Available in preview", sv ? `Gratis · ${LIMITS.guest.messagesPerDay} meddelanden/dag som gäst eller ${LIMITS.member.messagesPerDay} med konto.` : `Free · ${LIMITS.guest.messagesPerDay} messages/day as a guest or ${LIMITS.member.messagesPerDay} with an account.`],
    ["Consumer", sv ? "Under utveckling" : "In development", sv ? "Planerad utökad kapacitet för individuellt arbete." : "Planned expanded capacity for individual work."],
    ["Business", sv ? "Under utveckling" : "In development", sv ? "Planerade gemensamma arbetsflöden för team." : "Planned shared workflows for teams."],
  ];
  return <div className="phone-studio" id="phone-discover">
    <nav className="phone-studio-nav" aria-label={sv ? "Utforska Stilledev" : "Explore Stilledev"}>
      <a href="#capabilities">{sv ? "Förmågor" : "Capabilities"}</a><a href="#about">Builder</a><a href="#roadmap">Roadmap</a><a href={sv ? "/sv/labs" : "/labs"}>Labs <ArrowUpRight size={13} /></a>
    </nav>
    <section id="capabilities" className="phone-studio-section" aria-labelledby="phone-capabilities-title">
      <span className="phone-studio-kicker">01 / BUDAI</span>
      <h2 id="phone-capabilities-title">{sv ? <>Sex förmågor.<br /><em>En arbetsyta.</em></> : <>Six capabilities.<br /><em>One workspace.</em></>}</h2>
      <p>{sv ? "Från en första tanke till ett användbart resultat. Välj hur du vill börja i Playground." : "From a first thought to a useful result. Choose where to begin in the Playground."}</p>
      <ol className="phone-studio-list">{capabilities.map(([title, description], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{description}</p>{prompts[i] && <button type="button" className="phone-capability-prompt" onClick={() => startPrompt(prompts[i])}>{sv ? `Prova ${title}` : `Try ${title}`} <ArrowUpRight size={14} aria-hidden="true" /></button>}</div></li>)}</ol>
      <p className="phone-prompt-note">{sv ? "Förslagen öppnas som redigerbara utkast – inget skickas automatiskt." : "Suggestions open as editable drafts – nothing is sent automatically."}</p>
      <a className="phone-studio-link" href="#playground">{sv ? "Prova i Playground" : "Try the Playground"} <ArrowUpRight size={16} /></a>
    </section>
    <section className="phone-studio-section" aria-labelledby="phone-access-title">
      <span className="phone-studio-kicker">02 / ACCESS</span>
      <h2 id="phone-access-title">{sv ? "Välj din väg in." : "Choose your way in."}</h2>
      <p>{sv ? "Basic är öppet idag. Fler paket utvecklas; inga priser eller datum är fastställda här." : "Basic is open today. More plans are in development; no prices or dates are promised here."}</p>
      <div className="phone-plan-list">{plans.map(([name, status, description]) => <article key={name}><div><h3>{name}</h3><span>{status}</span></div><p>{description}</p></article>)}</div>
      <Waitlist />
    </section>
    <section className="phone-studio-section phone-faq" aria-labelledby="phone-faq-title">
      <span className="phone-studio-kicker">03 / FAQ</span>
      <h2 id="phone-faq-title">{sv ? "Bra att veta." : "Good to know."}</h2>
      <p>{sv ? "Kort om att komma igång och behålla kontrollen." : "A quick guide to getting started and staying in control."}</p>
      <div className="phone-faq-list">
        <details><summary>{sv ? "Behöver jag ett konto?" : "Do I need an account?"}</summary><p>{sv ? `Nej. Du kan prova som gäst med ${LIMITS.guest.messagesPerDay} meddelanden per dag. Ett gratis konto ger ${LIMITS.member.messagesPerDay} per dag och tillgång till fler funktioner.` : `No. Try as a guest with ${LIMITS.guest.messagesPerDay} messages per day. A free account gives you ${LIMITS.member.messagesPerDay} per day and access to more features.`}</p></details>
        <details><summary>{sv ? "Hur fungerar minnet?" : "How does memory work?"}</summary><p>{sv ? "Med konto kan BudAI automatiskt spara minnen när funktionen är på. Du kan stänga av, redigera eller radera dem. Tillfälliga chattar använder inte minne." : "With an account, BudAI may automatically save memories when enabled. You can turn memory off, edit or delete it. Temporary chats do not use memory."}</p></details>
        <details><summary>{sv ? "Kan jag lita på alla svar?" : "Can I rely on every answer?"}</summary><p>{sv ? "AI kan göra fel. Kontrollera viktiga uppgifter och undvik att dela känslig information i onödan." : "AI can make mistakes. Check important information and avoid sharing sensitive details unnecessarily."}</p></details>
      </div>
      <a className="phone-studio-link" href="/legal/privacy">{sv ? "Läs integritetspolicyn" : "Read the privacy policy"} <ArrowUpRight size={16} aria-hidden="true" /></a>
    </section>
    <section id="about" className="phone-studio-section phone-studio-builder" aria-labelledby="phone-builder-title">
      <span className="phone-studio-kicker">04 / STILLEDEV</span>
      <h2 id="phone-builder-title">{sv ? <>Från idé till<br /><em>digitalt verktyg.</em></> : <>From an idea to<br /><em>a digital tool.</em></>}</h2>
      <p>{sv ? "Stilledev utvecklar BudAI och utforskar webbapplikationer, gränssnitt, integrationer och arbetsflöden." : "Stilledev builds BudAI and explores web applications, interfaces, integrations and workflows."}</p>
      <div className="phone-studio-tags"><span>Web</span><span>Dashboards</span><span>AI</span><span>Automation</span></div>
      <div className="phone-studio-actions"><a className="phone-studio-link" href={sv ? "/sv/labs" : "/labs"}>{sv ? "Utforska Labs" : "Explore Labs"} <ArrowUpRight size={16} /></a><a className="phone-studio-link" href={sv ? "/sv/contact" : "/contact"}>{sv ? "Kontakta oss" : "Get in touch"} <ArrowUpRight size={16} /></a></div>
    </section>
    <section id="roadmap" className="phone-studio-section" aria-labelledby="phone-roadmap-title">
      <span className="phone-studio-kicker">05 / ROADMAP</span>
      <h2 id="phone-roadmap-title">{sv ? "Byggt steg för steg." : "Built step by step."}</h2>
      <div className="phone-roadmap"><div><span>{sv ? "NU" : "NOW"}</span><p>{sv ? "Öppen developer preview med Playground och gratis konto." : "Open developer preview with Playground and a free account."}</p></div><div><span>{sv ? "UNDER UTVECKLING" : "IN DEVELOPMENT"}</span><p>{sv ? "Utökade paket för individer och team. Inga lanseringsdatum är utlovade." : "Expanded plans for individuals and teams. No launch dates promised."}</p></div></div>
    </section>
  </div>;
}
