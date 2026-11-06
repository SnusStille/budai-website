"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Check, ShieldCheck } from "lucide-react";
import PageHero from "./PageHero";
import ProductShowcase from "./ProductShowcase";
import AIPlayground from "@/components/sections/AIPlayground";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Shortcuts from "@/components/ui/Shortcuts";
import { useLang } from "@/components/ui/LanguageContext";
import { LIMITS } from "@/lib/limits";

export default function BudAIView() {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <main id="main" tabIndex={-1} className="v2-main">
      <Shortcuts />
      <PageHero
        kicker={{ en: "BUDAI · INTELLIGENT AI WORKSPACE", sv: "BUDAI · INTELLIGENT AI-ARBETSYTA" }}
        title={{ en: "A clearer way to move work forward.", sv: "Ett tydligare sätt att föra arbetet framåt." }}
        description={{ en: "Research, write, analyze and create in Swedish and English. BudAI brings conversations, memory, vision, voice and editable drafts into one continuous workspace.", sv: "Research, skrivande, analys och skapande på svenska och engelska. BudAI samlar samtal, minne, bild, röst och redigerbara utkast i en sammanhängande arbetsyta." }}
      >
        <div className="v2-page-actions"><a href="#playground" className="v2-button v2-button-primary">{sv ? "Öppna Playground" : "Open Playground"}<ArrowDown size={16} /></a><Link href="/knowledge" className="v2-button v2-button-secondary">{sv ? "Så fungerar BudAI" : "How BudAI works"}<ArrowRight size={15} /></Link></div>
      </PageHero>
      <div className="v2-container v2-product-facts" aria-label={sv ? "Snabbfakta" : "Quick facts"}>
        <span><Check size={14} />{sv ? "Öppen utvecklarpreview" : "Open developer preview"}</span>
        <span><Check size={14} />{sv ? `${LIMITS.guest.messagesPerDay} gästmeddelanden/dag` : `${LIMITS.guest.messagesPerDay} guest messages/day`}</span>
        <span><Check size={14} />{sv ? "Svenska och engelska" : "Swedish and English"}</span>
        <span><Check size={14} />{sv ? "Minne du kan kontrollera" : "Memory you control"}</span>
      </div>
      <ProductShowcase />
      <ErrorBoundary><AIPlayground /></ErrorBoundary>
      <section className="v2-section v2-product-trust">
        <div className="v2-container v2-product-trust-inner">
          <ShieldCheck size={28} />
          <div><p className="v2-kicker">{sv ? "INTEGRITET & KONTROLL" : "PRIVACY & CONTROL"}</p><h2>{sv ? "Förstå vad som händer med din information." : "Understand what happens to your information."}</h2><p>{sv ? "Läs den lättlästa guiden om modeller, minne, gästlagring, externa leverantörer och vilka kontroller du har. Inga oklara säkerhetslöften." : "Read the plain-language guide to models, memory, guest storage, external providers and the controls you have. No vague security promises."}</p></div>
          <Link href="/knowledge#privacy" className="v2-text-link">{sv ? "Utforska integriteten" : "Explore privacy"}<ArrowRight size={15} /></Link>
        </div>
      </section>
    </main>
  );
}
