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
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Check as CheckIcon, X as XIcon, User as UserIcon, Building2 as BuildingIcon, Sparkles as SparkIcon } from "lucide-react";
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
    aSv: "Utvecklarförhandsvisning. Early access i vågor via väntelistan.",
    aEn: "Developer preview. Early access in waves via the waitlist.",
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
    aSv: "Priser kommer (Coming soon). Basic är gratis under preview, med begränsad användning. Founding members låser 10 % vid lansering.",
    aEn: "Pricing is coming soon. Basic is free during the preview, with limited usage. Founding members lock 10% at launch.",
  },
];

export default function Capabilities() {
  const { t, lang } = useLang();
  const sv = lang === "sv";
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      key: "basic",
      icon: SparkIcon,
      name: "Basic",
      tag: sv ? "Tillgänglig nu" : "Available now",
      price: sv ? "Gratis" : "Free",
      sub: sv ? "under preview" : "during the preview",
      note: sv ? "Minsta versionen. Perfekt för att prova BudAI." : "The smallest version. Perfect for trying BudAI.",
      pros: sv ? ["Playground på svenska och engelska", "Minne, historik och bilder med konto", "Röstinmatning"] : ["Playground in Swedish and English", "Memory, history and vision with an account", "Voice input"],
      cons: sv ? ["Minst antal dagliga credits", "Kortast historik och minne", "Ingen prioriterad åtkomst"] : ["Fewest daily credits", "Shortest history and memory", "No priority access"],
      cta: sv ? "Prova Playground" : "Try the Playground",
      href: "#playground",
      card: "border-accent-cyan/40 bg-accent-cyan/[0.05] shadow-[0_0_70px_-25px_rgba(0,229,255,0.55)]",
      bar: "from-accent-cyan to-accent-cyan/0",
      chip: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
      iconTone: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
      btn: "bg-accent-cyan text-[#020205]",
      blob: "bg-accent-cyan/20",
    },
    {
      key: "consumer",
      icon: UserIcon,
      name: sv ? "Konsument" : "Consumer",
      tag: "Coming soon",
      price: "Coming soon",
      sub: sv ? "pris kommer" : "pricing soon",
      note: sv ? "För dig som använder BudAI varje dag." : "For one person who uses BudAI every day.",
      pros: sv ? ["Många fler dagliga credits", "Längre historik och minne", "Tidig tillgång till nya funktioner"] : ["Many more daily credits", "Longer history and memory", "Early access to new features"],
      cons: sv ? ["Ett konto", "Ingen delad arbetsyta"] : ["One account", "No shared workspace"],
      cta: sv ? "Gå med i väntelistan" : "Join the waitlist",
      href: "#waitlist",
      card: "border-accent-purple/30 bg-accent-purple/[0.04]",
      bar: "from-accent-purple to-accent-purple/0",
      chip: "border-accent-purple/30 bg-accent-purple/10 text-accent-purple",
      iconTone: "border-accent-purple/30 bg-accent-purple/10 text-accent-purple",
      btn: "border border-accent-purple/40 text-white hover:bg-accent-purple/10",
      blob: "bg-accent-purple/20",
    },
    {
      key: "business",
      icon: BuildingIcon,
      name: sv ? "Företag" : "Business",
      tag: "Coming soon",
      price: "Coming soon",
      sub: sv ? "pris per team" : "priced per team",
      note: sv ? "För team. Ett paket, flera konton." : "For teams. One plan, many accounts.",
      pros: sv ? ["Delade credits över flera konton", "Delade rutiner och arbetsytor", "Adminkontroll och prioriterad support"] : ["Credits shared across multiple accounts", "Shared playbooks and workspaces", "Admin controls and priority support"],
      cons: sv ? ["Prissätts per team", "Kräver ett företagskonto"] : ["Priced per team", "Needs a company account"],
      cta: sv ? "Gå med i väntelistan" : "Join the waitlist",
      href: "#waitlist",
      card: "border-accent-green/30 bg-accent-green/[0.04]",
      bar: "from-accent-green to-accent-green/0",
      chip: "border-accent-green/30 bg-accent-green/10 text-accent-green",
      iconTone: "border-accent-green/30 bg-accent-green/10 text-accent-green",
      btn: "border border-accent-green/40 text-white hover:bg-accent-green/10",
      blob: "bg-accent-green/20",
    },
  ];

  return (
    <section id="capabilities" className="relative section-hairline py-20 sm:py-24 md:py-32">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(90vw,700px)] h-[400px] bg-accent-cyan/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-12">
          <span className="section-badge text-accent-cyan mb-5">{t.capabilities.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {t.capabilities.title} <span className="text-gradient">{t.capabilities.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {sv
              ? "BudAI byggs för att bli en av de bästa AI:erna någonsin, och det tar tid. Gratis att prova idag. Mer credits, längre minne och teamkonton när du behöver det."
              : "BudAI is being built to become one of the best AIs ever, and that takes time. Free to try today. More credits, longer memory and team accounts when you need them."}
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-4 mb-5 bud-3d-in">
          {plans.map((pl, i) => (
            <ScrollReveal key={pl.key} delay={i * 0.05}>
              <SpotlightCard className={`h-full rounded-2xl border ${pl.card}`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${pl.bar}`} />
                <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${pl.blob}`} />
                <div className="relative flex h-full flex-col p-6 pt-7">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${pl.iconTone}`}>
                        <pl.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{pl.name}</h3>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${pl.chip}`}>{pl.tag}</span>
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-white">
                    {pl.price} <span className="text-sm font-normal text-muted">{pl.sub}</span>
                  </p>
                  <p className="mt-1 mb-5 text-sm text-muted">{pl.note}</p>

                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-accent-green/80">{sv ? "Du får" : "You get"}</p>
                  <ul className="mb-4 space-y-2 text-sm text-white/85">
                    {pl.pros.map((it) => (
                      <li key={it} className="flex gap-2.5">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-amber-300/80">{sv ? "Begränsningar" : "Limits"}</p>
                  <ul className="mb-6 space-y-2 text-sm text-muted">
                    {pl.cons.map((it) => (
                      <li key={it} className="flex gap-2.5">
                        <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/70" />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <a href={pl.href} className={`mt-auto rounded-full py-2.5 text-center text-sm font-semibold transition-all hover:opacity-90 ${pl.btn}`}>
                    {pl.cta}
                  </a>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
        <p className="mb-16 text-center text-sm text-muted/80 max-w-2xl mx-auto">
          {sv
            ? "Samma AI i alla paket. Basic har minst credits och kortast minne. Betalpaketen låser upp mer användning, längre minne och teamfunktioner."
            : "Same AI in every plan. Basic has the fewest credits and the shortest memory. Paid plans unlock more usage, longer memory and team features."}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-16 bud-3d-in">
          {[
            { i: FileText, t: sv ? "Skriv" : "Write", d: sv ? "Mejl, rapporter, förslag." : "Emails, reports, proposals." },
            { i: Workflow, t: sv ? "Automatisera" : "Automate", d: sv ? "Rutiner till tydliga steg." : "Routines into clear steps." },
            { i: BarChart3, t: sv ? "Besluta" : "Decide", d: sv ? "Sammanfatta, risker, nästa steg." : "Summaries, risks, next steps." },
            { i: Languages, t: sv ? "Svenska + engelska" : "Swedish + English", d: sv ? "Byt språk utan tapp i ton." : "Switch language, keep the tone." },
            { i: BrainCircuit, t: sv ? "Minne" : "Memory", d: sv ? "Kommer ihåg det du väljer." : "Remembers what you choose." },
            { i: ImageIcon, t: sv ? "Bild och röst" : "Vision and voice", d: sv ? "Ladda upp bilder, prata in." : "Upload images, speak prompts." },
          ].map((x) => (
            <SpotlightCard key={x.t} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-accent-cyan/30">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-cyan/20 bg-accent-cyan/10 text-accent-cyan">
                  <x.i className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white">{x.t}</p>
                  <p className="text-[13px] text-muted">{x.d}</p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>

      </div>
    </section>
  );
}
