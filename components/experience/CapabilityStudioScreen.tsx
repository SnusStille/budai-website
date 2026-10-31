"use client";

import { useEffect, useMemo, useState } from "react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";
import { tokenizeLine } from "@/lib/experience/code";
import { CAPABILITY_CHAMBER_MODULES } from "@/lib/experience/capability-engine";
import { subscribeJourney } from "@/lib/experience/scroll";
import { clamp, smooth } from "@/lib/experience/timeline";

const PIPELINE_CODE_LINES = [
  "// 03 -> 04 · From Signal to Structured Action",
  "import { BudAI, Workspace } from '@budai/core';",
  "",
  "export async function synthesizeSignal(signal: Input) {",
  "  const intake = await BudAI.intake(signal.multimodal);",
  "  const context = await BudAI.memory.recallSelected(intake);",
  "  const result = await Workspace.assemble({",
  "    pathway: ['Basic', 'Consumer', 'Business'],",
  "    locales: ['sv-SE', 'en-US'],",
  "    userControlledMemory: context.verifiedRows,",
  "  });",
  "  return result.renderActionableOutput();",
  "}",
];

const SV_TITLES: Record<string, { title: string; subtitle: string; comp: string }> = {
  write: {
    title: "Offerter, rapporter & mejl",
    subtitle: "Kontextlåst skrivande på svenska och engelska.",
    comp: "TVÅSPRÅKIG DOKUMENTBYGGARE",
  },
  workflows: {
    title: "Playbooks & arbetsflöden",
    subtitle: "Återkommande rutiner i tydliga steg.",
    comp: "STRUKTURERAD PLAYBOOK",
  },
  research: {
    title: "Underlag & beslutsmatriser",
    subtitle: "Sammanfattning, risker och rekommenderat nästa steg.",
    comp: "BESLUTSMATRIS",
  },
  bilingual: {
    title: "Sömlös SV / EN-arbetsyta",
    subtitle: "Samma nyans och precision på båda språken.",
    comp: "SV ↔ EN SPRÅKBRYGGA",
  },
  memory: {
    title: "Användarstyrt arbetsminne",
    subtitle: "Minnen kan sparas automatiskt och redigeras eller raderas.",
    comp: "ANVÄNDARSTYRT MINNESVALV",
  },
  multimodal: {
    title: "Skärmbilder, diagram & röst",
    subtitle: "Visuell analys och röststyrning i samma tråd.",
    comp: "SYN & RÖST-STUDIO",
  },
};

