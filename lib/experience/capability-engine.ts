import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp, lerp, smooth } from "./timeline";

export interface CapabilityChamberModule {
  id: string;
  index: string;
  label: string;
  title: string;
  subtitle: string;
  accent: string;
  file: string;
  codeLines: string[];
  componentTitle: string;
  componentKind: "proposal" | "workflow" | "analytics" | "bilingual" | "memory" | "multimodal";
  componentMetrics: [string, string, string];
  zDepth: number;
  xOffset: number;
  yOffset: number;
}

export const CAPABILITY_CHAMBER_MODULES: CapabilityChamberModule[] = [
  {
    id: "write",
    index: "01",
    label: "WRITE & EDIT",
    title: "Proposals & launch copy",
    subtitle: "Context-locked drafting in SV & EN.",
    accent: "#72d7ec",
    file: "01-write.tsx",
    codeLines: [
      "import { BudAI } from '@budai/studio';",
      "const tone = await BudAI.recall('nordic');",
      "const doc = await BudAI.write({",
      "  locales: ['sv-SE', 'en-US'],",
      "  grounding: tone.citations,",
      "});",
      "return <ProposalCard data={doc} />;",
    ],
    componentTitle: "PROPOSAL COMPOSER",
    componentKind: "proposal",
    componentMetrics: ["SV + EN", "99.4% OK", "VERIFIED"],
    zDepth: 0.42,
    xOffset: -1.12,
    yOffset: 0.16,
  },
  {
    id: "workflows",
    index: "02",
    label: "WORKFLOWS",
    title: "Playbooks & task pipelines",
    subtitle: "Multi-stage execution pipelines.",
    accent: "#8be4f5",
    file: "02-automate.tsx",
    codeLines: [
      "import { Playbook } from '@budai/flow';",
      "export const flow = Playbook.define({",
      "  id: 'release-pipeline-v4',",
      "  gates: ['Audit', 'Synth', 'Deploy'],",
      "  policy: 'GDPR-EU-North',",
      "});",
      "await flow.executeStageGates();",
    ],
    componentTitle: "PLAYBOOK PIPELINE",
    componentKind: "workflow",
    componentMetrics: ["4 GATES", "AUTO-AUDIT", "140MS"],
    zDepth: -0.45,
    xOffset: 1.12,
    yOffset: 0.14,
  },
  {
    id: "research",
    index: "03",
    label: "RESEARCH & SYNTHESIS",
    title: "Briefings & decision matrices",
    subtitle: "Executive telemetry & KPI synthesis.",
    accent: "#99a8f0",
    file: "03-decide.tsx",
    codeLines: [
      "import { Matrix } from '@budai/research';",
      "const kpis = await Matrix.extract(docs);",
      "const board = Matrix.project({",
      "  horizon: 'Q3-Q4',",
      "  confidence: 0.96,",
      "});",
      "return <ExecutiveMatrix data={board} />;",
    ],
    componentTitle: "DECISION MATRIX",
    componentKind: "analytics",
    componentMetrics: ["+42.8%", "12 DOCS", "96% CONF"],
    zDepth: -1.3,
    xOffset: -1.08,
    yOffset: 0.08,
  },
  {
    id: "bilingual",
    index: "04",
    label: "SWEDISH & ENGLISH",
    title: "Native SV / EN workspace",
    subtitle: "Instant semantic parity across teams.",
    accent: "#7de2d1",
    file: "04-bilingual.tsx",
    codeLines: [
      "import { Bridge } from '@budai/i18n';",
      "const pair = Bridge.mirror(source, {",
      "  primary: 'sv-SE',",
      "  secondary: 'en-US',",
      "  lockRegister: 'nordic-exec',",
      "});",
      "return <DualPane sv={pair.sv} en={pair.en} />;",
    ],
    componentTitle: "SV / EN BRIDGE",
    componentKind: "bilingual",
    componentMetrics: ["SV-SE", "EN-US", "0 DRIFT"],
    zDepth: -2.15,
    xOffset: 1.08,
    yOffset: 0.04,
  },
  {
    id: "memory",
    index: "05",
    label: "MEMORY & CONTEXT",
    title: "Persistent workspace memory",
    subtitle: "Row-level isolated project context.",
    accent: "#a8b4f8",
    file: "05-memory.tsx",
    codeLines: [
      "import { Vault, RLS } from '@budai/mem';",
      "export const vault = Vault.mount({",
      "  tenant: 'stilledev-se',",
      "  policy: RLS.strict('auth.uid()'),",
      "  scope: ['architecture', 'voice'],",
      "});",
      "await vault.commitEncryptedState();",
    ],
    componentTitle: "RLS CONTEXT VAULT",
    componentKind: "memory",
    componentMetrics: ["RLS LOCK", "AES-256", "ACTIVE"],
    zDepth: -3.0,
    xOffset: -1.04,
    yOffset: 0.0,
  },
  {
    id: "multimodal",
    index: "06",
    label: "VISION & VOICE",
    title: "Diagrams, screenshots & speech",
    subtitle: "Visual inspection & spoken directives.",
    accent: "#6ee7b7",
    file: "06-multimodal.tsx",
    codeLines: [
      "import { Vision, Voice } from '@budai/io';",
      "const ast = await Vision.parse(frame.img);",
      "const cmd = await Voice.listen('sv-SE');",
      "return ast.compileInterface({",
      "  directive: cmd.intent,",
      "  theme: 'budai-dark-studio',",
      "});",
    ],
    componentTitle: "VISION & VOICE",
    componentKind: "multimodal",
    componentMetrics: ["4K AST", "VOICE IO", "READY"],
    zDepth: -3.85,
    xOffset: 1.04,
    yOffset: -0.04,
  },
];

