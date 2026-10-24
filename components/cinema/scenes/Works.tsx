"use client";

import { Lines, Eyebrow, Fade, Rule } from "@/components/cinema/Primitives";
import { hoverMount } from "@/lib/cinema/bus";
import { PROJECTS, type Project } from "@/lib/cinema/content";
import { useLang } from "@/components/ui/LanguageContext";
import Scene from "./Scene";

/**
 * SCENE F — REAL PROJECTS.
 * Five things that exist, each with a link you can follow. Hovering a display lights its
 * physical mount in the WebGL world (bus → world.setHover) — interaction tied to content, not
 * to a demo of capability. Nothing here is invented: no clients, no numbers, no testimonials.
 */
const statusLabel: Record<Project["status"], { en: string; sv: string; tone: string }> = {
  live: { en: "Live", sv: "Live", tone: "var(--st-bleed)" },
  preview: { en: "Developer preview", sv: "Utvecklarförhandsvisning", tone: "var(--st-signal)" },
  "open-source": { en: "Open source", sv: "Öppen källkod", tone: "var(--st-silver-dim)" },
  archive: { en: "Archive", sv: "Arkiv", tone: "var(--st-silver-dim)" },
};

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-1.5">
      {items.map((s) => (
        <li key={s} className="st-chip">
          {s}
        </li>
      ))}
    </ul>
  );
}

function External({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="st-works__link"
    >
      {children}
      <span aria-hidden>↗</span>
    </a>
  );
}

export default function Works() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [featured, ...rest] = PROJECTS;

  return (
    <Scene id="works" titleId="works-title" className="st-scene">
      <div className="st-shell st-shell--wide">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow index="06">{sv ? "Arbeten" : "Selected work"}</Eyebrow>
          </div>
          <div className="lg:col-span-7">
            <Lines
              as="h2"
              id="works-title"
              className="st-display st-h2"
              lines={sv ? ["Fem saker", "som faktiskt", "finns."] : ["Five things", "that actually", "exist."]}
              accentIndex={2}
            />
            <Fade i={3}>
              <p className="st-lede mt-7 max-w-[56ch]">
                {sv
                  ? "Varje kort länkar till något du kan öppna: ett program som körs, ett repository du kan läsa. Inga case med påhittade siffror — arbetet är ungt, och ärligheten är delen av varumärket som inte förhandlas."
                  : "Every card links to something you can open: a running app, a repository you can read. No case studies with invented numbers — the work is young, and honesty is the part of the brand that is not negotiable."}
              </p>
            </Fade>
          </div>
        </div>

        {/* featured: BudAI, with the facts a portfolio piece should carry */}
        <Fade i={1}>
          <article
            className="st-works__feature st-works__item mt-14"
            onMouseEnter={() => hoverMount(0)}
            onMouseLeave={() => hoverMount(-1)}
            onFocus={() => hoverMount(0)}
            onBlur={() => hoverMount(-1)}
          >
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-12 lg:p-12">
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="st-works__badge">
                    {sv ? "Flaggskepp" : "Flagship"}
                  </span>
                  <span className="st-mono">{featured.year}</span>
                  <span className="st-works__status" style={{ color: statusLabel.preview.tone }}>
                    ● {sv ? statusLabel.preview.sv : statusLabel.preview.en}
                  </span>
                </div>
                <h3 className="st-display st-h2 mt-6">{featured.name}</h3>
                <p className="st-display st-display--flat mt-2 text-[1.35rem] text-[color:var(--st-silver)]">
                  {sv ? featured.headlineSv : featured.headline}
                </p>
                <p className="st-body mt-5 max-w-[62ch] text-[0.95rem]">{sv ? featured.blurbSv : featured.blurb}</p>
                <Chips items={featured.stack} />
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a className="st-btn" href={featured.href}>
                    {sv ? "Öppna produktsidan" : "Open the product site"}
                    <span className="arrow" aria-hidden>
                      →
                    </span>
                  </a>
                  {featured.repo && (
                    <a className="st-btn st-btn--ghost" href={featured.repo} target="_blank" rel="noopener noreferrer">
                      {sv ? "Läs källkoden" : "Read the source"}
                    </a>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="st-display-frame p-5">
                  <p className="st-mono uppercase">{sv ? "Undersök" : "Inspect"}</p>
                  <dl className="mt-4 divide-y divide-[color:var(--st-line)]">
                    {[
                      [sv ? "Yta" : "Surface", sv ? "Chatt · röst · bild · export" : "Chat · voice · vision · export"],
                      [sv ? "Motor" : "Engine", "Anthropic Claude API"],
                      [sv ? "Data" : "Data", "Supabase · Postgres · RLS"],
                      [sv ? "Konton" : "Accounts", sv ? "Magic link · Google · waitlist" : "Magic link · Google · waitlist"],
                      [sv ? "Drift" : "Ops", sv ? "Admin-panel, hälsospår, feedback" : "Admin panel, health route, feedback"],
                      [sv ? "Pris" : "Price", sv ? "Gratis under preview" : "Free during preview"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex items-baseline justify-between gap-6 py-3">
                        <dt className="st-mono uppercase shrink-0">{k}</dt>
                        <dd className="text-right text-[0.85rem] text-[color:var(--st-silver)]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="st-mono mt-5 leading-relaxed text-[color:var(--st-silver-dim)]">
                    {sv
                      ? "Live playground finns på scen 04 — samma komponent, samma API."
                      : "The live playground is on scene 04 — same component, same API."}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </Fade>

        {/* the rest, as displays in the same hall */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((p, i) => {
            const st = statusLabel[p.status];
            return (
              <Fade key={p.id} i={i}>
                <article
                  className="st-works__item st-panel h-full p-7"
                  onMouseEnter={() => hoverMount(i + 1)}
                  onMouseLeave={() => hoverMount(-1)}
                  onFocus={() => hoverMount(i + 1)}
                  onBlur={() => hoverMount(-1)}
                >
                  <span className="st-idx">{String(i + 2).padStart(2, "0")}</span>
                  <div className="flex items-center justify-between gap-4 pt-8">
                    <p className="st-mono uppercase">{p.kind}</p>
                    <span className="st-mono" style={{ color: st.tone }}>
                      ● {sv ? st.sv : st.en}
                    </span>
                  </div>
                  <h3 className="st-display st-display--flat mt-4 text-[1.75rem] leading-none sm:text-[2rem]">
                    {p.name}
                  </h3>
                  <p className="mt-3 text-[0.98rem] text-[color:var(--st-silver)]">{sv ? p.headlineSv : p.headline}</p>
                  <p className="st-body mt-3 max-w-[46ch]">{sv ? p.blurbSv : p.blurb}</p>
                  <Chips items={p.stack} />
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-[color:var(--st-line)] pt-4">
                    <External href={p.href}>{p.hrefLabel}</External>
                    <span className="st-mono">{p.year}</span>
                  </div>
                </article>
              </Fade>
            );
          })}
        </div>

        <Rule className="mt-16" />
      </div>
    </Scene>
  );
}
