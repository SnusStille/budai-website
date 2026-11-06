"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2, Compass, Github, Linkedin, Mail, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import PageHero from "./PageHero";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevMark } from "@/components/ui/BudAILogo";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function AboutView() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const principles = [
    { icon: Sparkles, title: { en: "Product before decoration", sv: "Produkt före dekoration" }, body: { en: "Visual craft should make the product clearer and more compelling—not hide a lack of substance.", sv: "Visuellt hantverk ska göra produkten tydligare och mer engagerande — inte dölja avsaknaden av substans." } },
    { icon: Code2, title: { en: "Details are engineering", sv: "Detaljer är teknik" }, body: { en: "Typography, loading states, accessibility and reliable interactions belong to the same quality standard as the code underneath.", sv: "Typografi, laddningstillstånd, tillgänglighet och tillförlitliga interaktioner hör till samma kvalitetsstandard som koden under ytan." } },
    { icon: ShieldCheck, title: { en: "Trust needs specifics", sv: "Förtroende kräver konkretion" }, body: { en: "Honest capability labels, visible memory controls and plain-language data explanations matter more than broad promises.", sv: "Ärliga funktionsetiketter, synliga minneskontroller och tydliga dataförklaringar betyder mer än svepande löften." } },
    { icon: Compass, title: { en: "Independent for the long term", sv: "Oberoende på lång sikt" }, body: { en: "Stilledev can explore carefully, ship in steps and build a coherent product family without chasing every trend.", sv: "Stilledev kan utforska noggrant, släppa stegvis och bygga en sammanhängande produktfamilj utan att jaga varje trend." } },
  ];
  return (
    <main id="main" tabIndex={-1} className="v2-main">
      <PageHero
        kicker={{ en: "ABOUT STILLEDEV · SWEDEN", sv: "OM STILLEDEV · SVERIGE" }}
        title={{ en: "Independent software & AI development.", sv: "Oberoende mjukvaru- och AI-utveckling." }}
        description={{ en: "Stilledev builds intelligent digital experiences with a product designer’s eye and an engineer’s respect for what happens underneath. BudAI is the primary product; the vision is wider.", sv: "Stilledev bygger intelligenta digitala upplevelser med en produktdesigners blick och en ingenjörs respekt för det som händer under ytan. BudAI är huvudprodukten; visionen är bredare." }}
      >
        <div className="v2-page-actions"><a href="mailto:Stilleinc@hotmail.com?subject=Conversation%20with%20Stilledev" className="v2-button v2-button-primary">{sv ? "Starta ett samtal" : "Start a conversation"}<Mail size={15} /></a><Link href="/labs" className="v2-button v2-button-secondary">{sv ? "Utforska projekten" : "Explore the work"}<ArrowRight size={15} /></Link></div>
      </PageHero>

      <div className="v2-container v2-about-content">
        <ScrollReveal className="v2-about-intro">
          <div className="v2-about-mark"><StilledevMark size={64} /><span>STILLEDEV</span><small>EST. IN SWEDEN</small></div>
          <div><p className="v2-kicker">{sv ? "EN OBEROENDE TEKNIKSTUDIO" : "AN INDEPENDENT TECHNOLOGY PRACTICE"}</p><h2>{sv ? "Avancerad teknik, gjord begriplig och användbar." : "Advanced technology, made clear and useful."}</h2><p>{sv ? "Stilledev är ett oberoende svenskt teknik- och mjukvaruvarumärke. Arbetet rör sig mellan produktdesign, frontend-arkitektur, AI-integration och den noggranna finishen som får digitala produkter att kännas genomtänkta." : "Stilledev is an independent Swedish technology and software brand. The work spans product design, frontend architecture, AI integration and the careful finish that makes digital products feel considered."}</p><p>{sv ? "Erfarenheten bygger på mer än tio år med kod och de senaste två åren av fokuserat BudAI-arbete. Ambitionen är inte att skapa mer AI-brus, utan verktyg som människor verkligen vill använda." : "The foundation is more than ten years of software experience and the last two years focused on BudAI. The ambition is not to create more AI noise, but tools people genuinely want to use."}</p></div>
        </ScrollReveal>

        <div className="v2-about-facts"><div><strong>10+</strong><span>{sv ? "år med kod" : "years writing software"}</span></div><div><strong>02</strong><span>{sv ? "år fokuserade på BudAI" : "years focused on BudAI"}</span></div><div><strong>SV / EN</strong><span>{sv ? "tvåspråkig produktdesign" : "bilingual product design"}</span></div><div><strong><MapPin size={24} />SE</strong><span>{sv ? "oberoende i Sverige" : "independent in Sweden"}</span></div></div>

        <section className="v2-about-principles" aria-labelledby="principles-title"><div className="v2-section-heading"><p className="v2-kicker">01 · {sv ? "ARBETSSÄTT" : "PRINCIPLES"}</p><h2 id="principles-title">{sv ? "Hur arbetet ska kännas — och fungera." : "How the work should feel—and function."}</h2></div><div className="v2-principle-grid">{principles.map((principle, index) => <ScrollReveal key={principle.title.en} delay={index * 0.045}><article><div><principle.icon size={19} /><span>0{index + 1}</span></div><h3>{principle.title[lang]}</h3><p>{principle.body[lang]}</p></article></ScrollReveal>)}</div></section>

        <ScrollReveal className="v2-about-budai">
          <div><p className="v2-kicker">02 · {sv ? "HUVUDPRODUKTEN" : "THE PRIMARY PRODUCT"}</p><h2>{sv ? "BudAI är där idéerna blir en verklig produkt." : "BudAI is where the ideas become a real product."}</h2><p>{sv ? "En tvåspråkig AI-arbetsyta med samtal, bildförståelse, röstinmatning, minneskontroller och redigerbara utkast. Den är byggd i Sverige och utvecklas öppet som en användbar preview — inte ett färdigt löfte om allt." : "A bilingual AI workspace with conversations, image understanding, voice input, memory controls and editable drafts. Built in Sweden and developed openly as a useful preview—not a finished promise of everything."}</p><Link href="/budai" className="v2-text-link">{sv ? "Utforska produkten" : "Explore the product"}<ArrowRight size={15} /></Link></div><div className="v2-about-budai-lines"><span>STILLEDEV</span><i /><strong>BudAI</strong><i /><span>{sv ? "ANVÄNDBART ARBETE" : "USEFUL WORK"}</span></div>
        </ScrollReveal>

        <ScrollReveal className="v2-buddy-note">
          <div className="v2-buddy-photo"><Image src="/images/buddy.webp" alt={sv ? "Buddy, hunden vars namn inspirerade BudAI" : "Buddy, the dog whose name inspired BudAI"} width={720} height={700} sizes="(max-width: 700px) 70vw, 240px" /></div>
          <div><p className="v2-kicker">03 · {sv ? "NAMNET BAKOM BUDAI" : "THE NAME BEHIND BUDAI"}</p><h2>{sv ? "En personlig historia i ett tekniskt varumärke." : "A personal story inside a technology brand."}</h2><p>{sv ? "Buddy är den tysta inspirationen bakom BudAI — en lojal vän vars namn blev en del av historien. Det personliga ursprunget finns kvar, även när produkten och Stilledev växer." : "Buddy is the quiet inspiration behind BudAI—a loyal friend whose name became part of the story. That personal origin remains, even as the product and Stilledev grow."}</p></div>
        </ScrollReveal>

        <ScrollReveal className="v2-contact-card">
          <div><p className="v2-kicker">04 · {sv ? "KONTAKT" : "CONTACT"}</p><h2>{sv ? "Har du något intressant att bygga?" : "Have something interesting to build?"}</h2><p>{sv ? "Kontakta Stilledev om mjukvaru- och AI-utveckling, produktidéer, tekniska experiment eller en genomtänkt fråga om BudAI." : "Contact Stilledev about software and AI development, product ideas, technical experiments or a thoughtful question about BudAI."}</p></div>
          <div className="v2-contact-details"><a href="mailto:Stilleinc@hotmail.com?subject=Project%20inquiry%20for%20Stilledev"><Mail size={17} /><span><small>{sv ? "E-POST" : "EMAIL"}</small>Stilleinc@hotmail.com</span><ArrowUpRight size={16} /></a><a href="https://www.linkedin.com/in/oliver-stille-8bb48a403/" target="_blank" rel="noopener noreferrer"><Linkedin size={17} /><span><small>LINKEDIN</small>{sv ? "Följ Stilledevs arbete" : "Follow Stilledev’s work"}</span><ArrowUpRight size={16} /></a><a href="https://github.com/SnusStille" target="_blank" rel="noopener noreferrer"><Github size={17} /><span><small>GITHUB</small>{sv ? "Utforska källkoden" : "Explore the source"}</span><ArrowUpRight size={16} /></a></div>
        </ScrollReveal>
      </div>
    </main>
  );
}
