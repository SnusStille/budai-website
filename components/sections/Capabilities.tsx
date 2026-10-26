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
import CapabilityMap from "@/components/experience/CapabilityMap";
import Waitlist from "@/components/sections/Waitlist";

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
    glow: "rgba(124,92,255,0.15)",
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
    glow: "rgba(45,212,191,0.12)",
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
    glow: "rgba(167,139,250,0.12)",
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
      card: "border-white/20 bg-white/[0.04]",
      bar: "from-accent-cyan via-accent-purple to-accent-purple/0",
      chip: "border-white/20 bg-white/10 text-white",
      iconTone: "border-white/20 bg-white/10 text-white",
      btn: "border border-white/30 text-white hover:bg-white/10",
      blob: "bg-white/10",
    },
  ];

  return (
    <section id="capabilities" className="capabilities-universe relative section-hairline py-20 sm:py-24 md:py-32">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(90vw,700px)] h-[400px] bg-accent-cyan/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-12">
          <span className="chapter-label mb-6 inline-flex"><i />03 / {t.capabilities.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {t.capabilities.title} <span className="text-gradient">{t.capabilities.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {sv
              ? "BudAI byggs för att bli en av de bästa AI:erna någonsin, och det tar tid. Gratis att prova idag. Mer credits, längre minne och teamkonton när du behöver det."
              : "BudAI is being built to become one of the best AIs ever, and that takes time. Free to try today. More credits, longer memory and team accounts when you need them."}
          </p>
        </ScrollReveal>

        <CapabilityMap />
        <div className="plans-heading">
          <span>{sv ? "Välj din väg" : "Choose your way in"}</span>
          <p>{sv ? "Från rådata till färdigt svar — börja gratis och väx när du är redo." : "From raw input to structured output — start free and grow when you’re ready."}</p>
        </div>
        <div className="access-architecture" data-access-architecture data-ai-assembly-line aria-hidden="true">
          <div className="access-code-header">
            <span>{sv ? "03B / THE AI ASSEMBLY LINE · FLÖDE & NIVÅER" : "03B / THE AI ASSEMBLY LINE · WORKFLOW & ACCESS TIERS"}</span>
            <code>{`input(chat | image | voice) -> context.memory() -> model.stream() -> output`}</code>
          </div>
          <div className="access-fallback">
            <svg viewBox="-5 -2.1 10 4.2" width="100%" height="100%">
              {/* Stage 1: Raw Input Tiles & Intake Gate */}
              {[-0.85, -0.3, 0.25, 0.8].map((iy, idx) => (
                <rect key={idx} x="-4.4" y={iy - 0.16} width="1.15" height="0.3" rx="0.04" fill="#0d263a" stroke={idx % 2 === 0 ? "#78d5ea" : "#6ee7b7"} strokeWidth="0.02" />
              ))}
              <rect x="-2.85" y="-1.15" width="0.42" height="2.3" rx="0.04" fill="none" stroke="#78d5ea" strokeOpacity="0.8" strokeWidth="0.025" />
              {/* Stage 2: 3-Deck Context & Routing Matrix Rack */}
              <rect x="-1.45" y="-1.05" width="2.1" height="2.1" rx="0.06" fill="#0b2032" fillOpacity="0.85" stroke="#8ce8fa" strokeWidth="0.024" />
              {[-0.55, 0, 0.55].map((dy, dIdx) => (
                <rect key={dIdx} x="-1.25" y={dy - 0.14} width="1.7" height="0.28" rx="0.03" fill="#13344c" stroke={dIdx === 1 ? "#6ee7b7" : "#78d5ea"} strokeWidth="0.018" />
              ))}
              {/* Stage 3: Conduits */}
              {[-0.45, 0, 0.45].map((cy, cIdx) => (
                <path key={cIdx} d={`M -2.43 ${cy} L -1.45 ${cy} M 0.65 ${cy} L 1.75 ${cy}`} fill="none" stroke="#6ee7b7" strokeOpacity="0.78" strokeWidth="0.022" />
              ))}
              {/* Stage 4: Assembled Product Output Window + Mobile Companion */}
              <rect x="1.75" y="-1.1" width="2.45" height="2.2" rx="0.06" fill="#0d263b" fillOpacity="0.92" stroke="#6ee7b7" strokeWidth="0.026" />
              <rect x="1.95" y="-0.85" width="2.05" height="0.32" rx="0.03" fill="#163e5c" stroke="#78d5ea" strokeWidth="0.016" />
              <rect x="1.95" y="-0.38" width="1.2" height="1.15" rx="0.03" fill="#12324a" stroke="#78d5ea" strokeWidth="0.016" />
              <rect x="3.28" y="-0.38" width="0.72" height="1.15" rx="0.04" fill="#12324a" stroke="#6ee7b7" strokeWidth="0.018" />
            </svg>
          </div>
          <div className="access-labels">
            <span>
              <code>01 · INTAKE (CHAT · VISION · VOICE)</code>
              01 / BASIC
              <small>{sv ? "Tillgänglig nu · Direkt inmatning & svar" : "Available now · Direct intake & chat"}</small>
            </span>
            <span>
              <code>02 · CONTEXT &amp; MEMORY PIPELINE</code>
              02 / CONSUMER
              <small>{sv ? "Kommer snart · Strukturerat minne & modeller" : "Coming soon · Structured memory & models"}</small>
            </span>
            <span>
              <code>03 · COHERENT TEAM OUTPUT</code>
              03 / BUSINESS
              <small>{sv ? "Kommer snart · Gemensamt resultat & flöden" : "Coming soon · Coherent shared output"}</small>
            </span>
          </div>
        </div>
        <div className="plan-comparison grid md:grid-cols-3 gap-4 mb-5" data-plan-comparison>
          {plans.map((pl, i) => (
            <ScrollReveal key={pl.key} delay={i * 0.05}>
              <SpotlightCard tilt={false} className={`plan-card plan-${pl.key} h-full rounded-2xl border ${pl.card}`}>
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
        <p className="mb-10 text-center text-sm text-muted/80 max-w-2xl mx-auto">
          {sv
            ? "Samma AI i alla paket. Basic har minst credits och kortast minne. Betalpaketen låser upp mer användning, längre minne och teamfunktioner."
            : "Same AI in every plan. Basic has the fewest credits and the shortest memory. Paid plans unlock more usage, longer memory and team features."}
        </p>

        <Waitlist />

      </div>
    </section>
  );
}
