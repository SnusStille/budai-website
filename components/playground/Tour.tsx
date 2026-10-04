"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Command, Keyboard, Sparkles, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";

export const TOUR_KEY = "budai.pg.tour.v1";

type Step = {
  glyph: string;
  title: Record<Lang, string>;
  text: Record<Lang, string>;
  chips: Record<Lang, string[]>;
};

const STEPS: Step[] = [
  {
    glyph: "✎",
    title: { sv: "Skriv, eller tryck /", en: "Type, or press /" },
    text: {
      sv: "Skrivfältet är där allt börjar. Enter skickar, Shift+Enter ger ny rad — och ett snedstreck öppnar snabbkommandon som bild, sammanfatta eller översätt.",
      en: "The composer is where everything starts. Enter sends, Shift+Enter adds a line — and a slash opens commands like image, summarize or translate.",
    },
    chips: { sv: ["Enter skickar", "/ kommandon", "Bifoga bild"], en: ["Enter sends", "/ commands", "Attach an image"] },
  },
  {
    glyph: "◎",
    title: { sv: "Prata i stället", en: "Talk instead" },
    text: {
      sv: "Röstläget lyssnar medan du pratar, avbryter när du börjar igen och läser svaret högt. Perfekt när händerna är upptagna.",
      en: "Voice mode keeps listening while you talk, interrupts the moment you speak again, and reads the answer back out loud.",
    },
    chips: { sv: ["Mikrofonknappen", "Läser högt", "Svenska & engelska"], en: ["Mic button", "Reads aloud", "Swedish & English"] },
  },
  {
    glyph: "◫",
    title: { sv: "Markera text i svaret", en: "Highlight the answer" },
    text: {
      sv: "Markera en mening i ett svar och en liten meny dyker upp: förklara, översätta, förbättra, bygga ut — eller spara som anteckning.",
      en: "Highlight a sentence in an answer and a small bar appears: explain, translate, improve, expand — or save it as a note.",
    },
    chips: { sv: ["Förklara", "Översätt", "Spara anteckning"], en: ["Explain", "Translate", "Save note"] },
  },
  {
    glyph: "▤",
    title: { sv: "Panelerna runt omkring", en: "The panels around it" },
    text: {
      sv: "Till vänster: konversationer och projekt. Till höger: promptbibliotek, minne, anteckningar, galleri och en inspector som kör HTML, CSS och SVG live.",
      en: "On the left: conversations and projects. On the right: prompt library, notes, gallery, and an inspector that runs HTML, CSS and SVG live.",
    },
    chips: { sv: ["Bibliotek", "Anteckningar", "Live-preview"], en: ["Library", "Notes", "Live preview"] },
  },
  {
    glyph: "⌘",
    title: { sv: "Kommandopaletten", en: "The command palette" },
    text: {
      sv: "⌘K (Ctrl+K) öppnar allt: byta persona, täthet, röst, dela som länk, exportera, rensa. Shift+/ visar alla tangentbordskombinationer.",
      en: "⌘K (Ctrl+K) opens everything: switch persona, depth, voice, share as a link, export, clear. Shift+/ shows every shortcut.",
    },
    chips: { sv: ["⌘K palett", "⌘E export", "⌘/ genvägar"], en: ["⌘K palette", "⌘E export", "⌘/ shortcuts"] },
  },
];

export default function PlaygroundTour({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}) {
  const isSv = lang === "sv";
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setStep((s) => Math.min(s + 1, STEPS.length - 1));
      if (event.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
      if (event.key === "Enter") {
        if (step === STEPS.length - 1) onClose();
        else setStep((s) => s + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, step]);

  if (typeof document === "undefined") return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="pgx-modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label={isSv ? "Rundtur i Playground" : "Playground tour"}
        >
          <button type="button" className="pgx-modal-backdrop" onClick={onClose} aria-label="close" />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pgx-tour"
          >
            <div className="pgx-tour-head">
              <span className="pgx-tour-badge">
                <Sparkles className="h-3.5 w-3.5" />
                {isSv ? "Rundtur" : "Quick tour"}
                <span className="pgx-tour-count">
                  {step + 1}/{STEPS.length}
                </span>
              </span>
              <button type="button" onClick={onClose} className="pgx-tour-close" aria-label={isSv ? "Stäng" : "Close"}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22 }}
                className="pgx-tour-body"
              >
                <span className="pgx-tour-glyph" aria-hidden>
                  {current.glyph}
                </span>
                <h3>{current.title[lang]}</h3>
                <p>{current.text[lang]}</p>
                <div className="pgx-tour-chips">
                  {current.chips[lang].map((chip) => (
                    <span key={chip} className="pgx-tour-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pgx-tour-foot">
              <div className="pgx-tour-dots">
                {STEPS.map((item, index) => (
                  <button
                    key={item.glyph}
                    type="button"
                    onClick={() => setStep(index)}
                    className={`pgx-tour-dot ${index === step ? "is-active" : ""}`}
                    aria-label={`${isSv ? "Steg" : "Step"} ${index + 1}`}
                  />
                ))}
              </div>
              <div className="pgx-tour-actions">
                <button type="button" onClick={onClose} className="pgx-text-btn">
                  {isSv ? "Hoppa över" : "Skip"}
                </button>
                {step > 0 && (
                  <button type="button" onClick={() => setStep((s) => s - 1)} className="lab-mini">
                    {isSv ? "Tillbaka" : "Back"}
                  </button>
                )}
                <button type="button" onClick={() => (last ? onClose() : setStep((s) => s + 1))} className="pgx-tour-next">
                  {last ? (isSv ? "Kör igång" : "Let's go") : isSv ? "Nästa" : "Next"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="pgx-tour-hint">
              <Keyboard className="h-3.5 w-3.5" />
              {isSv ? "Piltangenter byter steg · Esc stänger" : "Arrow keys change step · Esc closes"}
              <span className="pgx-tour-hint-sep" aria-hidden />
              <Command className="h-3.5 w-3.5" />
              {isSv ? "Visa igen via ⌘K → Rundtur" : "Replay via ⌘K → Tour"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
