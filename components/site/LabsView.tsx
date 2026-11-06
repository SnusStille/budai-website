"use client";

import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Beaker, Code2, Github, Layers3, Network, Plus } from "lucide-react";
import PageHero from "./PageHero";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo from "@/components/ui/BudAILogo";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function LabsView() {
  const { lang } = useLang();
  const sv = lang === "sv";
  return (
    <main id="main" tabIndex={-1} className="v2-main">
      <PageHero
        kicker={{ en: "PROJECTS / STILLEDEV LABS", sv: "PROJEKT / STILLEDEV LABS" }}
        title={{ en: "Products, experiments and what comes next.", sv: "Produkter, experiment och det som kommer härnäst." }}
        description={{ en: "BudAI is Stilledev’s primary product. Labs is the wider space for the visual systems, engineering experiments and future ideas that can grow beyond it.", sv: "BudAI är Stilledevs huvudprodukt. Labs är det bredare utrymmet för visuella system, tekniska experiment och framtida idéer som kan växa bortom den." }}
      >
        <a href="https://github.com/SnusStille/budai-website" target="_blank" rel="noopener noreferrer" className="v2-text-link">{sv ? "Utforska källkoden" : "Explore the source"}<Github size={15} /></a>
      </PageHero>

      <div className="v2-container v2-labs-content">
        <ScrollReveal className="v2-featured-project">
          <div className="v2-featured-project-copy">
            <p className="v2-kicker">01 · {sv ? "HUVUDPRODUKT" : "PRIMARY PRODUCT"}</p>
            <div className="v2-project-title"><BudAILogo size="md" /><h2>BudAI</h2></div>
            <h3>{sv ? "En intelligent arbetsyta för arbete på svenska och engelska." : "An intelligent workspace for Swedish and English work."}</h3>
            <p>{sv ? "Från streaming-samtal och bildförståelse till minneskontroller och redigerbara Workspace-utkast. BudAI är en öppen utvecklarpreview som kan användas idag." : "From streaming conversations and image understanding to memory controls and editable Workspace drafts. BudAI is an open developer preview you can use today."}</p>
            <div className="v2-project-tech"><span>Next.js</span><span>TypeScript</span><span>Supabase</span><span>Anthropic</span></div>
            <div className="v2-page-actions"><Link href="/budai" className="v2-button v2-button-primary">{sv ? "Utforska BudAI" : "Explore BudAI"}<ArrowRight size={15} /></Link><Link href="/roadmap" className="v2-text-link">{sv ? "Se roadmap" : "View roadmap"}<ArrowUpRight size={14} /></Link></div>
          </div>
          <div className="v2-featured-project-media"><NextImage src="/images/product/budai-workspace.webp" alt={sv ? "BudAI Workspace med samtal och redigerbart utkast" : "BudAI Workspace with conversation and editable draft"} width={1392} height={881} sizes="(max-width: 900px) 92vw, 48vw" /><span>{sv ? "VERKLIG PRODUKT · UTVECKLARPREVIEW" : "REAL PRODUCT · DEVELOPER PREVIEW"}</span></div>
        </ScrollReveal>

        <div className="v2-lab-grid">
          <ScrollReveal>
            <article className="v2-lab-card v2-lab-card-neural">
              <div className="v2-lab-visual" aria-hidden="true"><NextImage src="/brain/entry-desktop.webp" alt="" fill sizes="(max-width: 900px) 100vw, 50vw" /><BudAILogo size="lg" /></div>
              <div className="v2-lab-card-content"><p className="v2-kicker">02 · {sv ? "VISUELLT SYSTEM" : "VISUAL SYSTEM"}</p><Network size={21} /><h2>Confluence</h2><h3>{sv ? "En neural identitet, inte en generisk AI-symbol." : "A neural identity, not a generic AI symbol."}</h3><p>{sv ? "BudAI:s särpräglade märke, neuralkärna och rörelsespråk utforskar hur intelligens kan visualiseras med teknisk precision utan att överrösta produkten." : "BudAI’s distinctive mark, neural core and motion language explore how intelligence can be visualized with technical precision without overwhelming the product."}</p><div className="v2-lab-meta"><span>{sv ? "Används på sajten" : "Live on this site"}</span><a href="https://github.com/SnusStille/budai-website/tree/main/lib/experience" target="_blank" rel="noopener noreferrer">{sv ? "Se implementationen" : "View implementation"}<ArrowUpRight size={13} /></a></div></div>
            </article>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <article className="v2-lab-card">
              <div className="v2-lab-card-content"><p className="v2-kicker">03 · {sv ? "ÖPPEN TEKNIK" : "OPEN ENGINEERING"}</p><Code2 size={21} /><h2>{sv ? "Byggt i det öppna." : "Built in the open."}</h2><h3>{sv ? "Produktytan och dess teknik kan granskas." : "The product surface and its engineering can be inspected."}</h3><p>{sv ? "Webbplatsens kod är publik på GitHub: Next.js-gränssnittet, Playground-flödet, integrationerna, säkerhetsarbetet och de verkliga webbläsartesterna. Källkoden är tillgänglig för granskning utan ett påstående om en specifik öppen licens." : "The website code is public on GitHub: the Next.js interface, Playground flow, integrations, security work and real browser tests. Source is available for inspection without implying a specific open-source license."}</p><div className="v2-lab-meta"><span>GitHub · SnusStille</span><a href="https://github.com/SnusStille/budai-website" target="_blank" rel="noopener noreferrer">{sv ? "Öppna repositoryt" : "Open repository"}<ArrowUpRight size={13} /></a></div></div>
              <div className="v2-code-fragment" aria-hidden="true"><span>STILLEDEV / BUILD LOG</span><code><i>const</i> principle = {"{"}<br />&nbsp;&nbsp;product: <b>&quot;before decoration&quot;</b>,<br />&nbsp;&nbsp;claims: <b>&quot;verifiable&quot;</b>,<br />&nbsp;&nbsp;details: <b>&quot;considered&quot;</b><br />{"}"};</code><small><Layers3 size={13} />DESIGN + ENGINEERING</small></div>
            </article>
          </ScrollReveal>
        </div>

        <ScrollReveal className="v2-labs-future">
          <Beaker size={26} /><div><p className="v2-kicker">{sv ? "NÄSTA EXPERIMENT" : "THE NEXT EXPERIMENT"}</p><h2>{sv ? "Nya projekt visas när de är verkliga." : "New projects appear when they are real."}</h2><p>{sv ? "Labs är avsiktligt inte fyllt med koncept som ser färdiga ut. Framtida Stilledev-experiment får sin plats här när det finns något konkret att visa, testa eller lära av." : "Labs is deliberately not filled with concepts made to look finished. Future Stilledev experiments belong here when there is something concrete to show, test or learn from."}</p></div><a href="mailto:Stilleinc@hotmail.com?subject=Stilledev%20Labs" className="v2-button v2-button-secondary"><Plus size={15} />{sv ? "Diskutera en idé" : "Discuss an idea"}</a>
        </ScrollReveal>
      </div>
    </main>
  );
}
