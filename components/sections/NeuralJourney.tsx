"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MoveDown } from "lucide-react";
import NeuralCinema from "@/components/effects/NeuralCinema";
import { chapterFor } from "@/components/effects/neural/engine";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * The cinematic chapter between the hero and the product.
 *
 * One scroll range drives one camera flight (NeuralCinema, mode="scroll").
 * The copy is real DOM, one panel per beat, tied to the same progress value —
 * the animation explains the product instead of decorating it.
 *
 * Falls back to a readable, static stack when the visitor prefers reduced motion.
 */

type Chapter = {
  id: string;
  label: { sv: string; en: string };
  title: { sv: string; en: string };
  body: { sv: string; en: string };
  meta: { sv: string; en: string };
};

const CHAPTERS: Chapter[] = [
  {
    id: "signal",
    label: { sv: "Signal", en: "Signal" },
    title: { sv: "Ett sinne som lyssnar", en: "A mind that listens" },
    body: {
      sv: "BudAI läser frågan, behåller tråden och svarar på svenska eller engelska. Med konto minns den det som är värt att minnas.",
      en: "BudAI reads the question, keeps the thread and answers in Swedish or English. With an account, it remembers what is worth remembering.",
    },
    meta: { sv: "Kontext · Minne · Två språk", en: "Context · Memory · Two languages" },
  },
  {
    id: "synapses",
    label: { sv: "Synapser", en: "Synapses" },
    title: { sv: "Kopplar ihop text, bild och röst", en: "Connects text, image and voice" },
    body: {
      sv: "Skriv, bifoga en bild för analys eller prata in din fråga. Samma assistent, samma tråd — inget separat verktyg för varje sak.",
      en: "Type, attach an image for analysis or speak your question. One assistant, one thread — not a separate tool for every task.",
    },
    meta: { sv: "Bildanalys · Röst · Bilagor", en: "Image analysis · Voice · Attachments" },
  },
  {
    id: "flow",
    label: { sv: "Flödet", en: "The flow" },
    title: { sv: "Från fråga till färdigt arbete", en: "From question to finished work" },
    body: {
      sv: "Utkast, planer, sammanfattningar, kod och översättningar — i din ton, redo att kopieras, exporteras eller delas.",
      en: "Drafts, plans, summaries, code and translations — in your voice, ready to copy, export or share.",
    },
    meta: { sv: "Skrivande · Planering · Analys · Export", en: "Writing · Planning · Analysis · Export" },
  },
  {
    id: "enter",
    label: { sv: "Ingången", en: "The entrance" },
    title: { sv: "Kliv in i BudAI", en: "Step into BudAI" },
    body: {
      sv: "Playground är live och öppen. Ingen registrering krävs för att prova — konto låser upp historik, minne och bildanalys.",
      en: "The Playground is live and open. No signup needed to try it — an account unlocks history, memory and image analysis.",
    },
    meta: { sv: "Live nu · Gratis att prova", en: "Live now · Free to try" },
  },
];

