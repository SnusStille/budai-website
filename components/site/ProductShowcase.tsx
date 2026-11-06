"use client";

import Image from "next/image";
import { ArrowRight, Check, MessageSquareText, PanelsTopLeft, BrainCircuit } from "lucide-react";
import { useRef, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";

const VIEWS = [
  {
    id: "conversation",
    icon: MessageSquareText,
    label: { en: "Conversations", sv: "Samtal" },
    title: { en: "Start with what you have.", sv: "Börja med det du har." },
    description: {
      en: "Ask a question, paste rough notes or attach an image. BudAI responds in Swedish or English with dedicated modes for writing, structured research, creation and analysis.",
      sv: "Ställ en fråga, klistra in röriga anteckningar eller bifoga en bild. BudAI svarar på svenska eller engelska med särskilda lägen för skrivande, strukturerad research, skapande och analys.",
    },
    bullets: {
      en: ["Streaming replies and editable follow-ups", "Writer, Analyst, Coder and Translator personas", "Research mode structures analysis; it does not search the web"],
      sv: ["Strömmande svar och redigerbara uppföljningar", "Lägen för Skribent, Analytiker, Kodare och Översättare", "Research strukturerar analysen men söker inte på webben"],
    },
    image: "/images/product/budai-chat.webp",
    alt: { en: "BudAI conversation interface and starting workflows", sv: "BudAI:s samtalsyta och startpunkter för arbetsflöden" },
    prompt: { en: "Turn these meeting notes into a concise follow-up with decisions, action items and open questions: ", sv: "Gör dessa mötesanteckningar till ett kort uppföljningsmejl med beslut, åtgärder och öppna frågor: " },
  },
  {
    id: "workspace",
    icon: PanelsTopLeft,
    label: { en: "Workspace", sv: "Workspace" },
    title: { en: "Keep the thinking. Finish the work.", sv: "Behåll tanken. Slutför arbetet." },
    description: {
      en: "Longer answers open beside the conversation as a real draft. Edit the text, preview the result and keep refining it without losing the original thread.",
      sv: "Längre svar öppnas bredvid samtalet som ett riktigt utkast. Redigera texten, förhandsgranska resultatet och fortsätt förfina det utan att tappa den ursprungliga tråden.",
    },
    bullets: {
      en: ["Edit, preview and save a local draft", "Improve, translate or turn selections into checklists", "Export to Markdown, Word or PDF, or create a read-only share link"],
      sv: ["Redigera, förhandsgranska och spara ett lokalt utkast", "Förbättra, översätt eller gör markeringar till checklistor", "Exportera till Markdown, Word eller PDF, eller skapa en skrivskyddad delningslänk"],
    },
    image: "/images/product/budai-workspace.webp",
    alt: { en: "BudAI Workspace with a prepared launch follow-up draft", sv: "BudAI Workspace med ett förberett exempel på uppföljningsutkast" },
    prompt: { en: "Create a project launch checklist with communications, owner review and final quality checks.", sv: "Skapa en checklista för projektlansering med kommunikation, ansvarig granskning och slutlig kvalitetskontroll." },
  },
  {
    id: "memory",
    icon: BrainCircuit,
    label: { en: "Memory & control", sv: "Minne & kontroll" },
    title: { en: "Useful context, under your control.", sv: "Användbar kontext, under din kontroll." },
    description: {
      en: "With a free account, BudAI can remember durable preferences between conversations. Memory is on by default for accounts, but it is never hidden from you.",
      sv: "Med ett gratiskonto kan BudAI minnas beständiga preferenser mellan samtal. Minnet är på som standard för konton, men det är aldrig dolt för dig.",
    },
    bullets: {
      en: ["See, add, edit and delete individual memories", "Turn memory off or use a temporary chat", "Guest conversations and routines stay in your browser"],
      sv: ["Se, lägg till, redigera och radera enskilda minnen", "Stäng av minnet eller använd ett tillfälligt samtal", "Gästsamtal och rutiner stannar i din webbläsare"],
    },
    image: "/images/product/budai-memory.webp",
    alt: { en: "BudAI memory panel explaining account memory controls", sv: "BudAI:s minnespanel med konton och kontroller för minne" },
    prompt: { en: "Help me describe how I prefer your answers to be structured and written.", sv: "Hjälp mig beskriva hur jag vill att dina svar ska struktureras och skrivas." },
  },
] as const;

export default function ProductShowcase() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const view = VIEWS[active];
  const Icon = view.icon;

  const tryPrompt = () => {
    window.dispatchEvent(new CustomEvent("budai:prompt", { detail: view.prompt[lang] }));
    document.getElementById("playground")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const onTabKey = (event: React.KeyboardEvent, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? VIEWS.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + VIEWS.length) % VIEWS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id="signal" className="v2-section v2-product-story" aria-labelledby="product-story-title">
      <span id="product-story" className="v2-anchor" aria-hidden="true" />
      <div className="v2-container">
        <ScrollReveal>
          <div className="v2-section-heading v2-split-heading">
            <div>
              <p className="v2-kicker">01 · {sv ? "PRODUKTEN" : "THE PRODUCT"}</p>
              <h2 id="product-story-title">{sv ? "Från första tanke till färdigt utkast." : "From first thought to finished draft."}</h2>
            </div>
            <p>{sv ? "En sammanhängande arbetsyta i stället för en samling lösa AI-verktyg. Det du ser här är den verkliga produkten — inte en konceptbild." : "One continuous workspace instead of a collection of disconnected AI tools. What you see here is the real product—not a concept mockup."}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="v2-showcase" delay={0.08}>
          <div className="v2-showcase-tabs" role="tablist" aria-label={sv ? "Produktvyer" : "Product views"}>
            {VIEWS.map((item, index) => {
              const TabIcon = item.icon;
              return (
                <button
                  key={item.id}
                  ref={(node) => { tabs.current[index] = node; }}
                  type="button"
                  role="tab"
                  id={`product-tab-${item.id}`}
                  aria-selected={active === index}
                  aria-controls={`product-panel-${item.id}`}
                  tabIndex={active === index ? 0 : -1}
                  className={active === index ? "is-active" : ""}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >
                  <TabIcon size={16} /><span>{item.label[lang]}</span><span className="v2-tab-number" aria-hidden="true">0{index + 1}</span>
                </button>
              );
            })}
          </div>

          <div className="v2-showcase-panel" role="tabpanel" id={`product-panel-${view.id}`} aria-labelledby={`product-tab-${view.id}`} key={view.id}>
            <div className="v2-showcase-copy">
              <p className="v2-showcase-icon"><Icon size={19} /></p>
              <h3>{view.title[lang]}</h3>
              <p>{view.description[lang]}</p>
              <ul>{view.bullets[lang].map((bullet) => <li key={bullet}><Check size={14} />{bullet}</li>)}</ul>
              <button type="button" className="v2-text-link" onClick={tryPrompt}>{sv ? "Prova ett arbetsflöde" : "Try a workflow"}<ArrowRight size={15} /></button>
            </div>
            <div className="v2-showcase-media">
              <Image src={view.image} alt={view.alt[lang]} width={1392} height={881} sizes="(max-width: 900px) 92vw, 58vw" />
              <p>{sv ? "Verkligt gränssnitt · Workspace visar ett förberett exempel" : "Actual interface · Workspace uses a prepared example"}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
