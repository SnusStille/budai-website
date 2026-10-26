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
    file: "01-write.ts",
    codeLines: [
      "// 01 · Bilingual Editorial Synthesis",
      "import { BudAI, ProposalCard } from '@budai/studio';",
      "",
      "export async function composeProposal(brief: Brief) {",
      "  const tone = await BudAI.memory.recall('nordic');",
      "  const doc = await BudAI.write({",
      "    locales: ['sv-SE', 'en-US'],",
      "    grounding: tone.citations,",
      "  });",
      "  return <ProposalCard status='VERIFIED' data={doc} />;",
      "}",
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
    file: "02-automate.ts",
    codeLines: [
      "// 02 · Deterministic Playbook Pipeline",
      "import { Playbook, StageGate } from '@budai/flow';",
      "",
      "export const releaseFlow = Playbook.define({",
      "  id: 'enterprise-rollout-v4',",
      "  gates: [",
      "    StageGate.audit('GDPR-EU-North'),",
      "    StageGate.synthesize(['Product', 'Ops']),",
      "    StageGate.deploy('production-edge'),",
      "  ],",
      "});",
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
    file: "03-decide.ts",
    codeLines: [
      "// 03 · Executive Decision Matrix",
      "import { MatrixEngine, Telemetry } from '@budai/research';",
      "",
      "export async function buildMatrix(docs: Corpus[]) {",
      "  const kpis = await MatrixEngine.extract(docs);",
      "  const board = Telemetry.project({",
      "    horizon: 'Q3-Q4',",
      "    confidence: 0.96,",
      "  });",
      "  return board.renderExecutiveMatrix(kpis);",
      "}",
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
    file: "04-bilingual.ts",
    codeLines: [
      "// 04 · Synchronized SV / EN Language Bridge",
      "import { LocaleBridge, DualPane } from '@budai/i18n';",
      "",
      "export function BilingualBridge({ source }: Props) {",
      "  const pair = LocaleBridge.mirror(source, {",
      "    primary: 'sv-SE',",
      "    secondary: 'en-US',",
      "    preserveDomainTerms: true,",
      "  });",
      "  return <DualPane sv={pair.sv} en={pair.en} />;",
      "}",
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
    file: "05-memory.ts",
    codeLines: [
      "// 05 · Row-Level Isolated Context Vault",
      "import { ContextVault, RLS } from '@budai/memory';",
      "",
      "export const projectVault = ContextVault.mount({",
      "  tenant: 'stilledev-stockholm',",
      "  policy: RLS.strict('org_id = auth.uid()'),",
      "  strata: ['architecture', 'brand-voice', 'decisions'],",
      "  encryption: 'AES-256-GCM',",
      "});",
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
    file: "06-multimodal.ts",
    codeLines: [
      "// 06 · Multimodal Vision AST & Voice Stream",
      "import { VisionParser, VoiceStream } from '@budai/io';",
      "",
      "export async function synthesizeMedia(frame: Input) {",
      "  const ast = await VisionParser.inspect(frame.image);",
      "  const cmd = await VoiceStream.listen('sv-SE');",
      "  return ast.compileComponent({",
      "    directive: cmd.intent,",
      "    theme: 'budai-dark-studio',",
      "  });",
      "}",
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
  screenPosition: THREE.Vector3;
  screenScale: number;
  update(
    progress: number,
    activeModule: number,
    accessMorph: number,
    time: number,
    assemblyProgress?: number
  ): void;
}

function drawLeftWingDisplay(
  ctx: CanvasRenderingContext2D,
  activeModule: number,
  morph: number,
  progress: number
) {
  const w = ctx.canvas.width; // 1024
  const h = ctx.canvas.height; // 512
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0b1829");
  bg.addColorStop(1, "#060c16");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#102238";
  ctx.fillRect(0, 0, w, 64);
  ctx.fillStyle = "#72d7ec";
  ctx.fillRect(0, 62, w, 2.5);

  ctx.font = "700 24px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = "#72d7ec";
  ctx.fillText(
    morph >= 0.48
      ? "01 · MULTIMODAL INTAKE (BASIC)"
      : "BUDAI · 6-MODULE ARCHITECTURE",
    30,
    41
  );

  if (morph < 0.48) {
    CAPABILITY_CHAMBER_MODULES.forEach((m, idx) => {
      const isAct = idx === activeModule;
      const y = 84 + idx * 66;
      ctx.fillStyle = isAct ? "#173250" : "#0e1d30";
      ctx.beginPath();
      ctx.roundRect(28, y, w - 56, 54, 10);
      ctx.fill();
      ctx.strokeStyle = isAct ? m.accent : "rgba(114, 215, 236, 0.22)";
      ctx.lineWidth = isAct ? 2.5 : 1.2;
      ctx.stroke();

      ctx.font = "700 22px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = isAct ? m.accent : "#6282a3";
      ctx.fillText(m.index, 52, y + 35);

      ctx.fillStyle = isAct ? "#f6faff" : "#9db6d2";
      ctx.fillText(m.label, 108, y + 35);

      ctx.textAlign = "right";
      ctx.fillStyle = isAct ? "#6ee7b7" : "#53708e";
      ctx.fillText(isAct ? "● ACTIVE" : m.file, w - 52, y + 35);
      ctx.textAlign = "left";
    });
  } else {
    const signals = [
      { tag: "CHAT PROMPT", val: '"Create Q2 launch portal (SV/EN)"', col: "#72d7ec" },
      { tag: "VISION AST", val: "wireframe-v4.png · 14 UI blocks", col: "#99a8f0" },
      { tag: "VOICE STREAM", val: '"Add live ARR & approval gates"', col: "#6ee7b7" },
    ];
    signals.forEach((sig, sIdx) => {
      const y = 94 + sIdx * 128;
      ctx.fillStyle = "#132842";
      ctx.beginPath();
      ctx.roundRect(30, y, w - 60, 108, 14);
      ctx.fill();
      ctx.strokeStyle = sig.col;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.font = "700 20px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = sig.col;
      ctx.fillText(`● ${sig.tag}`, 56, y + 38);

      const chars = Math.max(4, Math.floor(sig.val.length * clamp(progress * 1.2, 0.35, 1)));
      ctx.font = "700 27px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = "#f4f9ff";
      ctx.fillText(sig.val.slice(0, chars), 56, y + 82);
    });
  }
}

function drawRightWingDisplay(
  ctx: CanvasRenderingContext2D,
  activeModule: number,
  morph: number,
  progress: number
) {
  const w = ctx.canvas.width; // 1024
  const h = ctx.canvas.height; // 512
  ctx.clearRect(0, 0, w, h);

  const mod = CAPABILITY_CHAMBER_MODULES[activeModule] ?? CAPABILITY_CHAMBER_MODULES[0];
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0b1829");
  bg.addColorStop(1, "#060c16");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#102238";
  ctx.fillRect(0, 0, w, 64);
  ctx.fillStyle = "#6ee7b7";
  ctx.fillRect(0, 62, w, 2.5);

  ctx.font = "700 24px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText(
    morph >= 0.48
      ? "03 · TEAM WORKSPACE (BUSINESS)"
      : `OUTPUT · ${mod.componentTitle}`,
    30,
    41
  );

  // Assembled visual telemetry bars + verified metrics
  ctx.fillStyle = "#122640";
  ctx.beginPath();
  ctx.roundRect(30, 92, 540, 380, 16);
  ctx.fill();
  ctx.strokeStyle = mod.accent;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.font = "700 22px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = mod.accent;
  ctx.fillText("LIVE TELEMETRY & VELOCITY", 58, 138);

  const heights = [0.42, 0.58, 0.52, 0.76, 0.84, 0.96];
  heights.forEach((bh, idx) => {
    const barH = bh * 250 * clamp(progress * 1.15, 0.4, 1);
    ctx.fillStyle = idx >= 4 ? "#6ee7b7" : mod.accent;
    ctx.beginPath();
    ctx.roundRect(62 + idx * 78, 438 - barH, 52, barH, 8);
    ctx.fill();
  });

  mod.componentMetrics.forEach((mText, mIdx) => {
    const my = 92 + mIdx * 132;
    ctx.fillStyle = "#132842";
    ctx.beginPath();
    ctx.roundRect(596, my, 398, 114, 14);
    ctx.fill();
    ctx.strokeStyle = mIdx === 0 ? "#6ee7b7" : "rgba(114, 215, 236, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "700 19px ui-monospace, SFMono-Regular, monospace";
    ctx.fillStyle = "#88a6c6";
    ctx.fillText(`VERIFIED 0${mIdx + 1}`, 624, my + 42);

    ctx.font = "700 30px ui-monospace, SFMono-Regular, monospace";
    ctx.fillStyle = "#f6faff";
    ctx.fillText(mText, 624, my + 86);
  });
}

function drawCenterBackingScreen(
  ctx: CanvasRenderingContext2D,
  mod: CapabilityChamberModule,
  ratio: number
) {
  const w = ctx.canvas.width; // 1024
  const h = ctx.canvas.height; // 512
  ctx.fillStyle = "#07101c";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#0e1d30";
  ctx.fillRect(0, 0, w, 58);
  ctx.fillStyle = mod.accent;
  ctx.fillRect(0, 56, w, 2);

  ctx.font = "700 22px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = mod.accent;
  ctx.fillText(`BUDAI SYNTHESIS STUDIO · ${mod.file}`, 32, 38);

  const lines = mod.codeLines.slice(0, 6);
  ctx.font = "700 24px ui-monospace, SFMono-Regular, monospace";
  lines.forEach((line, idx) => {
    const y = 114 + idx * 54;
    ctx.fillStyle = "#567596";
    ctx.fillText(`0${idx + 1}`, 28, y);
    ctx.fillStyle = idx === 1 ? "#b4c0ff" : "#e6f2ff";
    const take = Math.max(4, Math.floor(line.length * clamp(ratio * 1.2, 0.35, 1)));
    ctx.fillText(line.slice(0, take), 82, y);
  });
}

/**
 * Creates the Unified 3D Capability Synthesis Studio (`03 / Capabilities`),
 * matching Builder's physical `RoundedBoxGeometry` brushed-alloy/graphite
 * studio architecture and hosting the live `CSS3DObject` `<CapabilityStudioScreen />`.
 */
export function createCapabilityEngine(
  parent: THREE.Group,
  screenWidth = 1080
): CapabilityEngine {
  const root = new THREE.Group();
  root.position.set(0, 0, 0);
  parent.add(root);

  // Builder-grade physical studio materials (`developer-room.ts` exact palette)
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
  const rubber = new THREE.MeshStandardMaterial({
    color: "#090f17",
    metalness: 0.25,
    roughness: 0.65,
  });
  const cyanLight = new THREE.MeshBasicMaterial({ color: "#72d4e9" });
  const lavenderLight = new THREE.MeshBasicMaterial({ color: "#a5b4f3" });
  const emeraldLight = new THREE.MeshBasicMaterial({ color: "#6ee7b7" });
  const edgeWireMat = new THREE.LineBasicMaterial({
    color: "#7ddaf0",
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const box = (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rounded = false
  ) => {
    const geo = rounded
      ? new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.18)
      : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    root.add(mesh);
    return mesh;
  };

  // Architectural studio floor, back wall, and vertical acoustic/light slats
  box(24, 0.22, 16, rubber, 0, -2.15, -0.5);
  box(24, 11, 0.24, rubber, 0, 3.2, -5.2);
  for (let i = -9; i <= 9; i++) {
    box(0.055, 7.6, 0.12, graphite, i * 0.95, 2.0, -4.98);
    if (i % 3 === 0) {
      box(0.015, 6.2, 0.02, i % 2 === 0 ? cyanLight : lavenderLight, i * 0.95 + 0.04, 2.0, -4.91);
    }
  }

  // Sculpted studio synthesis desk platform with under-lit LED edge strips
  box(13.2, 0.16, 4.1, graphite, 0, -0.45, 0.35, true);
  box(13.24, 0.02, 0.03, cyanLight, 0, -0.37, 2.38);
  box(13.24, 0.014, 0.025, lavenderLight, 0, -0.52, 2.36);
  box(0.24, 1.65, 3.4, alloy, -5.8, -1.28, 0.35, true);
  box(0.24, 1.65, 3.4, alloy, 5.8, -1.28, 0.35, true);

  const makeMonitor = (
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    ry = 0,
    texture?: THREE.Texture
  ) => {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = ry;

    const frameGeo = new RoundedBoxGeometry(width + 0.18, height + 0.18, 0.19, 2, 0.07);
    group.add(new THREE.Mesh(frameGeo, alloy));
    group.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 0.16, height + 0.16, 0.18)),
        edgeWireMat
      )
    );

    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      texture
        ? new THREE.MeshBasicMaterial({ map: texture })
        : new THREE.MeshStandardMaterial({ color: "#050a12", roughness: 0.18, metalness: 0.35 })
    );
    bezel.position.z = 0.103;
    group.add(bezel);

    const chin = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.016, 0.012), cyanLight);
    chin.position.set(0, -height / 2 - 0.035, 0.105);
    group.add(chin);

    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.19), alloy);
    stem.position.set(0, -height / 2 - 0.5, -0.12);
    group.add(stem);

    const foot = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.08, 0.75, 1, 0.035), graphite);
    foot.position.set(0, -y - 0.37, 0.1);
    group.add(foot);

    root.add(group);
    return group;
  };

  // Backing texture for central monitor (visible alongside/under CSS3DObject)
  const centerCanvas = document.createElement("canvas");
  centerCanvas.width = 1024;
  centerCanvas.height = 512;
  const centerCtx = centerCanvas.getContext("2d")!;
  drawCenterBackingScreen(centerCtx, CAPABILITY_CHAMBER_MODULES[0], 0.7);
  const centerTex = new THREE.CanvasTexture(centerCanvas);
  centerTex.colorSpace = THREE.SRGBColorSpace;
  centerTex.generateMipmaps = true;
  centerTex.minFilter = THREE.LinearMipmapLinearFilter;
  centerTex.magFilter = THREE.LinearFilter;
  centerTex.anisotropy = 8;

  // Left & Right Flanking Monitor Canvases (1024x512 power-of-two mipmapped)
  const leftCanvas = document.createElement("canvas");
  leftCanvas.width = 1024;
  leftCanvas.height = 512;
  const leftCtx = leftCanvas.getContext("2d")!;
  drawLeftWingDisplay(leftCtx, 0, 0, 0.7);
  const leftTex = new THREE.CanvasTexture(leftCanvas);
  leftTex.colorSpace = THREE.SRGBColorSpace;
  leftTex.generateMipmaps = true;
  leftTex.minFilter = THREE.LinearMipmapLinearFilter;
  leftTex.magFilter = THREE.LinearFilter;
  leftTex.anisotropy = 8;

  const rightCanvas = document.createElement("canvas");
  rightCanvas.width = 1024;
  rightCanvas.height = 512;
  const rightCtx = rightCanvas.getContext("2d")!;
  drawRightWingDisplay(rightCtx, 0, 0, 0.7);
  const rightTex = new THREE.CanvasTexture(rightCanvas);
  rightTex.colorSpace = THREE.SRGBColorSpace;
  rightTex.generateMipmaps = true;
  rightTex.minFilter = THREE.LinearMipmapLinearFilter;
  rightTex.magFilter = THREE.LinearFilter;
  rightTex.anisotropy = 8;

  // Central Monitor hosts the real DOM `<CapabilityStudioScreen />` via CSS3DObject
  const central = makeMonitor(0, 2.02, -0.85, 6.5, 3.64, 0, centerTex);
  const leftWing = makeMonitor(-5.05, 1.82, -0.95, 3.3, 2.7, 0.34, leftTex);
  const rightWing = makeMonitor(5.05, 1.82, -0.95, 3.3, 2.7, -0.34, rightTex);

  // 6 Physical 3D Module Pedestal Nodes on the front studio desk surface
  const moduleNodes: Array<{
    group: THREE.Group;
    coreMat: THREE.MeshStandardMaterial;
    baseX: number;
  }> = [];

  CAPABILITY_CHAMBER_MODULES.forEach((mod, idx) => {
    const baseX = -3.25 + idx * 1.3;
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(baseX, -0.32, 1.35);
    root.add(nodeGroup);

    const ped = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.08, 0.56, 2, 0.02), alloy);
    nodeGroup.add(ped);

    const coreMat = new THREE.MeshStandardMaterial({
      color: "#152940",
      emissive: mod.accent,
      emissiveIntensity: 0.45,
      metalness: 0.75,
      roughness: 0.22,
    });
    const core = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.14, 0.36, 2, 0.03), coreMat);
    core.position.y = 0.09;
    nodeGroup.add(core);

    moduleNodes.push({ group: nodeGroup, coreMat, baseX });
  });

  // Illuminated waveguide bus bar connecting the 6 desk nodes
  const busRail = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.02, 0.04), emeraldLight);
  busRail.position.set(0, -0.34, 1.35);
  root.add(busRail);

  // Studio PointLights matching Builder (`developer-room.ts`)
  const cyanLamp = new THREE.PointLight("#71c9e7", 32, 18, 2);
  cyanLamp.position.set(-4.2, 3.2, 2.2);
  root.add(cyanLamp);

  const fillLamp = new THREE.PointLight("#9fabe9", 26, 17, 2);
  fillLamp.position.set(4.8, 3.8, 1.6);
  root.add(fillLamp);

  const deskLamp = new THREE.PointLight("#6ee7b7", 16, 10, 2);
  deskLamp.position.set(0, 0.5, 2.6);
  root.add(deskLamp);

  let lastStateKey = "";

  return {
    root,
    screenPosition: central.position.clone().add(new THREE.Vector3(0, 0, 0.112)),
    screenScale: 6.5 / screenWidth,
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
      const modIdx = clamp(activeModule, 0, 5);

      const moduleStart = modIdx / 6;
      const localProgress = clamp((p - moduleStart) * 6, 0.35, 1);
      const effectiveRatio = morph >= 0.48 ? asm : localProgress;

      // Quantized canvas redraw for the flanking & backing monitors
      const qStep = Math.round(effectiveRatio * 16);
      const qMorph = morph >= 0.48 ? 1 : 0;
      const stateKey = `${modIdx}:${qMorph}:${qStep}`;
      if (stateKey !== lastStateKey) {
        lastStateKey = stateKey;
        const r = qStep / 16;
        drawLeftWingDisplay(leftCtx, modIdx, morph, r);
        leftTex.needsUpdate = true;
        drawRightWingDisplay(rightCtx, modIdx, morph, r);
        rightTex.needsUpdate = true;
        drawCenterBackingScreen(centerCtx, CAPABILITY_CHAMBER_MODULES[modIdx], r);
        centerTex.needsUpdate = true;
      }

      // Smooth unfolding of Left & Right 3D Studio Wings as morph transitions Act I -> Act II:
      // Tucked behind the central monolith during Act I (so the left DOM capability column is 100% clean),
      // then sliding out and articulating into a panoramic 3-screen pipeline in Act II!
      const wingDeploy = smooth(clamp((morph - 0.12) / 0.68, 0, 1));
      leftWing.position.set(
        lerp(-1.4, -4.95, wingDeploy),
        1.82,
        lerp(-1.55, -0.92, wingDeploy)
      );
      leftWing.rotation.y = lerp(0.05, 0.24, wingDeploy);
      leftWing.scale.setScalar(lerp(0.55, 1.0, wingDeploy));
      leftWing.visible = wingDeploy > 0.04;

      rightWing.position.set(
        lerp(1.4, 4.95, wingDeploy),
        1.82,
        lerp(-1.55, -0.92, wingDeploy)
      );
      rightWing.rotation.y = lerp(-0.05, -0.24, wingDeploy);
      rightWing.scale.setScalar(lerp(0.55, 1.0, wingDeploy));
      rightWing.visible = wingDeploy > 0.04;

      // Animate the 6 physical 3D desk nodes
      moduleNodes.forEach((node, idx) => {
        const isFocused = idx === modIdx;
        const lift = morph < 0.48 ? (isFocused ? 0.16 : 0.0) : 0.08;
        node.group.position.y =
          -0.32 + lift + Math.sin(time * 1.6 + idx * 0.8) * 0.012;
        node.coreMat.emissiveIntensity =
          morph < 0.48 ? (isFocused ? 1.15 : 0.35) : 0.85;
      });

      cyanLamp.intensity = lerp(30, 42, effectiveRatio) + Math.sin(time * 0.7) * 1.5;
      fillLamp.intensity = lerp(24, 34, morph);
      deskLamp.intensity = lerp(14, 24, effectiveRatio);
    },
  };
}
