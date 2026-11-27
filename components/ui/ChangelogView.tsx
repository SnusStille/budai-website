"use client";

// E6: the real, indexable What's new page. The quick-peek modal in
// WhatsNew.tsx renders the same CHANGELOG data and links here.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import StandalonePageShell from "@/components/site/StandalonePageShell";
import { CHANGELOG } from "@/lib/changelog";

export default function ChangelogView() {
  const { lang } = useLang();
  const sv = lang === "sv";

  return (
    <StandalonePageShell
      title={sv ? "Vad är nytt" : "What's new"}
      eyebrow="stilledev.se · BudAI · CHANGELOG"
      icon="history"
      lang={sv ? "sv" : "en"}
      enHref="/changelog"
      svHref="/changelog"
    >
          <p className="mb-8 text-sm leading-relaxed text-muted">
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
    </StandalonePageShell>
  );
}
