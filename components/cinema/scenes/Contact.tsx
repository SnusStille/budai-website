"use client";

import dynamic from "next/dynamic";
import { Lines, Eyebrow, Fade, Rule } from "@/components/cinema/Primitives";
import { useHashTarget, useNearViewport, usePrefersReducedMotion } from "@/components/cinema/motion";
import { scrollToScene } from "@/lib/cinema/scroll";
import { useLang } from "@/components/ui/LanguageContext";
import Scene from "./Scene";

/** The preserved waitlist: real Supabase writes, real referral codes, real admin inbox. */
const Waitlist = dynamic(
  () => import("@/components/sections/Waitlist").then((m) => m.default ?? m),
  { ssr: false }
);

const CHANNELS = [
  {
    k: "E-post",
    kEn: "Email",
    v: "Stilleinc@hotmail.com",
    href: "mailto:Stilleinc@hotmail.com?subject=Project%20enquiry%20via%20stilledev.se",
  },
  { k: "GitHub", kEn: "GitHub", v: "github.com/SnusStille", href: "https://github.com/SnusStille" },
  {
    k: "LinkedIn",
    kEn: "LinkedIn",
    v: "oliver-stille",
    href: "https://www.linkedin.com/in/oliver-stille-8bb48a403/",
  },
  { k: "Studio", kEn: "Studio", v: "Stockholm · Kista", href: null },
];

/**
 * SCENE G — THE FINAL MOMENT.
 * The world converges back onto the logotype (the outro point cloud in lib/cinema/world.ts)
 * and then gets out of the way: the contact block below is plain, findable, keyboard-first.
 * No contact detail is ever hidden behind animation.
 */
export default function Contact() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const reduced = usePrefersReducedMotion();
  const { ref, near } = useNearViewport<HTMLDivElement>("600px");
  const wanted = useHashTarget("waitlist");

  return (
    <>
      <Scene id="contact" titleId="contact-title" className="st-scene--contact">
        <div className="st-shell">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow index="07">{sv ? "Slutet på rullen" : "End of the reel"}</Eyebrow>
              <Lines
                as="h2"
                id="contact-title"
                className="st-display st-h1 mt-7"
                lines={
                  sv
                    ? ["Låt oss bygga", "något annorlunda."]
                    : ["Let's build", "something different."]
                }
                accentIndex={1}
              />
              <Fade i={3}>
                <p className="st-lede mt-7 max-w-[50ch]">
                  {sv
                    ? "AI-produkt, gränssnitt eller automatisering — skicka vad du försöker lösa, så svarar vi med hur vi skulle bygga det, vad det kostar och vad vi inte kan."
                    : "An AI product, an interface or automation — send what you are trying to solve and we answer with how we would build it, what it costs, and what we cannot do."}
                </p>
              </Fade>
              <Fade i={4}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    className="st-btn"
                    href="mailto:Stilleinc@hotmail.com?subject=Project%20enquiry%20via%20stilledev.se"
                  >
                    {sv ? "Skriv till studion" : "Write to the studio"}
                    <span className="arrow" aria-hidden>
                      →
                    </span>
                  </a>
                  <a className="st-btn st-btn--ghost" href="https://github.com/SnusStille" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                  <button type="button" className="st-btn st-btn--ghost" onClick={() => scrollToScene("works")}>
                    {sv ? "Till arbetena" : "Back to the work"}
                  </button>
                </div>
              </Fade>
            </div>

            <div className="lg:col-span-5">
              <Fade i={2}>
                <dl className="st-contact">
                  {CHANNELS.map((c) => (
                    <div key={c.k} className="st-contact__row">
                      <dt>{sv ? c.k : c.kEn}</dt>
                      <dd>
                        {c.href ? (
                          <a
                            href={c.href}
                            {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          >
                            {c.v}
                          </a>
                        ) : (
                          c.v
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Fade>
            </div>
          </div>

          <Rule className="mt-16" />
        </div>
      </Scene>

      {/* the real early-access funnel, kept intact below the closing frame */}
      <div ref={ref} className="relative z-10">
        {near || wanted ? (
          <Waitlist />
        ) : (
          <div className="st-shell py-20">
            <p className="st-mono animate-pulse">{reduced ? "" : "…"}{sv ? "Laddar early access…" : "Loading early access…"}</p>
          </div>
        )}
      </div>
    </>
  );
}
