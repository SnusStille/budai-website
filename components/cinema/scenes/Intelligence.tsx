"use client";

import dynamic from "next/dynamic";
import { Lines, Eyebrow, Fade, Rule } from "@/components/cinema/Primitives";
import { useLang } from "@/components/ui/LanguageContext";
import Scene from "./Scene";

const Tilt3D = dynamic(() => import("@/components/ui/Tilt3D"), { ssr: false });

/**
 * SCENE C — INTELLIGENCE.
 * The object on the left of frame is a machined shell that expands as this chapter plays,
 * exposing the lattice inside (core.explode in lib/cinema/world.ts). The copy is the argument:
 * we ship the inside, not the hype. Text is held to the right so it never fights the object.
 */
const PRINCIPLES = [
  {
    t: "Swedish first",
    tSv: "Svenska först",
    b: "Prompts, tokens and tone built for Swedish and English in the same surface — not bolted on at the end and hoped for the best.",
    bSv:
      "Prompts, tokens och ton byggda för svenska och engelska i samma yta — inte översatt i efterhand och hoppas på det bästa.",
  },
  {
    t: "Judgement, not autocomplete",
    tSv: "Dömmekraft, inte autocomplete",
    b: "A good answer names the risk, shows the inputs and proposes a next step. A wall of confident prose is a cost centre with better grammar.",
    bSv:
      "Ett bra svar namnger risken, visar underlaget och föreslår nästa steg. En vägg av självsäker text är en kostnad med bättre grammatik.",
  },
  {
    t: "Your memory stays yours",
    tSv: "Ditt minne är ditt",
    b: "Accounts, history, exports and deletion. EU-hosted. The assistant that remembers your business should not be selling it.",
    bSv:
      "Konton, historik, export och radering. Hostat i EU. Assistenten som kommer ihåg ditt företag ska inte sälja det.",
  },
  {
    t: "Cost has a ceiling",
    tSv: "Kostnad har ett tak",
    b: "Credits, rate limits and a meter the user can see. An AI feature without a budget is a demo, not a product.",
    bSv:
      "Credits, hastighetsgränser och en mätare användaren kan se. En AI-funktion utan budget är en demo, inte en produkt.",
  },
];

export default function Intelligence() {
  const { lang } = useLang();
  const sv = lang === "sv";

  return (
    <Scene id="intelligence" titleId="intelligence-title" className="st-scene">
      <div className="st-shell st-shell--wide">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* left column stays empty on purpose: the core is rendering there */}
          <div className="hidden lg:col-span-5 lg:block" aria-hidden>
            <Fade i={1}>
              <p className="st-mono max-w-[26ch] text-[color:var(--st-silver-dim)]">
                {sv
                  ? "↖ skalet öppnar sig när du läser det här. Det är hela idén."
                  : "↖ the shell opens as you read this. That is the whole idea."}
              </p>
            </Fade>
          </div>

          <div className="lg:col-span-7">
            <Eyebrow index="03">{sv ? "Intelligens" : "Intelligence"}</Eyebrow>
            <Lines
              as="h2"
              id="intelligence-title"
              className="st-display st-h2 mt-6"
              lines={
                sv
                  ? ["Intelligens som", "fullbordar arbetet —", "inte bara ser bra ut."]
                  : ["Intelligence that", "finishes the work —", "not the look of it."]
              }
              accentIndex={1}
            />
            <Fade i={3}>
              <p className="st-lede mt-7 max-w-[58ch]">
                {sv
                  ? "Vi bygger in modeller i produkter där de måste hålla måttet: strömmande svar, strukturerad output, kontroll och ett pris per användning som någon kan se. Mindre magi, mer ingenjörskonst."
                  : "We put models inside products where they have to hold: streaming answers, structured output, controls and a price per use someone can see. Less magic, more engineering."}
              </p>
            </Fade>

            <Rule className="mt-10" />

            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {PRINCIPLES.map((p, i) => (
                <Fade key={p.t} as="li" i={i} className="group">
                  <div className="flex gap-4">
                    <span className="st-num mt-1 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="st-display st-display--flat st-h3">{sv ? p.tSv : p.t}</h3>
                      <p className="st-body mt-2.5 max-w-[42ch] transition-colors duration-500 group-hover:text-[color:var(--st-silver)]">
                        {sv ? p.bSv : p.b}
                      </p>
                    </div>
                  </div>
                </Fade>
              ))}
            </ul>

            <Fade i={5}>
              <Tilt3D max={4}>
                <div className="st-panel mt-12 p-5 sm:p-6">
                  <p className="st-mono">
                    {sv
                      ? "Beviset finns i nästa scen — playgroundet är produkten, inte en mockup."
                      : "The proof is on the next scene — the playground is the product, not a mockup."}
                  </p>
                </div>
              </Tilt3D>
            </Fade>
          </div>
        </div>
      </div>
    </Scene>
  );
}
