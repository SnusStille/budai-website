"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Workflow,
  BarChart3,
  Languages,
  ChevronDown,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  BrainCircuit,
  Image as ImageIcon,
  Mic,
  Shield,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo from "@/components/ui/BudAILogo";

const capabilities = [
  {
    id: "write",
    icon: FileText,
    title: "Write & draft",
    titleSv: "Skriv & utkast",
    tag: "Docs",
    tagSv: "Dokument",
    desc: "Reports, emails, proposals, and notes in your voice — Swedish or English — in seconds.",
    descSv:
      "Rapporter, mejl, offerter och anteckningar i din ton — svenska eller engelska — på sekunder.",
    preview:
      "Subject: Q2 pilot proposal\n\nHi team — here's a crisp one-pager…",
    previewSv:
      "Ämne: Q2-pilotförslag\n\nHej team — här är en skarp one-pager…",
    gradient: "from-accent-cyan to-accent-blue",
    accent: "text-accent-cyan",
    glow: "rgba(0,229,255,0.15)",
  },
  {
    id: "automate",
    icon: Workflow,
    title: "Automate the routine",
    titleSv: "Automatisera rutin",
    tag: "Ops",
    tagSv: "Drift",
    desc: "Turn recurring work into clear playbooks so your team spends time on judgment, not copy-paste.",
    descSv:
      "Gör återkommande jobb till playbooks så teamet lägger tid på bedömning — inte copy-paste.",
    preview: "1. Collect inputs\n2. Draft summary\n3. Flag risks\n4. Send digest",
    previewSv: "1. Samla input\n2. Utkast sammanfattning\n3. Flagga risker\n4. Skicka digest",
    gradient: "from-accent-purple to-accent-pink",
    accent: "text-accent-purple",
    glow: "rgba(185,103,255,0.15)",
  },
  {
    id: "decide",
    icon: BarChart3,
    title: "Decide with clarity",
    titleSv: "Besluta tydligare",
    tag: "Insight",
    tagSv: "Insikt",
    desc: "Summarize messy context, surface risks, and get concrete next steps — practical, not vague.",
    descSv:
      "Sammanfatta rörig kontext, lyft risker och få konkreta nästa steg — praktiskt, inte vagt.",
    preview: "Risk: medium\nBlocker: data quality\nNext: 3 owners, 1 week",
    previewSv: "Risk: medium\nBlocker: datakvalitet\nNästa: 3 ägare, 1 vecka",
    gradient: "from-accent-green to-accent-cyan",
    accent: "text-accent-green",
    glow: "rgba(0,255,157,0.12)",
  },
  {
    id: "bilingual",
    icon: Languages,
    title: "Nordic bilingual",
    titleSv: "Nordisk tvåspråkig",
    tag: "SV · EN",
    tagSv: "SV · EN",
    desc: "Built for teams that switch languages mid-day without dropping quality or tone.",
    descSv:
      "Byggd för team som byter språk mitt i dagen utan att tappa kvalitet eller ton.",
    preview: "Draft in SV → polish in EN\nSame intent. Same quality.",
    previewSv: "Utkast på SV → putsa på EN\nSamma intent. Samma kvalitet.",
    gradient: "from-accent-pink to-accent-purple",
    accent: "text-accent-pink",
    glow: "rgba(255,107,157,0.12)",
  },
];

const PRODUCT_PILLS = [
  {
    icon: BrainCircuit,
    en: "Auto memory",
    sv: "Autominnes",
    tipEn: "Durable facts saved for members — you control every row",
    tipSv: "Hållbara fakta sparas för konton — du styr varje rad",
  },
  {
    icon: ImageIcon,
    en: "Vision",
    sv: "Vision",
    tipEn: "Upload an image — BudAI analyzes it with Claude vision",
    tipSv: "Ladda upp en bild — BudAI analyserar med Claude vision",
  },
  {
    icon: Mic,
    en: "Voice input",
    sv: "Röstinput",
    tipEn: "Speak prompts via Web Speech — graceful fallback",
    tipSv: "Prata in prompts via Web Speech — mjuk fallback",
  },
  {
    icon: Shield,
    en: "Guest → account",
    sv: "Gäst → konto",
    tipEn: "Try free daily limits; unlock cloud history when you sign in",
    tipSv: "Prova fria dagsgränser; lås molnhistorik när du loggar in",
  },
];

