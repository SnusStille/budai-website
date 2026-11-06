"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, MapPin } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import BudAIWordmark from "@/components/ui/BudAIWordmark";
import NeuralCore from "@/components/site/NeuralCore";
import { LIMITS } from "@/lib/limits";

export default function Hero() {
  const { lang } = useLang();
  const sv = lang === "sv";

  return (
    <section id="intelligence" className="v2-hero" aria-labelledby="hero-title">
      <div className="v2-hero-grid v2-container">
        <div className="v2-hero-copy">
          <p className="v2-eyebrow"><span className="v2-status-dot" />{sv ? "BUDAI AV STILLEDEV · UTVECKLARPREVIEW" : "BUDAI BY STILLEDEV · DEVELOPER PREVIEW"}</p>
          <h1 id="hero-title">
            {sv ? <>Mer än AI.<br /><span>En arbetsyta som tänker med dig.</span></> : <>More than AI.<br /><span>A workspace that thinks with you.</span></>}
          </h1>
          <p className="v2-hero-description">
            {sv
              ? "Gör röriga anteckningar, frågor och bilder till tydliga dokument, beslut och nästa steg — på svenska och engelska, i en och samma intelligenta miljö."
              : "Turn rough notes, questions and images into clear documents, decisions and next steps—in Swedish and English, in one intelligent environment."}
          </p>
          <div className="v2-hero-actions">
            <a href="#playground" className="v2-button v2-button-primary">
              <span>{sv ? "Utforska BudAI" : "Explore BudAI"}</span><ArrowRight size={17} />
            </a>
            <Link href="/about" className="v2-button v2-button-secondary">
              <span>{sv ? "Om Stilledev" : "About Stilledev"}</span><ArrowUpRight size={16} />
            </Link>
          </div>
          <ul className="v2-hero-assurances" aria-label={sv ? "Produktfördelar" : "Product benefits"}>
            <li><Check size={13} />{sv ? "Gratis att prova" : "Free to try"}</li>
            <li><Check size={13} />{sv ? "Inget konto behövs" : "No account required"}</li>
            <li><Check size={13} />SV / EN</li>
          </ul>
        </div>

        <div className="v2-hero-visual">
          <NeuralCore />
          <div className="v2-product-window">
            <div className="v2-product-window-bar">
              <div className="v2-window-identity"><i /><i /><i /><BudAIWordmark /></div>
              <span>{sv ? "VERKLIG PRODUKTYTA" : "ACTUAL PRODUCT INTERFACE"}</span>
              <a href="#playground">{sv ? "Öppna live" : "Open live"}<ArrowUpRight size={12} /></a>
            </div>
            <div className="v2-product-screenshot">
              <Image
                src="/images/product/budai-chat.webp"
                alt={sv ? "BudAI Playground med chatt, Research, Skapa, Analys, röst och minne" : "The real BudAI Playground with chat, Research, Create, Analyze, voice and memory controls"}
                width={1392}
                height={881}
                priority
                sizes="(max-width: 800px) 92vw, (max-width: 1400px) 48vw, 650px"
              />
            </div>
            <div className="v2-product-window-foot">
              <span><i />{sv ? "Live Playground" : "Live Playground"}</span>
              <span>{sv ? `${LIMITS.guest.messagesPerDay} gratismeddelanden/dag som gäst` : `${LIMITS.guest.messagesPerDay} free guest messages/day`}</span>
            </div>
          </div>
          <p className="v2-visual-caption"><span>01</span>{sv ? "Intelligens som blir användbart arbete." : "Intelligence, turned into useful work."}</p>
        </div>
      </div>

      <div className="v2-hero-bottom v2-container">
        <p><MapPin size={13} />{sv ? "Oberoende teknik och mjukvaruutveckling i Sverige" : "Independent software & AI development in Sweden"}</p>
        <a href="#product-story"><span>{sv ? "Se hur det fungerar" : "See how it works"}</span><ArrowDown size={14} /></a>
      </div>
    </section>
  );
}
