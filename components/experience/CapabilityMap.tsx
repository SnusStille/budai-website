"use client";

import { useEffect, useRef, useState } from "react";
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
  const [hover, setHover] = useState(-1);
  const active = hover >= 0 ? hover : scrollActive;

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
  const fullCode = currentCap.codeLines.join("\n");
  const charBudget = hover >= 0 ? fullCode.length : Math.max(8, Math.floor(typedRatio * fullCode.length));
  let remainingChars = charBudget;
  let activeCodeLine = 0;
  const typedCodeLines = currentCap.codeLines.map((line, idx) => {
    if (remainingChars <= 0) return "";
    if (remainingChars >= line.length) {
      remainingChars -= line.length + 1;
      activeCodeLine = idx;
      return line;
    }
    const partial = line.slice(0, remainingChars);
    remainingChars = 0;
    activeCodeLine = idx;
    return partial;
  });

  return (
    <div ref={root} className="capability-system" data-active={active} data-progress="0.0000" data-capability-system data-infinite-code-chamber>
      <div className="capability-sticky">
        <div className="capability-index">
          <div className="capability-matrix-header">
            <span>{sv ? "03A / DEN OÄNDLIGA KODKAMMAREN" : "03A / THE INFINITE CODE CHAMBER"}</span>
            <span>06 MODULES</span>
          </div>
          <h3>
            {sv ? "Ett system." : "One system."}
            <br />
            <span>{sv ? "Många möjligheter." : "Many possibilities."}</span>
          </h3>
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
            <svg viewBox="-2.2 -1.8 4.4 3.6" aria-hidden="true">
              {/* Concentric Chamber Portal Frames */}
              {[0, 1, 2, 3].map(pIdx => {
                const w = 4.0 - pIdx * 0.55;
                const h = 3.0 - pIdx * 0.42;
                return (
                  <rect
                    key={pIdx}
                    x={-w / 2}
                    y={-h / 2}
                    width={w}
                    height={h}
                    rx="0.06"
                    fill="none"
                    stroke="#78d5ea"
                    strokeOpacity={0.28 - pIdx * 0.05}
                    strokeWidth="0.015"
                  />
                );
              })}
              {/* Left 3D Code Monolith */}
              <rect x="-1.85" y="-0.72" width="1.62" height="1.32" rx="0.05" fill="#091d2e" fillOpacity="0.92" stroke="#78d5ea" strokeOpacity="0.88" strokeWidth="0.022" />
              <rect x="-1.85" y="-0.22" width="1.62" height="0.22" fill="#6ee7b7" fillOpacity="0.24" />
              {[0, 1, 2, 3].map(r => (
                <line key={r} x1="-1.68" y1={-0.46 + r * 0.24} x2={-0.55 - (r % 2) * 0.25} y2={-0.46 + r * 0.24} stroke={r === 1 ? "#6ee7b7" : "#8ce8fa"} strokeOpacity="0.85" strokeWidth="0.03" />
              ))}
              {/* Compiler Beams */}
              {[-0.25, 0, 0.25].map((by, bIdx) => (
                <path key={bIdx} d={`M -0.23 ${by} C 0.05 ${by}, 0.15 ${by * 0.8}, 0.35 ${by * 0.8}`} fill="none" stroke="#6ee7b7" strokeOpacity="0.8" strokeWidth="0.02" />
              ))}
              {/* Right Assembled Blueprint UI Component */}
              <rect x="0.35" y="-0.68" width="1.48" height="1.26" rx="0.05" fill="#0d263b" fillOpacity="0.92" stroke="#6ee7b7" strokeOpacity="0.9" strokeWidth="0.022" />
              <rect x="0.52" y="-0.45" width="1.14" height="0.24" rx="0.03" fill="#163d58" stroke="#8ce8fa" strokeWidth="0.015" />
              <rect x="0.52" y="-0.1" width="0.52" height="0.48" rx="0.03" fill="#14364e" stroke="#6ee7b7" strokeWidth="0.015" />
              <rect x="1.12" y="-0.1" width="0.54" height="0.48" rx="0.03" fill="#14364e" stroke="#8ce8fa" strokeWidth="0.015" />
              {rows.slice(0, 18).map((p, i) => (
                <circle key={i} cx={p.x * 0.85} cy={p.y * 0.65} r={p.lane === active ? 0.032 : 0.018} fill={p.lane === active ? "#d4f7ff" : "#75a6b8"} fillOpacity={p.lane === active ? 0.9 : 0.38} />
              ))}
            </svg>
          </div>

          <div className="capability-viewport-top">
            <span>BUDAI / THE INFINITE CODE CHAMBER · CODE WALL &amp; BLUEPRINT</span>
            <span>001 — 006</span>
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
              {typedCodeLines.map((line, lIdx) => (
                <div key={lIdx} className="capability-code-row">
                  <b>0{lIdx + 1}</b>
                  <span>
                    {tokenizeLine(line).map((tk, tIdx) => (
                      <span key={tIdx} className={`token-${tk.tone}`}>{tk.text}</span>
                    ))}
                    {lIdx === activeCodeLine && <i className="editor-cursor" />}
                  </span>
                </div>
              ))}
            </div>
            <div className="capability-readout-foot">
              <strong>{currentCap.title}</strong>
              <small>{currentCap.architecture}</small>
            </div>
          </div>

          <div className="capability-viewport-bottom">
            <span>{sv ? "FÖRGRUND · MELLANPLAN · DJUP KODARKITEKTUR" : "FOREGROUND · MIDGROUND · DEEP CODE ARCHITECTURE"}</span>
            <span>SV / EN · LIVE CHAMBER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
