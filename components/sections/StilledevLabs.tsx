"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Box, LockKeyhole, Mail } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevMark } from "@/components/ui/BudAILogo";
import LabsSculpture from "@/components/sections/LabsSculpture";
import LabsShowcase from "@/components/sections/LabsShowcase";
import LabsLegal from "@/components/sections/LabsLegal";
import { LAB_PROJECTS } from "@/lib/stilledev-labs";

export default function StilledevLabs() {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";
  const home = sv ? "/sv" : "/";
  return (
    <main id="main" className="lab-page">
      <header className="lab-header">
        <a href={home} className="lab-back"><ArrowLeft size={15} /><span>{sv ? "Tillbaka till BudAI" : "Back to BudAI"}</span></a>
        <a href="#top" className="lab-brand" aria-label="Labs"><StilledevMark size={21} /><span>LABS<span className="lab-brand-dot">.</span></span></a>
        <div className="lab-header-right">
          <nav className="lab-header-nav" aria-label={sv ? "Labs navigering" : "Labs navigation"}>
            <a href="#projects">{sv ? "Projekt" : "Projects"}</a><a href="#about-labs">{sv ? "Om" : "About"}</a><a href="#contact">{sv ? "Kontakt" : "Contact"}</a>
          </nav>
          <div className="lab-lang" role="group" aria-label={sv ? "Språk" : "Language"}>
            <a href="/labs" onClick={() => setLang("en")} aria-current={!sv ? "page" : undefined}>EN</a>
            <a href="/sv/labs" onClick={() => setLang("sv")} aria-current={sv ? "page" : undefined}>SV</a>
          </div>
        </div>
      </header>

      <section className="lab-hero lab-wrap" id="top">
        <div className="lab-hero-copy">
          <div className="lab-eyebrow"><span /> {sv ? "ETT OBEROENDE DIGITALT LABB" : "AN INDEPENDENT DIGITAL LAB"} <b> / 01</b></div>
          <h1>Labs<span>.</span><br /><em>{sv ? "Idéer i rörelse." : "Ideas in motion."}</em></h1>
          <p>{sv ? "En plats där idéer blir till genomtänkt mjukvara. Byggt av Oliver Stille, i Sverige." : "A place where ideas become thoughtful software. Built by Oliver Stille, in Sweden."}</p>
          <div className="lab-hero-actions"><a className="lab-primary" href="#projects">{sv ? "Utforska projekten" : "Explore the projects"}<ArrowDown size={16} /></a><a className="lab-text-link" href="#about-labs">{sv ? "Om Labs" : "About Labs"}<ArrowRight size={15} /></a></div>
        </div>
        <div className="lab-hero-visual"><LabsSculpture /><div className="lab-visual-caption"><span>01 / {sv ? "FORM & FUNKTION" : "FORM & FUNCTION"}</span><span>{sv ? "SKAPAT FÖR ATT BYGGA" : "MADE TO BUILD"}</span></div></div>
        <div className="lab-hero-bottom"><span>STILLEDEV / LABS</span><span>{sv ? "UTFORSKA NEDÅT" : "SCROLL TO EXPLORE"} ↓</span><span>SV / EN</span></div>
      </section>

      <section className="lab-project-section lab-wrap" id="projects" aria-labelledby="projects-title">
        <div className="lab-section-intro"><div><div className="lab-eyebrow"><span /> {sv ? "UTVALT ARBETE" : "SELECTED WORK"} <b> / 02</b></div><h2 id="projects-title">{sv ? "Byggt med avsikt." : "Made with intention."}</h2></div><p>{sv ? "Ett urval av idéer och produkter. Projektlänkar delas inte här." : "A selection of ideas and products. Project links are not shared here."}</p></div>
        <LabsShowcase sv={sv} />
        <div className="lab-index-heading"><span>{sv ? "FLER PROJEKT" : "THE PROJECT INDEX"}</span><span>05 / 05</span></div>
        <div className="lab-project-list">
          {LAB_PROJECTS.map((project, index) => <article className="lab-project-row" key={project.name}>
            <span className="lab-project-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="lab-project-symbol" aria-hidden="true"><Box size={19} strokeWidth={1.2} /></div>
            <div className="lab-project-title"><h3>{project.name}</h3><span>{sv ? project.type.sv : project.type.en}</span></div>
            <p>{sv ? project.description.sv : project.description.en}</p>
            <span className="lab-private"><LockKeyhole size={12} />{sv ? "INGEN LÄNK" : "NO LINK"}</span>
          </article>)}
        </div>
        <div className="lab-project-foot"><span><LockKeyhole size={13} /> {sv ? "Projektens länkar hålls privata." : "Project links are kept private."}</span><span>{String(LAB_PROJECTS.length).padStart(2, "0")} / {String(LAB_PROJECTS.length).padStart(2, "0")}</span></div>
      </section>

      <section className="lab-about lab-wrap" id="about-labs" aria-labelledby="about-labs-title">
        <div className="lab-about-card">
          <div className="lab-about-visual" aria-hidden="true"><div className="lab-monogram"><StilledevMark size={57} /></div><span>O.S / STILLEDEV</span><i /></div>
          <div className="lab-about-copy"><div className="lab-eyebrow"><span /> {sv ? "MÄNNISKAN BAKOM" : "THE PERSON BEHIND"} <b> / 03</b></div><h2 id="about-labs-title">{sv ? "Hej, jag är Oliver." : "Hello, I’m Oliver."}</h2><p>{sv ? "Jag bygger digitala produkter, AI-verktyg och webbupplevelser med omsorg om både detaljerna och helheten." : "I build digital products, AI tools and web experiences with care for the details and the bigger picture."}</p><div className="lab-about-tags"><span>AI & SOFTWARE</span><span>DESIGN & DEVELOPMENT</span><span>SWEDEN / SV + EN</span></div></div>
        </div>
      </section>

      <section className="lab-services lab-wrap" id="services" aria-labelledby="services-title">
        <div className="lab-section-intro"><div><div className="lab-eyebrow"><span /> {sv ? "VAD JAG KAN BYGGA" : "WHAT I CAN BUILD"} <b> / 04</b></div><h2 id="services-title">{sv ? "Från idé till verklighet." : "From idea to reality."}</h2></div><p>{sv ? "Skräddarsytt efter din idé, ditt projekt och dina mål." : "Thoughtfully tailored to your idea, your project and your goals."}</p></div>
        <div className="lab-service-grid">
          <article><span>01 / AI</span><h3>{sv ? "AI & verktyg" : "AI & tools"}</h3><p>{sv ? "Smarta verktyg och digitala arbetsflöden." : "Thoughtful tools and digital workflows."}</p></article>
          <article><span>02 / SOFTWARE</span><h3>{sv ? "Digitala produkter" : "Digital products"}</h3><p>{sv ? "Mjukvara som formas efter verkliga behov." : "Software shaped around real needs."}</p></article>
          <article><span>03 / WEB</span><h3>{sv ? "Webbupplevelser" : "Web experiences"}</h3><p>{sv ? "Webbplatser med fokus på form och funktion." : "Websites balancing form and function."}</p></article>
          <article className="lab-service-highlight"><span>04 / CUSTOM</span><h3>{sv ? "Spelscript & webb" : "Game scripts & websites"}</h3><p>{sv ? "Skräddarsydda script för GTA 5 och Roblox, samt webbplatser för ditt projekt." : "Custom scripts for GTA 5 and Roblox, plus websites for your project."}</p><a href="mailto:Stilleinc@hotmail.com">{sv ? "Berätta om din idé" : "Tell me about your idea"} <ArrowUpRight size={14} /></a></article>
        </div>
      </section>

      <section className="lab-business lab-wrap" id="business" aria-labelledby="business-title">
        <div className="lab-section-intro"><div><div className="lab-eyebrow"><span /> {sv ? "ATT ARBETA TILLSAMMANS" : "WORKING TOGETHER"} <b> / 04</b></div><h2 id="business-title">{sv ? "Tydligt från början." : "Clear from the start."}</h2></div><p>{sv ? "Praktisk information för uppdrag och samarbeten." : "The practical details for projects and partnerships."}</p></div>
        <div className="lab-business-grid">
          <article><span className="lab-business-index">01 / {sv ? "FÖRETAG" : "COMPANY"}</span><h3>{sv ? "Svensk enskild firma" : "Swedish sole proprietorship"}</h3><p>{sv ? "Stilledev är en enskild firma. Juridiskt namn och registreringsuppgifter behöver bekräftas." : "Stilledev is a sole proprietorship. Its legal name and registration details are to be confirmed."}</p></article>
          <article><span className="lab-business-index">02 / {sv ? "BETALNING" : "PAYMENT"}</span><h3>{sv ? "Avtalas per uppdrag" : "Agreed per project"}</h3><p>{sv ? "Pris, betalningssätt, förfallodatum och eventuell moms diskuteras och anges i offert eller avtal." : "Price, payment method, due date and any applicable VAT are discussed and set out in a quote or agreement."}</p></article>
          <article><span className="lab-business-index">03 / {sv ? "REGLER" : "LEGAL"}</span><h3>{sv ? "Svenska & EU-regler" : "Swedish & EU rules"}</h3><p>{sv ? "Fakturering krävs normalt vid försäljning till företag; moms beror på uppdraget. GDPR ställer krav på bland annat rättslig grund och skydd för personuppgifter." : "Business sales normally require an invoice; VAT depends on the transaction. GDPR requires, among other things, a lawful basis and protection of personal data when applicable."}</p><div className="lab-authority-links"><a href={sv ? "https://www.skatteverket.se/foretag/moms/saljavarorochtjanster/momslagensregleromfakturering.4.58d555751259e4d66168000403.html" : "https://www.skatteverket.se/servicelankar/otherlanguages/inenglish/businessesandemployers/nonswedishbusinesseswithoperationsinsweden/questionsandanswers.4.676f4884175c97df4191ec1.html?q=invoicing"} target="_blank" rel="noopener noreferrer">Skatteverket <ArrowUpRight size={12} /></a><a href={sv ? "https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/grundlaggande-principer/" : "https://www.imy.se/en/organisations/data-protection/this-applies-accordning-to-gdpr/the-gdpr-fundamental-principles/"} target="_blank" rel="noopener noreferrer">IMY / GDPR <ArrowUpRight size={12} /></a></div></article>
        </div>
        <LabsLegal />
        <p className="lab-business-note">{sv ? "Allmän information, inte juridisk eller skatterådgivning. Villkor och tillämpliga regler beror på uppdraget." : "General information, not legal or tax advice. Terms and applicable rules depend on the project."}</p>
      </section>

      <section className="lab-contact lab-wrap" id="contact">
        <div className="lab-contact-card"><div><div className="lab-eyebrow"><span /> {sv ? "NÄSTA STEG" : "THE NEXT STEP"} <b> / 05</b></div><h2>{sv ? "Har du en idé?" : "Have an idea?"}<br /><em>{sv ? "Låt oss prata." : "Let’s talk."}</em></h2><p>{sv ? "För projekt, samarbeten eller en enkel fråga." : "For projects, collaborations, or a simple question."}</p></div><a className="lab-contact-button" href="mailto:Stilleinc@hotmail.com"><Mail size={17} /><span>Stilleinc@hotmail.com</span><ArrowUpRight size={16} /></a></div>
      </section>
      <footer className="lab-footer lab-wrap"><span><StilledevMark size={17} /> LABS / STILLEDEV</span><span>{sv ? "BYGGT I SVERIGE" : "BUILT IN SWEDEN"}</span><a href={home}>{sv ? "TILLBAKA TILL BUDAI" : "BACK TO BUDAI"} <ArrowUpRight size={13} /></a></footer>
    </main>
  );
}
