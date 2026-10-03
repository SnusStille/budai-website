"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronDown,
  FileText,
  GitBranch,
  Languages,
  Layers,
  Mic,
  PenLine,
  Route,
  User,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import { LIMITS } from "@/lib/limits";
import { renderMarkdown } from "@/components/playground/markdown";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Demo: the same three things a visitor can try in the Playground ─── */

type Demo = { id: string; label: { sv: string; en: string }; body: { sv: string; en: string } };

const DEMOS: Demo[] = [
  {
    id: "draft",
    label: { sv: "Skriv ett utkast", en: "Draft something" },
    body: {
      sv: `**Ämne:** Uppföljning efter piloten

Hej Anna,

kort sammanfattning efter två veckor med piloten:

- **Utfall:** 4 av 5 arbetsflöden gick snabbare
- **Risk:** datakvaliteten i underlaget
- **Nästa steg:** avstämning torsdag 10:00

Vill du att jag skickar samma underlag till ekonomiteamet?`,
      en: `**Subject:** Follow-up after the pilot

Hi Anna,

a short summary after two weeks of the pilot:

- **Outcome:** 4 of 5 workflows got faster
- **Risk:** the quality of the source data
- **Next step:** check-in Thursday 10:00

Want me to send the same material to the finance team?`,
    },
  },
  {
    id: "analyze",
    label: { sv: "Analysera text", en: "Analyze text" },
    body: {
      sv: `**Vad texten säger**
Kunden är positiv till produkten men tvekar om priset.

**Vad som är otydligt**
Två av tre beslut saknar ägare och datum.

**Förslag**
1. Lyft prisfrågan först i nästa möte
2. Sätt ägare på varje beslut
3. Skicka en uppföljning inom 48 timmar`,
      en: `**What the text says**
The customer likes the product but hesitates on price.

**What is unclear**
Two of three decisions have no owner and no date.

**Suggestion**
1. Raise pricing first in the next meeting
2. Assign an owner to every decision
3. Send a follow-up within 48 hours`,
    },
  },
  {
    id: "options",
    label: { sv: "Två förslag att välja mellan", en: "Two options to choose from" },
    body: {
      sv: `**Alternativ A — kort och formellt**
Tack för underlaget. Vi återkommer med besked senast fredag.

**Alternativ B — varmare ton**
Tack för att du skickade underlaget! Vi tittar igenom det och hör av oss senast på fredag.

Säg till om du vill ha en tredje variant — kortare, eller mer formell.`,
      en: `**Option A — short and formal**
Thank you for the material. We will get back to you no later than Friday.

**Option B — warmer tone**
Thanks for sending this over! We will look through it and be in touch by Friday.

Say the word if you want a third version — shorter, or more formal.`,
    },
  },
];

const FAQ = [
  {
    q: { sv: "Vad är BudAI?", en: "What is BudAI?" },
    a: {
      sv: "En AI-arbetsassistent för Sverige och Norden. Du skriver, planerar, analyserar och automatiserar i samma yta — på svenska eller engelska.",
      en: "An AI work assistant for Sweden and the Nordics. You write, plan, analyze and automate in the same surface — in Swedish or English.",
    },
  },
  {
    q: { sv: "Kan jag testa innan jag går med i väntelistan?", en: "Can I try it before joining the waitlist?" },
    a: {
      sv: `Ja — Playground högst upp på sidan är live. Som gäst får du ${LIMITS.guest.messagesPerDay} meddelanden per dag. Med ett konto får du ${LIMITS.member.messagesPerDay}, molnhistorik, bildanalys och minne.`,
      en: `Yes — the Playground at the top of this page is live. As a guest you get ${LIMITS.guest.messagesPerDay} messages a day. With an account you get ${LIMITS.member.messagesPerDay}, cloud history, image analysis and memory.`,
    },
  },
  {
    q: { sv: "Varför är gränserna så låga?", en: "Why are the limits so low?" },
    a: {
      sv: "Det här är en förhandsvisning som ska hålla för alla som testar samtidigt. Gränserna är satta med flit, nollställs varje dag och höjs när accessen öppnas i vågor.",
      en: "This is a preview that has to hold up for everyone testing at once. The limits are deliberate, reset every day, and rise as access opens in waves.",
    },
  },
  {
    q: { sv: "Vad kostar BudAI?", en: "What does BudAI cost?" },
    a: {
      sv: "Förhandsvisningen är gratis att prova. Prissättning presenteras innan full lansering — den som står på väntelistan låser 10 % med koden BUDAI-EARLY-10.",
      en: "The preview is free to try. Pricing is announced before full launch — anyone on the waitlist locks 10% with the code BUDAI-EARLY-10.",
    },
  },
  {
    q: { sv: "Hur hanteras mina data?", en: "How is my data handled?" },
    a: {
      sv: "Som gäst stannar konversationerna i din egen webbläsare. Inloggad sparas historiken i ditt konto och minnet kan du radera rad för rad. Vi tränar inte på dina konversationer.",
      en: "As a guest, conversations stay in your own browser. Signed in, history is stored in your account and you can delete memory row by row. We do not train on your conversations.",
    },
  },
  {
    q: { sv: "När öppnar ni för fler?", en: "When do you open for more people?" },
    a: {
      sv: "Accessen öppnas i vågor. Väntelistan är platsen där vi meddelar nästa våg — du får ett mejl när det är din tur.",
      en: "Access opens in waves. The waitlist is where we announce the next wave — you get an email when it is your turn.",
    },
  },
];

