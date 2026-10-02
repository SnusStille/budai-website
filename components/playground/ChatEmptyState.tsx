"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  BarChart3,
  Dices,
  Flag,
  ImagePlus,
  Lightbulb,
  LogIn,
  Mail,
  Mic,
  BrainCircuit,
} from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { EXAMPLE_PROMPTS, type Lang } from "./presets";

const ICONS = {
  mail: Mail,
  bulb: Lightbulb,
  chart: BarChart3,
  brain: BrainCircuit,
  flag: Flag,
  calendar: CalendarDays,
};

type Props = {
  lang: Lang;
  busy: boolean;
  isGuest: boolean;
  remainingMessages: number;
  dailyLimit: number;
  listening: boolean;
  onPick: (prompt: string) => void;
  onSurprise: () => void;
  onAttach: () => void;
  onMic: () => void;
  onSignIn: () => void;
};

/**
 * First-run state of the Playground.
 * Job: make it obvious that BudAI is real and usable in the next five seconds.
 */
export default function ChatEmptyState({
  lang,
  busy,
  isGuest,
  remainingMessages,
  dailyLimit,
  listening,
  onPick,
  onSurprise,
  onAttach,
  onMic,
  onSignIn,
}: Props) {
  const sv = lang === "sv";

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <BudAILogo size="lg" animated />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-white sm:text-[27px]"
        >
          {sv ? "Vad kan BudAI hjälpa dig med?" : "What can BudAI help you with?"}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto mt-2.5 max-w-md text-[13.5px] leading-relaxed text-muted"
        >
          {sv
            ? "Klicka på ett exempel för att fylla i fältet — eller skriv direkt. BudAI svarar på svenska eller engelska."
            : "Click an example to fill the composer — or just type. BudAI answers in Swedish or English."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14 }}
          className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {EXAMPLE_PROMPTS[lang].map((ex) => {
            const Icon = ICONS[ex.icon];
            return (
              <button
                key={ex.id}
                type="button"
                disabled={busy}
                onClick={() => onPick(ex.prompt)}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-cyan/30 hover:bg-accent-cyan/[0.045] disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-accent-cyan transition-colors group-hover:border-accent-cyan/25 group-hover:bg-accent-cyan/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="block text-[13.5px] font-semibold leading-snug text-white/90">
                  {ex.title}
                </span>
                <span className="mt-1 block text-[11.5px] leading-snug text-muted">{ex.blurb}</span>
              </button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={onSurprise}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/[0.07] px-3.5 py-1.5 text-[12px] font-medium text-white/90 transition-colors hover:border-accent-cyan/45 hover:bg-accent-cyan/[0.12] disabled:opacity-40"
          >
            <Dices className="h-3.5 w-3.5 text-accent-cyan" />
            {sv ? "Överraska mig" : "Surprise me"}
          </button>
          <button
            type="button"
            onClick={onAttach}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] px-3.5 py-1.5 text-[12px] text-muted transition-colors hover:border-white/20 hover:text-white"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {sv ? "Bifoga bild" : "Attach image"}
          </button>
          <button
            type="button"
            onClick={onMic}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${
              listening
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-white/[0.09] text-muted hover:border-white/20 hover:text-white"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            {sv ? "Prata in" : "Speak"}
          </button>
        </motion.div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11.5px] text-muted/60">
          <span>
            {isGuest
              ? sv
                ? `Gästläge · ${remainingMessages} av ${dailyLimit} meddelanden idag`
                : `Guest mode · ${remainingMessages} of ${dailyLimit} messages today`
              : sv
                ? `Konto · ${remainingMessages} av ${dailyLimit} meddelanden idag`
                : `Account · ${remainingMessages} of ${dailyLimit} messages today`}
          </span>
          {isGuest && (
            <>
              <span className="text-muted/30">·</span>
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-1 text-accent-cyan/85 transition-colors hover:text-accent-cyan"
              >
                <LogIn className="h-3 w-3" />
                {sv ? "logga in för mer" : "sign in for more"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
