"use client";

import Link from "next/link";
import { ArrowRight, Check, CircleDashed, Clock3, MessageSquarePlus } from "lucide-react";
import PageHero from "./PageHero";
import { useLang } from "@/components/ui/LanguageContext";
import { ROADMAP } from "@/lib/roadmap";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function RoadmapView() {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <main id="main" tabIndex={-1} className="v2-main">
      <PageHero
        kicker={{ en: "ROADMAP · OPEN DEVELOPMENT", sv: "ROADMAP · ÖPPEN UTVECKLING" }}
        title={{ en: "What’s real. What’s next.", sv: "Vad som finns. Vad som kommer." }}
        description={{ en: "A public view of BudAI’s direction, grounded in the actual product. No invented launch dates, inflated statuses or promises presented as finished work.", sv: "En öppen bild av BudAI:s riktning, förankrad i den verkliga produkten. Inga hittade på lanseringsdatum, uppblåsta statusar eller löften som presenteras som färdigt arbete." }}
      >
        <Link href="/feedback" className="v2-text-link">{sv ? "Påverka prioriteringarna" : "Influence the priorities"}<ArrowRight size={15} /></Link>
      </PageHero>

      <div className="v2-container v2-roadmap-page">
        <div className="v2-roadmap-legend" aria-label={sv ? "Statusförklaring" : "Status legend"}><span><i className="is-live" />{sv ? "Live betyder tillgängligt i previewn idag" : "Live means available in today’s preview"}</span><span><i className="is-development" />{sv ? "Under utveckling kan ändras i omfattning" : "In development may change in scope"}</span><span><i className="is-planned" />{sv ? "Planerat är riktning, inte releasedatum" : "Planned is direction, not a release date"}</span></div>
        {ROADMAP.map((group, groupIndex) => {
          const Icon = group.status === "live" ? Check : group.status === "development" ? Clock3 : CircleDashed;
          return (
            <section key={group.status} className={`v2-roadmap-group is-${group.status}`} aria-labelledby={`roadmap-${group.status}`}>
              <ScrollReveal className="v2-roadmap-group-heading">
                <div><span>0{groupIndex + 1}</span><Icon size={20} /><h2 id={`roadmap-${group.status}`}>{group.title[lang]}</h2></div>
                <p>{group.description[lang]}</p>
              </ScrollReveal>
              <div className="v2-roadmap-items">
                {group.items.map((item, index) => (
                  <ScrollReveal key={item.title.en} delay={index * 0.045}>
                    <article className="v2-roadmap-item">
                      <span className="v2-roadmap-item-number">{String(index + 1).padStart(2, "0")}</span>
                      <div><h3>{item.title[lang]}</h3><p>{item.description[lang]}</p>{item.detail && <small>{item.detail[lang]}</small>}</div>
                      <span className="v2-roadmap-item-status">{group.title[lang]}</span>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          );
        })}
        <ScrollReveal className="v2-inline-cta">
          <MessageSquarePlus size={25} />
          <div><h2>{sv ? "Vad skulle göra BudAI mer användbart för dig?" : "What would make BudAI more useful to you?"}</h2><p>{sv ? "Roadmapen är en riktning, inte en sluten plan. Dela ett konkret arbetsflöde, ett problem eller en idé genom den befintliga feedbackkanalen." : "The roadmap is a direction, not a closed plan. Share a concrete workflow, problem or idea through the existing feedback channel."}</p></div>
          <Link href="/feedback" className="v2-button v2-button-secondary">{sv ? "Skicka feedback" : "Send feedback"}<ArrowRight size={15} /></Link>
        </ScrollReveal>
      </div>
    </main>
  );
}
