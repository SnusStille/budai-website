"use client";

import dynamic from "next/dynamic";
import { Lines, Eyebrow, Fade, Rule } from "@/components/cinema/Primitives";
import { useHashTarget, useNearViewport } from "@/components/cinema/motion";
import { CODE_EXCERPT } from "@/lib/cinema/content";
import { useLang } from "@/components/ui/LanguageContext";
import Scene from "./Scene";

/**
 * The real product, mounted for real. The playground is the preserved BudAI feature — same
 * component, same API, same auth and credit rules as /budai — loaded only when the visitor is
 * close enough to use it, so the opening never waits on 3 000 lines of interface.
 */
const AIPlayground = dynamic(
  () => import("@/components/sections/AIPlayground").then((m) => m.default ?? m),
  {
    ssr: false,
    loading: () => (
      <div className="st-panel mt-14 flex min-h-[340px] items-center justify-center">
        <p className="st-mono animate-pulse">
          {`… loading playground`}
        </p>
      </div>
    ),
  }
);

const CRAFT = [
  {
    t: "Type carries the hierarchy",
    tSv: "Typografin bär hierarkin",
    b: "One display face, one text face, one mono. Size and spacing do the arguing; colour is saved for signal.",
    bSv: "Ett display-snitt, ett textsnitt, ett mono. Storlek och mellanrum bär hierarkin; färgen sparas till signalen.",
  },
  {
    t: "Motion has weight",
    tSv: "Rörelse har vikt",
    b: "Every eased value here is frame-rate independent. Reverse scrolling reconstructs the same frame; fast flicks bend the lens instead of breaking it.",
    bSv:
      "All mjukning här är framerate-oberoende. Bakåtskroll återskapar exakt samma bild; snabba svep böjer linsen i stället för att förstöra den.",
  },
  {
    t: "The content never depends on the effects",
    tSv: "Innehållet beror inte på effekterna",
    b: "Semantics, headings and links are real HTML. Kill WebGL or the animation and this page is still a page — the fallback is designed, not degraded.",
    bSv:
      "Semantik, rubriker och länkar är riktig HTML. Stäng av WebGL eller animation och det här är fortfarande en sida — fallbacken är designad, inte nedskalad.",
  },
];

export default function Construction() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const { ref, near } = useNearViewport<HTMLDivElement>("900px");
  const wanted = useHashTarget("playground");

  return (
    <Scene id="construction" titleId="construction-title" className="st-scene">
      <div className="st-shell st-shell--wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <Eyebrow index="04">{sv ? "Konstruktion" : "Construction"}</Eyebrow>
            <Lines
              as="h2"
              id="construction-title"
              className="st-display st-h2 mt-6"
              lines={
                sv
                  ? ["Gränssnitt", "med fysik", "och budget."]
                  : ["Interfaces", "with physics", "and a budget."]
              }
              accentIndex={1}
            />
            <Fade i={3}>
              <p className="st-lede mt-7 max-w-[54ch]">
                {sv
                  ? "Vi bygger produkten du kan öppna på den här sidan. Därför har effekterna en kostnad vi betalar medvetet: en enda render-loop, ett delat scrollsignal, tak för pixel ratio, pausad när fliken är dold — och inga tunga filer som laddas innan du hunnit se något."
                  : "We build the product you can open on this page, which means the effects have a cost we pay deliberately: one render loop, one shared scroll signal, a pixel-ratio ceiling, paused when the tab is hidden — and nothing heavy loading before you have seen anything."}
              </p>
            </Fade>

            <ul className="mt-10 space-y-7">
              {CRAFT.map((c, i) => (
                <Fade key={c.t} as="li" i={i}>
                  <div className="flex gap-4">
                    <span className="st-num mt-1.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="st-display st-display--flat text-[1.3rem] leading-tight">{sv ? c.tSv : c.t}</h3>
                      <p className="st-body mt-2 max-w-[46ch]">{sv ? c.bSv : c.b}</p>
                    </div>
                  </div>
                </Fade>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <Fade i={1}>
              <figure className="st-panel overflow-hidden">
                <figcaption className="flex items-center gap-2 border-b border-[color:var(--st-line)] px-5 py-3.5">
                  <span className="h-2 w-2 rounded-full bg-[#f3f7f9]/25" />
                  <span className="h-2 w-2 rounded-full bg-[#f3f7f9]/18" />
                  <span className="h-2 w-2 rounded-full bg-[color:var(--st-signal)]/50" />
                  <span className="st-mono ml-3">lib/cinema/timeline.ts</span>
                  <span className="st-mono ml-auto text-[color:var(--st-signal)]">real</span>
                </figcaption>
                <pre className="st-code max-h-[420px] overflow-auto px-5 py-5 text-left">
                  <code>{CODE_EXCERPT}</code>
                </pre>
                <div className="border-t border-[color:var(--st-line)] px-5 py-3">
                  <p className="st-mono">
                    {sv
                      ? "Sidan du läser styrs av den funktionen. Ingen dekorativ kod."
                      : "The page you are reading is driven by that function. No decorative code."}
                  </p>
                </div>
              </figure>
            </Fade>
          </div>
        </div>

        <Rule className="mt-16" />

        <div ref={ref} className="mt-14">
          <Fade i={0}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="st-display st-display--flat st-h3 max-w-[30ch]">
                {sv
                  ? "Inga mockups. Nedan kör produkten på riktigt."
                  : "No mockups. Below: the product, running."}
              </h3>
              <p className="st-mono max-w-[40ch]">
                {sv
                  ? "Samma komponent, samma API, samma konton och credits som på /budai."
                  : "Same component, same API, same accounts and credits as /budai."}
              </p>
            </div>
          </Fade>
          {near || wanted ? <AIPlayground /> : <div className="min-h-[320px]" aria-hidden />}
        </div>
      </div>
    </Scene>
  );
}
