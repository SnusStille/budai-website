"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2, Compass, Layers3 } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo, { StilledevMark } from "@/components/ui/BudAILogo";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function About() {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <section id="about" className="v2-section v2-company-preview" aria-labelledby="company-preview-title">
      <div className="v2-container v2-company-grid">
        <ScrollReveal className="v2-company-statement">
          <p className="v2-kicker">04 · STILLEDEV</p>
          <h2 id="company-preview-title">{sv ? "Oberoende mjukvara. Långsiktiga idéer." : "Independent software. Long-term ideas."}</h2>
          <p className="v2-company-lead">{sv ? "Stilledev är ett oberoende svenskt teknik- och mjukvaruvarumärke som bygger intelligenta digitala upplevelser. BudAI är vår huvudprodukt — inte hela visionen." : "Stilledev is an independent Swedish technology and software brand building intelligent digital experiences. BudAI is our primary product—not the whole vision."}</p>
          <p>{sv ? "Med mer än tio års erfarenhet av kod och två år fokuserade på BudAI bygger vi med samma ambition: avancerad teknik ska kännas tydlig, användbar och genomtänkt ända in i detaljen." : "With more than ten years of software experience and two years focused on BudAI, we build toward the same ambition: advanced technology should feel clear, useful and considered down to the last detail."}</p>
          <div className="v2-company-actions"><Link href="/about" className="v2-button v2-button-secondary">{sv ? "Om Stilledev" : "About Stilledev"}<ArrowRight size={15} /></Link><Link href="/labs" className="v2-text-link">{sv ? "Utforska Projects / Labs" : "Explore Projects / Labs"}<ArrowUpRight size={15} /></Link></div>
        </ScrollReveal>

        <ScrollReveal className="v2-company-system" delay={0.08}>
          <div className="v2-system-brand"><StilledevMark size={34} /><div><strong>Stilledev</strong><span>{sv ? "Oberoende teknik & AI" : "Independent technology & AI"}</span></div><small>SE</small></div>
          <div className="v2-system-line" aria-hidden="true"><i /><span /><i /></div>
          <div className="v2-system-projects">
            <Link href="/budai" className="v2-system-project is-primary"><BudAILogo size="sm" /><div><strong>BudAI</strong><span>{sv ? "Intelligent AI-arbetsyta" : "Intelligent AI workspace"}</span></div><small>{sv ? "HUVUDPRODUKT" : "PRIMARY PRODUCT"}</small><ArrowUpRight size={16} /></Link>
            <Link href="/labs" className="v2-system-project"><Compass size={26} /><div><strong>Stilledev Labs</strong><span>{sv ? "Experiment och framtida produkter" : "Experiments and future products"}</span></div><small>{sv ? "UTFORSKAR" : "EXPLORING"}</small><ArrowUpRight size={16} /></Link>
          </div>
          <div className="v2-system-principles"><span><Code2 size={14} />{sv ? "Programvara med omsorg" : "Software with intent"}</span><span><Layers3 size={14} />{sv ? "Designad för att växa" : "Designed to grow"}</span></div>
        </ScrollReveal>
      </div>
    </section>
  );
}
