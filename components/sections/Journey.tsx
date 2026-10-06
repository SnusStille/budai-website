"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Check, Rocket, Layers, Globe } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

const RINGS = [
  { name: "Sweden", sv: "Sverige", size: 140, c: "#00e5ff", d: "14s" },
  { name: "Nordics", sv: "Norden", size: 240, c: "#b967ff", d: "22s" },
  { name: "World", sv: "Världen", size: 340, c: "#00ff9d", d: "32s" },
];
const RING_OF = [0, 0, 1, 2];

export default function Journey() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [active, setActive] = useState(1);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % 4), 5500);
    return () => window.clearInterval(id);
  }, [auto]);

  const stages = [
    {
      icon: Check,
      chip: sv ? "Klart" : "Done",
      chipTone: "border-accent-green/30 bg-accent-green/10 text-accent-green",
      title: sv ? "Grunden" : "The foundation",
      lead: sv ? "Det som redan fungerar." : "What already works.",
      items: sv ? ["Playground med live-svar", "Konton, minne och historik", "Bild, röst och export"] : ["Playground with live replies", "Accounts, memory and history", "Vision, voice and export"],
    },
    {
      icon: Rocket,
      chip: sv ? "Nu" : "Now",
      chipTone: "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
      title: "Developer Preview",
      lead: sv ? "Gratis för alla att prova." : "Free for everyone to try.",
      items: sv ? ["Basic-paketet är gratis", "Din feedback styr nästa steg", "Förbättras varje vecka"] : ["The Basic plan is free", "Your feedback steers what's next", "Improved every week"],
    },
    {
      icon: Layers,
      chip: sv ? "Härnäst" : "Next",
      chipTone: "border-accent-purple/30 bg-accent-purple/10 text-accent-purple",
      title: sv ? "Paket och team" : "Plans and teams",
      lead: sv ? "Mer användning, för dig och ditt företag." : "More usage, for you and your company.",
      items: sv ? ["Konsument- och Företagspaket", "Flera konton på delade credits", "Nordisk integritet: du äger ditt minne"] : ["Consumer and Business plans", "Multiple accounts on shared credits", "Nordic-first privacy: you own your memory"],
    },
    {
      icon: Globe,
      chip: sv ? "Målet" : "Goal",
      chipTone: "border-accent-pink/30 bg-accent-pink/10 text-accent-pink",
      title: sv ? "AI för alla" : "AI for everyone",
      lead: sv ? "Tillgänglig för varje människa och företag." : "Accessible to every person and company.",
      items: sv ? ["Din nya ChatGPT, på ditt språk", "Växer steg för steg, ärligt", "Byggd för att hålla"] : ["Your new ChatGPT, in your language", "Growing step by step, honestly", "Built to last"],
    },
  ];

  const ring = RING_OF[active];

  return (
    <section id="roadmap" className="relative section-hairline py-20 sm:py-28 overflow-hidden">
      <span id="vision" className="absolute top-0" aria-hidden />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(95vw,900px)] h-[420px] bg-accent-purple/[0.06] rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <span className="section-badge text-accent-pink mb-5">Roadmap</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            {sv ? "Dit BudAI är på väg" : "Where BudAI is going"}
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            {sv ? "Från svenska arbetsdagar till allas vardags-AI. Inga datum, bara ärliga framsteg." : "From Swedish workdays to everyone's everyday AI. No dates, just honest progress."}
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-2.5" role="list">
            {stages.map((s, i) => {
              const on = active === i;
              return (
                <button
                  key={s.title}
                  type="button"
                  role="listitem"
                  aria-pressed={on}
                  onClick={() => {
                    setAuto(false);
                    setActive(i);
                  }}
                  className={`relative w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                    on ? "border-white/20 bg-white/[0.05] shadow-[0_0_50px_-20px_rgba(124,92,255,0.6)]" : "border-white/[0.06] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${on ? s.chipTone : "border-white/10 text-muted"}`}>
                      <s.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-white">{s.title}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.chipTone}`}>{s.chip}</span>
                        {i === 1 && (
                          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-accent-cyan">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-cyan" />
                            {sv ? "Vi är här" : "We are here"}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-muted">{s.lead}</p>
                    </div>
                  </div>
                  {on && (
                    <ul className="mt-3 space-y-1.5 pl-12 text-sm text-white/80">
                      {s.items.map((it) => (
                        <li key={it} className="flex gap-2.5">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RINGS[ring].c }} />
                          {it}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative flex h-[300px] sm:h-[400px] items-center justify-center">
              <div className="bud-orbit-scene absolute inset-0 flex items-center justify-center scale-[0.72] sm:scale-100" aria-hidden>
                <div className="bud-orbit-tilt">
                  {RINGS.map((r, i) => (
                    <div
                      key={r.name}
                      className="bud-orbit-ring"
                      style={
                        {
                          width: r.size,
                          height: r.size,
                          "--c": r.c,
                          "--d": r.d,
                          opacity: ring === i ? 1 : 0.2,
                          boxShadow: ring === i ? `0 0 34px ${r.c}55, inset 0 0 34px ${r.c}22` : "none",
                        } as CSSProperties
                      }
                    >
                      <span className="bud-orbit-node" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative z-10">
                <BudAILogo size="lg" animated />
              </div>
            </div>
            <div className="mt-2 flex justify-center gap-2">
              {RINGS.map((r, i) => (
                <span
                  key={r.name}
                  className="rounded-full border px-3 py-1 text-xs transition-all duration-300"
                  style={{ borderColor: ring === i ? r.c : "rgba(255,255,255,0.1)", color: ring === i ? r.c : "rgba(255,255,255,0.45)", background: ring === i ? `${r.c}14` : "transparent" }}
                >
                  {sv ? r.sv : r.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-accent-cyan/[0.06] via-accent-purple/[0.06] to-accent-green/[0.06] px-6 py-5 text-center text-base sm:text-lg text-white/85">
          {sv ? "Mission: gör avancerad AI tydlig och användbar i vardagligt arbete." : "Mission: make advanced AI clear and useful in everyday work."}
        </p>
      </div>
    </section>
  );
}