const FAQ = [
  {
    qSv: "Vad är BudAI?",
    qEn: "What is BudAI?",
    aSv: "En AI-arbetsassistent för Sverige — skriv, automatisera och tänk snabbare på SV och EN, i en yta.",
    aEn: "An AI work assistant for Sweden — write, automate, and think faster in SV and EN, in one surface.",
  },
  {
    qSv: "När lanserar ni?",
    qEn: "When do you launch?",
    aSv: "Developer preview v0.93 · 93%. Early access i vågor via väntelistan under 2026.",
    aEn: "Developer preview v0.93 · 93%. Early access in waves via the waitlist through 2026.",
  },
  {
    qSv: "Vad får jag med 10% early access?",
    qEn: "What's included with 10% early access?",
    aSv: "Kod BUDAI-EARLY-10 låses när du går med. Rabatten gäller vid lansering för founding members.",
    aEn: "Code BUDAI-EARLY-10 locks when you join. Discount applies at launch for founding members.",
  },
  {
    qSv: "Är det GDPR-vänligt?",
    qEn: "Is it GDPR-friendly?",
    aSv: "Ja — Nordic-first, tydliga gränser för modellinput, enterprise-säkerhet som mål. Preview är begränsad.",
    aEn: "Yes — Nordic-first, clear model-input boundaries, enterprise security as the target. Preview is limited.",
  },
  {
    qSv: "Kan jag testa innan jag går med?",
    qEn: "Can I try before joining?",
    aSv: "Öppna Playground som gäst (dagsgräns) eller logga in för minne, historik, vision och högre gränser.",
    aEn: "Open the Playground as a guest (daily cap) or sign in for memory, history, vision, and higher limits.",
  },
  {
    qSv: "Vad kostar det?",
    qEn: "What does it cost?",
    aSv: "Prissättning delas med early access. Preview är gratis att prova. Founding members låser 10 % vid launch.",
    aEn: "Pricing is shared with early access. Preview is free to try. Founding members lock 10% at launch.",
  },
];

