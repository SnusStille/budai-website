"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Sparkles, Hand, Eye, PartyPopper, Lightbulb, Coffee } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevMark } from "@/components/ui/BudAILogo";
import LabsBrief from "@/components/sections/LabsBrief";
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
  celebrate: { en: "Another bolt tightened! Thanks for exploring Labs.", sv: "En bult till åtdragen! Tack för att du utforskar Labs.", moodEn: "CELEBRATING", moodSv: "FIRAR" },
  think: { en: "Hmm… if I move this wall, the whole idea gets bigger. Noted!", sv: "Hmm… flyttar jag den här väggen blir hela idén större. Noterat!", moodEn: "THINKING", moodSv: "FUNDERAR" },
};
const IDLE = { en: "Explore the directions behind the work, try BudAI, or get in touch about an idea. Labs will continue to evolve as new work is ready to share.", sv: "Utforska riktningarna bakom arbetet, prova BudAI eller hör av dig med en idé. Labs fortsätter att utvecklas när nytt arbete är redo att visas." };

/** Labs holding page — now with a living Builder Bot: hard hat, wrench, emotes and speech. */
export default function StilledevLabs({ phone = false }: { phone?: boolean }) {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const home = sv ? "/sv" : "/";
  const builder = phone ? `${home}#about` : `${home}#stilledev-labs`;
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
        <div className="labs-wait-copy"><div className="labs-wait-status"><span /> {sv ? "UNDER UTVECKLING" : "UNDER DEVELOPMENT"} <b> / LABS</b></div><h1 id="labs-wait-title">{sv ? <>Idéer tar<br /><em>form här.</em></> : <>Where ideas<br /><em>take shape.</em></>}</h1><p className="labs-wait-lead">{sv ? "En öppen inblick i Stilledevs arbete." : "An open look at the work behind Stilledev."}</p><p>{sv ? IDLE.sv : IDLE.en}</p>
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
      <section className="labs-index" aria-labelledby="labs-index-title">
        <div className="labs-index-intro">
          <span>STILLEDEV / LABS</span>
          <h2 id="labs-index-title">{sv ? "En plats för idéer i arbete." : "A place for ideas in progress."}</h2>
          <p>{sv ? "Labs samlar Stilledevs produkter, experiment och sätt att utveckla digitala verktyg. Innehållet växer i takt med arbetet." : "Labs brings together Stilledev’s products, experiments and approach to building digital tools. This space will grow with the work."}</p>
        </div>
        <ol className="labs-index-list">
          {[
            ["Products", sv ? "Egna produkter och plattformar. BudAI är tillgängligt att prova i Playground." : "Independent products and platforms. Try BudAI in the Playground.", `${home}#playground`, sv ? "Prova BudAI" : "Try BudAI"],
            ["Experiments", sv ? "Prototyper och interaktiva idéer under utforskning." : "Prototypes and interactive ideas in exploration.", "", ""],
            ["Development", sv ? "Webbapplikationer, gränssnitt, integrationer och digitala verktyg." : "Web applications, interfaces, integrations and digital tools.", `${home}#about`, sv ? "Utforska Builder" : "Explore Builder"],
            ["Research", sv ? "Tekniska tester och nya metoder inom AI och automation." : "Technical testing and new approaches to AI and automation.", "", ""],
            ["Connect", sv ? "Har du en idé eller ett projekt att diskutera?" : "Have an idea or a project to discuss?", sv ? "/sv/contact" : "/contact", sv ? "Kontakta Stilledev" : "Contact Stilledev"],
          ].map(([title, description, href, label], index) => <li key={title}>
            <span className="labs-index-number">0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div>
            {href && <a href={href}>{label} <ArrowUpRight size={15} /></a>}
          </li>)}
        </ol>
      </section>
      <section className="labs-feature" aria-labelledby="labs-feature-title">
        <div className="labs-feature-intro"><span className="labs-section-label">01 / {sv ? "PRODUKT I FOKUS" : "FEATURED PRODUCT"}</span><h2 id="labs-feature-title">BudAI<span>.</span></h2><p>{sv ? "En AI-arbetsyta utvecklad av Stilledev – från idé och text till nästa steg." : "An AI workspace developed by Stilledev – from ideas and writing to the next step."}</p><a className="labs-feature-link" href={`${home}#playground`}>{sv ? "Öppna Playground" : "Open Playground"} <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        <div className="labs-feature-detail"><div className="labs-feature-topline"><span>BUDAI / PREVIEW</span><span>{sv ? "PROVA IDAG" : "TRY IT TODAY"}</span></div><p className="labs-feature-statement">{sv ? <>En tanke.<br /><em>Flera vägar vidare.</em></> : <>One thought.<br /><em>More ways forward.</em></>}</p><div className="labs-feature-lines" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><p>{sv ? "Skriv, planera och utforska på svenska eller engelska. Prova som gäst eller logga in för fler funktioner." : "Write, plan and explore in Swedish or English. Try it as a guest or sign in for more features."}</p></div>
      </section>
      <section className="labs-process" aria-labelledby="labs-process-title">
        <div><span className="labs-section-label">02 / {sv ? "ARBETSSÄTT" : "APPROACH"}</span><h2 id="labs-process-title">{sv ? <>Från fråga till<br /><em>fungerande verktyg.</em></> : <>From a question to<br /><em>a working tool.</em></>}</h2><p>{sv ? "Ett sätt att närma sig nya idéer: börja med behovet, utforska lösningar och förbättra med återkoppling." : "A way to approach new ideas: start with the need, explore solutions and refine with feedback."}</p></div>
        <ol><li><span>01</span><div><h3>{sv ? "Förstå" : "Understand"}</h3><p>{sv ? "Vad behöver lösas, och för vem?" : "What needs solving, and for whom?"}</p></div></li><li><span>02</span><div><h3>{sv ? "Utforska" : "Explore"}</h3><p>{sv ? "Prova idéer och tekniska möjligheter." : "Explore ideas and technical possibilities."}</p></div></li><li><span>03</span><div><h3>{sv ? "Utveckla" : "Develop"}</h3><p>{sv ? "Bygg vidare på det som fungerar och förfina detaljerna." : "Build on what works and refine the details."}</p></div></li></ol>
      </section>
      <LabsBrief />
      <section className="labs-contact" aria-labelledby="labs-contact-title"><div><span className="labs-section-label">04 / CONNECT</span><h2 id="labs-contact-title">{sv ? "Har du en idé?" : "Have an idea?"}</h2><p>{sv ? "Berätta vad du vill utforska eller bygga." : "Tell us what you would like to explore or build."}</p></div><a href={sv ? "/sv/contact" : "/contact"}>{sv ? "Kontakta Stilledev" : "Contact Stilledev"} <ArrowUpRight size={18} aria-hidden="true" /></a></section>
      <footer className="labs-wait-footer"><span>STILLEDEV EF / LABS</span><span>{sv ? "BYGGT MED NYFIKENHET" : "BUILT WITH CURIOSITY"} ✳</span></footer>
    </div>
  </main>;
}
