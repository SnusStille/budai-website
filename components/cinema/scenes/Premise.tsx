"use client";

import { Lines, Eyebrow, Rule, Fade, Marquee } from "@/components/cinema/Primitives";
import { MANIFEST } from "@/lib/cinema/content";
import { useLang } from "@/components/ui/LanguageContext";
import Scene from "./Scene";

/**
 * SCENE B — ENTERING THE WORLD.
 * The camera passes through the point field on the way down; this scene is the statement that
 * the rest of the page has to keep, so it is deliberately the quietest layout on the site.
 */
export default function Premise() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const ticker = [
    "Next.js",
    "TypeScript",
    "three.js / GLSL",
    "Supabase",
    "Claude",
    "Design systems",
    "Motion",
    "Accessibility",
    "Stockholm",
    "sv · en",
  ];

  return (
    <Scene id="descent" titleId="descent-title" className="st-scene--tall">
      <div className="st-shell">
        <div className="grid gap-y-9 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-3">
            <Eyebrow index="02">{sv ? "Premiss" : "Premise"}</Eyebrow>
            <Fade i={2}>
              <p className="st-mono mt-6 max-w-[24ch]">
                {sv
                  ? "Kameran har rört sig hela tiden. Inga klipp."
                  : "The camera has been moving the whole time. No cuts."}
              </p>
            </Fade>
          </div>

          <div className="lg:col-span-9">
            <Lines
              as="h2"
              id="descent-title"
              className="st-display st-h2"
              lines={
                sv
                  ? ["De flesta webbplatser", "är bildspel. Det här", "är en enda tagning."]
                  : ["Most websites", "are slides. This one", "is a single take."]
              }
              accentIndex={2}
            />
            <Fade i={4}>
              <p className="st-lede mt-8 max-w-[62ch]">
                {sv
                  ? "Du har inte rullat genom sju sektioner. En kamera har färdats genom en enda scenografi: metall, ljus, ett golv med rutnät i rätt skala och tiotusentals punkter som rörde sig innan du ens kom. Vi lägger samma disciplin på mjukvaran — ett sammanhängande system i stället för skarvar där ansträngningen tog slut."
                  : "You have not scrolled through seven sections. One camera has travelled through one set: metal, light, a measured floor and tens of thousands of points that were already moving before you arrived. We spend the same discipline on software — one continuous system rather than seams where the effort stopped."}
              </p>
            </Fade>

            <Rule className="mt-12" />

            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              {MANIFEST.map((m, i) => (
                <Fade key={m.k} i={i}>
                  <div>
                    <dt className="st-eyebrow">{m.k}</dt>
                    <dd className="mt-3 text-[0.98rem] leading-relaxed text-[color:var(--st-silver)]">
                      {sv ? m.vSv : m.v}
                    </dd>
                  </div>
                </Fade>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16">
          <Marquee items={ticker} />
        </div>
      </div>
    </Scene>
  );
}
