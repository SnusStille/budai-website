"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Cookie, Sparkles, Hand, Eye, PartyPopper, Lightbulb, Coffee } from "lucide-react";
import { openCookieSettings } from "@/lib/consent";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevMark } from "@/components/ui/BudAILogo";
import LabsMascot, { type MascotGesture } from "@/components/sections/LabsMascot";

type Emote = MascotGesture["kind"];
const EMOTES: { kind: Emote; en: string; sv: string; icon: typeof Hand }[] = [
  { kind: "hello", en: "Wave", sv: "Vinka", icon: Hand },
  { kind: "wink", en: "Wink", sv: "Blinka", icon: Eye },
  { kind: "celebrate", en: "Celebrate", sv: "Fira", icon: PartyPopper },
  { kind: "think", en: "Think", sv: "Fundera", icon: Lightbulb },
];
const LINES: Record<Emote, { en: string; sv: string; moodEn: string; moodSv: string }> = {
  hello: { en: "Hi! I'm the Builder Bot. Hard hat on — building in progress!", sv: "Hej! Jag är Byggroboten. Hjälmen är på — bygge pågår!", moodEn: "SAYING HI", moodSv: "HÄLSAR" },
  wink: { en: "Don't tell anyone… the coffee machine is my best friend.", sv: "Berätta inte för någon… kaffemaskinen är min bästa vän.", moodEn: "BEING CHEEKY", moodSv: "ÄR BUSIG" },
  celebrate: { en: "Another bolt tightened! Labs is still in development.", sv: "En bult till åtdragen! Labs är fortfarande under utveckling.", moodEn: "CELEBRATING", moodSv: "FIRAR" },
  think: { en: "Hmm… if I move this wall, the whole idea gets bigger. Noted!", sv: "Hmm… flyttar jag den här väggen blir hela idén större. Noterat!", moodEn: "THINKING", moodSv: "FUNDERAR" },
};
const IDLE = { en: "Our little builder bot is busy tinkering, coding and looking for its coffee mug. Come back another time — until then, curiosity will have to wait a little. Psst — try the buttons, it loves attention.", sv: "Vår lilla byggrobot har fullt upp med att skruva, koda och försöka hitta sin kaffekopp. Titta in igen en annan gång — tills dess får nyfikenheten vila lite. Psst — prova knapparna, den älskar uppmärksamhet." };

