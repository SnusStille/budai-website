"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import HashRedirect from "@/components/layout/HashRedirect";
import CookieConsent from "@/components/ui/CookieConsent";
import { useLang } from "@/components/ui/LanguageContext";

const HOME_CHIPS = {
  sv: [
    { label: "Planera dagen", q: "Jag har 6 timmar djupjobb, två möten och en deadline imorgon. Bygg en realistisk dagsplan." },
    { label: "Skriv ett mejl", q: "Skriv ett kort, varmt och proffsigt uppföljningsmejl efter ett första möte." },
    { label: "Analysera", q: "Ge mig en ärlig SWOT för att rulla ut en AI-arbetsassistent i ett svenskt SME." },
    { label: "Brainstorm", q: "Ge mig sju originella sätt en nordisk produktchef kan använda BudAI en vanlig vecka." },
  ],
  en: [
    { label: "Plan my day", q: "I have 6 hours of deep work, two meetings, and a deadline tomorrow. Build a realistic day plan." },
    { label: "Write an email", q: "Write a short, warm, professional follow-up email after a first meeting." },
    { label: "Analyze", q: "Give me an honest SWOT for rolling out an AI work assistant in a Swedish SME." },
    { label: "Brainstorm", q: "Give me seven original ways a Nordic product lead could use BudAI in a normal week." },
  ],
};

export default function HomeGateway() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const tmr = window.setTimeout(() => inputRef.current?.focus(), 380);
    return () => window.clearTimeout(tmr);
  }, []);

  const goPlayground = (prompt?: string) => {
    const text = (prompt ?? q).trim();
    if (text) {
      router.push(`/playground?q=${encodeURIComponent(text)}`);
    } else {
      router.push("/playground");
    }
  };

  const chips = HOME_CHIPS[lang];

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background text-white overflow-x-hidden">
      <HashRedirect />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-[-18%] left-1/2 -translate-x-1/2 w-[80vw] max-w-[820px] h-[52vh] rounded-full bg-accent-cyan/[0.09] blur-[140px]" />
      </div>

      <SiteNav />

      <main className="relative z-10 flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] text-white/55 mb-8"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-accent-green animate-ping opacity-60" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-accent-green" />
            </span>
            {t.home.badge}
            <span className="text-white/20">·</span>
            {t.home.nordic}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-7"
          >
            <BudAILogo size="xl" animated />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-[3.25rem] sm:text-6xl md:text-7xl font-bold tracking-[-0.05em] text-white leading-none"
          >
            Bud<span className="text-accent-cyan">AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-4 text-lg sm:text-xl text-white/55 tracking-tight"
          >
            {t.home.tagline}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-3 max-w-md text-[15px] text-white/42 leading-relaxed"
          >
            {t.home.subtitle}
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-10 w-full max-w-[560px]"
            onSubmit={(e) => {
              e.preventDefault();
              goPlayground();
            }}
          >
            <label className="sr-only" htmlFor="home-composer">
              {t.home.composerPlaceholder}
            </label>
            <div className="pg-composer flex items-end gap-2 rounded-[28px] border border-white/[0.1] bg-[#121218] px-3.5 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <textarea
                id="home-composer"
                ref={inputRef}
                rows={1}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    goPlayground();
                  }
                }}
                placeholder={t.home.composerPlaceholder}
                className="flex-1 bg-transparent resize-none text-[16px] text-white placeholder:text-white/35 focus:outline-none min-h-[32px] max-h-[120px] py-1.5 px-1"
              />
              <button
                type="submit"
                className="shrink-0 h-10 w-10 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-30"
                aria-label={t.home.ctaPrimary}
                disabled={!q.trim()}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2.5 text-[11px] text-white/28">{t.home.composerHint}</p>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.36 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => goPlayground(c.q)}
                className="px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-[12px] text-white/55 hover:text-white hover:border-white/18 transition-colors"
              >
                {c.label}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]"
          >
            <Link href="/playground" className="text-white/70 hover:text-white transition-colors">
              {t.home.ctaPrimary}
            </Link>
            <span className="text-white/15">·</span>
            <Link href="/waitlist" className="text-white/70 hover:text-white transition-colors">
              {t.home.ctaSecondary}
              <span className="ml-1.5 text-accent-cyan/90 text-[11px]">10%</span>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.56 }}
            className="mt-8 text-[11px] text-white/28"
          >
            {t.home.bilingual}
            <span className="mx-2 text-white/12">·</span>
            {t.home.preview}
          </motion.p>
        </section>
      </main>

      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
