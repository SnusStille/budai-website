"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Info, Languages, ShieldCheck, Sparkles } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevLink } from "@/components/ui/BudAILogo";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Build stamp for the preview tag. Bumped when the preview changes shape. */
const BUILD = "2026.10";

/**
 * The home page opens straight into the product.
 *
 * Deliberately short: an eyebrow that says this is a preview, one claim,
 * one line of context, a quiet proof row — then the Playground takes the screen.
 */
export default function PlaygroundIntro() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const reduce = useReducedMotion() ?? false;

  const fade = (delay: number, y = 16) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: EASE },
        };

  const trust = [
    { icon: Sparkles, label: t.intro.trustFree },
    { icon: Languages, label: t.intro.trustLang },
    { icon: ShieldCheck, label: t.intro.trustPrivacy },
  ];

  return (
    <div className="relative">
      {/* Ambient bloom behind the claim — one layer, very low opacity */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-[420px] overflow-hidden">
        <div className="aurora opacity-70" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 pb-5 pt-20 text-center sm:px-6 sm:pb-9 sm:pt-28 lg:pt-32">
        {/* Eyebrow: preview + build stamp */}
        <motion.div {...fade(0.02, 10)} className="flex flex-wrap items-center justify-center gap-2">
          <span className="preview-tag">
            <span className="status-dot !h-[5px] !w-[5px]" />
            {t.intro.badge}
          </span>
          <span className="fig">
            {t.intro.buildLabel} {BUILD}
          </span>
        </motion.div>

        <motion.h1
          {...fade(0.08, 18)}
          className="t-display t-balance mt-6 text-white sm:mt-7"
        >
          <span className="block text-gradient-soft">{t.intro.title1}</span>
          <span className="mt-1 block text-gradient">{t.intro.title2}</span>
        </motion.h1>

        <motion.p {...fade(0.15, 14)} className="t-lead mx-auto mt-5 max-w-2xl sm:mt-6">
          {t.intro.subtitle}
        </motion.p>

        {/* Quiet proof row */}
        <motion.div
          {...fade(0.22, 10)}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2"
        >
          {trust.map((item) => (
            <span key={item.label} className="chip chip-hover">
              <item.icon className="h-3.5 w-3.5 text-accent-cyan" />
              {item.label}
            </span>
          ))}
          <span className="chip !border-transparent !bg-transparent !text-muted/60">
            {sv ? "Utvecklad av" : "Built by"} <StilledevLink />
          </span>
        </motion.div>

        {/* What actually works right now — honest, specific, no numbers */}
        <motion.div
          {...fade(0.3, 10)}
          className="mx-auto mt-7 hidden max-w-2xl rounded-[var(--r-md)] border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left sm:block sm:px-5"
        >
          <p className="eyebrow !text-[10px]">{t.intro.liveLabel}</p>
          <ul className="mt-2.5 grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
            {t.intro.liveItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12.5px] leading-snug text-white/62">
                <Check className="mt-[3px] h-3 w-3 shrink-0 text-accent-green/80" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.p
          {...fade(0.36, 8)}
          className="mx-auto mt-4 hidden max-w-xl items-start justify-center gap-1.5 text-[11.5px] leading-relaxed text-muted/55 sm:flex"
        >
          <Info className="mt-[2px] h-3 w-3 shrink-0" />
          <span>{t.intro.honestNote}</span>
        </motion.p>
        <motion.div
          {...fade(0.42, 6)}
          className="mt-7 hidden items-center justify-center sm:flex lg:hidden"
        >
          <span className="flex flex-col items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-muted/45">
            {t.intro.scrollHint}
            <span className="scroll-cue" />
          </span>
        </motion.div>
      </div>
    </div>
  );
}
