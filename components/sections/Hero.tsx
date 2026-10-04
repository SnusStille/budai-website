"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BrainCircuit,
  Command,
  Languages,
  Sparkles,
  SplitSquareHorizontal,
  Wand2,
} from "lucide-react";
import BudAILogo, { StilledevLink } from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { prefillPlayground } from "@/lib/playground/events";

type Demo = { prompt: string; answer: string; chips: string[] };

const DEMOS: Record<"sv" | "en", Demo[]> = {
  sv: [
    {
      prompt: "Skriv ett kort mejl till kunden om förseningen.",
      answer:
        "Hej Anna,\n\nTack för ert tålamod. Leveransen landar i morgon i stället för i dag — vi hör av oss så snart den är på väg.\n\nVänliga hälsningar\nStilledev",
      chips: ["Kortare", "Varmare ton", "Översätt"],
    },
    {
      prompt: "Planera min vecka med fokusblock.",
      answer:
        "Måndag: djuparbete 9–11, möten efter lunch.\nTisdag–onsdag: två fokusblock per dag, inga notiser.\nTorsdag: leverans + återkoppling.\nFredag: stäng luckor, planera nästa vecka.",
      chips: ["Gör om", "Lägg till pauser", "Checklista"],
    },
    {
      prompt: "Förklara vektorsökning enkelt.",
      answer:
        "Tänk dig ett bibliotek där böckerna står sorterade efter betydelse i stället för bokstav. Frågar du efter \"pasta\" hittar hyllan även \"spaghetti\" och \"lasagne\" — för de ligger nära varandra.",
      chips: ["Djupare", "Ge exempel", "Översätt"],
    },
  ],
  en: [
    {
      prompt: "Write a short email to the client about the delay.",
      answer:
        "Hi Anna,\n\nThanks for your patience. Delivery lands tomorrow instead of today — we'll be in touch as soon as it's on its way.\n\nBest\nStilledev",
      chips: ["Shorter", "Warmer tone", "Translate"],
    },
    {
      prompt: "Plan my week with focus blocks.",
      answer:
        "Monday: deep work 9–11, meetings after lunch.\nTuesday–Wednesday: two focus blocks a day, notifications off.\nThursday: ship + review.\nFriday: close loops, plan next week.",
      chips: ["Redo", "Add breaks", "Checklist"],
    },
    {
      prompt: "Explain vector search simply.",
      answer:
        "Picture a library where books are shelved by meaning instead of alphabet. Ask for \"pasta\" and the shelf hands you \"spaghetti\" and \"lasagne\" too — because they live next door.",
      chips: ["Deeper", "Give an example", "Translate"],
    },
  ],
};

