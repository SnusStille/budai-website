"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, AudioLines, BarChart3, FileText, Languages, Network, Workflow } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { subscribeJourney } from "@/lib/experience/scroll";
import { capabilityRecords } from "@/lib/experience/information-patterns";
import { tokenizeLine } from "@/lib/experience/code";
import { clamp } from "@/lib/experience/timeline";

export default function CapabilityMap() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(-1);
  const previousChars = useRef(-1);
  const [scrollActive, setScrollActive] = useState(0);
  const [typedRatio, setTypedRatio] = useState(0.65);
  const [choreoStage, setChoreoStage] = useState(0);
  const [hover, setHover] = useState(-1);
  const [pathway, setPathway] = useState<"personal" | "business">("personal");
  const active = hover >= 0 ? hover : scrollActive;

  const workshopStages = sv
    ? ["01 Upptäckt", "02 Aktivering", "03 Omvandling", "04 Sammansättning", "05 Utveckling"]
    : ["01 Discovery", "02 Activation", "03 Transformation", "04 Composition", "05 Unfolding"];

  const selectPathway = (mode: "personal" | "business") => {
    setPathway(mode);
    window.dispatchEvent(new CustomEvent("budai:pathway-mode", { detail: mode }));
  };

  const capabilities = [
    {
      icon: FileText,
      title: sv ? "Skriv" : "Write",
      detail: sv ? "Mejl, rapporter, förslag." : "Emails, reports, proposals.",
      file: "src/engine/01-write.ts",
      telemetry: sv ? "MODUL 01 · REDAKTIONELL SYNTES" : "MODULE 01 · EDITORIAL SYNTHESIS",
      architecture: sv ? "Skiktade dokumentplan + strukturflöde" : "Layered document planes + structural flow",
      codeLines: [
        "import { BudAI, DocumentCard } from '@budai/studio';",
        'const draft = await budai.write({ lang: "sv-SE", format: "proposal" });',
        "return <DocumentCard status='VERIFIED' payload={draft} />;",
      ],
    },
    {
      icon: Workflow,
      title: sv ? "Automatisera" : "Automate",
      detail: sv ? "Rutiner till tydliga steg." : "Routines into clear steps.",
      file: "src/engine/02-automate.ts",
      telemetry: sv ? "MODUL 02 · SEKVENTIELL PIPELINE" : "MODULE 02 · SEQUENTIAL PIPELINE",
      architecture: sv ? "Fyra kopplade exekveringssteg" : "Four interlocked execution stages",
      codeLines: [
        "import { Playbook, StageGate } from '@budai/workflows';",
        'export const flow = budai.automate({ trigger: "inbox.routine" });',
        "await flow.runSteps([parseContext, verifyPolicy, dispatchSummary]);",
      ],
    },
    {
      icon: BarChart3,
      title: sv ? "Besluta" : "Decide",
      detail: sv ? "Sammanfattningar och nästa steg." : "Summaries and next steps.",
      file: "src/engine/03-decide.ts",
      telemetry: sv ? "MODUL 03 · ANALYTISKT PRISMA" : "MODULE 03 · ANALYTICAL PRISM",
      architecture: sv ? "Konvergerande val → rekommenderad väg" : "Converging options → recommended vector",
      codeLines: [
        "import { MatrixEngine, Telemetry } from '@budai/research';",
        "const matrix = await budai.decide({ options: thread.scenarios });",
        'return matrix.rankRecommendations(["impact", "risk", "reversible"]);',
      ],
    },
    {
      icon: Languages,
      title: sv ? "Svenska + engelska" : "Swedish + English",
      detail: sv ? "Byt språk. Behåll tonen." : "Switch language. Keep the tone.",
      file: "src/engine/04-bilingual.ts",
      telemetry: sv ? "MODUL 04 · TVÅSPRÅKIG RESONANS" : "MODULE 04 · BILINGUAL RESONANCE",
      architecture: sv ? "Synkroniserad SV / EN dubbelhelix" : "Synchronized SV / EN double-helix bridge",
      codeLines: [
        "import { LocaleBridge, DualPane } from '@budai/i18n';",
        'const bridge = await budai.bilingual({ pair: ["sv-SE", "en-US"] });',
        'return bridge.preserveTone({ register: "nordic_professional" });',
      ],
    },
    {
      icon: Network,
      title: sv ? "Minne" : "Memory",
      detail: sv ? "Sparar det du väljer." : "Keeps what you choose.",
      file: "src/engine/05-memory.ts",
      telemetry: sv ? "MODUL 05 · KRISTALLINT MINNESVALV" : "MODULE 05 · CRYSTALLINE MEMORY VAULT",
      architecture: sv ? "Fyra lagrade kontextskikt med konto" : "Four retained context strata with account",
      codeLines: [
        "import { ContextVault, RLSPolicy } from '@budai/memory';",
        "const ctx = await budai.memory.recall({ owner: auth.uid() });",
        'return ctx.applyExplicitFacts({ rls: "strict_owner_only" });',
      ],
    },
    {
      icon: AudioLines,
      title: sv ? "Bild och röst" : "Vision and voice",
      detail: sv ? "Ladda upp bilder, prata in." : "Upload images, speak prompts.",
      file: "src/engine/06-multimodal.ts",
      telemetry: sv ? "MODUL 06 · OPTISK APERTUR & RÖSTVÅG" : "MODULE 06 · OPTICAL APERTURE & VOICE WAVE",
      architecture: sv ? "Visuell analys + direkt röstinmatning" : "Visual analysis + direct voice dictation",
      codeLines: [
        "import { VisionParser, VoiceStream } from '@budai/multimodal';",
        'const signal = await budai.perceive({ image, voice: stream("sv-SE") });',
        "return signal.synthesizeMultimodalReply({ stream: true });",
      ],
    },
  ];

  const prompts = sv
    ? [
        "Hjälp mig skriva ett tydligt och vänligt mejl.",
        "Hjälp mig göra en återkommande arbetsuppgift till tydliga steg.",
        "Hjälp mig jämföra två alternativ och välja nästa steg.",
        "Hjälp mig skriva om en kort text på svenska och engelska med samma ton.",
        "Hjälp mig formulera hur jag vill att mina svar ska vara.",
        "Vad kan du hjälpa mig förstå från en bild? Jag bifogar den sedan.",
      ]
    : [
        "Help me write a clear, friendly email.",
        "Help me turn a recurring work task into clear steps.",
        "Help me compare two options and choose a next step.",
        "Help me rewrite a short text in Swedish and English with the same tone.",
        "Help me describe how I like my responses to be written.",
        "What can you help me understand from an image? I will attach one next.",
      ];

  useEffect(
    () =>
      subscribeJourney(frame => {
        const el = root.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const p = clamp(-rect.top / Math.max(1, rect.height - frame.height + 100));
        el.dataset.progress = p.toFixed(4);
        el.style.setProperty("--capability-progress", String(p));
        const i = Math.min(5, Math.floor(p * 6));
        if (i !== previous.current) {
          previous.current = i;
          setScrollActive(i);
        }
        const nextStage = p < 0.12 ? 0 : p < 0.25 ? 1 : p < 0.76 ? 2 : p < 0.9 ? 3 : 4;
        setChoreoStage(prev => (prev === nextStage ? prev : nextStage));
        const local = clamp((p - i / 6) * 6, 0.25, 1);
        const step = Math.round(local * 24);
        if (step !== previousChars.current) {
          previousChars.current = step;
          setTypedRatio(step / 24);
        }
      }),
    []
  );

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("budai:capability-focus", { detail: active }));
    return () => {
      window.dispatchEvent(new CustomEvent("budai:capability-focus", { detail: -1 }));
    };
  }, [active]);

  const rows = capabilityRecords();
  const currentCap = capabilities[active] ?? capabilities[0];
  const tokenizedLines = useMemo(
    () => currentCap.codeLines.map(line => tokenizeLine(line)),
    [currentCap]
  );
  const fullCodeLength = useMemo(
    () =>
      tokenizedLines.reduce(
        (sum, line) => sum + line.reduce((lSum, t) => lSum + t.text.length, 0) + 1,
        0
      ),
    [tokenizedLines]
  );
  const charBudget = hover >= 0 ? fullCodeLength : Math.max(8, Math.floor(typedRatio * fullCodeLength));
  let consumedChars = 0;

  return (
    <div ref={root} className="capability-system" data-active={active} data-progress="0.0000" data-capability-system data-infinite-code-chamber>
      <div className="capability-sticky">
        <div className="capability-index">
          <div className="capability-matrix-header">
            <span>{sv ? "VÄRLD I · DEN OMÖJLIGA VERKSTADEN" : "WORLD I · THE IMPOSSIBLE WORKSHOP"}</span>
            <span>06 INSTRUMENTS</span>
          </div>
          <h3>
            {sv ? "Idéer är råmaterial." : "Ideas are raw material."}
            <br />
            <span>{sv ? "Här formas de till verktyg." : "Shaped into precision tools."}</span>
          </h3>
          <p className="mb-3.5 text-xs text-muted/85 italic leading-relaxed">
            {sv
              ? "”Idéer är inte färdiga produkter. De är material som väntar på att formas.”"
              : "“Ideas are not finished products. They are materials waiting to be shaped.”"}
          </p>
          <div className="capability-pathway-switch" role="group" aria-label={sv ? "Välj visuell väg" : "Choose visual pathway"} data-pathway-toggle>
            <button
              type="button"
              className={pathway === "personal" ? "is-active" : ""}
              aria-pressed={pathway === "personal"}
              onClick={() => selectPathway("personal")}
            >
              {sv ? "Privat arbete · Basic & Konsument" : "Personal work · Basic & Consumer"}
            </button>
            <button
              type="button"
              className={pathway === "business" ? "is-active" : ""}
              aria-pressed={pathway === "business"}
              onClick={() => selectPathway("business")}
            >
              {sv ? "Teamarbete · Företag" : "Team work · Business"}
            </button>
          </div>
          <div className="capability-modules">
            {capabilities.map(({ icon: Icon, title, detail, file }, i) => (
              <a
                href="#playground"
                className={`capability-module ${active === i ? "is-active" : ""}`}
                key={i}
                onClick={() => window.dispatchEvent(new CustomEvent("budai:prompt", { detail: prompts[i] }))}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(-1)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(-1)}
              >
                <b>0{i + 1}</b>
                <Icon size={16} />
                <span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
                <code className="capability-module-file">{file.replace("src/engine/", "")}</code>
                <ArrowUpRight className="capability-arrow" size={14} />
              </a>
            ))}
          </div>
          <p className="capability-matrix-note">
            {sv ? "Utforska i den riktiga Playground" : "Explore in the real Playground"}
            <ArrowUpRight size={12} />
          </p>
        </div>

        <div className="capability-viewport" aria-hidden="true" data-capability-viewport>
          <div className="capability-drawing-fallback">
            <svg viewBox="-2.4 -1.9 4.8 3.8" aria-hidden="true">
              {/* Astrolabe Rotunda Meridian Rings */}
              {[1.75, 1.38, 1.02].map((r, rIdx) => (
                <circle
                  key={rIdx}
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke={rIdx === 1 ? "#a8b4f8" : "#7adbf0"}
                  strokeOpacity={0.34 - rIdx * 0.06}
                  strokeWidth="0.016"
                  strokeDasharray={rIdx === 2 ? "0.08 0.04" : undefined}
                />
              ))}
              {/* 8 Radial Stadia Meridian Ribs */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map(s => {
                const a = (s / 8) * Math.PI * 2;
                return (
                  <line
                    key={s}
                    x1={Math.cos(a) * 0.55}
                    y1={Math.sin(a) * 0.55}
                    x2={Math.cos(a) * 1.75}
                    y2={Math.sin(a) * 1.75}
                    stroke="#7adbf0"
                    strokeOpacity="0.22"
                    strokeWidth="0.012"
                  />
                );
              })}
              {/* 6 Circular Gimbal Cradles around the Workshop Crucible */}
              {[0, 1, 2, 3, 4, 5].map(idx => {
                const a = ((idx - active + 6) % 6 / 6) * Math.PI * 2 - Math.PI / 2;
                const cx = idx === active ? 0 : Math.cos(a) * 1.25;
                const cy = idx === active ? 0.12 : Math.sin(a) * 0.92;
                const cr = idx === active ? 0.48 : 0.28;
                return (
                  <g key={idx}>
                    <line x1="0" y1="0" x2={cx} y2={cy} stroke="#7adbf0" strokeOpacity="0.32" strokeWidth="0.014" />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={cr}
                      fill="#081a2b"
                      fillOpacity={idx === active ? 0.88 : 0.58}
                      stroke={idx === active ? "#6ee7b7" : "#7adbf0"}
                      strokeOpacity={idx === active ? 0.92 : 0.45}
                      strokeWidth={idx === active ? "0.024" : "0.016"}
                    />
                  </g>
                );
              })}
              {rows.slice(0, 18).map((p, i) => (
                <circle key={i} cx={p.x * 0.85} cy={p.y * 0.65} r={p.lane === active ? 0.032 : 0.018} fill={p.lane === active ? "#d4f7ff" : "#75a6b8"} fillOpacity={p.lane === active ? 0.9 : 0.38} />
              ))}
            </svg>
          </div>

          <div className="capability-viewport-top">
            <span>{sv ? "VÄRLD I / DEN OMÖJLIGA VERKSTADEN · ARKITEKTONISKT INSTRUMENT" : "WORLD I / THE IMPOSSIBLE WORKSHOP · PRECISION CRUCIBLE"}</span>
            <span data-workshop-choreography>{workshopStages[choreoStage]}</span>
          </div>

          <div className="capability-active-readout" data-living-code-console>
            <div className="capability-readout-head">
              <span className="capability-readout-kicker">
                <i />
                {currentCap.telemetry}
              </span>
              <code className="capability-readout-file">{currentCap.file}</code>
            </div>
            <div className="capability-readout-code">
              {tokenizedLines.map((tokens, lIdx) => {
                const lineLen = tokens.reduce((s, t) => s + t.text.length, 0);
                const visible = Math.max(0, Math.min(lineLen, charBudget - consumedChars));
                const showCursor =
                  charBudget >= consumedChars &&
                  charBudget <= consumedChars + lineLen &&
                  charBudget < fullCodeLength;
                consumedChars += lineLen + 1;
                let used = 0;
                return (
                  <div key={lIdx} className="capability-code-row">
                    <b>0{lIdx + 1}</b>
                    <span>
                      {tokens.map((tk, tIdx) => {
                        const take = Math.max(0, visible - used);
                        used += tk.text.length;
                        return (
                          <span key={tIdx} className={`token-${tk.tone}`}>
                            {tk.text.slice(0, take)}
                          </span>
                        );
                      })}
                      {showCursor && <i className="editor-cursor" />}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="capability-readout-foot">
              <strong>{currentCap.title}</strong>
              <small>{currentCap.architecture}</small>
            </div>
          </div>

          <div className="capability-viewport-bottom">
            <span>{sv ? "VERKSTADENS STRUKTUR VIKS UT TILL MÖJLIGHETERNAS ATLAS NEDAN" : "THE WORKSHOP STRUCTURE UNFOLDS INTO THE ATLAS OF POSSIBILITY BELOW"}</span>
            <span>SV / EN · 0{active + 1} / 06</span>
          </div>
        </div>
      </div>
    </div>
  );
}
