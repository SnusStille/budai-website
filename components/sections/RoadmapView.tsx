"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleDashed, FlaskConical } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Public status page. Deliberately plain: what works, what is being refined,
 * what we are only exploring. No dates we cannot keep, no invented metrics.
 */

const LIVE = [
  {
    sv: ["Chatt med riktig modell", "Svenska och engelska, strömmande svar, avbryt när som helst."],
    en: ["Chat with a real model", "Swedish and English, streaming answers, stop whenever you want."],
  },
  {
    sv: ["Två svarsförslag", "Be om två alternativ och välj det som passar — tråden fortsätter därifrån."],
    en: ["Two answer options", "Ask for two alternatives and pick one — the thread continues from there."],
  },
  {
    sv: ["Röst och bildanalys", "Prata in din prompt eller bifoga en bild, ett diagram eller ett fotat dokument."],
    en: ["Voice and image analysis", "Speak your prompt or attach an image, a chart or a photo of a document."],
  },
  {
    sv: ["Historik och Workspace", "Sök i tidigare trådar, exportera dem, eller lyft långa svar till ett dokument."],
    en: ["History and Workspace", "Search earlier threads, export them, or lift long answers into a document."],
  },
  {
    sv: ["Väntelista med referral", "Riktiga anmälningar till en riktig databas, med early-access-kod och delbar länk."],
    en: ["Waitlist with referrals", "Real signups into a real database, with an early-access code and a shareable link."],
  },
  {
    sv: ["Konton och gränser", "Gästläge utan konto, konto för högre gränser, molnhistorik och minne."],
    en: ["Accounts and limits", "Guest mode without an account, accounts for higher limits, cloud history and memory."],
  },
];

const WIP = [
  {
    sv: ["Minne över tid", "Hållbara fakta sparas för inloggade och kan raderas rad för rad."],
    en: ["Memory over time", "Durable facts are stored for signed-in users and can be deleted row by row."],
  },
  {
    sv: ["Fler språk och tonlägen", "Fler varianter av samma svar: mer formellt, kortare, mer personligt."],
    en: ["More languages and tones", "More variants of the same answer: more formal, shorter, more personal."],
  },
  {
    sv: ["Puts och prestanda", "Snabbare första svar, jämnare strömning, tystare UI på mobil."],
    en: ["Polish and performance", "Faster first token, smoother streaming, quieter mobile UI."],
  },
];

const NEXT = [
  {
    sv: ["Integrationer", "Kalender, mejl och dokument — så att BudAI kan arbeta i dina egna flöden."],
    en: ["Integrations", "Calendar, email and documents — so BudAI can work inside your own flows."],
  },
  {
    sv: ["Team", "Delade ytor där ett team kan samla utkast, beslut och playbooks."],
    en: ["Teams", "Shared surfaces where a team can collect drafts, decisions and playbooks."],
  },
  {
    sv: ["Svenska verksamheter", "Djupare stöd för svenska processer, avtal och rapporteringskrav."],
    en: ["Swedish businesses", "Deeper support for Swedish processes, contracts and reporting needs."],
  },
];

