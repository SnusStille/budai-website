"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  ChevronDown,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Languages,
  Mic,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import BudAILogo from "@/components/ui/BudAILogo";
import { LIMITS } from "@/lib/limits";

type Capability = {
  id: string;
  icon: typeof FileText;
  title: string;
  titleSv: string;
  tag: string;
  desc: string;
  descSv: string;
  preview: string;
  previewSv: string;
  gradient: string;
  accent: string;
  glow: string;
};

const CAPABILITIES: Capability[] = [
  {
    id: "write",
    icon: FileText,
    title: "Write & draft",
    titleSv: "Skriv & utkast",
    tag: "Docs",
    desc: "Reports, emails, proposals and notes in your voice — Swedish or English — in seconds.",
    descSv: "Rapporter, mejl, offerter och anteckningar i din ton — svenska eller engelska — på sekunder.",
    preview: "Subject: Q2 pilot proposal\n\nHi team — here's a crisp one-pager with scope, cost and the three risks we accept…",
    previewSv: "Ämne: Q2-pilotförslag\n\nHej team — här är en skarp one-pager med scope, kostnad och de tre risker vi accepterar…",
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
    desc: "Turn recurring work into clear playbooks so your time goes to judgment, not copy-paste.",
    descSv: "Gör återkommande jobb till playbooks så din tid går till bedömning — inte copy-paste.",
    preview: "1. Collect inputs\n2. Draft summary\n3. Flag risks\n4. Send the digest",
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
    desc: "Summarize messy context, surface the risks, and get concrete next steps — practical, not vague.",
    descSv: "Sammanfatta rörig kontext, lyft riskerna och få konkreta nästa steg — praktiskt, inte vagt.",
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
    desc: "Built for people who switch language mid-day without dropping quality or tone.",
    descSv: "Byggd för dig som byter språk mitt i dagen utan att tappa kvalitet eller ton.",
    preview: "Draft in SV → polish in EN\nSame intent. Same quality.",
    previewSv: "Utkast på SV → putsa på EN\nSamma intent. Samma kvalitet.",
    gradient: "from-accent-pink to-accent-purple",
    accent: "text-accent-pink",
    glow: "rgba(255,107,157,0.12)",
  },
];

const PILLS = [
  {
    icon: BrainCircuit,
    en: "Long-term memory",
    sv: "Långtidsminne",
    tipEn: "Durable facts are saved for signed-in users — you control every row",
    tipSv: "Hållbara fakta sparas för inloggade — du styr varje rad",
  },
  {
    icon: ImageIcon,
    en: "Image analysis",
    sv: "Bildanalys",
    tipEn: "Attach an image and BudAI reads it with Claude vision",
    tipSv: "Bifoga en bild så läser BudAI den med Claude vision",
  },
  {
    icon: Mic,
    en: "Voice input",
    sv: "Röstinput",
    tipEn: "Speak your prompt instead of typing it",
    tipSv: "Prata in din prompt i stället för att skriva",
  },
  {
    icon: Shield,
    en: "Guest → account",
    sv: "Gäst → konto",
    tipEn: `Try ${LIMITS.guest.messagesPerDay} free messages a day; sign in for ${LIMITS.member.messagesPerDay} and cloud history`,
    tipSv: `Prova ${LIMITS.guest.messagesPerDay} fria meddelanden per dag; logga in för ${LIMITS.member.messagesPerDay} och molnhistorik`,
  },
];

const FAQ = [
  {
    qSv: "Vad är BudAI?",
    qEn: "What is BudAI?",
    aSv: "En AI-arbetsassistent för Sverige och Norden. Du skriver, planerar, analyserar och automatiserar i samma yta — på svenska eller engelska.",
    aEn: "An AI work assistant for Sweden and the Nordics. You write, plan, analyze and automate in the same surface — in Swedish or English.",
  },
  {
    qSv: "Kan jag testa innan jag går med?",
    qEn: "Can I try it before joining?",
    aSv: `Ja. Playground högst upp på sidan är live. Som gäst får du ${LIMITS.guest.messagesPerDay} meddelanden per dag — med ett konto får du ${LIMITS.member.messagesPerDay}, molnhistorik, minne och bildanalys.`,
    aEn: `Yes. The Playground at the top of this page is live. Guests get ${LIMITS.guest.messagesPerDay} messages a day — an account gives you ${LIMITS.member.messagesPerDay}, cloud history, memory and image analysis.`,
  },
  {
    qSv: "Vad kostar det?",
    qEn: "What does it cost?",
    aSv: "Previewen är gratis att prova. Prissättning meddelas innan full lansering och founding members låser 10 % med koden BUDAI-EARLY-10.",
    aEn: "The preview is free to try. Pricing is announced before full launch and founding members lock 10% with the code BUDAI-EARLY-10.",
  },
  {
    qSv: "Är det GDPR-vänligt?",
    qEn: "Is it GDPR-friendly?",
    aSv: "Nordic-first är utgångspunkten: tydliga gränser för vad som skickas till modellen, minne du kan radera och ingen träning på dina konversationer.",
    aEn: "Nordic-first is the starting point: clear limits on what is sent to the model, memory you can delete, and no training on your conversations.",
  },
  {
    qSv: "När lanserar ni?",
    qEn: "When do you launch?",
    aSv: "Early access öppnas i vågor under 2026 via väntelistan. Du hör av oss när det är din tur.",
    aEn: "Early access opens in waves through 2026 via the waitlist. We reach out when it is your turn.",
  },
];

