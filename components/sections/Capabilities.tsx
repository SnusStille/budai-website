"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Brain,
  BrainCircuit,
  Gauge,
  Image as ImageIcon,
  Keyboard,
  Layers,
  Languages,
  Mic,
  PanelRight,
  PenLine,
  ShieldCheck,
  Sparkles,
  SplitSquareHorizontal,
  Workflow,
  Zap,
} from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { prefillPlayground } from "@/lib/playground/events";

type Capability = {
  title: string;
  description: string;
  example: string;
  prompt: string;
  icon: typeof PenLine;
  tone: string;
  number: string;
};

export default function Capabilities() {
  const { lang } = useLang();
  const isSv = lang === "sv";

  const cards: Capability[] = isSv
    ? [
        {
          number: "01",
          title: "Skriv",
          description: "Få fart på mejl, texter och dokument — från tom sida till ett första utkast.",
          example: "Gör den här kunduppdateringen tydlig och vänlig.",
          prompt: "Hjälp mig skriva en tydlig och vänlig uppdatering till en kund om att leveransen blir försenad en dag.",
          icon: PenLine,
          tone: "capability-card--mint",
        },
        {
          number: "02",
          title: "Tänk",
          description: "Sortera tankar, väg alternativ och hitta ett nästa steg när något känns rörigt.",
          example: "Hjälp mig jämföra två sätt att lösa problemet.",
          prompt: "Jag väljer mellan att göra en uppgift själv eller ta hjälp. Hjälp mig jämföra alternativen, riskerna och nästa steg.",
          icon: Brain,
          tone: "capability-card--lilac",
        },
        {
          number: "03",
          title: "Skapa",
          description: "Brainstorma koncept, hitta nya vinklar och utveckla en idé till något konkret.",
          example: "Ge mig tre koncept för en lugnare måndagsstart.",
          prompt: "Brainstorma fem enkla sätt att göra måndagsmötet mer fokuserat och mindre stressigt. Ge varje idé en kort förklaring.",
          icon: Sparkles,
          tone: "capability-card--peach",
        },
        {
          number: "04",
          title: "Förenkla flöden",
          description: "Bryt ner återkommande arbete i tydliga steg och upptäck vad som kan automatiseras framöver.",
          example: "Gör en enkel checklista av den här rutinen.",
          prompt: "Skapa en tydlig checklista för att förbereda ett veckomöte: samla status, fånga hinder, välja beslut och skicka uppföljning.",
          icon: Workflow,
          tone: "capability-card--blue",
        },
      ]
    : [
        {
          number: "01",
          title: "Write",
          description: "Get moving on emails, copy and documents — from a blank page to a useful first draft.",
          example: "Make this client update clear and warm.",
          prompt: "Help me write a clear, warm update to a client explaining that delivery will be one day late.",
          icon: PenLine,
          tone: "capability-card--mint",
        },
        {
          number: "02",
          title: "Think",
          description: "Sort through ideas, weigh options and find a next step when things feel tangled.",
          example: "Help me compare two ways to solve this.",
          prompt: "I'm choosing between doing a task myself or getting help. Compare the options, risks, and next steps.",
          icon: Brain,
          tone: "capability-card--lilac",
        },
        {
          number: "03",
          title: "Create",
          description: "Brainstorm concepts, find a fresh angle and turn an early idea into something concrete.",
          example: "Give me three ideas for a calmer Monday.",
          prompt: "Brainstorm five simple ways to make a Monday team meeting more focused and less stressful. Briefly explain each idea.",
          icon: Sparkles,
          tone: "capability-card--peach",
        },
        {
          number: "04",
          title: "Simplify workflows",
          description: "Break recurring work into clear steps and spot what could be automated later.",
          example: "Turn this routine into a simple checklist.",
          prompt: "Create a clear checklist for preparing a weekly team meeting: collect updates, surface blockers, choose decisions, and send a follow-up.",
          icon: Workflow,
          tone: "capability-card--blue",
        },
      ];

  const inside = isSv
    ? [
        { icon: <Zap className="h-4 w-4" />, title: "Strömmande svar", text: "Se texten växa fram i realtid och stoppa när du vill." },
        { icon: <Layers className="h-4 w-4" />, title: "Promptbibliotek", text: "Färdiga mallar för jobb, skrivande, kod och tänkande." },
        { icon: <BrainCircuit className="h-4 w-4" />, title: "Roller & minne", text: "Sex specialister och ett minne som följer med mellan chattar." },
        { icon: <ImageIcon className="h-4 w-4" />, title: "Bilder", text: "Analysera uppladdade bilder och skapa nya när det är aktiverat." },
        { icon: <Mic className="h-4 w-4" />, title: "Röst & röstläge", text: "Prata in din fråga, eller kör hela samtalet handsfree." },
        { icon: <SplitSquareHorizontal className="h-4 w-4" />, title: "Jämför svar", text: "Få två förslag sida vid sida och välj det bästa." },
        { icon: <PanelRight className="h-4 w-4" />, title: "Live-förhandsvisning", text: "Kör HTML, CSS och JS från svaret direkt i panelen." },
        { icon: <Keyboard className="h-4 w-4" />, title: "Kommandon", text: "⌘K-palett, snedstreck-kommandon och fullt tangentbord." },
        { icon: <Gauge className="h-4 w-4" />, title: "Insikter", text: "Ord, tokens, svarstider och kostnadsuppskattning." },
        { icon: <Languages className="h-4 w-4" />, title: "Två språk", text: "Svenska och engelska — i samma samtal." },
      ]
    : [
        { icon: <Zap className="h-4 w-4" />, title: "Streaming answers", text: "Watch the text arrive live and stop whenever you want." },
        { icon: <Layers className="h-4 w-4" />, title: "Prompt library", text: "Ready-made templates for work, writing, code and thinking." },
        { icon: <BrainCircuit className="h-4 w-4" />, title: "Personas & memory", text: "Six specialists and a memory that follows you between chats." },
        { icon: <ImageIcon className="h-4 w-4" />, title: "Images", text: "Analyse uploaded images and create new ones when enabled." },
        { icon: <Mic className="h-4 w-4" />, title: "Voice & voice mode", text: "Dictate a prompt, or run the whole conversation hands-free." },
        { icon: <SplitSquareHorizontal className="h-4 w-4" />, title: "Compare answers", text: "Get two options side by side and pick the better one." },
        { icon: <PanelRight className="h-4 w-4" />, title: "Live preview", text: "Run the HTML, CSS and JS from an answer right in the panel." },
        { icon: <Keyboard className="h-4 w-4" />, title: "Commands", text: "⌘K palette, slash commands and full keyboard control." },
        { icon: <Gauge className="h-4 w-4" />, title: "Insights", text: "Words, tokens, response times and cost estimates." },
        { icon: <Languages className="h-4 w-4" />, title: "Two languages", text: "Swedish and English — in the same conversation." },
      ];

  return (
    <section id="about" className="about-section section-hairline relative scroll-mt-24 overflow-hidden">
      <div className="about-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="about-intro grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <div>
            <span className="section-kicker">
              <Languages className="h-3.5 w-3.5" />
              {isSv ? "Vad är BudAI?" : "What is BudAI?"}
            </span>
            <h2 className="section-heading mt-5">
              {isSv ? "En arbetsassistent för" : "An AI work assistant for"}{" "}
              <span className="text-gradient">{isSv ? "riktiga arbetsdagar." : "real workdays."}</span>
            </h2>
          </div>
          <div className="about-copy max-w-2xl lg:justify-self-end">
            <p>
              {isSv
                ? "BudAI hjälper dig skriva, tänka, skapa och få ordning på återkommande uppgifter — på svenska och engelska. Det här är en tidig produktförhandsvisning: testa det som finns och hjälp oss förstå vad som bör byggas härnäst."
                : "BudAI helps you write, think, create, and make sense of recurring tasks — in Swedish and English. This is an early product preview: try what is here and help us learn what to build next."}
            </p>
            <div className="about-meta">
              <span>{isSv ? "Svenska + engelska" : "Swedish + English"}</span>
              <span>{isSv ? "Byggs fortfarande" : "Still being built"}</span>
              <span>{isSv ? "Människa i förarsätet" : "Human in the loop"}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-16">
          {cards.map((card, index) => (
            <motion.article
              key={card.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className={`capability-card ${card.tone}`}
            >
              <div className="capability-card-top">
                <div className="capability-icon">
                  <card.icon className="h-[18px] w-[18px]" />
                </div>
                <span className="capability-number">{card.number}</span>
              </div>
              <h3>{card.title}</h3>
              <p className="capability-description">{card.description}</p>
              <div className="capability-example">
                <span className="capability-example-mark">“</span>
                <span>{card.example}</span>
              </div>
              <a href="#playground" className="capability-link" onClick={() => prefillPlayground(card.prompt)}>
                <span>{isSv ? "Prova ett exempel" : "Try an example"}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </motion.article>
          ))}
        </div>

        {/* what's inside the playground */}
        <div className="inside-section">
          <div className="inside-head">
            <span className="section-kicker section-kicker--mint">
              <Sparkles className="h-3.5 w-3.5" />
              {isSv ? "Inuti Playground" : "Inside the Playground"}
            </span>
            <h3>
              {isSv ? "Byggt som ett arbetsbord, inte en demo." : "Built like a workbench, not a demo."}
            </h3>
          </div>
          <div className="inside-grid">
            {inside.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
                className="inside-card"
              >
                <span className="inside-icon">{item.icon}</span>
                <span className="inside-title">{item.title}</span>
                <span className="inside-text">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="about-note mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 sm:items-center">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cyan)] sm:mt-0" />
            {isSv
              ? "AI kan missa saker. Granska alltid resultat innan du använder dem i viktigt arbete."
              : "AI can get things wrong. Review outputs before using them for important work."}
          </p>
          <a
            href="#waitlist"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white"
          >
            {isSv ? "Hjälp till att forma nästa steg" : "Help shape what comes next"}
            <ArrowUpRight className="h-4 w-4 text-[var(--cyan)]" />
          </a>
        </div>
      </div>
    </section>
  );
}