/** Labs holding page — now with a living Builder Bot: hard hat, wrench, emotes and speech. */
export default function StilledevLabs() {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const home = sv ? "/sv" : "/";
  const playground = sv ? "/sv#playground" : "/#playground";
  const profile = sv ? "/sv/oliver-stille" : "/oliver-stille";
  const builder = `${home}#stilledev-labs`;
  const [gesture, setGesture] = useState<MascotGesture | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [mood, setMood] = useState<{ en: string; sv: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const counter = useRef(0);

  const emote = useCallback((kind: Emote) => {
    counter.current += 1;
    setGesture({ id: counter.current, kind });
    const l = LINES[kind];
    setLine(sv ? l.sv : l.en);
    setMood({ en: l.moodEn, sv: l.moodSv });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setLine(null); setMood(null); }, 4200);
  }, [sv]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // A friendly wave shortly after arrival (respects reduced motion via the mascot itself).
  useEffect(() => { const id = window.setTimeout(() => emote("hello"), 900); return () => window.clearTimeout(id); }, [emote]);

  return <main id="main" className="labs-wait">
    <div className="labs-wait-shell">
      <header className="labs-wait-header">
        <a href={home} className="labs-wait-brand" aria-label={sv ? "Tillbaka till BudAI" : "Back to BudAI"}><StilledevMark size={30} /><span>Labs<span>.</span><small>STILLEDEV EF</small></span></a>
        <div className="labs-wait-header-right"><div className="labs-wait-lang" role="group" aria-label={sv ? "Språk" : "Language"}><a href="/labs" onClick={() => setLang("en")} aria-current={!sv ? "page" : undefined}>EN</a><a href="/sv/labs" onClick={() => setLang("sv")} aria-current={sv ? "page" : undefined}>SV</a></div><a href={home} className="labs-wait-back"><ArrowLeft size={15} /> {sv ? "Tillbaka till BudAI" : "Back to BudAI"}</a></div>
      </header>
      <section className="labs-wait-hero" aria-labelledby="labs-wait-title">
        <div className="labs-wait-copy"><div className="labs-wait-status"><span /> {sv ? "UNDER UTVECKLING" : "UNDER DEVELOPMENT"} <b> / LABS</b></div><h1 id="labs-wait-title">Stilledev<br /><em>Labs.</em></h1><p className="labs-wait-lead">{sv ? "Digital utveckling och praktisk AI, under utveckling." : "Digital development and practical AI, in progress."}</p><p>{sv ? IDLE.sv : IDLE.en}</p>
          <div className="labs-bot-actions" role="group" aria-label={sv ? "Lek med byggroboten" : "Play with the Builder Bot"}>
            {EMOTES.map(({ kind, en, sv: svLabel, icon: Icon }) => (
              <button key={kind} type="button" onClick={() => emote(kind)} className="labs-bot-action"><Icon size={14} /> {sv ? svLabel : en}</button>
            ))}
          </div>
          <a className="labs-wait-cta" href={builder}>{sv ? "Tillbaka till Builder" : "Back to Builder"} <ArrowUpRight size={16} /></a><div className="labs-wait-footnote"><Sparkles size={14} /> {sv ? "KOD, KAFFE & LITE TÅLAMOD" : "CODE, COFFEE & A LITTLE PATIENCE"} <Coffee size={13} /></div></div>
        <div className="labs-wait-art"><div className="labs-wait-art-grid" />
          <button type="button" className="labs-bot-stage" onClick={() => emote(EMOTES[counter.current % EMOTES.length].kind)} aria-label={sv ? "Peta på byggroboten" : "Poke the Builder Bot"}>
            <LabsMascot hardHat gesture={gesture} />
          </button>
          <div className={`labs-bot-bubble ${line ? "is-visible" : ""}`} role="status" aria-live="polite">{line || (sv ? "…" : "…")}</div>
          <div className="labs-wait-art-caption"><span /> {sv ? "BYGGROBOTEN" : "BUILDER BOT"} / {mood ? (sv ? mood.sv : mood.en) : (sv ? "JOBBAR PÅ DET · NU MED HJÄLM & SKIFTNYCKEL" : "ON THE JOB · NOW WITH HARD HAT & WRENCH")}</div><span className="labs-wait-coordinate" aria-hidden="true">01 / LABS</span></div>
      </section>
      <section className="labs-wait-details" aria-labelledby="labs-details-title">
        <p className="labs-wait-details-kicker">{sv ? "STILLEDEV · DIGITAL UTVECKLING & AI" : "STILLEDEV · DIGITAL DEVELOPMENT & AI"}</p>
        <h2 id="labs-details-title">{sv ? "Vad som byggs" : "What we are building"}</h2>
        <p className="labs-wait-details-intro">{sv
          ? "Stilledev Labs är en experimentyta för digitala produkter och praktisk AI. Arbetet visas här när det är redo att delas offentligt."
          : "Stilledev Labs is an experimental space for digital products and practical AI. Work will be described here when it is ready to share publicly."}</p>
        <div className="labs-wait-details-grid">
          <article><span>{sv ? "ÖPPEN FÖRHANDSVISNING" : "PUBLIC PREVIEW"}</span><h3>BudAI</h3><p>{sv
            ? "Den publika produkten idag: en AI-arbetsyta för skrivande, planering och analys på svenska och engelska."
            : "The public product today: an AI workspace for writing, planning and analysis in Swedish and English."}</p><a href={playground}>{sv ? "Prova Playground" : "Try the Playground"}<ArrowUpRight size={14} aria-hidden="true" /></a></article>
          <article><span>{sv ? "OM GRUNDAREN" : "ABOUT THE FOUNDER"}</span><h3>Oliver Stille</h3><p>{sv
            ? "Läs om Stilledevs grundare, yrkeserfarenhet och offentliga professionella profiler."
            : "Read about Stilledev’s founder, professional experience and public professional profiles."}</p><a href={profile}>{sv ? "Oliver Stilles profil" : "Oliver Stille’s profile"}<ArrowUpRight size={14} aria-hidden="true" /></a></article>
        </div>
      </section>
      <footer className="labs-wait-footer"><span>STILLEDEV EF / LABS</span><button type="button" onClick={openCookieSettings} className="labs-cookie-settings"><Cookie size={13} aria-hidden="true" />{sv ? "Cookieinställningar" : "Cookie settings"}</button><span>{sv ? "VI SES SNART" : "SEE YOU SOON"} ✳</span></footer>
    </div>
  </main>;
}
