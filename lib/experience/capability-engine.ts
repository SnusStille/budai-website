import * as THREE from "three";
import { clamp, lerp, smooth } from "./timeline";

const CYAN = "#78d5ea";
const BRIGHT = "#d6f8ff";
const LAVENDER = "#9ca8e2";
const EMERALD = "#6ee7b7";
const SLATE = "#1b3348";

interface CodeSlateSpec {
  file: string;
  badge: string;
  lines: Array<Array<{ text: string; color: string }>>;
  basePos: [number, number, number];
  baseRot: [number, number, number];
}

const CODE_SLATES: CodeSlateSpec[] = [
  {
    file: "src/engine/01-write.ts",
    badge: "01 · WRITE & DRAFT",
    basePos: [-0.35, 1.85, -1.05],
    baseRot: [0.06, -0.18, 0],
    lines: [
      [{ text: "// 01 · Bilingual Editorial & Document Engine", color: "#5e8ca6" }],
      [
        { text: "const ", color: CYAN },
        { text: "draft ", color: BRIGHT },
        { text: "= ", color: "#7ea8be" },
        { text: "await ", color: LAVENDER },
        { text: "budai.write({", color: BRIGHT },
      ],
      [
        { text: "  locale: ", color: "#8ab4c9" },
        { text: '"sv-SE" | "en-US"', color: EMERALD },
        { text: ",", color: "#8ab4c9" },
      ],
      [
        { text: "  format: ", color: "#8ab4c9" },
        { text: '"executive_proposal"', color: EMERALD },
        { text: ",", color: "#8ab4c9" },
      ],
      [
        { text: "  tone: ", color: "#8ab4c9" },
        { text: "memory.preferredVoice,", color: CYAN },
      ],
      [{ text: "});", color: BRIGHT }],
    ],
  },
  {
    file: "src/engine/02-automate.ts",
    badge: "02 · AUTOMATE",
    basePos: [1.55, 1.15, -1.35],
    baseRot: [0.04, -0.24, 0],
    lines: [
      [{ text: "// 02 · Deterministic Multi-Step Workflow", color: "#5e8ca6" }],
      [
        { text: "export const ", color: CYAN },
        { text: "flow ", color: BRIGHT },
        { text: "= budai.automate({", color: LAVENDER },
      ],
      [
        { text: "  trigger: ", color: "#8ab4c9" },
        { text: '"incoming.brief"', color: EMERALD },
        { text: ",", color: "#8ab4c9" },
      ],
      [
        { text: "  steps: [", color: "#8ab4c9" },
        { text: "parse", color: CYAN },
        { text: ", ", color: "#8ab4c9" },
        { text: "verify", color: CYAN },
        { text: ", ", color: "#8ab4c9" },
        { text: "dispatch", color: CYAN },
        { text: "],", color: "#8ab4c9" },
      ],
      [
        { text: "  auditLog: ", color: "#8ab4c9" },
        { text: "true", color: EMERALD },
      ],
      [{ text: "});", color: BRIGHT }],
    ],
  },
  {
    file: "src/engine/03-decide.ts",
    badge: "03 · DECIDE",
    basePos: [-0.45, 0.35, -1.2],
    baseRot: [0.02, -0.15, 0],
    lines: [
      [{ text: "// 03 · Risk, Tradeoff & Decision Synthesis", color: "#5e8ca6" }],
      [
        { text: "const ", color: CYAN },
        { text: "matrix ", color: BRIGHT },
        { text: "= ", color: "#7ea8be" },
        { text: "await ", color: LAVENDER },
        { text: "budai.decide({", color: BRIGHT },
      ],
      [
        { text: "  scenarios: ", color: "#8ab4c9" },
        { text: "thread.options,", color: CYAN },
      ],
      [
        { text: "  evaluate: [", color: "#8ab4c9" },
        { text: '"risk"', color: EMERALD },
        { text: ", ", color: "#8ab4c9" },
        { text: '"impact"', color: EMERALD },
        { text: "],", color: "#8ab4c9" },
      ],
      [
        { text: "  recommend: ", color: "#8ab4c9" },
        { text: '"ranked_next_steps"', color: EMERALD },
      ],
      [{ text: "});", color: BRIGHT }],
    ],
  },
  {
    file: "src/engine/04-bilingual.ts",
    badge: "04 · SWEDISH + ENGLISH",
    basePos: [1.6, -0.35, -1.3],
    baseRot: [-0.02, -0.22, 0],
    lines: [
      [{ text: "// 04 · Native Nordic Bilingual Semantic Core", color: "#5e8ca6" }],
      [
        { text: "const ", color: CYAN },
        { text: "bridge ", color: BRIGHT },
        { text: "= ", color: "#7ea8be" },
        { text: "await ", color: LAVENDER },
        { text: "budai.bilingual({", color: BRIGHT },
      ],
      [
        { text: "  pair: [", color: "#8ab4c9" },
        { text: '"sv-SE"', color: EMERALD },
        { text: ", ", color: "#8ab4c9" },
        { text: '"en-US"', color: EMERALD },
        { text: "],", color: "#8ab4c9" },
      ],
      [
        { text: "  preserveNuance: ", color: "#8ab4c9" },
        { text: "true", color: CYAN },
        { text: ",", color: "#8ab4c9" },
      ],
      [
        { text: "  register: ", color: "#8ab4c9" },
        { text: '"natural_workday"', color: EMERALD },
      ],
      [{ text: "});", color: BRIGHT }],
    ],
  },
  {
    file: "src/engine/05-memory.ts",
    badge: "05 · MEMORY",
    basePos: [-0.4, -1.1, -1.15],
    baseRot: [-0.04, -0.16, 0],
    lines: [
      [{ text: "// 05 · User-Owned Persistent Context Graph", color: "#5e8ca6" }],
      [
        { text: "const ", color: CYAN },
        { text: "context ", color: BRIGHT },
        { text: "= ", color: "#7ea8be" },
        { text: "await ", color: LAVENDER },
        { text: "budai.memory.recall({", color: BRIGHT },
      ],
      [
        { text: "  owner: ", color: "#8ab4c9" },
        { text: "auth.uid(),", color: CYAN },
      ],
      [
        { text: "  policy: ", color: "#8ab4c9" },
        { text: '"explicit_user_choice"', color: EMERALD },
        { text: ",", color: "#8ab4c9" },
      ],
      [
        { text: "  rls: ", color: "#8ab4c9" },
        { text: '"strict_isolated"', color: EMERALD },
      ],
      [{ text: "});", color: BRIGHT }],
    ],
  },
  {
    file: "src/engine/06-multimodal.ts",
    badge: "06 · VISION & VOICE",
    basePos: [1.5, -1.8, -1.3],
    baseRot: [-0.06, -0.22, 0],
    lines: [
      [{ text: "// 06 · Optical Vision & Spoken Prompt Engine", color: "#5e8ca6" }],
      [
        { text: "const ", color: CYAN },
        { text: "signal ", color: BRIGHT },
        { text: "= ", color: "#7ea8be" },
        { text: "await ", color: LAVENDER },
        { text: "budai.perceive({", color: BRIGHT },
      ],
      [
        { text: "  vision: ", color: "#8ab4c9" },
        { text: "attachment.imageFrame,", color: CYAN },
      ],
      [
        { text: "  voice: ", color: "#8ab4c9" },
        { text: 'audio.transcribe("sv-SE"),', color: EMERALD },
      ],
      [
        { text: "  streamTo: ", color: "#8ab4c9" },
        { text: '"playground_thread"', color: EMERALD },
      ],
      [{ text: "});", color: BRIGHT }],
    ],
  },
];

