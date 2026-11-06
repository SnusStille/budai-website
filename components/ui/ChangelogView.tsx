"use client";

// E6: the real, indexable What's new page. The quick-peek modal in
// WhatsNew.tsx renders the same CHANGELOG data and links here.
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, History } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { CHANGELOG } from "@/lib/changelog";

export default function ChangelogView() {
  const { lang, setLang } = useLang();
  const sv = lang === "sv";

  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-white pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {sv ? "Tillbaka till BudAI" : "Back to BudAI"}
          </Link>
          <BudAILogo size="sm" animated />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan/90 to-accent-purple/90 flex items-center justify-center">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {sv ? "Vad är nytt" : "What's new"}
                </h1>
                <p className="text-[11px] text-muted font-mono mt-0.5">stilledev.se · BudAI · changelog</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/10 p-1" role="group" aria-label={sv ? "Språk" : "Language"}>
              {(["en", "sv"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-full px-3 py-1 font-mono text-[11px] transition-colors ${
                    lang === l ? "bg-white/10 text-white" : "text-muted hover:text-white"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed mb-8">
            {sv
              ? "Detta är en ärlig ändringslogg över vad som faktiskt finns i BudAI:s utvecklarförhandsvisning. Daterade poster beskriver levererat arbete. Odaterade avsnitt är en ögonblicksbild av nuvarande funktioner, inte ett påstående om en historisk release. Sidan uppdateras när något släpps, inte enligt ett fast schema."
              : "This is an honest changelog of what is actually in the BudAI developer preview. Dated entries describe shipped work. Undated sections are a snapshot of current capabilities, not a claim about a historical release. It is updated when something ships, not on a fixed schedule."}
          </p>

          <div className="space-y-9">
            {CHANGELOG.map((entry) => (
              <section key={entry.id} aria-labelledby={`changelog-${entry.id}`}>
                <div className="flex flex-wrap items-baseline gap-2 mb-3">
                  <h2 id={`changelog-${entry.id}`} className="text-base font-semibold text-white">
                    {sv ? entry.titleSv : entry.title}
                  </h2>
                  <span className="font-mono text-[11px] text-accent-cyan">
                    {entry.date || (sv ? "Nuvarande förhandsvisning" : "Current preview")}
                  </span>
                </div>
                <ul className="space-y-2 pl-4 text-sm text-muted leading-relaxed">
                  {(sv ? entry.itemsSv : entry.items).map((item) => (
                    <li key={item} className="list-disc marker:text-accent-cyan/60">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-6 text-sm">
            <Link href="/legal/data" className="inline-flex items-center gap-1 text-accent-cyan hover:text-white transition-colors">
              {sv ? "Så hanteras dina data" : "How your data is handled"}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="https://github.com/SnusStille/budai-website/commits/main"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent-cyan hover:text-white transition-colors"
            >
              {sv ? "Alla commits på GitHub" : "Full commit history on GitHub"}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
