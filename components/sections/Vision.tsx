"use client";

import { ArrowUpRight, CircleDot, Compass, Heart, ScanEye, ShieldCheck, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";
import { StilledevMark } from "@/components/ui/BudAILogo";

/* The path: where BudAI starts and where it goes. Static on purpose —
   the interactive parts of this page live in the Playground. */
const PATH = [
  {
    id: "se",
    region: { sv: "Sverige", en: "Sweden" },
    title: { sv: "Grundad här", en: "Rooted here" },
    body: {
      sv: "BudAI börjar i svensk arbetsvardag — mejl, möten, beslut — på det språk du faktiskt använder.",
      en: "BudAI starts in real Swedish workdays — mail, meetings, decisions — in the language you actually use.",
    },
  },
  {
    id: "nordic",
    region: { sv: "Norden", en: "Nordics" },
    title: { sv: "Nordic-first", en: "Nordic-first" },
    body: {
      sv: "Integritet och transparens är inte features — de är grunden. Människan först: AI som förstärker omdömet, inte ersätter det.",
      en: "Privacy and transparency are not features — they are the foundation. Human-first: AI that amplifies judgment, never replaces it.",
    },
  },
  {
    id: "world",
    region: { sv: "Världen", en: "World" },
    title: { sv: "Etisk skala", en: "Ethical scale" },
    body: {
      sv: "Från Sverige och Norden utåt — samma krav på kvalitet, språk och ansvar när BudAI växer.",
      en: "From Sweden and the Nordics outward — the same bar for quality, language and responsibility as BudAI grows.",
    },
  },
];

const PRINCIPLES = [
  { k: "b1" as const, icon: Sparkles },
  { k: "b2" as const, icon: Compass },
  { k: "b3" as const, icon: ShieldCheck },
];

/** Vision — why BudAI exists, what it believes, and what is actually live. */
export default function Vision() {
  const { t, lang } = useLang();
  const sv = lang === "sv";

  const columns = [
    { id: "live", label: t.vision.roadmapLive, items: t.vision.liveItems, icon: CircleDot, tone: "live" as const },
    { id: "wip", label: t.vision.roadmapWip, items: t.vision.wipItems, icon: ScanEye, tone: "wip" as const },
    { id: "next", label: t.vision.roadmapNext, items: t.vision.nextItems, icon: Compass, tone: "next" as const },
  ];

  return (
    <section id="vision" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora opacity-35" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-shell px-4 sm:px-6 lg:px-8">
        {/* ── Statement ─────────────────────────────────────────── */}
        <ScrollReveal className="max-w-3xl">
          <p className="eyebrow">
            <span className="fig !border-transparent !bg-transparent !px-0">03</span>
            {t.vision.badge}
          </p>
          <h2 className="t-h1 t-balance mt-5 text-white">
            {t.vision.title} <span className="text-gradient">{t.vision.titleHighlight}</span>
          </h2>
          <p className="t-lead mt-6 max-w-2xl">{t.vision.subtitle}</p>
        </ScrollReveal>

        {/* ── Manifesto ─────────────────────────────────────────── */}
        <ScrollReveal className="mt-14 sm:mt-20">
          <div className="grid gap-6 border-y border-white/[0.07] py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <p className="t-h3 t-balance text-white/92">{t.vision.manifestoTitle}</p>
            </div>
            <div className="lg:col-span-6 lg:pt-1.5">
              <p className="t-body max-w-xl text-[15.5px] leading-relaxed">{t.vision.manifestoBody}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Principles ────────────────────────────────────────── */}
        <div className="mt-16 sm:mt-20">
          {PRINCIPLES.map((p, i) => {
            const title = t.vision[`${p.k}Title`];
            const body = t.vision[`${p.k}Body`];
            return (
              <ScrollReveal key={p.k} delay={Math.min(i * 0.05, 0.15)}>
                <div className="group grid gap-4 border-b border-white/[0.06] py-7 sm:py-9 lg:grid-cols-12 lg:gap-10">
                  <div className="flex items-start gap-4 lg:col-span-5">
                    <span className="mt-0.5 font-mono text-[11px] text-muted/50">
                      0{i + 1}
                    </span>
                    <h3 className="t-h4 t-balance text-white transition-colors duration-300 group-hover:text-accent-cyan/95">
                      {title}
                    </h3>
                  </div>
                  <div className="lg:col-span-6">
                    <p className="t-body max-w-2xl">{body}</p>
                  </div>
                  <div className="hidden justify-end lg:col-span-1 lg:flex">
                    <p.icon className="h-4 w-4 text-white/20 transition-colors duration-300 group-hover:text-accent-cyan/70" />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* ── The path ──────────────────────────────────────────── */}
        <ScrollReveal className="mt-16 sm:mt-20">
          <p className="eyebrow mb-8">{t.vision.pathLabel}</p>
          <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
            <span
              aria-hidden
              className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-accent-cyan/50 via-accent-purple/35 to-transparent sm:block sm:left-0 sm:top-[7px] sm:h-px sm:w-full sm:bg-gradient-to-r"
            />
            {PATH.map((s) => (
              <div key={s.id} className="relative pl-6 sm:pl-0 sm:pt-8">
                <span className="absolute left-0 top-1.5 h-[7px] w-[7px] rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.6)] sm:left-0 sm:top-0" />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent-cyan/75">
                  {sv ? s.region.sv : s.region.en}
                </p>
                <h3 className="mt-2 text-[15px] font-semibold tracking-tight text-white">
                  {sv ? s.title.sv : s.title.en}
                </h3>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
                  {sv ? s.body.sv : s.body.en}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Roadmap: what is actually live ────────────────────── */}
        <ScrollReveal className="mt-16 sm:mt-20">
          <div className="card p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="eyebrow">
                  <span className="fig !border-transparent !bg-transparent !px-0">03.1</span>
                  {sv ? "Läget" : "Status"}
                </p>
                <h3 className="t-h3 mt-3 text-white">{t.vision.roadmapTitle}</h3>
                <p className="t-body mt-2">{t.vision.roadmapBody}</p>
              </div>
              <a href="#playground" className="link-arrow shrink-0 text-accent-cyan">
                {t.what.openPlayground}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--r-md)] border border-white/[0.07] bg-white/[0.05] sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.id} className="bg-background/85 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        col.tone === "live"
                          ? "status-dot"
                          : col.tone === "wip"
                            ? "h-[6px] w-[6px] rounded-full bg-accent-yellow/90 shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                            : "h-[6px] w-[6px] rounded-full bg-white/25"
                      }
                    />
                    <span
                      className={`font-mono text-[10.5px] uppercase tracking-[0.14em] ${
                        col.tone === "live"
                          ? "text-accent-green/85"
                          : col.tone === "wip"
                            ? "text-accent-yellow/85"
                            : "text-muted/70"
                      }`}
                    >
                      {col.label}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-white/72">
                        <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-white/25" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Pull quote ─────────────────────────────────────────── */}
        <ScrollReveal className="mx-auto mt-20 max-w-3xl text-center sm:mt-24">
          <Heart className="mx-auto h-4 w-4 text-accent-pink/70" />
          <blockquote className="t-h3 t-balance mt-6 font-light text-white/80">
            {t.vision.quote}
          </blockquote>
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-gradient-to-br from-accent-cyan/12 to-accent-purple/12 shadow-[0_0_24px_rgba(0,229,255,0.12)]">
              <StilledevMark size={26} />
            </span>
            <span className="text-left">
              <span className="block text-[13px] font-medium text-accent-cyan">Stilledev</span>
              <span className="block text-[12px] text-muted">{t.vision.quoteAuthor}</span>
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