const SYNTAX_TOKENS = [
  "await budai.write()",
  'locale: "sv-SE"',
  "budai.automate()",
  "steps => verified",
  "budai.decide()",
  "risk.evaluate()",
  "sv-SE <-> en-US",
  "preserveTone: true",
  "memory.recall()",
  "rls: auth.uid()",
  "vision.analyze()",
  "voice.stream()",
];

function createCodeSlateTexture(spec: CodeSlateSpec): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 340;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Deep translucent glass background
    ctx.fillStyle = "rgba(6, 15, 26, 0.92)";
    ctx.fillRect(0, 0, 640, 340);

    // Subtle grid lines inside code panel
    ctx.strokeStyle = "rgba(118, 212, 234, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 40; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 48);
      ctx.lineTo(x, 340);
      ctx.stroke();
    }

    // Header chrome bar
    ctx.fillStyle = "rgba(13, 31, 48, 0.95)";
    ctx.fillRect(0, 0, 640, 46);
    ctx.strokeStyle = "rgba(120, 213, 234, 0.32)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 46);
    ctx.lineTo(640, 46);
    ctx.stroke();

    // Window dots + file path + badge
    ctx.fillStyle = "#78d5ea";
    ctx.beginPath();
    ctx.arc(22, 23, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9ca8e2";
    ctx.beginPath();
    ctx.arc(38, 23, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "600 13px monospace";
    ctx.fillStyle = "#b8e9f5";
    ctx.fillText(spec.file, 58, 28);

    ctx.font = "600 11px monospace";
    ctx.fillStyle = "#78d5ea";
    ctx.fillText(spec.badge, 450, 28);

    // Code lines with line numbers and syntax highlighting
    spec.lines.forEach((tokens, rowIdx) => {
      const y = 84 + rowIdx * 36;
      ctx.font = "13px monospace";
      ctx.fillStyle = "rgba(116, 158, 182, 0.45)";
      ctx.fillText(`0${rowIdx + 1}`, 20, y);

      let x = 58;
      tokens.forEach(tk => {
        ctx.font = "600 15px monospace";
        ctx.fillStyle = tk.color;
        ctx.fillText(tk.text, x, y);
        x += ctx.measureText(tk.text).width;
      });
    });

    // Bottom live status bar
    ctx.fillStyle = "rgba(10, 25, 40, 0.9)";
    ctx.fillRect(0, 304, 640, 36);
    ctx.fillStyle = "#6ee7b7";
    ctx.beginPath();
    ctx.arc(24, 322, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "11px monospace";
    ctx.fillStyle = "#88bfd4";
    ctx.fillText("SIGNAL CONNECTED · NEURAL CORE READY · SV / EN", 38, 326);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createTokenTexture(text: string, idx: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 56;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(8, 22, 36, 0.82)";
    ctx.fillRect(0, 0, 256, 56);
    ctx.strokeStyle = idx % 2 === 0 ? "rgba(120, 213, 234, 0.42)" : "rgba(156, 168, 226, 0.42)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 254, 54);
    ctx.font = "600 15px monospace";
    ctx.fillStyle = idx % 2 === 0 ? "#b8f1ff" : "#d0d7fb";
    ctx.fillText(text, 16, 34);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Chapter 03 — THE LIVING INTELLIGENCE ENGINE:
 * 1. Visual 1 (`morph -> 0`):
 *    - 6 Dimensional 3D Code Panels (`THREE.CanvasTexture` on 3D `PlaneGeometry` with `EdgesGeometry` glass bevels)
 *      positioned at staggered 3D depths and perspective angles, illuminating and gliding forward as the user
 *      scrolls or focuses each capability (`01 Write` .. `06 Vision & Voice`).
 *    - 12 Floating 3D Syntax Token Streams travelling through depth between the code panels and the Core.
 *    - Reactive 3D Central Intelligence Core (`IcosahedronGeometry` outer lattice + `OctahedronGeometry` nucleus +
 *      3 counter-rotating `TorusGeometry` gimbals) connected via 6 curved 3D `TubeGeometry` waveguides to
 *      6 distinct 3D capability sculptures.
 * 2. Visual 2 (`morph -> 1`):
 *    - Smoothly transitions into 3 monumental 3D Access Tier Stations (`Basic` Personal Core, `Consumer` Deep-Memory
 *      Station, `Business` 4-Satellite Team Constellation) with dimensional code slates arrayed along the horizon.
 */
export function createCapabilityEngine(parent?: THREE.Object3D) {
  const root = new THREE.Group();
  root.position.set(0, 1.4, 0);
  parent?.add(root);

  const engineGroup = new THREE.Group();
  root.add(engineGroup);

  const accessGroup = new THREE.Group();
  root.add(accessGroup);

  // ============================================================================
  // 1A. DIMENSIONAL 3D CODE PANELS (Positioned at staggered depths in 3D space)
  // ============================================================================
  const codePanelGroup = new THREE.Group();
  engineGroup.add(codePanelGroup);

  const codeSlates: Array<{
    group: THREE.Group;
    mat: THREE.MeshBasicMaterial;
    edgeMat: THREE.LineBasicMaterial;
    glowBarMat: THREE.MeshBasicMaterial;
    spec: CodeSlateSpec;
  }> = [];

  const slateGeo = new THREE.PlaneGeometry(1.92, 1.02);
  const slateEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.94, 1.04, 0.02));
  const glowBarGeo = new THREE.PlaneGeometry(1.9, 0.028);

  CODE_SLATES.forEach(spec => {
    const group = new THREE.Group();
    group.position.set(...spec.basePos);
    group.rotation.set(...spec.baseRot);
    codePanelGroup.add(group);

    const tex = createCodeSlateTexture(spec);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(slateGeo, mat);
    group.add(mesh);

    const edgeMat = new THREE.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const edges = new THREE.LineSegments(slateEdgeGeo, edgeMat);
    group.add(edges);

    const glowBarMat = new THREE.MeshBasicMaterial({
      color: BRIGHT,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowBar = new THREE.Mesh(glowBarGeo, glowBarMat);
    glowBar.position.set(0, 0.51, 0.015);
    group.add(glowBar);

    codeSlates.push({ group, mat, edgeMat, glowBarMat, spec });
  });

  // 3D Architectural Perspective Depth Grid + 6 Code-to-Core Synaptic Compiler Filaments
  const depthGridPts: THREE.Vector3[] = [];
  for (let gx = -3.6; gx <= 2.8; gx += 0.8) {
    depthGridPts.push(new THREE.Vector3(gx, -2.5, -2.05), new THREE.Vector3(gx, 2.5, -2.05));
  }
  for (let gy = -2.2; gy <= 2.2; gy += 0.55) {
    depthGridPts.push(new THREE.Vector3(-3.6, gy, -2.05), new THREE.Vector3(2.8, gy, -2.05));
  }
  const depthGridMat = new THREE.LineBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const depthGrid = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(depthGridPts), depthGridMat);
  codePanelGroup.add(depthGrid);

  const slateBeamCurves: THREE.CatmullRomCurve3[] = [];
  const slateBeamMats: THREE.MeshBasicMaterial[] = [];
  const slatePulses: THREE.Mesh[] = [];
  const slatePulseGeo = new THREE.SphereGeometry(0.044, 10, 10);

  CODE_SLATES.forEach((spec, idx) => {
    const sPos = new THREE.Vector3(...spec.basePos);
    const mid = new THREE.Vector3(
      (sPos.x - 2.28) * 0.5,
      sPos.y * 0.58,
      sPos.z * 0.5 - 0.25
    );
    const cEnd = new THREE.Vector3(-2.28, (2.5 - idx) * 0.12, 0);
    const sCurve = new THREE.CatmullRomCurve3([sPos, mid, cEnd]);
    slateBeamCurves.push(sCurve);

    const sbMat = new THREE.MeshBasicMaterial({
      color: idx % 2 === 0 ? CYAN : LAVENDER,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    slateBeamMats.push(sbMat);
    codePanelGroup.add(new THREE.Mesh(new THREE.TubeGeometry(sCurve, 28, 0.009, 6, false), sbMat));

    const spMesh = new THREE.Mesh(slatePulseGeo, sbMat);
    codePanelGroup.add(spMesh);
    slatePulses.push(spMesh);
  });

  // ============================================================================
  // 1B. FLOATING 3D SYNTAX TOKEN STREAMS (Flowing through depth)
  // ============================================================================
  const syntaxStreamGroup = new THREE.Group();
  engineGroup.add(syntaxStreamGroup);

  const tokenGeo = new THREE.PlaneGeometry(0.66, 0.145);
  const tokenMeshes: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    lane: number;
    phase: number;
  }> = [];

  SYNTAX_TOKENS.forEach((text, idx) => {
    const lane = idx % 6;
    const tex = createTokenTexture(text, idx);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(tokenGeo, mat);
    syntaxStreamGroup.add(mesh);
    tokenMeshes.push({ mesh, mat, lane, phase: (idx / SYNTAX_TOKENS.length) % 1 });
  });

  // ============================================================================
  // 1C. CENTRAL INTELLIGENCE CORE (Left focal anchor: x = -2.28, y = 0, z = 0)
  // ============================================================================
  const corePos = new THREE.Vector3(-2.28, 0, 0);
  const coreGroup = new THREE.Group();
  coreGroup.position.copy(corePos);
  engineGroup.add(coreGroup);

  const coreSolidMat = new THREE.MeshStandardMaterial({
    color: "#0e293b",
    emissive: "#237391",
    emissiveIntensity: 0.9,
    metalness: 0.82,
    roughness: 0.2,
    transparent: true,
    opacity: 0.92,
  });
  const coreNucleus = new THREE.Mesh(new THREE.OctahedronGeometry(0.44, 1), coreSolidMat);
  coreGroup.add(coreNucleus);

  const coreInnerMat = new THREE.MeshBasicMaterial({
    color: BRIGHT,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreSpark = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), coreInnerMat);
  coreGroup.add(coreSpark);

  const coreWireMat = new THREE.LineBasicMaterial({
    color: "#9aefff",
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreOuterShell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.72, 1)),
    coreWireMat
  );
  coreGroup.add(coreOuterShell);

  const coreMidShellMat = new THREE.LineBasicMaterial({
    color: LAVENDER,
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreMidShell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(0.58, 0)),
    coreMidShellMat
  );
  coreGroup.add(coreMidShell);

  const coreRings: THREE.Mesh[] = [];
  const coreRingMats: THREE.MeshBasicMaterial[] = [];
  const ringConfigs = [
    { radius: 0.96, tube: 0.014, rx: 1.08, ry: 0.22, color: "#8ce9fb" },
    { radius: 1.18, tube: 0.011, rx: -0.78, ry: 0.68, color: "#9da9e6" },
    { radius: 1.38, tube: 0.009, rx: 0.42, ry: -0.92, color: "#6ecbe2" },
  ];
  ringConfigs.forEach(cfg => {
    const rMat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.54,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    coreRingMats.push(rMat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.radius, cfg.tube, 10, 72), rMat);
    ring.rotation.set(cfg.rx, cfg.ry, 0);
    coreGroup.add(ring);
    coreRings.push(ring);
  });

  const spineMat = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreSpine = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.8, 8), spineMat);
  coreGroup.add(coreSpine);

  // ============================================================================
  // 1D. 6 NEURAL WAVEGUIDES & 6 SCULPTURAL 3D CAPABILITY ASSEMBLIES
  // ============================================================================
  const pathwayCurves: THREE.CatmullRomCurve3[] = [];
  const pathwayMats: THREE.MeshBasicMaterial[] = [];
  const pulsePairs: Array<[THREE.Mesh, THREE.Mesh]> = [];
  const pulseMats: THREE.MeshBasicMaterial[] = [];
  const moduleGroups: THREE.Group[] = [];
  const moduleWireMats: THREE.LineBasicMaterial[] = [];
  const moduleSolidMats: THREE.MeshStandardMaterial[] = [];
  const moduleAccentMats: THREE.MeshBasicMaterial[] = [];
  const moduleHalos: THREE.Mesh[] = [];

  const pulseGeo = new THREE.SphereGeometry(0.052, 12, 12);

  for (let i = 0; i < 6; i++) {
    const y = (2.5 - i) * 0.72;
    const start = new THREE.Vector3(corePos.x + 0.52, corePos.y + (y * 0.22), 0);
    const mid1 = new THREE.Vector3(-1.35, y * 0.68, (i % 2 === 0 ? 1 : -1) * 0.24);
    const mid2 = new THREE.Vector3(-0.62, y * 0.96, (i % 2 === 0 ? -1 : 1) * 0.12);
    const end = new THREE.Vector3(-0.08, y, 0);

    const curve = new THREE.CatmullRomCurve3([start, mid1, mid2, end]);
    pathwayCurves.push(curve);

    const pMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? CYAN : LAVENDER,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    pathwayMats.push(pMat);
    const tubeMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.014, 8, false), pMat);
    engineGroup.add(tubeMesh);

    const pulseMat = new THREE.MeshBasicMaterial({
      color: BRIGHT,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    pulseMats.push(pulseMat);
    const pA = new THREE.Mesh(pulseGeo, pulseMat);
    const pB = new THREE.Mesh(pulseGeo, pulseMat);
    engineGroup.add(pA, pB);
    pulsePairs.push([pA, pB]);

    const modGroup = new THREE.Group();
    modGroup.position.set(0.65, y, 0);
    engineGroup.add(modGroup);
    moduleGroups.push(modGroup);

    const wireMat = new THREE.LineBasicMaterial({
      color: "#93ecff",
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    moduleWireMats.push(wireMat);

    const solidMat = new THREE.MeshStandardMaterial({
      color: SLATE,
      emissive: "#236c88",
      emissiveIntensity: 0.65,
      metalness: 0.78,
      roughness: 0.24,
      transparent: true,
      opacity: 0.82,
    });
    moduleSolidMats.push(solidMat);

    const accentMat = new THREE.MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    moduleAccentMats.push(accentMat);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.01, 8, 40), accentMat);
    halo.position.set(-0.73, 0, 0);
    modGroup.add(halo);
    moduleHalos.push(halo);

    const hubDot = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), accentMat);
    hubDot.position.set(-0.73, 0, 0);
    modGroup.add(hubDot);

    if (i === 0) {
      // 01 / WRITE: 3 staggered 3D document planes
      for (let s = 0; s < 3; s++) {
        const sheetGeo = new THREE.BoxGeometry(0.95, 0.42, 0.025);
        const sheet = new THREE.Mesh(sheetGeo, solidMat);
        sheet.position.set(s * 0.24, (1 - s) * 0.05, -s * 0.11);
        sheet.rotation.y = -0.18 + s * 0.06;
        modGroup.add(sheet);

        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(sheetGeo), wireMat);
        edges.position.copy(sheet.position);
        edges.rotation.copy(sheet.rotation);
        modGroup.add(edges);
      }
      for (let line = 0; line < 3; line++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.56 - line * 0.1, 0.028, 0.01), accentMat);
        bar.position.set(-0.08 - line * 0.04, 0.12 - line * 0.09, 0.03);
        bar.rotation.y = -0.18;
        modGroup.add(bar);
      }
    } else if (i === 1) {
      // 02 / AUTOMATE: 4-stage 3D hexagonal workflow chain
      for (let n = 0; n < 4; n++) {
        const hexGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.07, 6);
        const hex = new THREE.Mesh(hexGeo, solidMat);
        hex.rotation.x = Math.PI / 2;
        hex.position.set(-0.22 + n * 0.36, (n % 2 === 0 ? 1 : -1) * 0.06, (1.5 - n) * 0.05);
        modGroup.add(hex);

        const hexWire = new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), wireMat);
        hexWire.rotation.copy(hex.rotation);
        hexWire.position.copy(hex.position);
        modGroup.add(hexWire);

        if (n < 3) {
          const link = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.022, 0.022), accentMat);
          link.position.set(-0.04 + n * 0.36, 0, 0);
          link.rotation.z = n % 2 === 0 ? -0.32 : 0.32;
          modGroup.add(link);
        }
      }
    } else if (i === 2) {
      // 03 / DECIDE: 3D octahedral decision core branching into 3 weighted outcome nodes
      const hubGeo = new THREE.OctahedronGeometry(0.22, 0);
      const hub = new THREE.Mesh(hubGeo, solidMat);
      hub.position.set(-0.15, 0, 0);
      modGroup.add(hub);
      const hubEdges = new THREE.LineSegments(new THREE.EdgesGeometry(hubGeo), wireMat);
      hubEdges.position.copy(hub.position);
      modGroup.add(hubEdges);

      const branchOffsets = [
        new THREE.Vector3(0.58, 0.2, 0.1),
        new THREE.Vector3(0.68, 0, 0),
        new THREE.Vector3(0.58, -0.2, -0.1),
      ];
      branchOffsets.forEach((bPos, bIdx) => {
        const bCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.15, 0, 0), bPos]);
        const bTube = new THREE.Mesh(new THREE.TubeGeometry(bCurve, 12, 0.012, 6, false), accentMat);
        modGroup.add(bTube);

        const outGeo = new THREE.OctahedronGeometry(bIdx === 1 ? 0.14 : 0.1, 0);
        const outNode = new THREE.Mesh(outGeo, solidMat);
        outNode.position.copy(bPos);
        modGroup.add(outNode);
        const outWire = new THREE.LineSegments(new THREE.EdgesGeometry(outGeo), wireMat);
        outWire.position.copy(bPos);
        modGroup.add(outWire);
      });
    } else if (i === 3) {
      // 04 / SWEDISH + ENGLISH: Dual-helix 3D bilingual wave bridge
      const ptsA: THREE.Vector3[] = [];
      const ptsB: THREE.Vector3[] = [];
      for (let s = 0; s <= 16; s++) {
        const u = s / 16;
        const x = -0.3 + u * 1.15;
        const angle = u * Math.PI * 2;
        ptsA.push(new THREE.Vector3(x, Math.sin(angle) * 0.16, Math.cos(angle) * 0.14));
        ptsB.push(new THREE.Vector3(x, -Math.sin(angle) * 0.16, -Math.cos(angle) * 0.14));
      }
      const strandA = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsA), 28, 0.016, 6, false),
        accentMat
      );
      const strandB = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsB), 28, 0.016, 6, false),
        accentMat
      );
      modGroup.add(strandA, strandB);
      for (let r = 1; r < 16; r += 2) {
        const rungGeo = new THREE.BufferGeometry().setFromPoints([ptsA[r], ptsB[r]]);
        modGroup.add(new THREE.Line(rungGeo, wireMat));
      }
    } else if (i === 4) {
      // 05 / MEMORY: 3-layer 3D vertical context stack with memory-bus pillars
      for (let layer = 0; layer < 3; layer++) {
        const plateGeo = new THREE.BoxGeometry(0.88, 0.045, 0.48);
        const plate = new THREE.Mesh(plateGeo, solidMat);
        plate.position.set(0.24, (layer - 1) * 0.15, 0);
        plate.rotation.y = 0.28;
        plate.rotation.x = 0.14;
        modGroup.add(plate);

        const plateEdges = new THREE.LineSegments(new THREE.EdgesGeometry(plateGeo), wireMat);
        plateEdges.position.copy(plate.position);
        plateEdges.rotation.copy(plate.rotation);
        modGroup.add(plateEdges);
      }
      for (const px of [-0.08, 0.54]) {
        for (const pz of [-0.14, 0.14]) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), accentMat);
          col.position.set(px, 0, pz);
          modGroup.add(col);
        }
      }
    } else {
      // 06 / VISION & VOICE: Dual-ring 3D optical iris + 6-bar 3D acoustic equalizer
      const lensOuter = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 10, 40), accentMat);
      lensOuter.position.set(-0.08, 0, 0);
      modGroup.add(lensOuter);
      const lensCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), solidMat);
      lensCore.position.set(-0.08, 0, 0);
      modGroup.add(lensCore);

      const barHeights = [0.16, 0.34, 0.44, 0.26, 0.38, 0.2];
      barHeights.forEach((bh, bIdx) => {
        const barGeo = new THREE.BoxGeometry(0.048, bh, 0.048);
        const bar = new THREE.Mesh(barGeo, solidMat);
        bar.position.set(0.25 + bIdx * 0.11, 0, (bIdx % 2 === 0 ? 1 : -1) * 0.03);
        modGroup.add(bar);
        const barEdges = new THREE.LineSegments(new THREE.EdgesGeometry(barGeo), wireMat);
        barEdges.position.copy(bar.position);
        modGroup.add(barEdges);
      });
    }
  }

  // ============================================================================
  // 2. VISUAL 2 (`[data-access-architecture]`): 3 SCULPTURAL 3D TIER STATIONS
  // ============================================================================
  const tierX = [-3.1, 0, 3.1];
  const tierGroups: THREE.Group[] = [];
  const tierWireMats: THREE.LineBasicMaterial[] = [];
  const tierSolidMats: THREE.MeshStandardMaterial[] = [];
  const tierAccentMats: THREE.MeshBasicMaterial[] = [];
  const tierCores: THREE.Object3D[] = [];
  const tierOrbits: THREE.Object3D[][] = [[], [], []];
  const tierSlateMats: THREE.MeshBasicMaterial[] = [];
  const tierSlateEdges: THREE.LineBasicMaterial[] = [];
  const tierSlateGroups: THREE.Group[] = [];

  tierX.forEach((tx, tIdx) => {
    const sGroup = new THREE.Group();
    sGroup.position.set(tx, 0.58, -1.15);
    sGroup.rotation.set(0.05, tIdx === 0 ? 0.18 : tIdx === 2 ? -0.18 : 0, 0);
    sGroup.scale.setScalar(0.84);
    accessGroup.add(sGroup);
    tierSlateGroups.push(sGroup);

    const sMat = new THREE.MeshBasicMaterial({
      map: codeSlates[tIdx * 2].mat.map,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    tierSlateMats.push(sMat);
    sGroup.add(new THREE.Mesh(slateGeo, sMat));

    const sEdge = new THREE.LineBasicMaterial({
      color: tIdx === 2 ? LAVENDER : CYAN,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tierSlateEdges.push(sEdge);
    sGroup.add(new THREE.LineSegments(slateEdgeGeo, sEdge));
  });

  const tierBridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.1, 0.08, 0),
    new THREE.Vector3(-1.55, 0.22, 0.2),
    new THREE.Vector3(0, 0.12, 0),
    new THREE.Vector3(1.55, 0.24, -0.2),
    new THREE.Vector3(3.1, 0.14, 0),
  ]);
  const tierBridgeMat = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const tierBridgeMesh = new THREE.Mesh(
    new THREE.TubeGeometry(tierBridgeCurve, 48, 0.015, 8, false),
    tierBridgeMat
  );
  accessGroup.add(tierBridgeMesh);

  const tierBridgePulses: THREE.Mesh[] = [];
  const tierBridgePulseMat = new THREE.MeshBasicMaterial({
    color: BRIGHT,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  for (let p = 0; p < 3; p++) {
    const pm = new THREE.Mesh(pulseGeo, tierBridgePulseMat);
    accessGroup.add(pm);
    tierBridgePulses.push(pm);
  }

  tierX.forEach((tx, tIdx) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tx, -0.05, 0);
    accessGroup.add(tGroup);
    tierGroups.push(tGroup);

    const primaryColor = tIdx === 0 ? CYAN : tIdx === 1 ? "#8ac4f4" : LAVENDER;
    const tWireMat = new THREE.LineBasicMaterial({
      color: tIdx === 0 ? "#9cf0ff" : tIdx === 1 ? "#b0dcff" : "#c0c8fa",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tierWireMats.push(tWireMat);

    const tSolidMat = new THREE.MeshStandardMaterial({
      color: "#11283a",
      emissive: tIdx === 0 ? "#1f6e88" : tIdx === 1 ? "#2b5e8f" : "#3f4682",
      emissiveIntensity: 0.78,
      metalness: 0.8,
      roughness: 0.24,
      transparent: true,
      opacity: 0,
    });
    tierSolidMats.push(tSolidMat);

    const tAccentMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    tierAccentMats.push(tAccentMat);

    const pedRadius = 0.74 + tIdx * 0.14;
    const pedGeo = new THREE.CylinderGeometry(pedRadius * 0.88, pedRadius, 0.14, 6);
    const pedMesh = new THREE.Mesh(pedGeo, tSolidMat);
    pedMesh.position.y = -0.68;
    tGroup.add(pedMesh);

    const pedEdges = new THREE.LineSegments(new THREE.EdgesGeometry(pedGeo), tWireMat);
    pedEdges.position.copy(pedMesh.position);
    tGroup.add(pedEdges);

    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(pedRadius * 1.05, 0.012, 8, 48), tAccentMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -0.6;
    tGroup.add(baseRing);

    for (let c = 0; c < 6; c++) {
      const ang = (c / 6) * Math.PI * 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.36 + tIdx * 0.08, 6), tAccentMat);
      col.position.set(
        Math.cos(ang) * pedRadius * 0.68,
        -0.46 + tIdx * 0.04,
        Math.sin(ang) * pedRadius * 0.68
      );
      tGroup.add(col);
    }

    if (tIdx === 0) {
      const cGeo = new THREE.OctahedronGeometry(0.36, 0);
      const cMesh = new THREE.Mesh(cGeo, tSolidMat);
      cMesh.position.y = 0.15;
      tGroup.add(cMesh);
      const cWire = new THREE.LineSegments(new THREE.EdgesGeometry(cGeo), tWireMat);
      cMissionCopy(cMesh, cWire);
      tGroup.add(cWire);
      tierCores.push(cMesh);

      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.013, 8, 56), tAccentMat);
      ring1.position.y = 0.15;
      ring1.rotation.set(1.1, 0.3, 0);
      tGroup.add(ring1);
      tierOrbits[0].push(ring1, cWire);
    } else if (tIdx === 1) {
      const cGeo = new THREE.IcosahedronGeometry(0.42, 1);
      const cMesh = new THREE.Mesh(cGeo, tSolidMat);
      cMesh.position.y = 0.2;
      tGroup.add(cMesh);
      const cWire = new THREE.LineSegments(new THREE.EdgesGeometry(cGeo), tWireMat);
      cWire.position.y = 0.2;
      tGroup.add(cWire);
      tierCores.push(cMesh);

      for (let m = -1; m <= 1; m++) {
        const mRing = new THREE.Mesh(new THREE.TorusGeometry(0.56 - Math.abs(m) * 0.08, 0.011, 8, 48), tAccentMat);
        mRing.rotation.x = Math.PI / 2;
        mRing.position.y = 0.2 + m * 0.18;
        tGroup.add(mRing);
      }

      const g1 = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.013, 8, 60), tAccentMat);
      g1.position.y = 0.2;
      g1.rotation.set(0.95, 0.45, 0);
      const g2 = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.01, 8, 60), tAccentMat);
      g2.position.y = 0.2;
      g2.rotation.set(-0.85, -0.5, 0);
      tGroup.add(g1, g2);
      tierOrbits[1].push(g1, g2, cWire);
    } else {
      const cGeo = new THREE.IcosahedronGeometry(0.46, 1);
      const cMesh = new THREE.Mesh(cGeo, tSolidMat);
      cMesh.position.y = 0.24;
      tGroup.add(cMesh);
      const cWire = new THREE.LineSegments(new THREE.EdgesGeometry(cGeo), tWireMat);
      cWire.position.y = 0.24;
      tGroup.add(cWire);
      tierCores.push(cMesh);

      const satGroup = new THREE.Group();
      satGroup.position.y = 0.24;
      tGroup.add(satGroup);
      for (let s = 0; s < 4; s++) {
        const sAng = (s / 4) * Math.PI * 2 + 0.4;
        const sx = Math.cos(sAng) * 0.86;
        const sy = (s % 2 === 0 ? 1 : -1) * 0.22;
        const sz = Math.sin(sAng) * 0.64;

        const satGeo = new THREE.OctahedronGeometry(0.14, 0);
        const sat = new THREE.Mesh(satGeo, tSolidMat);
        sat.position.set(sx, sy, sz);
        satGroup.add(sat);
        const satWire = new THREE.LineSegments(new THREE.EdgesGeometry(satGeo), tWireMat);
        satWire.position.copy(sat.position);
        satGroup.add(satWire);

        const spokeGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(sx, sy, sz),
        ]);
        satGroup.add(new THREE.Line(spokeGeo, tWireMat));
      }

      const outerG1 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.014, 8, 64), tAccentMat);
      outerG1.position.y = 0.24;
      outerG1.rotation.set(1.08, -0.35, 0);
      const outerG2 = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.01, 8, 64), tAccentMat);
      outerG2.position.y = 0.24;
      outerG2.rotation.set(-0.72, 0.62, 0);
      tGroup.add(outerG1, outerG2);
      tierOrbits[2].push(outerG1, outerG2, satGroup, cWire);
    }
  });

  function cMissionCopy(src: THREE.Object3D, dst: THREE.Object3D) {
    dst.position.copy(src.position);
  }

  return {
    root,
    update(progress: number, focus: number, morph = 0, time = 0) {
      const m = smooth(clamp(morph));
      const engineVis = smooth(1 - m * 1.15);
      const accessVis = smooth((m - 0.08) / 0.82);

      engineGroup.visible = engineVis > 0.005;
      accessGroup.visible = accessVis > 0.005;

      const active = focus >= 0 ? focus : Math.min(5, Math.floor(clamp(progress) * 6));

      if (engineGroup.visible) {
        // 1A. Animate 6 Dimensional 3D Code Panels
        codeSlates.forEach((slate, idx) => {
          const isFocused = idx === active;
          const targetZ = isFocused ? -0.35 : slate.spec.basePos[2] - Math.abs(idx - active) * 0.18;
          const targetX = isFocused ? 0.65 : slate.spec.basePos[0] + (idx % 2 === 0 ? -0.15 : 0.25);
          const targetY = isFocused ? (2.5 - idx) * 0.62 + 0.18 : slate.spec.basePos[1] + Math.sin(time * 0.8 + idx) * 0.04;

          slate.group.position.x = lerp(slate.group.position.x, targetX, 0.14);
          slate.group.position.y = lerp(slate.group.position.y, targetY, 0.14);
          slate.group.position.z = lerp(slate.group.position.z, targetZ, 0.14);
          slate.group.scale.setScalar(isFocused ? 0.92 : 0.68);

          slate.mat.opacity = (isFocused ? 0.82 : 0.22) * engineVis;
          slate.edgeMat.opacity = (isFocused ? 0.88 : 0.24) * engineVis;
          slate.glowBarMat.opacity = (isFocused ? 0.95 : 0.25) * engineVis;

          slateBeamMats[idx].opacity = (isFocused ? 0.76 : 0.14) * engineVis;
          const su = (time * (isFocused ? 0.56 : 0.24) + idx * 0.17) % 1;
          slateBeamCurves[idx].getPointAt(su, slatePulses[idx].position);
          slatePulses[idx].scale.setScalar(isFocused ? 1.45 : 0.75);
        });
        depthGrid.rotation.y = (clamp(progress) - 0.5) * 0.14;
        depthGridMat.opacity = 0.12 * engineVis;

        // 1B. Animate Floating 3D Syntax Token Streams flowing from Code Panels into Core
        tokenMeshes.forEach(tk => {
          const u = (time * 0.22 + tk.phase) % 1;
          const isLaneActive = tk.lane === active;
          const curve = pathwayCurves[tk.lane];
          // Flow along a parallel depth plane behind the waveguides
          curve.getPointAt(1 - u, tk.mesh.position);
          tk.mesh.position.z -= 0.42 + (tk.lane % 2) * 0.22;
          tk.mesh.position.y += 0.12;
          tk.mat.opacity = (isLaneActive ? 0.68 : 0.22) * Math.sin(u * Math.PI) * engineVis;
        });

        // 1C. Animate Central Intelligence Core
        coreNucleus.rotation.y = time * 0.48;
        coreNucleus.rotation.x = time * 0.26;
        coreSpark.rotation.y = -time * 0.8;
        coreOuterShell.rotation.y = -time * 0.3;
        coreOuterShell.rotation.z = time * 0.16;
        coreMidShell.rotation.x = time * 0.34;
        coreMidShell.rotation.y = time * 0.24;

        coreSolidMat.opacity = 0.92 * engineVis;
        coreInnerMat.opacity = (0.78 + Math.sin(time * 3.2) * 0.16) * engineVis;
        coreWireMat.opacity = 0.88 * engineVis;
        coreMidShellMat.opacity = 0.58 * engineVis;
        spineMat.opacity = 0.36 * engineVis;

        coreRings.forEach((ring, rIdx) => {
          ring.rotation.z = time * (0.36 - rIdx * 0.08) * (rIdx % 2 === 0 ? 1 : -1);
          coreRingMats[rIdx].opacity = (0.52 + (rIdx === active % 3 ? 0.28 : 0)) * engineVis;
        });

        // 1D. Animate 6 Waveguides, Pulses & 6 Sculptural Capability Modules
        for (let i = 0; i < 6; i++) {
          const isFocused = i === active;
          const weight = isFocused ? 1.0 : 0.42;

          pathwayMats[i].opacity = (isFocused ? 0.86 : 0.28) * engineVis;
          pulseMats[i].opacity = (isFocused ? 0.98 : 0.45) * engineVis;

          const speed = isFocused ? 0.46 : 0.22;
          const u1 = (time * speed + i * 0.15) % 1;
          const u2 = (u1 + 0.5) % 1;
          pathwayCurves[i].getPointAt(u1, pulsePairs[i][0].position);
          pathwayCurves[i].getPointAt(u2, pulsePairs[i][1].position);
          const pScale = isFocused ? 1.38 : 0.82;
          pulsePairs[i][0].scale.setScalar(pScale);
          pulsePairs[i][1].scale.setScalar(pScale * 0.85);

          moduleWireMats[i].opacity = (isFocused ? 0.96 : 0.48) * engineVis;
          moduleSolidMats[i].opacity = (isFocused ? 0.92 : 0.54) * engineVis;
          moduleSolidMats[i].emissiveIntensity = isFocused ? 1.15 : 0.48;
          moduleAccentMats[i].opacity = (isFocused ? 0.92 : 0.42) * engineVis;

          const mod = moduleGroups[i];
          const targetScale = isFocused ? 1.12 : 0.92;
          mod.scale.setScalar(targetScale);
          mod.position.y = (2.5 - i) * 0.72 + Math.sin(time * 1.4 + i * 0.9) * 0.025 * weight;
          moduleHalos[i].rotation.z = time * (isFocused ? 0.9 : 0.35);
          moduleHalos[i].rotation.y = Math.sin(time * 0.8 + i) * 0.35;
        }
      }

      if (accessGroup.visible) {
        tierBridgeMat.opacity = 0.48 * accessVis;
        tierBridgePulseMat.opacity = 0.92 * accessVis;
        tierBridgePulses.forEach((pm, pIdx) => {
          const u = (time * 0.28 + pIdx * 0.33) % 1;
          tierBridgeCurve.getPointAt(u, pm.position);
        });

        for (let t = 0; t < 3; t++) {
          tierWireMats[t].opacity = 0.88 * accessVis;
          tierSolidMats[t].opacity = 0.86 * accessVis;
          tierAccentMats[t].opacity = 0.68 * accessVis;
          tierSlateMats[t].opacity = 0.46 * accessVis;
          tierSlateEdges[t].opacity = 0.52 * accessVis;
          tierSlateGroups[t].position.y = 0.58 + Math.sin(time * 1.1 + t * 1.3) * 0.035;

          tierCores[t].rotation.y = time * (0.35 + t * 0.1);
          tierCores[t].rotation.x = time * 0.2;

          tierOrbits[t].forEach((orb, oIdx) => {
            orb.rotation.y = time * (0.32 - oIdx * 0.08) * (oIdx % 2 === 0 ? 1 : -1);
            orb.rotation.z = time * 0.18 * (oIdx % 2 === 0 ? -1 : 1);
          });
        }
      }
    },
  };
}