export default function Hero() {
  const { t, lang } = useLang();
  const reduceMotion = useReducedMotion();
  const isSv = lang === "sv";
  const demos = useMemo(() => DEMOS[lang], [lang]);
  const [demoIndex, setDemoIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<"prompt" | "answer">("prompt");
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);

  const prompts = isSv
    ? [
        { label: "Skriv ett mejl", prompt: "Skriv ett kort, varmt och tydligt mejl till en kund och be om feedback senast fredag." },
        { label: "Planera veckan", prompt: "Hjälp mig planera veckan. Jag har två möten, en viktig deadline och vill hinna med fokuserat arbete." },
        { label: "Förklara enkelt", prompt: "Förklara generativ AI enkelt för en kollega som inte jobbar med teknik." },
        { label: "Röstläge: prata fritt", prompt: "Hej BudAI — hjälp mig få ordning på dagen. Vad bör jag fokusera på först?" },
      ]
    : [
        { label: "Write an email", prompt: "Write a short, warm, clear email to a client asking for feedback by Friday." },
        { label: "Plan my week", prompt: "Help me plan my week. I have two meetings, an important deadline, and need time for focused work." },
        { label: "Explain it simply", prompt: "Explain generative AI simply to a colleague who does not work in tech." },
        { label: "Voice mode: try it", prompt: "Hey BudAI — help me get my day in order. What should I focus on first?" },
      ];

  /* pause the demo when the hero is off screen or motion is reduced */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => setVisible(entries[0]?.isIntersecting ?? true), {
      threshold: 0.15,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* scripted typing demo — shows what a real answer feels like */
  useEffect(() => {
    if (reduceMotion || !visible) return;
    const demo = demos[demoIndex];
    let cancelled = false;

    if (stage === "prompt") {
      const timer = window.setTimeout(() => setStage("answer"), 1400);
      return () => window.clearTimeout(timer);
    }

    setTyped("");
    const target = demo.answer;
    let index = 0;
    const speed = 14;

    const tick = () => {
      if (cancelled) return;
      index += 2 + Math.floor(Math.random() * 3);
      setTyped(target.slice(0, index));
      if (index < target.length) {
        window.setTimeout(tick, speed);
      } else {
        window.setTimeout(() => {
          if (!cancelled) {
            setStage("prompt");
            setDemoIndex((current) => (current + 1) % demos.length);
          }
        }, 3200);
      }
    };
    const start = window.setTimeout(tick, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [demoIndex, demos, reduceMotion, stage, visible]);

  const enterPreview = (prompt: string) => prefillPlayground(prompt);
  const reveal = reduceMotion ? false : { opacity: 0, y: 18 };

  return (
    <section ref={sectionRef} id="home" className="hero-section relative isolate scroll-mt-24 overflow-hidden">
      <div className="hero-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="hero-glow hero-glow--a absolute pointer-events-none" aria-hidden="true" />
      <div className="hero-glow hero-glow--b absolute pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-10 lg:pb-24 lg:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 xl:gap-20">
          <motion.div
            initial={reveal}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="eyebrow-pill mb-7">
              <span className="eyebrow-dot" aria-hidden="true" />
              <span>{t.hero.badge}</span>
              <span className="eyebrow-divider" aria-hidden="true" />
              <span className="text-white/55">{isSv ? "Byggs i Sverige" : "Built in Sweden"}</span>
            </div>

            <h1 className="hero-title mb-6">
              <span className="block">{t.hero.title1}</span>
              <span className="block hero-title-accent">{t.hero.title2}</span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">{t.hero.subtitle}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#playground" className="button-primary group">
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a href="#waitlist" className="button-secondary">
                <span>{t.hero.ctaSecondary}</span>
                <span className="ml-1 rounded-full bg-[#f1d98f]/15 px-2 py-0.5 text-[10px] font-bold text-[#f1d98f]">10%</span>
              </a>
            </div>

            <div className="hero-proof mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/48 sm:text-sm">
              <span>{isSv ? "Svenska + engelska" : "Swedish + English"}</span>
              <span className="hero-proof-separator" aria-hidden="true" />
              <span>{isSv ? "Testa utan konto" : "Try it without an account"}</span>
              <span className="hero-proof-separator" aria-hidden="true" />
              <span>{isSv ? "Röstläge & strömmande svar" : "Voice mode & streaming answers"}</span>
            </div>

            <p className="mt-6 text-xs text-white/38">
              {isSv ? "Utvecklad av " : "Made by "}
              <StilledevLink className="!text-white/65 hover:!text-white" />
              <span className="mx-1.5 text-white/25">·</span>
              {isSv ? "Sverige" : "Sweden"}
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hero-visual relative mx-auto w-full max-w-[600px]"
          >
            <div className="hero-orbit hero-orbit--outer" aria-hidden="true" />
            <div className="hero-orbit hero-orbit--inner" aria-hidden="true" />

            <div className="hero-stage">
              <div className="hero-stage-head">
                <div className="flex min-w-0 items-center gap-3">
                  <BudAILogo size="md" motion={stage === "answer" ? "thinking" : "idle"} animated={!reduceMotion} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tracking-tight text-white">
                        Bud<span className="text-[var(--cyan)]">AI</span>
                      </span>
                      <span className="preview-label">{isSv ? "Live" : "Live"}</span>
                    </div>
                    <div className="text-[11px] text-white/42">
                      {isSv ? "Playground · strömmande svar" : "Playground · streaming answers"}
                    </div>
                  </div>
                </div>
                <span className="hero-stage-tools" aria-hidden>
                  <Command className="h-3.5 w-3.5" />
                  <span className="font-mono text-[10px]">⌘K</span>
                </span>
              </div>

              <div className="hero-stage-body">
                <div className="hero-bubble hero-bubble--user">
                  <span>{demos[demoIndex].prompt}</span>
                </div>
                <div className="hero-bubble hero-bubble--ai">
                  <span className="hero-bubble-avatar">
                    <BudAILogo size="xs" animated={!reduceMotion} motion={stage === "prompt" ? "thinking" : "idle"} />
                  </span>
                  <span className="min-w-0">
                    {stage === "answer" ? (
                      <span className="hero-answer">
                        {typed.split("\n").map((line, index) => (
                          <span key={index} className="block">
                            {line || "\u00a0"}
                          </span>
                        ))}
                        <span className="hero-caret" aria-hidden />
                      </span>
                    ) : (
                      <span className="hero-typing" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </span>
                    )}
                  </span>
                </div>

                <div className="hero-chips">
                  {demos[demoIndex].chips.map((chip) => (
                    <span key={chip} className="hero-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hero-stage-foot">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-white/45">
                    {isSv ? "Välj en startpunkt" : "Choose a starting point"}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                    {isSv ? "Exempel" : "Examples"}
                  </span>
                </div>
                <div className="space-y-2">
                  {prompts.map((item) => (
                    <a
                      key={item.label}
                      href="#playground"
                      onClick={() => enterPreview(item.prompt)}
                      className="hero-prompt-row group"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-white/30 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--cyan)]" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="hero-float-note hero-float-note--left" aria-hidden>
              <span className="hero-float-note-mark">
                <BrainCircuit className="h-3.5 w-3.5" />
              </span>
              <span>{isSv ? "Minne mellan chattar" : "Memory across chats"}</span>
            </div>
            <div className="hero-float-note hero-float-note--right" aria-hidden>
              <span className="hero-float-note-mark">
                <Wand2 className="h-3.5 w-3.5" />
              </span>
              <span>{isSv ? "Roller & promptbibliotek" : "Personas & prompt library"}</span>
            </div>
          </motion.div>
        </div>

        {/* feature strip */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="hero-feature-strip"
        >
          {[
            { icon: <Sparkles className="h-4 w-4" />, label: isSv ? "Strömmande svar" : "Streaming answers", value: isSv ? "token för token" : "token by token" },
            { icon: <AudioLines className="h-4 w-4" />, label: isSv ? "Röstläge" : "Voice mode", value: isSv ? "prata fritt" : "hands-free" },
            { icon: <BrainCircuit className="h-4 w-4" />, label: isSv ? "Roller & minne" : "Personas & memory", value: isSv ? "6 specialister" : "6 specialists" },
            { icon: <SplitSquareHorizontal className="h-4 w-4" />, label: isSv ? "Jämför svar" : "Compare answers", value: isSv ? "A/B sida vid sida" : "A/B side by side" },
            { icon: <Languages className="h-4 w-4" />, label: isSv ? "Språk" : "Languages", value: "SV / EN" },
            { icon: <Wand2 className="h-4 w-4" />, label: isSv ? "Verktyg" : "Tools", value: isSv ? "bild · fil · kod" : "image · file · code" },
          ].map((item) => (
            <div key={item.label} className="hero-feature">
              <span className="hero-feature-icon">{item.icon}</span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold text-white/85">{item.label}</span>
                <span className="block text-[11px] text-white/40">{item.value}</span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <a
        href="#playground"
        className="hero-scroll-cue"
        aria-label={isSv ? "Fortsätt till Playground" : "Continue to the Playground"}
      >
        <span>{isSv ? "Testa själv" : "Try it yourself"}</span>
        <ArrowRight className="h-3.5 w-3.5 rotate-90" />
      </a>
    </section>
  );
}
