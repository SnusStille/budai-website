"use client";

import { useEffect, useMemo, useState } from "react";
import BudAILogo from "@/components/ui/BudAILogo";
import { tokenizeLine } from "@/lib/experience/code";
import { CAPABILITY_CHAMBER_MODULES } from "@/lib/experience/capability-engine";
import { subscribeJourney } from "@/lib/experience/scroll";
import { clamp, smooth } from "@/lib/experience/timeline";

const PIPELINE_CODE_LINES = [
  "// 03B · End-to-End BudAI Synthesis Pipeline",
  "import { BudAI, TeamWorkspace } from '@budai/core';",
  "",
  "export async function synthesizeProduct(signal: Input) {",
  "  const intake = await BudAI.intake(signal.multimodal);",
  "  const context = await BudAI.memory.recall(intake);",
  "  const workspace = await TeamWorkspace.assemble({",
  "    tiers: ['Basic', 'Consumer', 'Business'],",
  "    locales: ['sv-SE', 'en-US'],",
  "    grounding: context.verifiedCitations,",
  "  });",
  "  return workspace.streamLiveOutput();",
  "}",
];

export default function CapabilityStudioScreen() {
  const [activeModule, setActiveModule] = useState(0);
  const [hoverFocus, setHoverFocus] = useState(-1);
  const [typedRatio, setTypedRatio] = useState(0.65);
  const [morph, setMorph] = useState(0);
  const [assemblyProgress, setAssemblyProgress] = useState(0.5);

  useEffect(() => {
    const onFocus = (event: Event) => {
      setHoverFocus((event as CustomEvent<number>).detail);
    };
    window.addEventListener("budai:capability-focus", onFocus);
    return () => window.removeEventListener("budai:capability-focus", onFocus);
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
            ? "BUDAI — END-TO-END SYNTHESIS PIPELINE"
            : `BUDAI — CAPABILITY SYNTHESIS STUDIO · ${currentMod.index}`}
        </span>
        <span>SV / EN · LIVE</span>
      </div>

      <div className="editor-tabs">
        <span className="editor-file">
          TS{" "}
          <b>{isPipelineMode ? "pipeline-synthesis.ts" : currentMod.file}</b>
          <i>●</i>
        </span>
        <span>
          {isPipelineMode
            ? "src / pipeline / intake-to-workspace.ts"
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
                ? "CONNECTED 3-STAGE PIPELINE"
                : currentMod.componentTitle}
            </span>
            <span className="studio-preview-status">
              {effectiveRatio >= 0.92
                ? "✓ VERIFIED READY"
                : `SYNTHESIZING ${Math.round(effectiveRatio * 100)}%`}
            </span>
          </div>

          {!isPipelineMode ? (
            <div className="studio-preview-card">
              <div className="studio-preview-title">
                <h4>{currentMod.title}</h4>
                <p>{currentMod.subtitle}</p>
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
                      <span>Arkitektur &amp; sammanhang</span>
                      <span>Verifierad företagsleverans</span>
                    </div>
                    <div className="studio-locale-pane">
                      <b>EN-US · ENGLISH</b>
                      <span>Architecture &amp; context</span>
                      <span>Verified enterprise delivery</span>
                    </div>
                  </div>
                ) : (
                  <div className="studio-pipeline-rows">
                    {[
                      `01 · ${currentMod.label} AST Initialized`,
                      "02 · SV / EN Context & Memory Grounded",
                      `03 · ${currentMod.componentTitle} Mounted`,
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
                        <b>READY</b>
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
                <h4>From Raw Input to Shared Team Output</h4>
                <p>One continuous AI engine across Basic, Consumer, and Business.</p>
              </div>
              <div className="studio-pipeline-rows">
                {[
                  {
                    tier: "01 / BASIC",
                    title: "Direct Multimodal Intake (Chat · Vision · Voice)",
                    state: "AVAILABLE NOW",
                    col: "#72d7ec",
                  },
                  {
                    tier: "02 / CONSUMER",
                    title: "Persistent Context Vault & Extended Models",
                    state: "COMING SOON",
                    col: "#99a8f0",
                  },
                  {
                    tier: "03 / BUSINESS",
                    title: "Shared Team Playbooks, Workspaces & Admin",
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
                  <small>STAGE 01</small>
                  <strong>FREE PREVIEW</strong>
                </div>
                <div className="studio-metric-pill">
                  <small>STAGE 02</small>
                  <strong>DEEP MEMORY</strong>
                </div>
                <div className="studio-metric-pill">
                  <small>STAGE 03</small>
                  <strong>TEAM SCALE</strong>
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
          {effectiveRatio >= 0.95
            ? "SYNTHESIS COMPLETE · COMPONENT ACTIVE"
            : "SCROLL TO SYNTHESIZE"}
        </span>
        <span>BUDAI UNIFIED 3D STUDIO · SV / EN</span>
      </div>
    </div>
  );
}
