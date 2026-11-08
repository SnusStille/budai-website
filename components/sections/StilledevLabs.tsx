"use client";

import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevMark } from "@/components/ui/BudAILogo";
import LabsMascot from "@/components/sections/LabsMascot";

/** The work behind Labs is intentionally not rendered while the studio is being built. */
export default function StilledevLabs() {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const home = sv ? "/sv" : "/";
  const builder = `${home}#stilledev-labs`;
  return <main id="main" className="labs-wait">
    <div className="labs-wait-shell">
      <header className="labs-wait-header">
        <a href={home} className="labs-wait-brand" aria-label={sv ? "Tillbaka till BudAI" : "Back to BudAI"}><StilledevMark size={30} /><span>Labs<span>.</span><small>STILLEDEV EF</small></span></a>
        <div className="labs-wait-header-right"><div className="labs-wait-lang" role="group" aria-label={sv ? "Språk" : "Language"}><a href="/labs" onClick={() => setLang("en")} aria-current={!sv ? "page" : undefined}>EN</a><a href="/sv/labs" onClick={() => setLang("sv")} aria-current={sv ? "page" : undefined}>SV</a></div><a href={home} className="labs-wait-back"><ArrowLeft size={15} /> {sv ? "Tillbaka till BudAI" : "Back to BudAI"}</a></div>
      </header>
      <section className="labs-wait-hero" aria-labelledby="labs-wait-title">
        <div className="labs-wait-copy"><div className="labs-wait-status"><span /> {sv ? "UNDER UTVECKLING" : "UNDER DEVELOPMENT"} <b> / LABS</b></div><h1 id="labs-wait-title">{sv ? <>Något kul<br /><em>är på gång.</em></> : <>Something good<br /><em>is brewing.</em></>}</h1><p className="labs-wait-lead">{sv ? "Labs är inte riktigt redo för besök än." : "Labs isn’t quite ready for visitors yet."}</p><p>{sv ? "Vår lilla byggrobot har fullt upp med att skruva, koda och försöka hitta sin kaffekopp. Titta in igen en annan gång — tills dess får nyfikenheten vila lite." : "Our little builder bot is busy tinkering, coding and looking for its coffee mug. Come back another time — until then, curiosity will have to wait a little."}</p><a className="labs-wait-cta" href={builder}>{sv ? "Tillbaka till Builder" : "Back to Builder"} <ArrowUpRight size={16} /></a><div className="labs-wait-footnote"><Sparkles size={14} /> {sv ? "KOD, KAFFE & LITE TÅLAMOD" : "CODE, COFFEE & A LITTLE PATIENCE"}</div></div>
        <div className="labs-wait-art"><div className="labs-wait-art-grid" /><LabsMascot /><div className="labs-wait-art-caption"><span /> {sv ? "BYGGROBOTEN / JOBBAR PÅ DET" : "BUILDER BOT / ON THE JOB"}</div><span className="labs-wait-coordinate" aria-hidden="true">01 / LABS</span></div>
      </section>
      <footer className="labs-wait-footer"><span>STILLEDEV EF / LABS</span><span>{sv ? "VI SES SNART" : "SEE YOU SOON"} ✳</span></footer>
    </div>
  </main>;
}