export interface CapabilityEngine {
  root: THREE.Group;
  update(
    progress: number,
    activeModule: number,
    accessMorph: number,
    time: number,
    assemblyProgress?: number
  ): void;
}

/**
 * Power-of-two (`1024 × 512`) mipmap-friendly Builder IDE monitor renderer
 * with large, ultra-legible 30px monospace typography so downscaled 3D screens
 * stay 100% free of WebGL aliasing.
 */
function drawProgressiveCodeMonitor(
  ctx: CanvasRenderingContext2D,
  mod: CapabilityChamberModule,
  typedRatio: number
) {
  const w = ctx.canvas.width; // 1024
  const h = ctx.canvas.height; // 512
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0c192b");
  bg.addColorStop(1, "#060d17");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Titlebar
  ctx.fillStyle = "#102036";
  ctx.fillRect(0, 0, w, 64);
  ctx.fillStyle = `${mod.accent}66`;
  ctx.fillRect(0, 62, w, 2);

  // macOS traffic dots
  const dots = ["#f87171", "#fbbf24", "#34d399"];
  dots.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(34 + idx * 26, 32, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // File tab pill
  ctx.fillStyle = "#172e4a";
  ctx.beginPath();
  ctx.roundRect(126, 10, 320, 44, 10);
  ctx.fill();
  ctx.strokeStyle = mod.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "700 22px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = mod.accent;
  ctx.fillText("TS", 148, 39);
  ctx.fillStyle = "#f4f9ff";
  ctx.fillText(mod.file, 188, 39);

  // Right module badge
  ctx.font = "700 20px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "#a5c0de";
  ctx.textAlign = "right";
  ctx.fillText(`${mod.index} / ${mod.label}`, w - 28, 39);
  ctx.textAlign = "left";

  // Progressive character budget
  const fullSource = mod.codeLines.join("\n");
  const totalChars = fullSource.length;
  const targetChars = clamp(Math.floor(clamp(typedRatio, 0.18, 1) * totalChars), 1, totalChars);

  let remaining = targetChars;
  let activeLineIdx = 0;
  const visibleLines: string[] = [];
  for (let i = 0; i < mod.codeLines.length; i++) {
    const line = mod.codeLines[i];
    if (remaining <= 0) break;
    if (remaining >= line.length) {
      visibleLines.push(line);
      remaining -= line.length + 1;
      activeLineIdx = i;
    } else {
      visibleLines.push(line.slice(0, remaining));
      remaining = 0;
      activeLineIdx = i;
      break;
    }
  }

  // Active line highlight bar
  const lineStartY = 114;
  const lineHeight = 50;
  const highlightY = lineStartY + activeLineIdx * lineHeight - 34;
  ctx.fillStyle = "rgba(114, 215, 236, 0.15)";
  ctx.fillRect(0, highlightY, w, lineHeight);
  ctx.fillStyle = mod.accent;
  ctx.fillRect(0, highlightY, 7, lineHeight);

  // Render bold 28px code lines
  ctx.font = "700 27px ui-monospace, SFMono-Regular, Menlo, monospace";
  for (let i = 0; i < mod.codeLines.length; i++) {
    const y = lineStartY + i * lineHeight;
    ctx.fillStyle = i === activeLineIdx ? mod.accent : "#587799";
    ctx.fillText(`0${i + 1}`, 24, y);

    if (i >= visibleLines.length) continue;
    const text = visibleLines[i];

    if (text.trimStart().startsWith("import ") || text.trimStart().startsWith("export ")) {
      ctx.fillStyle = "#b8c4ff";
    } else if (text.includes("return ") || text.includes("await ")) {
      ctx.fillStyle = "#84e6fb";
    } else if (text.includes("'") || text.includes(":")) {
      ctx.fillStyle = "#bef8ff";
    } else {
      ctx.fillStyle = "#f4f9ff";
    }
    ctx.fillText(text, 84, y);

    if (i === activeLineIdx && typedRatio < 0.995) {
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = mod.accent;
      ctx.fillRect(88 + textWidth, y - 26, 14, 32);
    }
  }

  // Bottom status bar
  ctx.fillStyle = "#0b1626";
  ctx.fillRect(0, h - 52, w, 52);
  ctx.fillStyle = `${mod.accent}55`;
  ctx.fillRect(0, h - 52, w, 2);

  ctx.font = "700 20px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "#6ee7b7";
  const pct = Math.round(clamp(typedRatio, 0, 1) * 100);
  ctx.fillText(
    typedRatio >= 0.95 ? `● COMPILED · ${mod.componentTitle}` : `● WRITING AST · ${pct}%`,
    28,
    h - 18
  );
  ctx.textAlign = "right";
  ctx.fillStyle = "#93b0d0";
  ctx.fillText("TypeScript 5.8 · UTF-8", w - 28, h - 18);
  ctx.textAlign = "left";
}

/**
 * Power-of-two (`1024 × 512`) Component Preview Monitor renderer with large,
 * bold UI cards and charts.
 */
function drawComponentPreviewMonitor(
  ctx: CanvasRenderingContext2D,
  mod: CapabilityChamberModule,
  buildRatio: number
) {
  const w = ctx.canvas.width; // 1024
  const h = ctx.canvas.height; // 512
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0d1b2e");
  bg.addColorStop(1, "#070e19");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#11233a";
  ctx.fillRect(0, 0, w, 64);
  ctx.fillStyle = mod.accent;
  ctx.fillRect(0, 62, w, 2.5);

  ctx.font = "700 23px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = mod.accent;
  ctx.fillText(`◆ ${mod.componentTitle}`, 30, 41);

  ctx.textAlign = "right";
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText(`LIVE · ${Math.round(clamp(buildRatio, 0.2, 1) * 100)}%`, w - 30, 41);
  ctx.textAlign = "left";

  // Large crisp title
  ctx.fillStyle = "#f6faff";
  ctx.font = "700 34px Inter, system-ui, sans-serif";
  ctx.fillText(mod.title, 32, 118);

  // Left visual widget card
  ctx.fillStyle = "#122640";
  ctx.beginPath();
  ctx.roundRect(32, 144, 620, 294, 16);
  ctx.fill();
  ctx.strokeStyle = mod.accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (mod.componentKind === "analytics") {
    const bars = [0.45, 0.62, 0.54, 0.78, 0.72, 0.92, 0.98];
    bars.forEach((val, bIdx) => {
      const bh = val * 210 * clamp(buildRatio * 1.15, 0.4, 1);
      const bx = 66 + bIdx * 80;
      const by = 412 - bh;
      ctx.fillStyle = bIdx >= 5 ? "#6ee7b7" : mod.accent;
      ctx.beginPath();
      ctx.roundRect(bx, by, 52, bh, 8);
      ctx.fill();
    });
  } else if (mod.componentKind === "workflow") {
    const stages = ["01 · AUDIT POLICY", "02 · SYNTHESIZE", "03 · DEPLOY EDGE"];
    stages.forEach((st, sIdx) => {
      const sy = 168 + sIdx * 82;
      ctx.fillStyle = "#193352";
      ctx.beginPath();
      ctx.roundRect(58, sy, 568, 64, 10);
      ctx.fill();
      ctx.fillStyle = "#f4f9ff";
      ctx.font = "700 24px ui-monospace, SFMono-Regular, monospace";
      ctx.fillText(st, 84, sy + 41);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillText("READY", 495, sy + 41);
    });
  } else if (mod.componentKind === "bilingual") {
    ctx.fillStyle = "#18314f";
    ctx.beginPath();
    ctx.roundRect(56, 168, 272, 246, 12);
    ctx.roundRect(354, 168, 272, 246, 12);
    ctx.fill();
    ctx.fillStyle = mod.accent;
    ctx.font = "700 24px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText("SVENSKA (SV)", 80, 216);
    ctx.fillText("ENGLISH (EN)", 378, 216);
    ctx.fillStyle = "#f0f7ff";
    ctx.font = "600 24px Inter, system-ui, sans-serif";
    ctx.fillText("Arkitektur", 80, 276);
    ctx.fillText("Leverans", 80, 326);
    ctx.fillText("Architecture", 378, 276);
    ctx.fillText("Delivery", 378, 326);
  } else {
    const rows = ["✓ Grounded Workspace Output", "✓ Bilingual SV / EN Verified", "✓ RLS Security Policy Active"];
    rows.forEach((label, r) => {
      ctx.fillStyle = r === 0 ? "#1b3858" : "#162d48";
      ctx.beginPath();
      ctx.roundRect(58, 168 + r * 82, 568 * clamp(buildRatio * 1.15, 0.5, 1), 64, 10);
      ctx.fill();
      ctx.fillStyle = "#f4f9ff";
      ctx.font = "700 24px Inter, system-ui, sans-serif";
      ctx.fillText(label, 82, 209 + r * 82);
    });
  }

  // Right telemetry column (3 large metric cards)
  mod.componentMetrics.forEach((metric, mIdx) => {
    const my = 144 + mIdx * 102;
    ctx.fillStyle = "#132742";
    ctx.beginPath();
    ctx.roundRect(676, my, 316, 88, 12);
    ctx.fill();
    ctx.strokeStyle = mIdx === 0 ? mod.accent : "rgba(130, 214, 238, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "700 28px ui-monospace, SFMono-Regular, monospace";
    ctx.fillStyle = "#f6faff";
    ctx.fillText(metric, 704, my + 55);
  });

  // Bottom bar
  ctx.fillStyle = "#0b1626";
  ctx.fillRect(0, h - 52, w, 52);
  ctx.font = "700 20px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText("● COMPONENT MOUNTED · ZERO DRIFT", 30, h - 18);
}

/**
 * Power-of-two (`1024 × 512`) progressive renderer for the 3 monitors of
 * Experience B (The AI Assembly Line).
 */
function drawAssemblyStageScreen(
  ctx: CanvasRenderingContext2D,
  stage: 1 | 2 | 3,
  progress: number
) {
  const w = ctx.canvas.width; // 1024
  const h = ctx.canvas.height; // 512
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0c192b");
  bg.addColorStop(1, "#060d17");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#102138";
  ctx.fillRect(0, 0, w, 66);
  const accent = stage === 1 ? "#72d7ec" : stage === 2 ? "#99a8f0" : "#6ee7b7";
  ctx.fillStyle = accent;
  ctx.fillRect(0, 64, w, 2.5);

  const titles = {
    1: "01 · MULTIMODAL INPUT STREAM",
    2: "02 · AI CODE & SCHEMA SYNTHESIS",
    3: "03 · ASSEMBLED PRODUCT (LIVE)",
  };
  ctx.font = "700 25px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = accent;
  ctx.fillText(titles[stage], 30, 42);

  if (stage === 1) {
    const items = [
      { tag: "PROMPT", text: '"Build Q2 launch portal (SV/EN)"', col: "#72d7ec" },
      { tag: "VISION", text: "wireframe-v4.png · 14 UI blocks", col: "#99a8f0" },
      { tag: "VOICE", text: '"Add live ARR & approval gates"', col: "#6ee7b7" },
    ];
    items.forEach((it, idx) => {
      const itemProgress = clamp((progress - idx * 0.14) / 0.42, 0.3, 1);
      const y = 92 + idx * 132;
      ctx.fillStyle = "#132742";
      ctx.beginPath();
      ctx.roundRect(30, y, w - 60, 112, 14);
      ctx.fill();
      ctx.strokeStyle = it.col;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.font = "700 21px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = it.col;
      ctx.fillText(`● ${it.tag}`, 56, y + 40);

      const chars = Math.max(1, Math.floor(it.text.length * itemProgress));
      ctx.font = "700 28px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = "#f6faff";
      ctx.fillText(it.text.slice(0, chars), 56, y + 84);
    });
  } else if (stage === 2) {
    const code = [
      "import { BudAI } from '@budai/core';",
      "const app = await BudAI.synthesize({",
      "  inputs: [prompt, vision, voice],",
      "  modules: [Nav, KPIChart, Playbook],",
      "  locales: ['sv-SE', 'en-US'],",
      "});",
      "export default app.mount('#live');",
    ];
    const all = code.join("\n");
    const budget = Math.max(10, Math.floor(clamp(progress, 0.25, 1) * all.length));
    let rem = budget;
    code.forEach((line, lIdx) => {
      const y = 116 + lIdx * 54;
      ctx.font = "700 27px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = "#5b7a9c";
      ctx.fillText(`0${lIdx + 1}`, 30, y);
      if (rem <= 0) return;
      const slice = line.slice(0, Math.min(line.length, rem));
      rem -= line.length + 1;
      ctx.fillStyle =
        lIdx === 0 || lIdx === 6 ? "#b8c4ff" : line.includes("'") ? "#bef8ff" : "#f4f9ff";
      ctx.fillText(slice, 88, y);
    });
  } else {
    // Stage 3: Assembled Digital Product
    ctx.fillStyle = "#162d4a";
    ctx.beginPath();
    ctx.roundRect(30, 88, w - 60, 74, 12);
    ctx.fill();
    ctx.strokeStyle = "#72d7ec";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "700 27px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#f6faff";
    ctx.fillText("BudAI Enterprise Portal · Live", 56, 134);
    ctx.fillStyle = "#6ee7b7";
    ctx.font = "700 23px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText("SV / EN", w - 160, 134);

    // Left Analytics Card
    ctx.fillStyle = "#12253e";
    ctx.beginPath();
    ctx.roundRect(30, 182, 460, 300, 14);
    ctx.fill();
    ctx.strokeStyle = "#72d7ec";
    ctx.stroke();
    ctx.fillStyle = "#72d7ec";
    ctx.font = "700 22px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText("ARR & VELOCITY", 56, 224);
    const heights = [0.45, 0.62, 0.58, 0.82, 0.96];
    heights.forEach((bh, idx) => {
      const barH = bh * 195 * clamp(progress * 1.15, 0.4, 1);
      ctx.fillStyle = idx >= 3 ? "#6ee7b7" : "#72d7ec";
      ctx.beginPath();
      ctx.roundRect(60 + idx * 80, 456 - barH, 54, barH, 8);
      ctx.fill();
    });

    // Right Playbook Card
    ctx.fillStyle = "#12253e";
    ctx.beginPath();
    ctx.roundRect(514, 182, 480, 300, 14);
    ctx.fill();
    ctx.strokeStyle = "#6ee7b7";
    ctx.stroke();
    ctx.fillStyle = "#6ee7b7";
    ctx.font = "700 22px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText("VERIFIED MODULES", 542, 224);
    ["✓ Security & RLS", "✓ SV / EN Copy", "✓ Live Telemetry"].forEach((check, cIdx) => {
      ctx.fillStyle = "#193354";
      ctx.beginPath();
      ctx.roundRect(542, 248 + cIdx * 72, 424, 56, 10);
      ctx.fill();
      ctx.fillStyle = "#f6faff";
      ctx.font = "700 24px Inter, system-ui, sans-serif";
      ctx.fillText(check, 568, 285 + cIdx * 72);
    });
  }
}

export function createCapabilityEngine(parent: THREE.Group): CapabilityEngine {
  const root = new THREE.Group();
  root.position.set(0, 1.4, 0);
  parent.add(root);

  const alloy = new THREE.MeshStandardMaterial({
    color: "#253447",
    metalness: 0.82,
    roughness: 0.28,
  });
  const graphite = new THREE.MeshStandardMaterial({
    color: "#111b29",
    metalness: 0.72,
    roughness: 0.24,
  });
  const darkFloorMat = new THREE.MeshStandardMaterial({
    color: "#0c1522",
    metalness: 0.76,
    roughness: 0.22,
  });
  const cyanStripMat = new THREE.MeshBasicMaterial({ color: "#72d7ec" });
  const lavenderStripMat = new THREE.MeshBasicMaterial({ color: "#99a8f0" });
  const emeraldStripMat = new THREE.MeshBasicMaterial({ color: "#6ee7b7" });

  const cyanLamp = new THREE.PointLight("#72d7ec", 3.2, 18, 1.5);
  cyanLamp.position.set(-2.6, 2.4, 2.8);
  root.add(cyanLamp);

  const lavenderLamp = new THREE.PointLight("#99a8f0", 2.8, 18, 1.5);
  lavenderLamp.position.set(2.8, 2.2, 2.4);
  root.add(lavenderLamp);

  const emeraldLamp = new THREE.PointLight("#6ee7b7", 2.2, 16, 1.6);
  emeraldLamp.position.set(0, 1.8, 3.4);
  root.add(emeraldLamp);

  // ============================================================================
  // EXPERIENCE A: 03A / THE INFINITE CODE CHAMBER
  // ============================================================================
  const chamberGroup = new THREE.Group();
  root.add(chamberGroup);

  const chamberFloor = new THREE.Mesh(
    new RoundedBoxGeometry(6.6, 0.12, 8.8, 3, 0.04),
    darkFloorMat
  );
  chamberFloor.position.set(0, -1.52, -1.6);
  chamberGroup.add(chamberFloor);

  [-2.5, 2.5].forEach((rx, idx) => {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.02, 8.4),
      idx === 0 ? cyanStripMat : lavenderStripMat
    );
    rail.position.set(rx, -1.45, -1.6);
    chamberGroup.add(rail);
  });

  for (let i = 0; i < 6; i++) {
    const z = 0.5 - i * 0.85;
    [-3.0, 3.0].forEach(sx => {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.8, 0.14), graphite);
      slat.position.set(sx, -0.05, z);
      chamberGroup.add(slat);
    });
  }

  interface ChamberStation {
    group: THREE.Group;
    codeCanvas: HTMLCanvasElement;
    codeCtx: CanvasRenderingContext2D;
    codeTex: THREE.CanvasTexture;
    codeScreenMat: THREE.MeshBasicMaterial;
    compCanvas: HTMLCanvasElement;
    compCtx: CanvasRenderingContext2D;
    compTex: THREE.CanvasTexture;
    compScreenMat: THREE.MeshBasicMaterial;
    bridgeCards: THREE.Mesh[];
    lastQuantizedProgress: number;
  }

  const chamberStations: ChamberStation[] = [];

  CAPABILITY_CHAMBER_MODULES.forEach(mod => {
    const station = new THREE.Group();
    station.position.set(0, 0.18, mod.zDepth);
    chamberGroup.add(station);

    // 1. Left Physical 3D Brushed-Alloy Code Monitor
    const codeW = 2.34;
    const codeH = 1.38;
    const codeMonitor = new THREE.Group();
    codeMonitor.position.set(-1.22, 0.08, 0);
    codeMonitor.rotation.y = 0.14;
    station.add(codeMonitor);

    codeMonitor.add(new THREE.Mesh(new RoundedBoxGeometry(codeW, codeH, 0.08, 4, 0.04), alloy));
    codeMonitor.add(
      new THREE.Mesh(new RoundedBoxGeometry(codeW - 0.06, codeH - 0.06, 0.084, 3, 0.03), graphite)
    );

    const chinStripMat = new THREE.MeshBasicMaterial({ color: mod.accent });
    const chinStrip = new THREE.Mesh(
      new THREE.BoxGeometry(codeW * 0.55, 0.018, 0.09),
      chinStripMat
    );
    chinStrip.position.set(0, -codeH * 0.46, 0.01);
    codeMonitor.add(chinStrip);

    const codeStem = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.62, 0.1, 3, 0.02), alloy);
    codeStem.position.set(0, -codeH * 0.5 - 0.26, -0.04);
    codeMonitor.add(codeStem);

    // Power-of-two 1024x512 canvas with full trilinear mipmaps enabled
    const codeCanvas = document.createElement("canvas");
    codeCanvas.width = 1024;
    codeCanvas.height = 512;
    const codeCtx = codeCanvas.getContext("2d")!;
    drawProgressiveCodeMonitor(codeCtx, mod, 0.5);

    const codeTex = new THREE.CanvasTexture(codeCanvas);
    codeTex.colorSpace = THREE.SRGBColorSpace;
    codeTex.generateMipmaps = true;
    codeTex.minFilter = THREE.LinearMipmapLinearFilter;
    codeTex.magFilter = THREE.LinearFilter;
    codeTex.anisotropy = 8;

    const codeScreenMat = new THREE.MeshBasicMaterial({
      map: codeTex,
      transparent: true,
      opacity: 0.98,
    });
    const codeScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(codeW - 0.11, codeH - 0.11),
      codeScreenMat
    );
    codeScreen.position.z = 0.046;
    codeMonitor.add(codeScreen);

    // 2. Right Physical 3D Component Preview Monitor
    const compW = 2.26;
    const compH = 1.36;
    const compMonitor = new THREE.Group();
    compMonitor.position.set(1.24, 0.08, -0.02);
    compMonitor.rotation.y = -0.14;
    station.add(compMonitor);

    compMonitor.add(new THREE.Mesh(new RoundedBoxGeometry(compW, compH, 0.08, 4, 0.04), alloy));
    compMonitor.add(
      new THREE.Mesh(new RoundedBoxGeometry(compW - 0.06, compH - 0.06, 0.084, 3, 0.03), graphite)
    );

    const compChin = new THREE.Mesh(
      new THREE.BoxGeometry(compW * 0.5, 0.018, 0.09),
      emeraldStripMat
    );
    compChin.position.set(0, -compH * 0.46, 0.01);
    compMonitor.add(compChin);

    const compStem = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.62, 0.1, 3, 0.02), alloy);
    compStem.position.set(0, -compH * 0.5 - 0.26, -0.04);
    compMonitor.add(compStem);

    const compCanvas = document.createElement("canvas");
    compCanvas.width = 1024;
    compCanvas.height = 512;
    const compCtx = compCanvas.getContext("2d")!;
    drawComponentPreviewMonitor(compCtx, mod, 0.5);

    const compTex = new THREE.CanvasTexture(compCanvas);
    compTex.colorSpace = THREE.SRGBColorSpace;
    compTex.generateMipmaps = true;
    compTex.minFilter = THREE.LinearMipmapLinearFilter;
    compTex.magFilter = THREE.LinearFilter;
    compTex.anisotropy = 8;

    const compScreenMat = new THREE.MeshBasicMaterial({
      map: compTex,
      transparent: true,
      opacity: 0.98,
    });
    const compScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(compW - 0.11, compH - 0.11),
      compScreenMat
    );
    compScreen.position.z = 0.046;
    compMonitor.add(compScreen);

    // 3. Lower Waveguide Bridge Rail
    const bridgeBar = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.04, 0.06, 2, 0.015), alloy);
    bridgeBar.position.set(0.0, -0.68, 0.04);
    station.add(bridgeBar);

    const bridgeStrip = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.014, 0.07), chinStripMat);
    bridgeStrip.position.set(0.0, -0.68, 0.05);
    station.add(bridgeStrip);

    const bridgeCards: THREE.Mesh[] = [];
    for (let c = 0; c < 3; c++) {
      const cardMesh = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.09, 0.03, 2, 0.01),
        new THREE.MeshStandardMaterial({
          color: "#16283e",
          emissive: mod.accent,
          emissiveIntensity: 0.55,
          metalness: 0.65,
          roughness: 0.25,
        })
      );
      cardMesh.position.set(-0.35 + c * 0.35, -0.68, 0.09);
      station.add(cardMesh);
      bridgeCards.push(cardMesh);
    }

    chamberStations.push({
      group: station,
      codeCanvas,
      codeCtx,
      codeTex,
      codeScreenMat,
      compCanvas,
      compCtx,
      compTex,
      compScreenMat,
      bridgeCards,
      lastQuantizedProgress: -1,
    });
  });

  // ============================================================================
  // EXPERIENCE B: 03B / THE AI ASSEMBLY LINE
  // ============================================================================
  const assemblyGroup = new THREE.Group();
  assemblyGroup.visible = false;
  root.add(assemblyGroup);

  const pipelineDeck = new THREE.Mesh(
    new RoundedBoxGeometry(9.4, 0.16, 3.4, 4, 0.05),
    darkFloorMat
  );
  pipelineDeck.position.set(0, -1.22, -0.2);
  assemblyGroup.add(pipelineDeck);

  const deckFrontTrim = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.024, 0.04), cyanStripMat);
  deckFrontTrim.position.set(0, -1.14, 1.48);
  assemblyGroup.add(deckFrontTrim);

  [-0.35, 0.35].forEach((rz, idx) => {
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.025, 0.04),
      idx === 0 ? cyanStripMat : emeraldStripMat
    );
    track.position.set(0, -1.12, rz);
    assemblyGroup.add(track);
  });

  function createAssemblyMonitor(
    stageNum: 1 | 2 | 3,
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    rotY: number,
    stripMat: THREE.MeshBasicMaterial
  ) {
    const holder = new THREE.Group();
    holder.position.set(x, y, z);
    holder.rotation.y = rotY;
    assemblyGroup.add(holder);

    holder.add(new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.09, 4, 0.04), alloy));
    holder.add(
      new THREE.Mesh(new RoundedBoxGeometry(w - 0.06, h - 0.06, 0.094, 3, 0.03), graphite)
    );

    const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.58, 0.02, 0.1), stripMat);
    strip.position.set(0, -h * 0.46, 0.01);
    holder.add(strip);

    const stem = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.62, 0.12, 3, 0.02), alloy);
    stem.position.set(0, -h * 0.5 - 0.26, -0.05);
    holder.add(stem);

    const base = new THREE.Mesh(new RoundedBoxGeometry(w * 0.42, 0.05, 0.46, 3, 0.02), alloy);
    base.position.set(0, -h * 0.5 - 0.54, 0.02);
    holder.add(base);

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    drawAssemblyStageScreen(ctx, stageNum, 0.65);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 8;

    const screenMat = new THREE.MeshBasicMaterial({ map: tex });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, h - 0.12), screenMat);
    screen.position.z = 0.05;
    holder.add(screen);

    return { holder, canvas, ctx, tex, lastStep: -1 };
  }

  const stage1Station = createAssemblyMonitor(1, 2.48, 1.48, -2.85, 0.14, 0.06, 0.2, cyanStripMat);
  const stage2Station = createAssemblyMonitor(
    2,
    2.58,
    1.54,
    -0.05,
    0.16,
    -0.08,
    0.0,
    lavenderStripMat
  );
  const stage3Station = createAssemblyMonitor(
    3,
    2.82,
    1.66,
    2.8,
    0.18,
    0.08,
    -0.2,
    emeraldStripMat
  );

  const travelingSlabs: THREE.Mesh[] = [];
  const slabAccents = ["#72d7ec", "#99a8f0", "#7de2d1", "#6ee7b7"];
  for (let s = 0; s < 4; s++) {
    const slab = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.14, 0.06, 3, 0.015),
      new THREE.MeshStandardMaterial({
        color: "#15263b",
        emissive: slabAccents[s],
        emissiveIntensity: 0.52,
        metalness: 0.72,
        roughness: 0.24,
      })
    );
    assemblyGroup.add(slab);
    travelingSlabs.push(slab);
  }

  return {
    root,
    update(
      progress: number,
      activeModule: number,
      accessMorph: number,
      time: number,
      assemblyProgress = 0
    ) {
      const p = clamp(progress, 0, 1);
      const morph = clamp(accessMorph, 0, 1);
      const asm = clamp(assemblyProgress, 0, 1);

      chamberGroup.visible = morph < 0.995;
      assemblyGroup.visible = morph > 0.005;

      if (chamberGroup.visible) {
        const chamberAlpha = 1 - smooth(clamp((morph - 0.15) / 0.65, 0, 1));
        chamberGroup.position.y = lerp(0, 0.3, morph);
        chamberGroup.scale.setScalar(lerp(1, 0.9, morph));

        chamberStations.forEach((st, idx) => {
          const mod = CAPABILITY_CHAMBER_MODULES[idx];
          const isFocused = idx === activeModule;

          const depthOrder =
            idx === activeModule
              ? 0
              : idx > activeModule
              ? idx - activeModule
              : 6 - activeModule + idx;
          const targetZ = isFocused ? 0.55 : 0.55 - depthOrder * 0.88;
          const targetY = isFocused
            ? 0.22
            : 0.26 + depthOrder * 0.08 + Math.sin(time * 1.2 + idx) * 0.015;
          const targetScale = isFocused ? 1.0 : Math.max(0.72, 0.92 - depthOrder * 0.04);

          st.group.position.z = targetZ;
          st.group.position.y = targetY;
          st.group.scale.setScalar(targetScale * chamberAlpha);

          const moduleStart = idx / 6;
          const localProgress = isFocused ? clamp((p - moduleStart) * 6, 0.38, 1) : 0.85;

          const quantized = Math.round(localProgress * 28);
          if (quantized !== st.lastQuantizedProgress) {
            st.lastQuantizedProgress = quantized;
            const ratio = quantized / 28;
            drawProgressiveCodeMonitor(st.codeCtx, mod, ratio);
            st.codeTex.needsUpdate = true;
            drawComponentPreviewMonitor(st.compCtx, mod, ratio);
            st.compTex.needsUpdate = true;
          }

          const focusBoost = isFocused ? 1.0 : Math.max(0.28, 0.72 - depthOrder * 0.12);
          st.codeScreenMat.opacity = focusBoost * chamberAlpha;
          st.compScreenMat.opacity = focusBoost * chamberAlpha;

          st.bridgeCards.forEach((card, cIdx) => {
            const cardFlow = clamp((localProgress - cIdx * 0.18) / 0.55, 0, 1);
            card.position.x = lerp(-0.52, 0.52, smooth(cardFlow));
            card.position.y = -0.68;
            card.position.z = 0.09;
            card.scale.setScalar(lerp(0.85, 1.05, smooth(cardFlow)) * chamberAlpha);
          });
        });
      }

      if (assemblyGroup.visible) {
        const asmAlpha = smooth(clamp((morph - 0.05) / 0.65, 0, 1));
        assemblyGroup.scale.setScalar(lerp(0.88, 1.0, asmAlpha));
        assemblyGroup.position.x = lerp(0.42, -0.42, asm);
        assemblyGroup.position.y = lerp(-0.22, 0.1, asmAlpha);

        const step1 = Math.round(clamp(asm * 1.6, 0.3, 1) * 20);
        if (step1 !== stage1Station.lastStep) {
          stage1Station.lastStep = step1;
          drawAssemblyStageScreen(stage1Station.ctx, 1, step1 / 20);
          stage1Station.tex.needsUpdate = true;
        }

        const step2 = Math.round(clamp((asm - 0.08) * 1.45, 0.3, 1) * 20);
        if (step2 !== stage2Station.lastStep) {
          stage2Station.lastStep = step2;
          drawAssemblyStageScreen(stage2Station.ctx, 2, step2 / 20);
          stage2Station.tex.needsUpdate = true;
        }

        const step3 = Math.round(clamp((asm - 0.18) * 1.35, 0.35, 1) * 20);
        if (step3 !== stage3Station.lastStep) {
          stage3Station.lastStep = step3;
          drawAssemblyStageScreen(stage3Station.ctx, 3, step3 / 20);
          stage3Station.tex.needsUpdate = true;
        }

        travelingSlabs.forEach((slab, sIdx) => {
          const travel = clamp((asm * 1.25 - sIdx * 0.12) / 0.75, 0, 1);
          const eased = smooth(travel);
          slab.position.x = lerp(-2.4, 2.4, eased);
          slab.position.y = -0.94 + Math.sin(eased * Math.PI) * 0.08;
          slab.position.z = 0.55;
          slab.rotation.y = lerp(0.18, -0.18, eased);
          slab.scale.setScalar(asmAlpha);
        });
      }
    },
  };
}