/** What BudAI is, what it does, and proof it works — one section, no filler. */
export default function WhatIsBudAI() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const [active, setActive] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [typed, setTyped] = useState("");
  const cap = CAPABILITIES[active];

  useEffect(() => {
    const full = sv ? cap.previewSv : cap.preview;
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 20);
    return () => window.clearInterval(id);
  }, [cap, sv]);

  return (
    <section id="budai" className="relative scroll-mt-24 py-20 sm:py-24 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[380px] w-[min(90vw,700px)] -translate-x-1/2 rounded-full bg-accent-cyan/[0.035] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <span className="section-badge mb-5 text-accent-cyan">{t.what.badge}</span>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl md:text-[3.1rem] md:leading-[1.08]">
            {t.what.title} <span className="text-gradient">{t.what.titleHighlight}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[17px]">
            {t.what.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: t.what.individualsLabel, body: t.what.individualsBody, color: "text-accent-cyan" },
            { label: t.what.businessLabel, body: t.what.businessBody, color: "text-accent-purple" },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left sm:p-5">
              <div className={`mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] ${c.color}`}>
                {c.label}
              </div>
              <p className="text-[13.5px] leading-relaxed text-muted">{c.body}</p>
            </div>
          ))}
        </ScrollReveal>

        <ScrollReveal className="mb-10 grid grid-cols-2 gap-2.5 md:mb-14 lg:grid-cols-4">
          {PILLS.map((p) => (
            <div
              key={p.en}
              className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.012] p-3.5 transition-colors hover:border-accent-cyan/25 sm:p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent-cyan/20 bg-accent-cyan/10">
                  <p.icon className="h-3.5 w-3.5 text-accent-cyan" />
                </span>
                <span className="text-[13px] font-semibold tracking-tight text-white">
                  {sv ? p.sv : p.en}
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-muted">{sv ? p.tipSv : p.tipEn}</p>
            </div>
          ))}
        </ScrollReveal>

        {/* Capability stage */}
        <ScrollReveal>
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12 lg:gap-5">
            <div className="flex flex-col gap-2 lg:col-span-5">
              {CAPABILITIES.map((c, i) => {
                const on = active === i;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => {
                      if (typeof window !== "undefined" && window.innerWidth >= 1024) setActive(i);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                      on
                        ? "border-accent-cyan/30 bg-accent-cyan/[0.055]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.13] hover:bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br p-[1px] ${c.gradient}`}>
                        <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0a0a12]">
                          <c.icon className={`h-[18px] w-[18px] ${c.accent}`} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-[14.5px] font-semibold tracking-tight ${on ? "text-white" : "text-white/85"}`}>
                          {sv ? c.titleSv : c.title}
                        </h3>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{sv ? c.descSv : c.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative min-h-[340px] lg:col-span-7">
              <div
                className="pointer-events-none absolute -inset-3 rounded-[2rem] opacity-55 blur-3xl transition-colors duration-500"
                style={{ background: `radial-gradient(circle at 40% 30%, ${cap.glow}, transparent 62%)` }}
              />
              <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-[#07070e]/92 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/45 to-transparent" />

                <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <BudAILogo size="xs" animated className="!h-6 !w-6" />
                    <span className="font-mono text-[11px] text-muted">budai · {cap.id}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-accent-green">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
                    {sv ? "exempel" : "sample"}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={cap.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-1 flex-col p-5 sm:p-6"
                  >
                    <div className={`mb-2 inline-flex items-center gap-1.5 text-[11.5px] font-medium ${cap.accent}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                      {t.what.stageLabel}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {sv ? cap.titleSv : cap.title}
                    </h3>
                    <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
                      {sv ? cap.descSv : cap.desc}
                    </p>

                    <div className="mt-5 min-h-[130px] flex-1 whitespace-pre-wrap rounded-2xl border border-white/[0.07] bg-black/40 p-4 font-mono text-[12.5px] leading-relaxed text-white/85">
                      {typed}
                      <span className="pg-caret ml-0.5 align-middle" aria-hidden />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <a
                        href="#playground"
                        className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent-cyan transition-colors hover:text-white"
                      >
                        {t.what.openPlayground}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                      <span className="text-[11px] text-muted/60">{t.what.stageLive}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ */}
        <div id="faq" className="mx-auto mt-16 max-w-3xl scroll-mt-28 md:mt-20">
          <ScrollReveal className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted/70">
              <HelpCircle className="h-3.5 w-3.5 text-accent-cyan" />
              {t.what.faqTitle}
            </span>
          </ScrollReveal>

          <ScrollReveal className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.qEn}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-5"
                  >
                    <span className={`text-[14px] font-medium ${open ? "text-white" : "text-white/85"}`}>
                      {sv ? f.qSv : f.qEn}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180 text-accent-cyan" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-[13.5px] leading-relaxed text-muted sm:px-5 sm:pb-5">
                          {sv ? f.aSv : f.aEn}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