export default function Capabilities() {
  const { t, lang } = useLang();
  const [active, setActive] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [typed, setTyped] = useState("");
  const [streamOn, setStreamOn] = useState(true);
  const cap = capabilities[active];

  // Live typewriter in the stage — the WOW moment
  useEffect(() => {
    if (!streamOn) return;
    const full = lang === "sv" ? cap.previewSv : cap.preview;
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [cap, lang, streamOn]);

  return (
    <section id="capabilities" className="relative section-hairline py-20 sm:py-24 md:py-32">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(90vw,700px)] h-[400px] bg-accent-cyan/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-10 md:mb-12">
          <span className="section-badge text-accent-cyan mb-5">{t.capabilities.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {t.capabilities.title}{" "}
            <span className="text-gradient">{t.capabilities.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.capabilities.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left">
              <div className="text-[11px] uppercase tracking-wider text-accent-cyan mb-1 font-medium">
                {lang === "sv" ? "Privatpersoner" : "Individuals"}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {lang === "sv"
                  ? "Skriv, planera, lär och organisera vardagen — utan att bli fast i verktygsdjungeln."
                  : "Write, plan, learn, and organize everyday work — without drowning in tools."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left">
              <div className="text-[11px] uppercase tracking-wider text-accent-purple mb-1 font-medium">
                {lang === "sv" ? "Företag" : "Businesses"}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {lang === "sv"
                  ? "Utkast, beslut, playbooks och supportflöden — samma yta för teamet."
                  : "Drafts, decisions, playbooks, and support flows — one surface for the team."}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Product capability strip — memorable WOW */}
        <ScrollReveal>
          <div className="mb-10 md:mb-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {PRODUCT_PILLS.map((p) => (
              <div
                key={p.en}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-3.5 sm:p-4 hover:border-accent-cyan/30 transition-colors"
              >
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-accent-cyan/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
                    <p.icon className="w-3.5 h-3.5 text-accent-cyan" />
                  </div>
                  <span className="text-sm font-semibold text-white tracking-tight">
                    {lang === "sv" ? p.sv : p.en}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                  {lang === "sv" ? p.tipSv : p.tipEn}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Interactive capability stage */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 items-stretch">
            <div className="lg:col-span-5 flex flex-col gap-2">
              {capabilities.map((c, i) => {
                const on = active === i;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => {
                      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                        setActive(i);
                      }
                    }}
                    className={`group text-left rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                      on
                        ? "border-accent-cyan/35 bg-accent-cyan/[0.06] shadow-[0_0_40px_rgba(0,229,255,0.08)]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} p-[1px] shrink-0 transition-transform duration-300 ${
                          on ? "scale-105" : "group-hover:scale-[1.03]"
                        }`}
                      >
                        <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                          <c.icon className={`w-5 h-5 ${c.accent}`} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`text-[15px] sm:text-base font-semibold tracking-tight ${
                              on ? "text-white" : "text-white/90"
                            }`}
                          >
                            {lang === "sv" ? c.titleSv : c.title}
                          </h3>
                          <span className="text-[10px] font-mono text-muted/60 px-1.5 py-0.5 rounded-md border border-white/[0.06]">
                            {lang === "sv" ? c.tagSv : c.tag}
                          </span>
                        </div>
                        <p className="text-sm text-muted leading-relaxed line-clamp-2">
                          {lang === "sv" ? c.descSv : c.desc}
                        </p>
                      </div>
                      <span
                        className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 transition-opacity ${
                          on ? "bg-accent-cyan opacity-100 shadow-[0_0_8px_#00e5ff]" : "opacity-0"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 relative min-h-[320px] sm:min-h-[400px]">
              <div
                className="absolute -inset-4 rounded-[2rem] blur-3xl opacity-60 pointer-events-none transition-colors duration-500"
                style={{ background: `radial-gradient(circle at 40% 30%, ${cap.glow}, transparent 60%)` }}
              />
              <div className="relative h-full rounded-3xl border border-white/[0.1] bg-[#07070e]/90 backdrop-blur-xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />
                {/* subtle scanline */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[linear-gradient(transparent_50%,rgba(0,229,255,0.35)_50%)] bg-[length:100%_4px]" />

                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <BudAILogo size="xs" animated />
                    <span className="text-xs font-mono text-muted">budai · {cap.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStreamOn((v) => !v)}
                      className="text-[10px] font-mono text-muted hover:text-white px-2 py-1 rounded-md border border-white/[0.06]"
                    >
                      {streamOn ? "live" : "pause"}
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] text-accent-green font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                      {lang === "sv" ? "stream" : "stream"}
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={cap.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="p-5 sm:p-7 flex flex-col h-[calc(100%-49px)]"
                  >
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${cap.accent} mb-2`}>
                          <Sparkles className="w-3.5 h-3.5" />
                          {lang === "sv" ? "Så känns det" : "How it feels"}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {lang === "sv" ? cap.titleSv : cap.title}
                        </h3>
                        <p className="text-sm text-muted mt-2 max-w-md leading-relaxed">
                          {lang === "sv" ? cap.descSv : cap.desc}
                        </p>
                      </div>
                      <div className={`hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br ${cap.gradient} p-[1px]`}>
                        <div className="w-full h-full rounded-2xl bg-[#0a0a12] flex items-center justify-center">
                          <cap.icon className={`w-6 h-6 ${cap.accent}`} />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 rounded-2xl border border-white/[0.07] bg-black/40 p-4 sm:p-5 font-mono text-[12px] sm:text-[13px] text-white/85 leading-relaxed whitespace-pre-wrap min-h-[140px]">
                      {typed}
                      <span className="inline-block w-1.5 h-4 bg-accent-cyan ml-0.5 align-middle animate-pulse" />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <a
                        href="#playground"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-cyan hover:text-white transition-colors"
                      >
                        {lang === "sv" ? "Öppna Playground" : "Open Playground"}
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-muted font-mono">
                        <Zap className="w-3 h-3 text-accent-purple" />
                        {lang === "sv" ? "live produkt · inte mock" : "live product · not a mock"}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ under cards */}
        <div id="faq" className="mt-16 md:mt-20 max-w-3xl mx-auto scroll-mt-28">
          <ScrollReveal className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted/70 font-medium mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-accent-cyan" />
              FAQ
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {lang === "sv" ? "Vanliga frågor" : "Common questions"}
            </h3>
          </ScrollReveal>

          <div className="space-y-2">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <ScrollReveal key={i} delay={i * 0.02}>
                  <div
                    className={`rounded-2xl border overflow-hidden transition-colors ${
                      isOpen
                        ? "border-accent-cyan/25 bg-accent-cyan/[0.04]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-[15px] font-medium text-white pr-2">
                        {lang === "sv" ? item.qSv : item.qEn}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-accent-cyan" : "text-muted"
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-4 sm:px-5 pb-4 text-sm text-muted leading-relaxed border-t border-white/[0.05] pt-3">
                          {lang === "sv" ? item.aSv : item.aEn}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
