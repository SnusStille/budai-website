"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bug, Check, History, Plus, Wrench } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";
import PageHero from "@/components/site/PageHero";
import { CHANGELOG, entryChanges, type ChangeType } from "@/lib/changelog";

const FILTERS: Array<{ id: "all" | ChangeType; en: string; sv: string }> = [
  { id: "all", en: "All updates", sv: "Alla uppdateringar" },
  { id: "new", en: "New", sv: "Nytt" },
  { id: "improved", en: "Improvements", sv: "Förbättringar" },
  { id: "fixed", en: "Fixes", sv: "Åtgärder" },
];

export default function ChangelogView() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [filter, setFilter] = useState<"all" | ChangeType>("all");
  const labels = {
    new: sv ? "Ny funktion" : "New",
    improved: sv ? "Förbättring" : "Improvement",
    fixed: sv ? "Åtgärd" : "Fix",
  };

  return (
    <main id="main" tabIndex={-1} className="v2-main">
      <PageHero
        kicker={{ en: "WHAT’S NEW · CHANGELOG", sv: "VAD ÄR NYTT · ÄNDRINGSLOGG" }}
        title={{ en: "Progress, documented honestly.", sv: "Framsteg, dokumenterade ärligt." }}
        description={{ en: "New features, improvements and fixes from BudAI and Stilledev. Dated entries describe shipped work; undated entries are a snapshot of the current preview, not invented historical releases.", sv: "Nya funktioner, förbättringar och åtgärder från BudAI och Stilledev. Daterade poster beskriver levererat arbete; odaterade poster är en ögonblicksbild av aktuell preview, inte hittade historiska releaser." }}
      >
        <Link href="/roadmap" className="v2-text-link">{sv ? "Se vad som kommer härnäst" : "See what comes next"}<ArrowRight size={15} /></Link>
      </PageHero>

      <div className="v2-container v2-changelog-layout">
        <aside className="v2-changelog-aside"><History size={20} /><h2>{sv ? "Uppdateras när något släpps." : "Updated when something ships."}</h2><p>{sv ? "Ingen påstådd fast releasekadens. Varje post ska beskriva arbete som faktiskt finns i projektet." : "No claimed fixed release cadence. Every entry should describe work that actually exists in the project."}</p><a href="https://github.com/SnusStille/budai-website/commits/main" target="_blank" rel="noopener noreferrer">{sv ? "Commits på GitHub" : "Commits on GitHub"}<ArrowUpRight size={13} /></a></aside>
        <div className="v2-changelog-content">
          <div className="v2-changelog-filters" role="group" aria-label={sv ? "Filtrera uppdateringar" : "Filter updates"}>{FILTERS.map((item) => <button key={item.id} type="button" onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={filter === item.id ? "is-active" : ""}>{sv ? item.sv : item.en}</button>)}</div>
          <div className="v2-changelog-list">
            {CHANGELOG.map((entry, entryIndex) => {
              const changes = entryChanges(entry).filter((change) => filter === "all" || change.type === filter);
              if (!changes.length) return null;
              return (
                <article key={entry.id} id={entry.id} className="v2-release">
                  <div className="v2-release-meta"><span>{entryIndex === 0 ? "V2" : entry.date ? "FAS1" : "PREVIEW"}</span>{entry.date ? <time dateTime={entry.date}>{new Intl.DateTimeFormat(sv ? "sv-SE" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${entry.date}T00:00:00Z`))}</time> : <span>{sv ? "Aktuell preview" : "Current preview"}</span>}</div>
                  <div className="v2-release-body"><h2>{sv ? entry.titleSv : entry.title}</h2><ul>{changes.map((change) => {
                    const Icon = change.type === "new" ? Plus : change.type === "fixed" ? Bug : Wrench;
                    return <li key={`${change.type}-${change.en}`} className={`is-${change.type}`}><Icon size={15} /><div><span>{labels[change.type]}</span><p>{sv ? change.sv : change.en}</p></div></li>;
                  })}</ul></div>
                </article>
              );
            })}
          </div>
          <div className="v2-changelog-end"><Check size={17} /><p>{sv ? "Du har nått början av den dokumenterade ändringsloggen." : "You’ve reached the start of the documented changelog."}</p><Link href="/feedback">{sv ? "Föreslå nästa förbättring" : "Suggest the next improvement"}<ArrowRight size={14} /></Link></div>
        </div>
      </div>
    </main>
  );
}
