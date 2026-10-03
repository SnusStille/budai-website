"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Copy, Clock, Lightbulb, ShieldAlert, Target } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import type { Playbook } from "@/lib/playbooks";

/**
 * Reader for a single playbook. Everything here points back at the Playground:
 * each step has a prompt you can copy and paste straight into the composer.
 */
export default function PlaybookView({ playbook, related }: { playbook: Playbook; related: Playbook[] }) {
  const { lang, t } = useLang();
  const sv = lang === "sv";
  const [copied, setCopied] = useState<number | null>(null);

  const copy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <main className="page-transition relative min-h-screen overflow-x-hidden bg-background text-white">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] opacity-30">
        <div className="ai-grid absolute inset-0" />
      </div>

      <div className="relative z-10">
        {/* ── Top bar ────────────────────────────────────────────── */}
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

        <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link href="/#playground" className="btn-quiet !px-0 !text-[13px]">
            <ArrowLeft className="h-3.5 w-3.5" />
            {sv ? "Tillbaka till Playground" : "Back to the Playground"}
          </Link>

          {/* ── Header ───────────────────────────────────────────── */}
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="chip !py-1 !text-[11.5px] !text-accent-cyan">{sv ? playbook.tag.sv : playbook.tag.en}</span>
            <span className="chip !py-1 !text-[11.5px]">
              <Clock className="h-3 w-3 text-muted" />
              {playbook.minutes} min
            </span>
          </div>

          <h1 className="t-h1 t-balance mt-5 text-white">{sv ? playbook.title.sv : playbook.title.en}</h1>
          <p className="t-lead mt-5">{sv ? playbook.subtitle.sv : playbook.subtitle.en}</p>

          <div className="card mt-8 flex items-start gap-3 p-5">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted/70">
                {sv ? "Resultat" : "Outcome"}
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/82">
                {sv ? playbook.outcome.sv : playbook.outcome.en}
              </p>
            </div>
          </div>

          {/* ── Steps ────────────────────────────────────────────── */}
          <ol className="mt-12 space-y-10">
            {playbook.steps.map((step, i) => (
              <li key={sv ? step.title.sv : step.title.en} className="relative">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-accent-cyan/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="t-h4 t-balance text-white">{sv ? step.title.sv : step.title.en}</h2>
                </div>
                <p className="t-body mt-3 max-w-2xl pl-0 sm:pl-7">{sv ? step.body.sv : step.body.en}</p>

                {step.prompt && (
                  <div className="mt-4 sm:pl-7">
                    <div className="overflow-hidden rounded-[var(--r-md)] border border-white/[0.09] bg-black/35">
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
                          {sv ? "prompt att kopiera" : "prompt to copy"}
                        </span>
                        <button
                          type="button"
                          onClick={() => copy(sv ? step.prompt!.sv : step.prompt!.en, i)}
                          className="icon-btn !h-7 !w-auto !px-2 !text-[11.5px]"
                        >
                          {copied === i ? (
                            <>
                              <Check className="mr-1 h-3 w-3 text-accent-green" />
                              {sv ? "Kopierad" : "Copied"}
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" />
                              {sv ? "Kopiera" : "Copy"}
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="pg-scroll-thin overflow-x-auto whitespace-pre-wrap px-4 py-3.5 font-sans text-[13.5px] leading-relaxed text-white/85">
                        {sv ? step.prompt.sv : step.prompt.en}
                      </pre>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>

          {/* ── Tips & avoid ─────────────────────────────────────── */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent-yellow" />
                <h3 className="text-[14px] font-semibold text-white">{sv ? "Tips" : "Tips"}</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {playbook.tips.map((tip) => (
                  <li key={tip.en} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
                    <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-accent-yellow/70" />
                    {sv ? tip.sv : tip.en}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-accent-pink" />
                <h3 className="text-[14px] font-semibold text-white">{sv ? "Undvik" : "Avoid"}</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {playbook.avoid.map((item) => (
                  <li key={item.en} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
                    <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-accent-pink/70" />
                    {sv ? item.sv : item.en}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── CTA ──────────────────────────────────────────────── */}
          <div className="card mt-10 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold text-white">
                {sv ? "Prova den här guiden direkt" : "Try this playbook right now"}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {sv
                  ? "Kopiera första prompten och klistra in den i chatten. Gästläge kräver inget konto."
                  : "Copy the first prompt and paste it into the chat. Guest mode needs no account."}
              </p>
            </div>
            <Link href="/#playground" className="btn-primary shrink-0 !px-5 !py-3 text-[13.5px]">
              {sv ? "Öppna Playground" : "Open the Playground"}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── Related ──────────────────────────────────────────── */}
          {related.length > 0 && (
            <div className="mt-12">
              <p className="eyebrow mb-5">{sv ? "Fler guider" : "More playbooks"}</p>
              <div className="grid gap-px overflow-hidden rounded-[var(--r-md)] border border-white/[0.07] bg-white/[0.05] sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/playbooks/${r.slug}`}
                    className="group flex items-center justify-between gap-4 bg-background/85 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                  >
                    <span>
                      <span className="block text-[14px] font-medium text-white">{sv ? r.title.sv : r.title.en}</span>
                      <span className="mt-0.5 block text-[12px] text-muted">{sv ? r.tag.sv : r.tag.en}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent-cyan" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
