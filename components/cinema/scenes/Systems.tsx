"use client";

import { useRef, type MutableRefObject } from "react";
import Beams from "@/components/cinema/Beams";
import { Lines, Eyebrow, Fade, Rule } from "@/components/cinema/Primitives";
import { SERVICES } from "@/lib/cinema/content";
import { useLang } from "@/components/ui/LanguageContext";
import Scene from "./Scene";

/**
 * SCENE E — AUTOMATION AND CONNECTED SYSTEMS.
 * Above this text the world's loose parts assemble into a graph, driven by the same scroll
 * value that drives this reveal: the diagram and the argument are the same motion.
 */
const PIPE = [
  { k: "Inputs", kSv: "Underlag", note: "docs · mail · CRM · röst", noteEn: "docs · mail · CRM · voice" },
  { k: "Understand", kSv: "Förstå", note: "classify · extract", noteEn: "classify · extract" },
  { k: "Decide", kSv: "Besluta", note: "rules + model", noteEn: "rules + model" },
  { k: "Act", kSv: "Agera", note: "write · send · sync", noteEn: "write · send · sync" },
  { k: "Account", kSv: "Redovisa", note: "log · audit · cost", noteEn: "log · audit · cost" },
];

export default function Systems() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const svc = SERVICES.filter((s) => s.id !== "web");

  // the beams read their geometry off these nodes, so the wiring follows the layout on any
  // viewport. One stable array of ref boxes, filled by callback refs (no hook in a loop).
  const nodesRef = useRef<MutableRefObject<HTMLLIElement | null>[]>(null!);
  if (!nodesRef.current) nodesRef.current = PIPE.map(() => ({ current: null }));
  const nodes = nodesRef.current;

  return (
    <Scene id="systems" titleId="systems-title" className="st-scene">
      <div className="st-shell">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow index="05">{sv ? "System" : "Systems"}</Eyebrow>
          </div>
          <div className="lg:col-span-8">
            <Lines
              as="h2"
              id="systems-title"
              className="st-display st-h2"
              lines={sv ? ["Automatisering", "som tar bort steg,"] : ["Automation that", "deletes steps,"]}
              accentIndex={1}
            />
            <Lines
              as="p"
              className="st-display st-h2 text-[color:var(--st-silver-dim)]"
              lines={[sv ? "inte lägger till fler." : "never adds more."]}
            />
            <Fade i={3}>
              <p className="st-lede mt-7 max-w-[60ch]">
                {sv
                  ? "Rutiner blir playbooks. Halvtomma databaser pratar med varandra. Varje steg som måste designeras om, godkännas av en människa eller kommas ihåg — är ett steg vi försöker ta bort. Kvar blir det som kräver omdöme."
                  : "Recurring work becomes playbooks. Half-empty databases start talking to each other. Every step that has to be re-designed, human-approved or remembered is a step we are trying to delete. What is left is the part that needs judgement."}
              </p>
            </Fade>
          </div>
        </div>

        {/* the pipeline: five real stages, wired with beams measured from the layout */}
        <Fade i={2}>
          <div className="relative">
            <ol className="st-pipe" aria-label={sv ? "Pipeline för automatisering" : "Automation pipeline"}>
              {PIPE.map((p, i) => (
                <li
                  key={p.k}
                  ref={(el) => {
                    nodes[i].current = el;
                  }}
                  className="st-pipe__node"
                  style={{ ["--i" as string]: i }}
                >
                  <span className="st-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="st-pipe__title">{sv ? p.kSv : p.k}</span>
                  <span className="st-mono">{sv ? p.note : p.noteEn}</span>
                </li>
              ))}
            </ol>
            <Beams refs={nodes} />
          </div>
        </Fade>

        <Rule className="mt-16" />

        <div className="mt-12 grid gap-px overflow-hidden rounded-[20px] border border-[color:var(--st-line)] bg-[color:var(--st-line)] md:grid-cols-3">
          {svc.map((s, i) => (
            <Fade key={s.id} i={i} className="bg-[color:var(--st-surface)] p-7">
              <h3 className="st-display st-display--flat st-h3">{sv ? s.titleSv : s.title}</h3>
              <p className="st-body mt-3 max-w-[40ch]">{sv ? s.bodySv : s.body}</p>
              <dl className="mt-6 space-y-2">
                {s.facts.map((f) => (
                  <div key={f.k} className="flex items-baseline justify-between gap-4 border-b border-dashed border-[color:var(--st-line)] pb-1.5">
                    <dt className="st-mono uppercase">{f.k}</dt>
                    <dd className="text-right text-[0.82rem] text-[color:var(--st-silver)]">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Fade>
          ))}
        </div>
      </div>
    </Scene>
  );
}