export default function RoadmapView() {
  const { lang, t } = useLang();
  const sv = lang === "sv";

  const columns = [
    {
      id: "live",
      label: sv ? "Live nu" : "Live now",
      icon: CheckCircle2,
      tone: "text-accent-green",
      items: LIVE,
      note: sv
        ? "Det här kan du testa i Playground redan i dag."
        : "Everything here is testable in the Playground today.",
    },
    {
      id: "wip",
      label: sv ? "Pågår" : "In progress",
      icon: FlaskConical,
      tone: "text-accent-yellow",
      items: WIP,
      note: sv ? "Byggt, men inte färdigputsat." : "Built, but not finished being polished.",
    },
    {
      id: "next",
      label: sv ? "Utforskar" : "Exploring",
      icon: CircleDashed,
      tone: "text-muted",
      items: NEXT,
      note: sv ? "Riktning, inte löften." : "Direction, not promises.",
    },
  ];

  return (
    <main className="page-transition relative min-h-screen overflow-x-hidden bg-background text-white">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] opacity-30">
        <div className="ai-grid absolute inset-0" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/[0.06]">
          <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="BudAI">
              <BudAILogo size="sm" animated />
              <span className="text-[17px] font-bold tracking-tight text-white">
                Bud<span className="text-accent-cyan">AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="preview-tag hidden sm:inline-flex">{t.nav.preview}</span>
              <Link href="/#playground" className="btn-primary !px-4 !py-2 text-[13px]">
                {sv ? "Öppna Playground" : "Open the Playground"}
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-shell px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link href="/" className="btn-quiet !px-0 !text-[13px]">
            <ArrowLeft className="h-3.5 w-3.5" />
            {sv ? "Tillbaka till startsidan" : "Back to the homepage"}
          </Link>

          <ScrollReveal className="mt-8 max-w-3xl">
            <p className="eyebrow">{sv ? "Läget" : "Status"}</p>
            <h1 className="t-h1 t-balance mt-5 text-white">
              {sv ? "Vad som är " : "What is "}
              <span className="text-gradient">{sv ? "klart" : "ready"}</span>
              {sv ? " — och vad som är på väg" : " — and what is next"}
            </h1>
            <p className="t-lead mt-5">
              {sv
                ? "BudAI är en förhandsvisning. Den här sidan är den ärliga versionen: vad som fungerar, vad som slipas på, och vad vi bara utforskar. Vi lovar inga datum vi inte kan hålla."
                : "BudAI is a preview. This page is the honest version: what works, what is being refined, and what we are only exploring. We do not promise dates we cannot keep."}
            </p>
            <p className="mt-5 flex flex-wrap items-center gap-3 text-[12px] text-muted/60">
              <span className="fig">{sv ? "uppdaterad 2026-10-03" : "updated 2026-10-03"}</span>
              <span>{sv ? "Byggt i Sverige av Stilledev" : "Built in Sweden by Stilledev"}</span>
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {columns.map((col, i) => (
              <ScrollReveal key={col.id} delay={i * 0.06}>
                <div className="card h-full p-6">
                  <div className="flex items-center gap-2">
                    <col.icon className={`h-4 w-4 ${col.tone}`} />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/70">
                      {col.label}
                    </span>
                    <span className="fig ml-auto">{String(col.items.length).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-3 text-[12.5px] text-muted/70">{col.note}</p>

                  <ul className="mt-6 space-y-5">
                    {col.items.map((item) => {
                      const [title, body] = sv ? item.sv : item.en;
                      return (
                        <li key={title} className="border-t border-white/[0.06] pt-4 first:border-0 first:pt-0">
                          <p className="text-[14px] font-medium text-white">{title}</p>
                          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{body}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-12">
            <div className="card p-6 sm:p-8">
              <p className="eyebrow">{sv ? "Så prioriterar vi" : "How we prioritize"}</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {[
                  {
                    sv: ["Riktiga problem först", "Funktioner som löser något du faktiskt gör varje vecka går före sådant som bara ser imponerande ut."],
                    en: ["Real problems first", "Features that solve something you actually do every week come before the ones that only look impressive."],
                  },
                  {
                    sv: ["Ärligt hellre än snyggt", "Hellre en tydlig gräns än ett tomt löfte. Vi visar vad som fungerar i stället för att berätta vad som kommer."],
                    en: ["Honest over polished", "A clear limit beats an empty promise. We show what works instead of describing what is coming."],
                  },
                  {
                    sv: ["Tyst tills det håller", "Inget släpps förrän det fungerar på svenska, på mobil och med låg latency."],
                    en: ["Quiet until it holds", "Nothing ships until it works in Swedish, on mobile and with low latency."],
                  },
                ].map((c) => {
                  const [title, body] = sv ? c.sv : c.en;
                  return (
                    <div key={title} className="border-t border-white/[0.07] pt-5">
                      <p className="text-[14px] font-medium text-white">{title}</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted">{body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="mt-12">
            <div className="card flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="t-h4 text-white">
                  {sv ? "Vill du vara med och forma det som kommer härnäst?" : "Want a say in what comes next?"}
                </p>
                <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-muted">
                  {sv
                    ? "Gå med i väntelistan — du får en rak linje till teamet, tidig access och 10 % vid lansering."
                    : "Join the waitlist — you get a direct line to the team, early access and 10% at launch."}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link href="/#waitlist" className="btn-primary !px-5 !py-3 text-[13.5px]">
                  {t.nav.requestAccess}
                </Link>
                <Link href="/#playground" className="btn-ghost !px-5 !py-3 text-[13.5px]">
                  {sv ? "Testa först" : "Try it first"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
