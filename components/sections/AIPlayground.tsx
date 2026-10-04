"use client";

import {
  AudioLines,
  BookmarkPlus,
  Link2,
  Settings2,
  Sparkles,
  SplitSquareHorizontal,
  TextSelect,
  MonitorPlay,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import PlaygroundApp from "@/components/playground/PlaygroundApp";
import { prefillPlayground } from "@/lib/playground/events";

const RIBBON: Record<"sv" | "en", string[]> = {
  sv: ["Strömmande svar", "Svenska + engelska", "Röst & bild", "Promptbibliotek", "Fungerar utan konto"],
  en: ["Streaming answers", "Swedish + English", "Voice & images", "Prompt library", "Works without an account"],
};

/** The six powers worth knowing about — each one drops a demo prompt into the composer. */
const POWERS: {
  id: string;
  icon: React.ReactNode;
  title: Record<"sv" | "en", string>;
  text: Record<"sv" | "en", string>;
  prompt: Record<"sv" | "en", string>;
}[] = [
  {
    id: "voice",
    icon: <AudioLines className="h-3.5 w-3.5" />,
    title: { sv: "Röstläge", en: "Voice mode" },
    text: {
      sv: "Prata i stället för att skriva. BudAI lyssnar, svarar och läser högt.",
      en: "Talk instead of typing. BudAI listens, answers, and reads it back.",
    },
    prompt: {
      sv: "Öppna röstläget med knappen i skrivfältet och berätta vad du jobbar med — jag lyssnar.",
      en: "Open voice mode from the composer and tell me what you are working on — I am listening.",
    },
  },
  {
    id: "compare",
    icon: <SplitSquareHorizontal className="h-3.5 w-3.5" />,
    title: { sv: "Jämför svar", en: "Compare answers" },
    text: {
      sv: "Två förslag sida vid sida. Välj det du gillar bäst och jobba vidare därifrån.",
      en: "Two takes side by side. Pick the one you like and keep working from there.",
    },
    prompt: {
      sv: "Föreslå två helt olika sätt att lansera en svensk AI-assistent på 30 dagar.",
      en: "Propose two completely different ways to launch a Swedish AI assistant in 30 days.",
    },
  },
  {
    id: "select",
    icon: <TextSelect className="h-3.5 w-3.5" />,
    title: { sv: "Markeringsverktyg", en: "Selection tools" },
    text: {
      sv: "Markera en rad i ett svar → förklara, översätt, förbättra eller bygg ut.",
      en: "Highlight a line in an answer → explain, translate, improve or expand it.",
    },
    prompt: {
      sv: "Skriv en kort text om varför svenska team behöver ett AI-verktyg som förstår svenska.",
      en: "Write a short piece on why Swedish teams need an AI tool that understands Swedish.",
    },
  },
  {
    id: "notes",
    icon: <BookmarkPlus className="h-3.5 w-3.5" />,
    title: { sv: "Anteckningar", en: "Notes" },
    text: {
      sv: "Spara det bästa från ett svar som anteckning — och exportera allt som Markdown.",
      en: "Save the best of an answer as a note — and export the lot as Markdown.",
    },
    prompt: {
      sv: "Ge mig fem principer för tydliga uppföljningsmejl till kunder.",
      en: "Give me five principles for clear follow-up emails to clients.",
    },
  },
  {
    id: "share",
    icon: <Link2 className="h-3.5 w-3.5" />,
    title: { sv: "Dela som länk", en: "Share as a link" },
    text: {
      sv: "Hela konversationen packas in i länken. Ingen server, inget konto.",
      en: "The whole conversation is packed into the link. No server, no account.",
    },
    prompt: {
      sv: "Planera en workshop på 90 minuter om AI i vardagen för ett team på tio personer.",
      en: "Plan a 90-minute workshop about AI in daily work for a team of ten.",
    },
  },
  {
    id: "preview",
    icon: <MonitorPlay className="h-3.5 w-3.5" />,
    title: { sv: "Live-förhandsvisning", en: "Live preview" },
    text: {
      sv: "Be om HTML, CSS eller SVG — koden körs i en sandlåda direkt i panelen.",
      en: "Ask for HTML, CSS or SVG — it runs sandboxed inside the side panel.",
    },
    prompt: {
      sv: "Bygg en liten SVG för en laddningsanimation och visa den i förhandsvisningen.",
      en: "Build a small SVG loading animation and show it in the preview panel.",
    },
  },
  {
    id: "instructions",
    icon: <Settings2 className="h-3.5 w-3.5" />,
    title: { sv: "Egna instruktioner", en: "Custom instructions" },
    text: {
      sv: "Berätta en gång hur BudAI ska skriva — ton, längd, språk, format.",
      en: "Tell BudAI once how to write — tone, length, language, format.",
    },
    prompt: {
      sv: "Sammanfatta vårt samtal hittills och föreslå tre nästa steg.",
      en: "Summarize our conversation so far and suggest three next steps.",
    },
  },
];

export default function AIPlayground() {
  const { t, lang } = useLang();
  const isSv = lang === "sv";

  return (
    <section id="playground" className="pgx-section relative scroll-mt-24 overflow-hidden">
      <div className="pgx-section-glow" aria-hidden="true" />
      <div className="pgx-section-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[86rem] px-3 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto mb-7 max-w-3xl text-center sm:mb-10">
          <span className="pgx-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {t.playground.badge}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[44px] md:leading-[1.1]">
            {t.playground.title} <span className="text-gradient">{t.playground.titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            {isSv
              ? "Ett komplett arbetsbord: strömmande svar, roller, promptbibliotek, minne, röstläge, svarsvarianter, markeringsverktyg, anteckningar, delningslänkar och live-förhandsvisning. Börja utan konto."
              : "A full workbench: streaming answers, personas, a prompt library, memory, voice mode, answer variants, selection tools, notes, share links and a live preview. Start without an account."}
          </p>
          <div className="pgx-ribbon">
            {RIBBON[lang].map((item) => (
              <span key={item} className="pgx-ribbon-chip">
                <span className="pgx-ribbon-dot" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* the powers belt — click a card to drop its demo prompt into the composer */}
        <ScrollReveal>
          <div className="pgx-powers">
            {POWERS.map((power) => (
              <button
                key={power.id}
                type="button"
                onClick={() => prefillPlayground(power.prompt[lang])}
                className="pgx-power"
                title={isSv ? "Klistra in ett demouppdrag i skrivfältet" : "Drop a demo task into the composer"}
              >
                <span className="pgx-power-icon">{power.icon}</span>
                <strong>{power.title[lang]}</strong>
                <small>{power.text[lang]}</small>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <PlaygroundApp />
        </ScrollReveal>
      </div>
    </section>
  );
}