export default function NeuralJourney() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* One rAF drives the active beat + the rail. React only re-renders on beat change. */
  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let lastBeat = -1;
    let lastProgress = -1;
    let startedOnce = false;
    let inView = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { rootMargin: "200px" }
    );
    io.observe(el);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!inView || document.visibilityState === "hidden") return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      if (p !== lastProgress) {
        lastProgress = p;
        if (railRef.current) {
          railRef.current.style.transform = `scaleY(${Math.max(0.001, p)})`;
        }
        if (p > 0.02 && !startedOnce) {
          startedOnce = true;
          setStarted(true);
        }
      }
      const beat = chapterFor(p, CHAPTERS.length);
      if (beat !== lastBeat) {
        lastBeat = beat;
        setActive(beat);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduced]);

  const heading = (
    <h2 id="neural-heading" className="sr-only">
      {sv ? "Så fungerar BudAI" : "How BudAI works"}
    </h2>
  );

  /* ---------------- reduced motion / no-flight fallback ---------------- */
  if (reduced) {
    return (
      <section id="neural" className="relative z-10 section-hairline py-16 sm:py-20">
        {heading}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="neural-static-visual mb-10 h-44 w-full overflow-hidden rounded-3xl border border-white/[0.07]">
            <NeuralCinema mode="hero" />
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {CHAPTERS.map((c, i) => (
              <li key={c.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-cyan/70">
                  {String(i + 1).padStart(2, "0")} · {c.label[lang]}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">{c.title[lang]}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body[lang]}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted/60">
                  {c.meta[lang]}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#playground" className="btn-primary inline-flex items-center gap-2 !px-6 !py-3 text-sm">
              {sv ? "Öppna Playground" : "Open the Playground"}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm text-white/85 transition-colors hover:border-accent-cyan/30"
            >
              {sv ? "Gå med i väntelistan" : "Join the waitlist"}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="neural"
      className="neural-story relative z-10"
      style={{ height: `${CHAPTERS.length * 100 + 20}svh` }}
    >
      {heading}
      <div className="neural-stage sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* the flight */}
        <div className="absolute inset-0">
          <NeuralCinema mode="scroll" scrollTarget={sectionRef} />
        </div>

        {/* readable scrims — the scene is allowed to be bright, the text never unreadable */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_45%,rgba(2,2,5,0.62)_0%,rgba(2,2,5,0.42)_38%,rgba(2,2,5,0.14)_70%,rgba(2,2,5,0)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#020205] via-[#020205]/70 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#020205] to-transparent"
          aria-hidden
        />

        {/* section marker */}
        <div className="pointer-events-none absolute left-4 top-20 flex items-center gap-2 sm:left-8 sm:top-24">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.9)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/45">
            BudAI · neural core
          </span>
        </div>

        {/* copy panels */}
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-6xl px-4 pb-10 sm:px-8 sm:pb-14">
          <div className="relative min-h-[15rem] sm:min-h-[16rem]">
            {CHAPTERS.map((c, i) => {
              const on = active === i;
              return (
                <article
                  key={c.id}
                  data-beat={on ? "on" : "off"}
                  aria-hidden={!on}
                  className={`transition-[opacity,transform] duration-500 ease-out ${
                    on
                      ? "relative translate-y-0 opacity-100"
                      : "pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 opacity-0"
                  }`}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-cyan/80">
                    {String(i + 1).padStart(2, "0")} · {c.label[lang]}
                  </p>
                  <h3 className="mt-3 max-w-2xl text-[1.7rem] font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-4xl md:text-[2.9rem]">
                    {c.title[lang]}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
                    {c.body[lang]}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                    {c.meta[lang]}
                  </p>

                  {i === CHAPTERS.length - 1 && (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <a
                        href="#playground"
                        tabIndex={on ? 0 : -1}
                        className="btn-primary inline-flex items-center gap-2 !px-6 !py-3 text-sm shadow-[0_0_40px_rgba(0,229,255,0.22)]"
                      >
                        {sv ? "Öppna Playground" : "Open the Playground"}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      <a
                        href="#waitlist"
                        tabIndex={on ? 0 : -1}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-5 py-3 text-sm text-white/85 transition-colors hover:border-accent-cyan/30"
                      >
                        {sv ? "Gå med i väntelistan" : "Join the waitlist"}
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* progress rail */}
        <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex">
          <div className="relative h-32 w-px overflow-hidden rounded-full bg-white/12">
            <div
              ref={railRef}
              className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-accent-cyan to-accent-purple"
              style={{ transform: "scaleY(0.001)" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {CHAPTERS.map((c, i) => (
              <span
                key={c.id}
                className={`h-1 w-1 rounded-full transition-colors duration-300 ${
                  active === i ? "bg-accent-cyan" : "bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>

        {/* scroll hint, only until the flight starts */}
        <div
          className={`pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-white/35 transition-opacity duration-500 sm:flex ${
            started ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        >
          <MoveDown className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em]">
            {sv ? "Skrolla för att gå in" : "Scroll to enter"}
          </span>
        </div>

        {/* an always-available exit for anyone who does not want the ride */}
        <a
          href="#playground"
          className="absolute right-4 top-20 rounded-full border border-white/12 bg-black/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 backdrop-blur-sm transition-colors hover:border-accent-cyan/40 hover:text-white sm:right-8 sm:top-24"
        >
          {sv ? "Hoppa till Playground" : "Skip to Playground"}
        </a>
      </div>
    </section>
  );
}
