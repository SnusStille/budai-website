"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  BarChart3,
  Command,
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

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
  const used = Math.max(0, dailyLimit - remainingMessages);
  const pct = dailyLimit > 0 ? Math.min(100, Math.round((used / dailyLimit) * 100)) : 0;

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl">
        {/* Status row — says "this is live and in preview" before anything else */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="preview-tag">
            <span className="status-dot !h-[5px] !w-[5px]" />
            {sv ? "live förhandsvisning" : "live preview"}
          </span>
          <span className="fig">{sv ? "gästläge kräver inget konto" : "guest mode needs no account"}</span>
        </motion.div>

        {/* Mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.04 }}
          className="relative mt-7 flex justify-center"
        >
          <span
            aria-hidden
            className="absolute top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-accent-cyan/[0.09] blur-2xl"
          />
          <BudAILogo size="lg" animated />
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.08 }}
          className="t-h2 t-balance mt-6 text-center text-white"
        >
          {sv ? "Vad kan BudAI " : "What can BudAI "}
          <span className="text-gradient">{sv ? "hjälpa dig med?" : "help you with?"}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE, delay: 0.12 }}
          className="mx-auto mt-3 max-w-lg text-center text-[13.5px] leading-relaxed text-muted"
        >
          {sv
            ? "Välj ett exempel för att fylla skrivfältet — eller skriv direkt. BudAI svarar på svenska eller engelska."
            : "Pick an example to fill the composer — or just start typing. BudAI answers in Swedish or English."}
        </motion.p>

        {/* Example prompts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
          className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {EXAMPLE_PROMPTS[lang].map((ex, i) => {
            const Icon = ICONS[ex.icon];
            return (
              <button
                key={ex.id}
                type="button"
                disabled={busy}
                onClick={() => onPick(ex.prompt)}
                style={{ transitionDelay: `${i * 20}ms` }}
                className="group card card-hover card-edge p-3.5 text-left disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[var(--r-xs)] border border-white/[0.07] bg-white/[0.04] text-accent-cyan transition-colors group-hover:border-accent-cyan/25 group-hover:bg-accent-cyan/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-3 block text-[13.5px] font-semibold leading-snug text-white/92">{ex.title}</span>
                <span className="mt-1 block text-[11.5px] leading-snug text-muted">{ex.blurb}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          <button type="button" onClick={onSurprise} disabled={busy} className="chip chip-hover disabled:opacity-40">
            <Dices className="h-3.5 w-3.5 text-accent-cyan" />
            {sv ? "Överraska mig" : "Surprise me"}
          </button>
          <button type="button" onClick={onAttach} className="chip chip-hover">
            <ImagePlus className="h-3.5 w-3.5" />
            {sv ? "Bifoga bild" : "Attach image"}
          </button>
          <button
            type="button"
            onClick={onMic}
            className={`chip ${
              listening ? "!border-accent-green/40 !bg-accent-green/10 !text-accent-green" : "chip-hover"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            {sv ? "Prata in" : "Speak"}
          </button>
        </motion.div>

        {/* Foot: usage + shortcuts + sign-in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-9 max-w-md rounded-[var(--r-md)] border border-white/[0.06] bg-white/[0.015] px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3 text-[11.5px] text-muted/70">
            <span className="flex items-center gap-2">
              <span className="font-mono uppercase tracking-[0.12em] text-muted/60">
                {isGuest ? (sv ? "gäst" : "guest") : sv ? "konto" : "account"}
              </span>
              <span className="tabular-nums">
                {remainingMessages}/{dailyLimit} {sv ? "kvar idag" : "left today"}
              </span>
            </span>
            {isGuest ? (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-1 text-accent-cyan/85 transition-colors hover:text-accent-cyan"
              >
                <LogIn className="h-3 w-3" />
                {sv ? "logga in för mer" : "sign in for more"}
              </button>
            ) : (
              <span className="hidden items-center gap-1.5 text-muted/60 sm:flex">
                <Command className="h-3 w-3" />K
              </span>
            )}
          </div>
          <div className={`meter mt-2.5 ${pct > 85 ? "meter-danger" : pct > 60 ? "meter-warn" : ""}`}>
            <span style={{ width: `${pct}%` }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