const STEPS = [
  {
    id: "intent",
    icon: PenLine,
    titleKey: "flow1Title" as const,
    bodyKey: "flow1Body" as const,
    tag: "intent",
  },
  {
    id: "stream",
    icon: GitBranch,
    titleKey: "flow2Title" as const,
    bodyKey: "flow2Body" as const,
    tag: "stream",
  },
  {
    id: "handoff",
    icon: Layers,
    titleKey: "flow3Title" as const,
    bodyKey: "flow3Body" as const,
    tag: "handoff",
  },
];

function DemoWindow() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const demo = DEMOS[active];

  // Cycle through the three demo types; each one types itself out.
  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % DEMOS.length), 11000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const full = sv ? demo.body.sv : demo.body.en;
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      // Type faster when the text is longer so the window never lags behind.
      i += Math.max(1, Math.round(full.length / 260));
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [demo, sv]);

  const nodes = useMemo(() => renderMarkdown(typed), [typed]);

  return (
    <div className="card overflow-hidden p-0">
      {/* window chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="fig">fig 02.1</span>
          <span className="hidden font-mono text-[11px] text-muted/70 sm:inline">
            budai — {sv ? "så byggs ett svar" : "how an answer is built"}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green/80">
          <span className="status-dot !h-[5px] !w-[5px]" />
          {sv ? "live exempel" : "live sample"}
        </span>
      </div>

      {/* mode tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/[0.05] px-3 py-2.5 sm:px-4">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActive(i)}
            className={`chip !px-3 !py-1.5 !text-[12px] ${i === active ? "chip-active" : "chip-hover"}`}
            aria-pressed={i === active}
          >
            {sv ? d.label.sv : d.label.en}
          </button>
        ))}
      </div>

      <div className="min-h-[260px] px-4 py-5 sm:min-h-[290px] sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={demo.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="text-[13.5px] leading-relaxed text-white/78"
          >
            {nodes}
            <span className="pg-caret ml-0.5 align-middle" aria-hidden />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** What BudAI is, how it works, what it costs you in limits, and the honest FAQ. */
export default function ProductStory() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const limitRows = [
    { label: t.what.limitsDaily, guest: `${LIMITS.guest.messagesPerDay}`, member: `${LIMITS.member.messagesPerDay}` },
    { label: t.what.limitsImages, guest: `${LIMITS.guest.imagesPerDay}`, member: `${LIMITS.member.imagesPerDay}` },
    {
      label: t.what.limitsGenerations,
      guest: `${LIMITS.guest.generationsPerDay}`,
      member: `${LIMITS.member.generationsPerDay}`,
    },
    { label: t.what.limitsHistory, guest: `${LIMITS.guest.maxHistory}`, member: `${LIMITS.member.maxHistory}` },
  ];

  const audience = [
    {
      id: "individual",
      icon: User,
      label: t.what.individualsLabel,
      body: t.what.individualsBody,
      points: sv
        ? ["Mejl, ansökningar och anteckningar", "Planera veckan och projekt", "Lär dig något nytt, förklarat enkelt"]
        : ["Emails, applications and notes", "Plan the week and your projects", "Learn something new, explained simply"],
    },
    {
      id: "business",
      icon: Building2,
      label: t.what.businessLabel,
      body: t.what.businessBody,
      points: sv
        ? ["Utkast och beslutsunderlag", "Playbooks för återkommande jobb", "Stöd i support och kundflöden"]
        : ["Drafts and decision material", "Playbooks for recurring work", "Support in service and customer flows"],
    },
  ];

  return (
    <section id="budai" className="relative scroll-mt-24 py-20 sm:py-24 md:py-28">
      {/* one ambient layer for the whole section */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora opacity-40" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-shell px-4 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <ScrollReveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">
              <span className="fig !border-transparent !bg-transparent !px-0">02</span>
              {t.what.badge}
            </p>
            <h2 className="t-h2 t-balance mt-4 text-white">
              {t.what.title} <span className="text-gradient">{t.what.titleHighlight}</span>
            </h2>
          </div>
          <p className="t-lead max-w-md lg:text-right">{t.what.subtitle}</p>
        </ScrollReveal>

        {/* ── Who it is for ──────────────────────────────────────── */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {audience.map((a, i) => (
            <ScrollReveal key={a.id} delay={i * 0.06}>
              <div className="card card-hover card-edge h-full p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] border border-white/[0.09] bg-white/[0.03]">
                    <a.icon className="h-4 w-4 text-accent-cyan" />
                  </span>
                  <h3 className="t-h4 text-white">{a.label}</h3>
                </div>
                <p className="t-body mt-4">{a.body}</p>
                <ul className="mt-5 space-y-2 border-t border-white/[0.06] pt-5">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-white/70">
                      <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-accent-cyan/80" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── How an answer is built ─────────────────────────────── */}
        <ScrollReveal className="mt-20 sm:mt-24">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <p className="eyebrow">
                <span className="fig !border-transparent !bg-transparent !px-0">02.1</span>
                {sv ? "Så fungerar det" : "How it works"}
              </p>
              <h3 className="t-h3 t-balance mt-4 text-white">{t.what.flowTitle}</h3>
              <p className="t-lead mt-4 max-w-md text-[15px]">{t.what.flowBody}</p>

              <ol className="mt-8 space-y-6">
                {STEPS.map((s, i) => (
                  <li key={s.id} className="relative flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-white/[0.09] bg-white/[0.03]">
                      <s.icon className="h-4 w-4 text-white/70" />
                    </span>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14.5px] font-semibold tracking-tight text-white">{t.what[s.titleKey]}</h4>
                        <span className="fig !py-[1px] !text-[9.5px]">{s.tag}</span>
                      </div>
                      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">{t.what[s.bodyKey]}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[17px] top-10 h-[calc(100%-14px)] w-px bg-gradient-to-b from-white/12 to-transparent"
                      />
                    )}
                  </li>
                ))}
              </ol>

              <a href="#playground" className="link-arrow mt-8 inline-flex text-accent-cyan">
                {t.what.openPlayground}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="lg:col-span-8">
              <DemoWindow />
            </div>
          </div>
        </ScrollReveal>

        {/* ── Real limits ────────────────────────────────────────── */}
        <ScrollReveal className="mt-20 sm:mt-24">
          <div className="card overflow-hidden p-0">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-4">
                <p className="eyebrow">
                  <span className="fig !border-transparent !bg-transparent !px-0">02.2</span>
                  {sv ? "Gränser" : "Limits"}
                </p>
                <h3 className="t-h3 mt-4 text-white">{t.what.limitsTitle}</h3>
                <p className="t-body mt-3 max-w-sm">{t.what.limitsBody}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-[12px] text-muted/70">
                  <BarChart3 className="h-3.5 w-3.5 text-accent-cyan/80" />
                  {t.what.limitsReset}
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-[var(--r-md)] border border-white/[0.07]">
                  <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-muted/70 sm:px-5">
                    <span>{sv ? "Förmåga" : "Capability"}</span>
                    <span className="text-center">{t.what.limitsGuest}</span>
                    <span className="text-center text-accent-cyan">{t.what.limitsMember}</span>
                  </div>
                  {limitRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center gap-2 border-b border-white/[0.05] px-4 py-3.5 text-[13.5px] last:border-0 sm:px-5"
                    >
                      <span className="text-white/78">{row.label}</span>
                      <span className="text-center font-mono text-[13px] text-muted">{row.guest}</span>
                      <span className="text-center font-mono text-[13px] text-white">{row.member}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-start gap-2 bg-white/[0.015] px-4 py-3.5 text-[12.5px] sm:px-5">
                    <span className="text-white/78">{t.what.limitsMemory}</span>
                    <span className="text-center leading-snug text-muted">{sv ? "Av" : "Off"}</span>
                    <span className="text-center leading-snug text-white/85">{sv ? "På" : "On"}</span>
                  </div>
                </div>
                <p className="mt-3 px-1 text-[11.5px] leading-relaxed text-muted/60">
                  {t.what.limitsMemoryMember} · {t.what.limitsMemoryGuest}
                </p>
              </div>
            </div>

            {/* Preview disclosure strip */}
            <div className="flex flex-col gap-3 border-t border-white/[0.06] bg-white/[0.015] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-start gap-3">
                <span className="preview-tag mt-0.5">{sv ? "preview" : "preview"}</span>
                <div>
                  <p className="text-[13.5px] font-medium text-white">{t.what.previewTitle}</p>
                  <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-muted">{t.what.previewBody}</p>
                </div>
              </div>
              <Link href="/roadmap" className="link-arrow shrink-0 text-[13.5px] text-accent-cyan">
                {sv ? "Se vad som är klart" : "See what is ready"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <div id="faq" className="mt-20 scroll-mt-28 sm:mt-24">
          <ScrollReveal className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">
                <span className="fig !border-transparent !bg-transparent !px-0">02.3</span>
                {t.what.faqTitle}
              </p>
              <h3 className="t-h3 mt-4 text-white">
                {sv ? "Det folk frågar först" : "What people ask first"}
              </h3>
              <p className="t-body mt-3 max-w-sm">
                {sv
                  ? "Korta svar, inga undanflykter. Saknas din fråga — gå med i väntelistan och ställ den direkt."
                  : "Short answers, no dodging. Missing your question — join the waitlist and ask it directly."}
              </p>
              <a href="#waitlist" className="link-arrow mt-5 inline-flex text-accent-cyan">
                {t.nav.requestAccess}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="lg:col-span-8">
              <div className="overflow-hidden rounded-[var(--r-md)] border border-white/[0.07] bg-white/[0.015]">
                {FAQ.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q.en} className="border-b border-white/[0.05] last:border-0">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.02] sm:px-6 sm:py-5"
                      >
                        <span className={`text-[14.5px] font-medium ${open ? "text-white" : "text-white/80"}`}>
                          {sv ? f.q.sv : f.q.en}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                            open ? "rotate-180 text-accent-cyan" : "text-muted"
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.26, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <p className="max-w-2xl px-4 pb-5 text-[13.5px] leading-relaxed text-muted sm:px-6">
                              {sv ? f.a.sv : f.a.en}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Small capability footer row (honest, no filler) ────── */}
        <ScrollReveal className="mt-16 sm:mt-20">
          <div className="grid gap-px overflow-hidden rounded-[var(--r-md)] border border-white/[0.07] bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileText, sv: "Utkast och dokument", en: "Drafts and documents" },
              { icon: Languages, sv: "Svenska och engelska", en: "Swedish and English" },
              { icon: Mic, sv: "Röst och bildanalys", en: "Voice and image analysis" },
              { icon: Route, sv: "Historik, export, Workspace", en: "History, export, Workspace" },
            ].map((item) => (
              <div key={item.en} className="flex items-center gap-3 bg-background/85 px-5 py-5">
                <item.icon className="h-4 w-4 shrink-0 text-accent-cyan/80" />
                <span className="text-[13.5px] text-white/75">{sv ? item.sv : item.en}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
