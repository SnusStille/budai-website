"use client";

import Link from "next/link";
import { ArrowRight, Check, CircleDashed, Clock3 } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ROADMAP } from "@/lib/roadmap";

export default function Journey() {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <section id="roadmap" className="v2-section v2-roadmap-preview" aria-labelledby="roadmap-preview-title">
      <div className="v2-container">
        <ScrollReveal>
          <div className="v2-section-heading v2-split-heading">
            <div><p className="v2-kicker">05 · {sv ? "ÖPPEN UTVECKLING" : "OPEN DEVELOPMENT"}</p><h2 id="roadmap-preview-title">{sv ? "Byggt steg för steg. Delat öppet." : "Built step by step. Shared openly."}</h2></div>
            <div className="v2-heading-aside"><p>{sv ? "En realistisk bild av vad som finns idag, vad som byggs och vad som ligger längre fram. Inga hittade på lanseringsdatum." : "A realistic view of what exists today, what is being built and what comes later. No invented launch dates."}</p><Link href="/roadmap" className="v2-text-link">{sv ? "Se hela roadmapen" : "View the full roadmap"}<ArrowRight size={15} /></Link></div>
          </div>
        </ScrollReveal>
        <div className="v2-roadmap-grid">
          {ROADMAP.map((group, groupIndex) => {
            const Icon = group.status === "live" ? Check : group.status === "development" ? Clock3 : CircleDashed;
            return (
              <ScrollReveal key={group.status} delay={groupIndex * 0.06}>
                <article className={`roadmap-milestone v2-roadmap-card is-${group.status}`}>
                  <div className="v2-roadmap-card-head"><Icon size={16} /><h3>{group.title[lang]}</h3><span>0{groupIndex + 1}</span></div>
                  <p>{group.description[lang]}</p>
                  <ul>{group.items.map((item) => <li key={item.title.en}><span />{item.title[lang]}</li>)}</ul>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
