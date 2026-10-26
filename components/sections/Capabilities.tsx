"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Check as CheckIcon, X as XIcon, User as UserIcon, Building2 as BuildingIcon, Sparkles as SparkIcon } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import CapabilityMap from "@/components/experience/CapabilityMap";
import Waitlist from "@/components/sections/Waitlist";

export default function Capabilities() {
  const { t, lang } = useLang();
  const sv = lang === "sv";

  const plans = [
    {
      key: "basic",
      icon: SparkIcon,
      name: "Basic",
      tag: sv ? "Tillgänglig nu" : "Available now",
      price: sv ? "Gratis" : "Free",
      sub: sv ? "under preview" : "during the preview",
      note: sv
        ? "Prova BudAI — öppen förhandsvisning utan konto eller med gratis konto."
        : "Try BudAI — open preview experience as a guest or with a free account.",
      pros: sv
        ? [
            "Playground på svenska och engelska (12/dag gäst)",
            "Gratis konto: 80/dag, användarstyrt minne, historik & bildanalys",
            "Röstinmatning och export i webbläsaren",
          ]
        : [
            "Playground in Swedish and English (12/day guest)",
            "Free account: 80/day, user-controlled memory, history & vision",
            "Voice input and conversation export",
          ],
      cons: sv
        ? ["Begränsad daglig kvot under preview", "Kortare kontext- och minnesfönster", "Ingen prioriterad kö vid hög last"]
        : ["Preview daily message cap", "Shorter context and memory window", "Standard preview queue"],
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
      sub: sv ? "planerat privatpaket" : "planned individual plan",
      note: sv
        ? "Använd BudAI varje dag — under utveckling för regelbundet individuellt arbete."
        : "Use BudAI every day — in development for regular individual work.",
      pros: sv
        ? [
            "Högre daglig kapacitet för frekvent arbete",
            "Längre konversationshistorik och utökat minne",
            "Tidig tillgång till nya modeller och verktyg",
          ]
        : [
            "Higher daily capacity for regular work",
            "Extended conversation history and memory capacity",
            "Early access to new models and capabilities",
          ],
      cons: sv
        ? ["Avsett för en person (1 konto)", "Ingen delad teamarbetsyta"]
        : ["Designed for one person (single account)", "No shared team workspace"],
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
      sub: sv ? "planerat teampaket" : "planned team plan",
      note: sv
        ? "Ta BudAI till ditt team — under utveckling för gemensamma arbetsflöden."
        : "Bring BudAI to your team — in development for shared workflows and governance.",
      pros: sv
        ? [
            "Planerat: delade credits över flera teamkonton",
            "Planerat: gemensamma playbooks och arbetsytor",
            "Planerat: administrationskontroller och prioriterad support",
          ]
        : [
            "Planned: credits shared across multiple team accounts",
            "Planned: shared playbooks and team workspaces",
            "Planned: admin controls and priority support",
          ],
      cons: sv
        ? ["Under utveckling (ej aktivt i preview än)", "Kommer kräva företagskonto"]
        : ["In development (not yet active in preview)", "Will require a company account"],
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
        <div className="capabilities-intro-header text-center mb-12">
          <span className="chapter-label mb-6 inline-flex"><i />03 / {t.capabilities.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-5 text-white">
            {t.capabilities.title} <span className="text-gradient">{t.capabilities.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {sv
              ? "I Playground ovan arbetar du i ett sammanhållet samtal. Under ytan samverkar sex förmågor för att forma råa anteckningar, dokument, bilder och röst till strukturerade resultat — på svenska och engelska, med minne du själv styr."
              : "In the Playground above, you work in a single conversation. Beneath that surface, six connected capabilities turn rough notes, documents, images, and voice into structured outcomes — in Swedish and English, with memory you control."}
          </p>
        </div>

        <CapabilityMap />
        <div className="plans-heading">
          <span>
            {sv ? "Värld II: Möjligheternas Atlas" : "World II: The Atlas of Possibility"}
          </span>
          <p>
            {sv
              ? "En förmåga löser en uppgift. Tillsammans bär de hela arbetssättet — från öppen preview idag till utökad individuell kapacitet och gemensamma teamflöden under utveckling."
              : "One capability solves a task. Combined, they support how you work — from open preview access today to extended individual capacity and shared team workflows in development."}
          </p>
        </div>
        <div className="access-architecture" data-access-architecture data-ai-assembly-line aria-hidden="true">
          <div className="access-code-header">
            <span>
              {sv
                ? "VÄRLD I → VÄRLD II / VERKSTADENS STRUKTUR VIKS UT TILL MÖJLIGHETERNAS ATLAS"
                : "WORLD I → WORLD II / WORKSHOP STRUCTURE UNFOLDS INTO THE ATLAS OF POSSIBILITY"}
            </span>
            <code>{`workshop.components(6) -> atlas.routes(document | decision | plan | workflow)`}</code>
          </div>
          <div className="access-fallback">
            <svg viewBox="-5 -2.1 10 4.2" width="100%" height="100%">
              {/* Cantilevered Meridian Arc & Topographic Compass Rose */}
              <path d="M -4.2 0.85 Q 0 -2.15 4.2 0.85" fill="none" stroke="#7adbf0" strokeOpacity="0.65" strokeWidth="0.028" strokeDasharray="0.12 0.06" />
              <ellipse cx="0" cy="0.35" rx="3.8" ry="1.05" fill="none" stroke="#a8b4f8" strokeOpacity="0.38" strokeWidth="0.02" />
              <ellipse cx="0" cy="0.35" rx="2.4" ry="0.68" fill="none" stroke="#7adbf0" strokeOpacity="0.45" strokeWidth="0.02" />
              {/* Three Unfolded Topographic Elevation Terraces (Basic, Consumer, Business) */}
              <polygon points="-4.5,0.65 -1.8,0.65 -1.4,-0.25 -4.1,-0.25" fill="#0b2032" fillOpacity="0.82" stroke="#7adbf0" strokeWidth="0.024" />
              <polygon points="-1.3,0.35 1.3,0.35 1.6,-0.55 -1.0,-0.55" fill="#0d2238" fillOpacity="0.86" stroke="#a8b4f8" strokeWidth="0.024" />
              <polygon points="1.8,0.05 4.4,0.05 4.6,-0.85 2.0,-0.85" fill="#0d263b" fillOpacity="0.88" stroke="#6ee7b7" strokeWidth="0.024" />
              {/* Interconnected Atlas Routes */}
              <path d="M -3.1 0.2 Q -1.5 -0.65 0.1 -0.15 T 3.2 -0.45" fill="none" stroke="#6ee7b7" strokeOpacity="0.88" strokeWidth="0.026" />
            </svg>
          </div>
          <div className="access-labels">
            <span>
              <code>01 · DOCUMENT &amp; INTAKE ROUTE</code>
              01 / BASIC
              <small>{sv ? "Tillgänglig nu · Direkt skrivande, syn & röst i preview" : "Available now · Direct writing, vision & voice in preview"}</small>
            </span>
            <span>
              <code>02 · MEMORY &amp; BILINGUAL ROUTE</code>
              02 / CONSUMER
              <small>{sv ? "Kommer snart · Utökat minne, planer & djupanalys" : "Coming soon · Extended memory, plans & deep analysis"}</small>
            </span>
            <span>
              <code>03 · SHARED WORKFLOW &amp; DECISION ROUTE</code>
              03 / BUSINESS
              <small>{sv ? "Kommer snart · Gemensamma arbetsflöden för team" : "Coming soon · Shared team workflows & governance"}</small>
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
                  <a
                    href={pl.href}
                    onClick={() => {
                      if (pl.key === "consumer" || pl.key === "business") {
                        window.dispatchEvent(
                          new CustomEvent("budai:waitlist-plan", {
                            detail: {
                              accountType: pl.key === "business" ? "company" : "individual",
                              openDetails: pl.key === "business",
                            },
                          })
                        );
                      }
                    }}
                    className={`mt-auto rounded-full py-2.5 text-center text-sm font-semibold transition-all hover:opacity-90 ${pl.btn}`}
                  >
                    {pl.cta}
                  </a>
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
        <p className="mb-10 text-center text-sm text-muted/80 max-w-2xl mx-auto">
          {sv
            ? "Samma kärnmodell i alla nivåer. Basic är gratis under preview (12 meddelanden/dag som gäst, 80/dag med gratis konto). Konsument och Företag är under utveckling — grundarmedlemmar på väntelistan låser 10 % rabatt vid lansering."
            : "Same core intelligence across every tier. Basic is free during the preview (12 messages/day as guest, 80/day with a free account). Consumer and Business are in development — founding members on the waitlist lock 10% off at launch."}
        </p>

        <Waitlist />

      </div>
    </section>
  );
}