export default function CapabilityStudioScreen() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [activeModule, setActiveModule] = useState(0);
  const [hoverFocus, setHoverFocus] = useState(-1);
  const [pathway, setPathway] = useState<"personal" | "business">("personal");
  const [typedRatio, setTypedRatio] = useState(0.65);
  const [morph, setMorph] = useState(0);
  const [assemblyProgress, setAssemblyProgress] = useState(0.5);

  useEffect(() => {
    const onFocus = (event: Event) => {
      setHoverFocus((event as CustomEvent<number>).detail);
    };
    const onPathway = (event: Event) => {
      const next = (event as CustomEvent<"personal" | "business">).detail;
      if (next === "personal" || next === "business") setPathway(next);
    };
    window.addEventListener("budai:capability-focus", onFocus);
    window.addEventListener("budai:pathway-mode", onPathway);
    return () => {
      window.removeEventListener("budai:capability-focus", onFocus);
      window.removeEventListener("budai:pathway-mode", onPathway);
    };
  }, []);

  useEffect(() => {
    return subscribeJourney(frame => {
      const capSystem = document.querySelector<HTMLElement>("[data-capability-system]");
      const accessViewport = document.querySelector<HTMLElement>("[data-access-architecture]");
      const p = Number(capSystem?.dataset.progress ?? 0);
      const idx = Math.min(5, Math.floor(p * 6));
      setActiveModule(prev => (prev === idx ? prev : idx));

      const local = frame.reduced ? 1 : clamp((p - idx / 6) * 6, 0.28, 1);
      const qLocal = Math.round(local * 32) / 32;
      setTypedRatio(prev => (prev === qLocal ? prev : qLocal));

      const accessRect = accessViewport?.getBoundingClientRect();
      const nextMorph = accessRect
        ? smooth(clamp((frame.height * 0.95 - accessRect.top) / (frame.height * 0.6)))
        : 0;
      const qMorph = Math.round(nextMorph * 24) / 24;
      setMorph(prev => (prev === qMorph ? prev : qMorph));

      const nextAsm = accessRect
        ? clamp(
            (frame.height * 0.85 - accessRect.top) /
              Math.max(1, accessRect.height + frame.height * 0.35),
            0.25,
            1
          )
        : 0.5;
      const qAsm = Math.round(nextAsm * 28) / 28;
      setAssemblyProgress(prev => (prev === qAsm ? prev : qAsm));
    });
  }, []);

  const focusedIdx = hoverFocus >= 0 ? hoverFocus : activeModule;
  const currentMod = CAPABILITY_CHAMBER_MODULES[focusedIdx] ?? CAPABILITY_CHAMBER_MODULES[0];
  const svMeta = SV_TITLES[currentMod.id];
  const displayTitle = sv && svMeta ? svMeta.title : currentMod.title;
  const displaySubtitle = sv && svMeta ? svMeta.subtitle : currentMod.subtitle;
  const displayComp = sv && svMeta ? svMeta.comp : currentMod.componentTitle;
  const isPipelineMode = morph >= 0.48;

  const tokenizedModules = useMemo(
    () =>
      CAPABILITY_CHAMBER_MODULES.map(m =>
        m.codeLines.map(line => tokenizeLine(line))
      ),
    []
  );
  const tokenizedPipeline = useMemo(
    () => PIPELINE_CODE_LINES.map(line => tokenizeLine(line)),
    []
  );

  const activeTokens = isPipelineMode
    ? tokenizedPipeline
    : tokenizedModules[focusedIdx] ?? tokenizedModules[0];

  const totalChars = useMemo(
    () =>
      activeTokens.reduce(
        (sum, line) => sum + line.reduce((lSum, t) => lSum + t.text.length, 0) + 1,
        0
      ),
    [activeTokens]
  );

  const effectiveRatio = isPipelineMode
    ? assemblyProgress
    : hoverFocus >= 0
    ? 1
    : typedRatio;
  const characters = Math.max(12, Math.floor(effectiveRatio * totalChars));

  let consumed = 0;

  return (
    <div
      className="builder-editor capability-studio-screen"
      data-capability-studio-screen
      data-studio-mode={isPipelineMode ? "pipeline" : "capability"}
      data-pathway-mode={pathway}
    >
      <div className="editor-titlebar">
        <span className="editor-traffic">
          <i />
          <i />
          <i />
        </span>
        <span className="editor-brand">
          <BudAILogo size="xs" animated={false} className="!h-4 !w-4" />
          {isPipelineMode
            ? sv
              ? "BUDAI — FRÅN SIGNAL TILL STRUKTURERAT RESULTAT"
              : "BUDAI — FROM SIGNAL TO STRUCTURED OUTPUT"
            : `BUDAI — SIGNAL TRANSFORMATION STUDIO · ${currentMod.index}`}
        </span>
        <span>
          {pathway === "business"
            ? sv
              ? "TEAMVÄG · SV / EN"
              : "TEAM PATHWAY · SV / EN"
            : sv
            ? "PRIVATVÄG · SV / EN"
            : "PERSONAL PATHWAY · SV / EN"}
        </span>
      </div>

      <div className="editor-tabs">
        <span className="editor-file">
          TS{" "}
          <b>{isPipelineMode ? "pipeline-synthesis.ts" : currentMod.file}</b>
          <i>●</i>
        </span>
        <span>
          {isPipelineMode
            ? "src / signal / intake-to-action.ts"
            : `src / capabilities / ${currentMod.file}`}
        </span>
      </div>

      <div className="capability-studio-body">
        {/* Left Pane: Builder-Grade Progressive TypeScript Code Composer */}
        <div className="editor-source capability-studio-code">
          {activeTokens.map((tokens, index) => {
            const length = tokens.reduce((sum, token) => sum + token.text.length, 0);
            const visible = Math.max(0, Math.min(length, characters - consumed));
            const cursor =
              characters >= consumed &&
              characters <= consumed + length &&
              characters < totalChars;
            consumed += length + 1;
            let used = 0;
            return (
              <div
                className={`editor-line ${cursor ? "editor-current-line" : ""}`}
                key={index}
              >
                <span className="editor-line-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  {tokens.map((token, i) => {
                    const take = Math.max(0, visible - used);
                    used += token.text.length;
                    return (
                      <span className={`syntax-${token.tone}`} key={i}>
                        {token.text.slice(0, take)}
                      </span>
                    );
                  })}
                  {cursor && <span className="editor-cursor" />}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Pane: Synchronized Materialized UI Component / 3-Tier System Output */}
        <div className="capability-studio-preview">
          <div className="studio-preview-header">
            <span className="studio-preview-badge">
              <i style={{ background: isPipelineMode ? "#6ee7b7" : currentMod.accent }} />
              {isPipelineMode
                ? sv
                  ? "SAMMANHÅLLEN 3-STEGSVÄG"
                  : "CONNECTED 3-STAGE PIPELINE"
                : displayComp}
            </span>
            <span className="studio-preview-status">
              {effectiveRatio >= 0.92
                ? sv
                  ? "✓ REDO FÖR HANDLING"
                  : "✓ ACTION READY"
                : `SIGNAL ${Math.round(effectiveRatio * 100)}%`}
            </span>
          </div>

          {!isPipelineMode ? (
            <div className="studio-preview-card">
              <div className="studio-preview-title">
                <h4>{displayTitle}</h4>
                <p>{displaySubtitle}</p>
              </div>

              <div className="studio-preview-surface">
                {currentMod.componentKind === "analytics" ? (
                  <div className="studio-chart-bars">
                    {[44, 62, 56, 78, 72, 91, 98].map((h, bIdx) => (
                      <div key={bIdx} className="studio-chart-col">
                        <span
                          style={{
                            height: `${Math.round(h * clamp(effectiveRatio * 1.15, 0.35, 1))}%`,
                            background:
                              bIdx >= 5
                                ? "linear-gradient(180deg, #6ee7b7, #34d399)"
                                : "linear-gradient(180deg, #72d7ec, #38bdf866)",
                          }}
                        />
                        <small>Q{(bIdx % 4) + 1}</small>
                      </div>
                    ))}
                  </div>
                ) : currentMod.componentKind === "bilingual" ? (
                  <div className="studio-bilingual-grid">
                    <div className="studio-locale-pane">
                      <b>SV-SE · SVENSKA</b>
                      <span>Naturlig svensk ton &amp; kontext</span>
                      <span>Användarstyrt minne &amp; struktur</span>
                    </div>
                    <div className="studio-locale-pane">
                      <b>EN-US · ENGLISH</b>
                      <span>Natural English tone &amp; context</span>
                      <span>User-controlled memory &amp; clarity</span>
                    </div>
                  </div>
                ) : (
                  <div className="studio-pipeline-rows">
                    {[
                      sv
                        ? `01 · Signal mottagen i ${currentMod.label}`
                        : `01 · Signal structured in ${currentMod.label}`,
                      pathway === "business"
                        ? sv
                          ? "02 · Teamkontext & SV/EN-ton synkroniserad"
                          : "02 · Team context & SV/EN tone aligned"
                        : sv
                        ? "02 · Användarstyrt minne & SV/EN-kontext"
                        : "02 · User-controlled memory & SV/EN context",
                      sv
                        ? `03 · ${displayComp} redo i Playground`
                        : `03 · ${displayComp} ready for action`,
                    ].map((row, rIdx) => (
                      <div
                        key={rIdx}
                        className="studio-pipeline-row"
                        style={{
                          opacity: effectiveRatio >= rIdx * 0.28 ? 1 : 0.38,
                        }}
                      >
                        <i style={{ background: currentMod.accent }} />
                        <span>{row}</span>
                        <b>{sv ? "KLAR" : "READY"}</b>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="studio-metrics-grid">
                {currentMod.componentMetrics.map((metric, mIdx) => (
                  <div key={mIdx} className="studio-metric-pill">
                    <small>SIGNAL 0{mIdx + 1}</small>
                    <strong>{metric}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="studio-preview-card">
              <div className="studio-preview-title">
                <h4>
                  {sv
                    ? "Från första tanke till gemensamt resultat"
                    : "From First Thought to Shared Team Action"}
                </h4>
                <p>
                  {sv
                    ? "Samma BudAI-kärna idag i Basic — och snart i Konsument och Företag."
                    : "One BudAI core free in Basic today — scaling to Consumer and Business."}
                </p>
              </div>
              <div className="studio-pipeline-rows">
                {[
                  {
                    tier: "01 / BASIC",
                    title: sv
                      ? "Prova BudAI gratis (12/dag gäst · 80/dag med konto, minne & bild)"
                      : "Try BudAI free (12/day guest · 80/day signed-in with memory & vision)",
                    state: sv ? "TILLGÄNGLIG NU" : "AVAILABLE NOW",
                    col: "#72d7ec",
                  },
                  {
                    tier: "02 / CONSUMER",
                    title: sv
                      ? "För dagligt bruk — fler dagliga credits och längre minne/historik"
                      : "For daily individual work — higher limits & extended memory/history",
                    state: "COMING SOON",
                    col: "#99a8f0",
                  },
                  {
                    tier: "03 / BUSINESS",
                    title: sv
                      ? "För team — delade credits, gemensamma playbooks & administration"
                      : "For teams — shared credit pools, team playbooks & admin controls",
                    state: "COMING SOON",
                    col: "#6ee7b7",
                  },
                ].map((stage, sIdx) => (
                  <div
                    key={sIdx}
                    className="studio-pipeline-row"
                    style={{
                      opacity: assemblyProgress >= sIdx * 0.25 ? 1 : 0.45,
                      borderColor: `${stage.col}55`,
                    }}
                  >
                    <i style={{ background: stage.col }} />
                    <span>
                      <strong>{stage.tier}</strong> — {stage.title}
                    </span>
                    <b style={{ color: stage.col }}>{stage.state}</b>
                  </div>
                ))}
              </div>
              <div className="studio-metrics-grid">
                <div className="studio-metric-pill">
                  <small>BASIC</small>
                  <strong>{sv ? "GRATIS PREVIEW" : "FREE PREVIEW"}</strong>
                </div>
                <div className="studio-metric-pill">
                  <small>CONSUMER</small>
                  <strong>{sv ? "DAGLIGT ARBETE" : "DAILY WORK"}</strong>
                </div>
                <div className="studio-metric-pill">
                  <small>BUSINESS</small>
                  <strong>{sv ? "TEAM & ADMIN" : "TEAM SCALE"}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="editor-statusbar">
        <span>
          ⑂ main <i /> TypeScript 5.8
        </span>
        <span>
          {sv
            ? "ILLUSTRATIV 3D-DEMONSTRATION · EJ ETT LIVE-ANROP"
            : "ILLUSTRATIVE 3D DEMONSTRATION · NOT A LIVE AI REQUEST"}
        </span>
        <span>BUDAI SIGNAL STUDIO · SV / EN</span>
      </div>
    </div>
  );
}
