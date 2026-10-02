"use client";

import { motion } from "framer-motion";
import { ChevronDown, Languages, ShieldCheck, Sparkles } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevLink } from "@/components/ui/BudAILogo";

/**
 * The home page opens straight into the product.
 * This block is deliberately short: one badge, one claim, one line of context —
 * then the Playground takes over the screen.
 */
export default function PlaygroundIntro() {
  const { t, lang } = useLang();
  const sv = lang === "sv";

  const trust = [
    { icon: Sparkles, label: t.intro.trustFree },
    { icon: Languages, label: t.intro.trustLang },
    { icon: ShieldCheck, label: t.intro.trustPrivacy },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-6 pt-20 text-center sm:px-6 sm:pb-8 sm:pt-24 lg:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="inline-flex items-center gap-2.5 rounded-full border border-accent-green/25 bg-accent-green/[0.06] px-3.5 py-1.5"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-green" />
        </span>
        <span className="text-[11.5px] font-medium text-accent-green">{t.intro.badge}</span>
        <span className="h-3 w-px bg-white/10" />
        <span className="text-[11.5px] text-muted">{t.intro.badgeLive}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-4 text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:mt-5 sm:text-5xl lg:text-[3rem]"
      >
        <span className="block text-white/95">{t.intro.title1}</span>
        <span className="mt-0.5 block text-gradient">{t.intro.title2}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-muted sm:mt-5 sm:text-[16.5px]"
      >
        {t.intro.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.24 }}
        className="mt-5 hidden flex-wrap items-center justify-center gap-x-2.5 gap-y-2 sm:flex"
      >
        {trust.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-muted"
          >
            <item.icon className="h-3.5 w-3.5 text-accent-cyan" />
            {item.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 px-1 py-1.5 text-[11.5px] text-muted/55">
          {sv ? "Utvecklad av " : "Built by "}
          <StilledevLink />
        </span>
      </motion.div>

      <motion.a
        href="#budai"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.34 }}
        className="mt-5 hidden items-center justify-center gap-1.5 text-[11.5px] text-muted/50 transition-colors hover:text-accent-cyan sm:flex lg:hidden"
      >
        {t.intro.scrollHint}
        <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
      </motion.a>
    </div>
  );
}
