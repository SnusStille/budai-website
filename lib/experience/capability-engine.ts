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
    title: "Fragments into structured documents",
    subtitle: "Context-locked drafting in SV & EN.",
    accent: "#72d7ec",
    file: "01-write.ts",
    codeLines: [
      "// 01 · The Impossible Workshop — Editorial Typesetting",
      "import { BudAI, DocumentPress } from '@budai/studio';",
      "",
      "export async function shapeDocument(raw: Fragment[]) {",
      "  const tone = await BudAI.memory.recallSelected('nordic');",
      "  const folio = await DocumentPress.align(raw, {",
      "    locales: ['sv-SE', 'en-US'],",
      "    structure: 'executive-brief',",
      "  });",
      "  return folio.renderStructuredDocument(tone);",
      "}",
    ],
    componentTitle: "STRUCTURED FOLIO",
    componentKind: "proposal",
    componentMetrics: ["SV + EN", "ALIGNED", "READY"],
    zDepth: 0.42,
    xOffset: -1.12,
    yOffset: 0.16,
  },
  {
    id: "workflows",
    index: "02",
    label: "AUTOMATION",
    title: "Components into coherent workflows",
    subtitle: "Multi-stage execution pipelines.",
    accent: "#8be4f5",
    file: "02-automate.ts",
    codeLines: [
      "// 02 · The Impossible Workshop — Precision Mechanism",
      "import { Playbook, StageGate } from '@budai/flow';",
      "",
      "export const routineMechanism = Playbook.interlock({",
      "  id: 'recurring-work-v4',",
      "  gates: [",
      "    StageGate.intake('raw-notes'),",
      "    StageGate.structure(['steps', 'owners']),",
      "    StageGate.verify('action-ready'),",
      "  ],",
      "});",
    ],
    componentTitle: "WORKFLOW MECHANISM",
    componentKind: "workflow",
    componentMetrics: ["4 GATES", "COHERENT", "STEP-BY-STEP"],
    zDepth: -0.45,
    xOffset: 1.12,
    yOffset: 0.14,
  },
  {
    id: "research",
    index: "03",
    label: "DECISION-MAKING",
    title: "Branching paths into clear decisions",
    subtitle: "Structured comparisons & next steps.",
    accent: "#99a8f0",
    file: "03-decide.ts",
    codeLines: [
      "// 03 · The Impossible Workshop — Converging Vector Prism",
      "import { DecisionPrism, Scenario } from '@budai/decide';",
      "",
      "export async function convergeOptions(branches: Scenario[]) {",
      "  const matrix = await DecisionPrism.weigh(branches, {",
      "    criteria: ['impact', 'risk', 'reversibility'],",
      "  });",
      "  return matrix.resolveRecommendedVector();",
      "}",
    ],
    componentTitle: "DECISION VECTOR",
    componentKind: "analytics",
    componentMetrics: ["6 → 1 PATH", "WEIGHED", "CLEAR ACTION"],
    zDepth: -1.3,
    xOffset: -1.08,
    yOffset: 0.08,
  },
  {
    id: "bilingual",
    index: "04",
    label: "SWEDISH & ENGLISH",
    title: "Two streams aligned in one structure",
    subtitle: "Native Swedish & English parity.",
    accent: "#7de2d1",
    file: "04-bilingual.ts",
    codeLines: [
      "// 04 · The Impossible Workshop — Dual-Stream Harmonic Bridge",
      "import { LocaleBridge, DualStream } from '@budai/i18n';",
      "",
      "export function alignStreams(source: Signal) {",
      "  return LocaleBridge.resonate(source, {",
      "    streams: ['sv-SE', 'en-US'],",
      "    preserveNuance: true,",
      "    sharedStructure: true,",
      "  });",
      "}",
    ],
    componentTitle: "SV ↔ EN HARMONIC",
    componentKind: "bilingual",
    componentMetrics: ["SV-SE", "EN-US", "0 DRIFT"],
    zDepth: -2.15,
    xOffset: 1.08,
    yOffset: 0.04,
  },
  {
    id: "memory",
    index: "05",
    label: "USER-CONTROLLED MEMORY",
    title: "Layered context you choose to keep",
    subtitle: "Explicitly retained strata — never automatic.",
    accent: "#a8b4f8",
    file: "05-memory.ts",
    codeLines: [
      "// 05 · The Impossible Workshop — User-Selected Strata",
      "import { ContextStrata, UserChoice } from '@budai/memory';",
      "",
      "export const retainedLayers = ContextStrata.curate({",
      "  mode: 'explicit_user_controlled',",
      "  retained: UserChoice.pinned(['tone', 'role', 'glossary']),",
      "  editable: true,",
      "  autoSurveillance: false,",
      "});",
    ],
    componentTitle: "CURATED STRATA",
    componentKind: "memory",
    componentMetrics: ["USER CHOSEN", "EDITABLE", "ISOLATED"],
    zDepth: -3.0,
    xOffset: -1.04,
    yOffset: 0.0,
  },
  {
    id: "multimodal",
    index: "06",
    label: "VISION & VOICE",
    title: "Sculptural aperture & acoustic wave",
    subtitle: "Visual forms & spoken directives.",
    accent: "#6ee7b7",
    file: "06-multimodal.ts",
    codeLines: [
      "// 06 · The Impossible Workshop — Optical & Acoustic Aperture",
      "import { IrisAperture, AcousticWave } from '@budai/io';",
      "",
      "export async function perceiveSignal(input: Multimodal) {",
      "  const visual = await IrisAperture.inspect(input.image);",
      "  const spoken = await AcousticWave.listen(['sv-SE', 'en-US']);",
      "  return visual.convergeWith(spoken);",
      "}",
    ],
    componentTitle: "IRIS & WAVEGUIDE",
    componentKind: "multimodal",
    componentMetrics: ["VISION IO", "VOICE SV/EN", "CONVERGED"],
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
    assemblyProgress?: number,
    pointerX?: number,
    pointerY?: number,
    pathwayMode?: "personal" | "business"
  ): void;
}

const DATUM_VERTEX_SHADER = /* glsl */ `
  uniform float uDiscovery;
  uniform float uMorph;
  uniform float uTime;
  uniform float uPixelRatio;

  attribute vec3 aWorkshopPos;
  attribute vec3 aAtlasPos;
  attribute float aPhase;
  attribute float aTone;

  varying float vAlpha;
  varying float vTone;

  void main() {
    // 3-state GPU spatial interpolation:
    // position (raw unshaped fragments) -> aWorkshopPos (World I crucible) -> aAtlasPos (World II topographic atlas)
    vec3 worldOne = mix(position, aWorkshopPos, uDiscovery);
    vec3 morphed = mix(worldOne, aAtlasPos, uMorph);

    float drift = sin(uTime * 1.15 + aPhase) * mix(0.045, 0.018, uMorph);
    morphed.y += drift;
    morphed.x += cos(uTime * 0.85 + aPhase * 1.3) * 0.02 * (1.0 - uMorph * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);
    float dist = max(1.5, -mvPosition.z);
    gl_PointSize = clamp((2.6 + 1.1 * sin(uTime * 1.6 + aPhase)) * uPixelRatio * (8.5 / dist), 1.2, 7.5);
    vAlpha = (0.38 + 0.34 * sin(uTime * 1.3 + aPhase)) * mix(0.88, 1.0, uMorph);
    vTone = aTone;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const DATUM_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorCyan;
  uniform vec3 uColorLavender;
  uniform vec3 uColorEmerald;
  uniform float uPathwayBoost;

  varying float vAlpha;
  varying float vTone;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.08, d);
    vec3 col = vTone < 0.34
      ? uColorCyan
      : vTone < 0.67
      ? mix(uColorLavender, uColorEmerald, uPathwayBoost * 0.45)
      : uColorEmerald;
    gl_FragColor = vec4(col, soft * vAlpha);
  }
`;

/**
 * TWO CONNECTED 3D WORLDS FOR CAPABILITIES (`03 / Capabilities`):
 *
 * WORLD ONE — THE IMPOSSIBLE WORKSHOP (`accessMorph` 0.0 -> 0.5):
 *   "Ideas are not finished products. They are materials waiting to be shaped."
 *   An architectural precision instrument atelier where raw geometric fragments
 *   are shaped by 6 sculptural capability mechanisms around a calibrated vernier
 *   crucible.
 *
 * WORLD TWO — THE ATLAS OF POSSIBILITY (`accessMorph` 0.5 -> 1.0):
 *   "One capability is a tool. Connected capabilities create possibilities."
 *   The workshop's enclosing architectural frames unlatch and hinge into horizontal
 *   topographic drafting decks, its 6 precision plates glide outward into a terraced
 *   spatial atlas, and its internal lines extend into illuminated 3D routes leading
 *   to recognizable outcome monuments (Document, Decision, Plan, Workflow).
 */
export function createCapabilityEngine(
  parent: THREE.Group,
  screenWidth = 1080
): CapabilityEngine {
  const root = new THREE.Group();
  root.position.set(0, 0, 0);
  parent.add(root);

  // ── Shared Precision Materials (BudAI Nordic Ice, Obsidian, Lavender, Emerald) ──
  const alloyMat = new THREE.MeshStandardMaterial({
    color: "#223347",
    metalness: 0.86,
    roughness: 0.24,
  });
  const slateMat = new THREE.MeshStandardMaterial({
    color: "#0d1724",
    metalness: 0.72,
    roughness: 0.3,
  });
  const translucentGlassMat = new THREE.MeshStandardMaterial({
    color: "#11283d",
    emissive: "#0a2034",
    emissiveIntensity: 0.4,
    metalness: 0.3,
    roughness: 0.14,
    transparent: true,
    opacity: 0.68,
  });
  const cyanEmissiveMat = new THREE.MeshBasicMaterial({
    color: "#7adbf0",
    transparent: true,
    opacity: 0.88,
  });
  const lavenderEmissiveMat = new THREE.MeshBasicMaterial({
    color: "#a8b4f8",
    transparent: true,
    opacity: 0.86,
  });
  const emeraldEmissiveMat = new THREE.MeshBasicMaterial({
    color: "#6ee7b7",
    transparent: true,
    opacity: 0.88,
  });
  const cyanLineMat = new THREE.LineBasicMaterial({
    color: "#7adbf0",
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lavenderLineMat = new THREE.LineBasicMaterial({
    color: "#a8b4f8",
    transparent: true,
    opacity: 0.44,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const emeraldLineMat = new THREE.LineBasicMaterial({
    color: "#6ee7b7",
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const subtleGridLineMat = new THREE.LineBasicMaterial({
    color: "#5c97b4",
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // ── 1. SHARED ARCHITECTURAL FRAMES: Workshop Portals -> Atlas Topographic Decks ──
  // In World One, these 4 chamfered architectural frames stand vertically as a mysterious
  // precision aperture corridor. In World Two, they hinge 90° flat into terraced horizontal
  // drafting tables of The Atlas of Possibility!
  const portalFrames: THREE.Group[] = [];
  const frameConfigs = [
    { w: 6.1, h: 4.1, z: 0.9, atlasY: 0.35, atlasZ: 0.85, atlasScaleX: 1.48 },
    { w: 5.3, h: 3.6, z: -0.25, atlasY: 0.72, atlasZ: -0.05, atlasScaleX: 1.4 },
    { w: 4.5, h: 3.1, z: -1.4, atlasY: 1.08, atlasZ: -0.95, atlasScaleX: 1.32 },
    { w: 3.7, h: 2.6, z: -2.55, atlasY: 1.44, atlasZ: -1.85, atlasScaleX: 1.24 },
  ];

  frameConfigs.forEach((cfg, idx) => {
    const fGroup = new THREE.Group();
    fGroup.position.set(0, 0.95, cfg.z);
    root.add(fGroup);

    const barThick = 0.065;
    const barDepth = 0.09;
    const topBeam = new THREE.Mesh(
      new RoundedBoxGeometry(cfg.w, barThick, barDepth, 2, 0.02),
      idx % 2 === 0 ? alloyMat : slateMat
    );
    topBeam.position.y = cfg.h / 2;
    const botBeam = new THREE.Mesh(
      new RoundedBoxGeometry(cfg.w, barThick, barDepth, 2, 0.02),
      idx % 2 === 0 ? alloyMat : slateMat
    );
    botBeam.position.y = -cfg.h / 2;
    const leftPillar = new THREE.Mesh(
      new RoundedBoxGeometry(barThick, cfg.h, barDepth, 2, 0.02),
      alloyMat
    );
    leftPillar.position.x = -cfg.w / 2;
    const rightPillar = new THREE.Mesh(
      new RoundedBoxGeometry(barThick, cfg.h, barDepth, 2, 0.02),
      alloyMat
    );
    rightPillar.position.x = cfg.w / 2;
    fGroup.add(topBeam, botBeam, leftPillar, rightPillar);

    // Precision technical hairline perimeter + corner vernier crosshairs
    const rectPts = [
      new THREE.Vector3(-cfg.w / 2 + 0.08, -cfg.h / 2 + 0.08, 0.05),
      new THREE.Vector3(cfg.w / 2 - 0.08, -cfg.h / 2 + 0.08, 0.05),
      new THREE.Vector3(cfg.w / 2 - 0.08, cfg.h / 2 - 0.08, 0.05),
      new THREE.Vector3(-cfg.w / 2 + 0.08, cfg.h / 2 - 0.08, 0.05),
    ];
    fGroup.add(
      new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(rectPts),
        idx % 2 === 0 ? cyanLineMat : lavenderLineMat
      )
    );

    // Internal coordinate drafting rulings (subtle in Workshop, topographic grid in Atlas)
    const gridPts: THREE.Vector3[] = [];
    for (let gx = -2; gx <= 2; gx++) {
      const x = (gx / 3) * (cfg.w * 0.46);
      gridPts.push(new THREE.Vector3(x, -cfg.h * 0.46, 0), new THREE.Vector3(x, cfg.h * 0.46, 0));
    }
    for (let gy = -1; gy <= 1; gy++) {
      const y = (gy / 2) * (cfg.h * 0.42);
      gridPts.push(new THREE.Vector3(-cfg.w * 0.46, y, 0), new THREE.Vector3(cfg.w * 0.46, y, 0));
    }
    fGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gridPts), subtleGridLineMat));

    portalFrames.push(fGroup);
  });

  // ── 2. CENTRAL VERNIER CRUCIBLE -> ATLAS COMPASS ROSE & MERIDIAN ARC ──
  // In World One, this precision multi-ring vernier gimbal surrounds the active capability
  // sculpture. In World Two, the outer ring rises into a sweeping Cantilevered Meridian Arc
  // while the inner rings flatten into the Topographic Compass Rose of the Atlas!
  const crucibleGroup = new THREE.Group();
  crucibleGroup.position.set(0, 0.92, 0.25);
  root.add(crucibleGroup);

  const vernierRings: THREE.Group[] = [];
  [1.42, 1.82, 2.28].forEach((radius, rIdx) => {
    const rGroup = new THREE.Group();
    crucibleGroup.add(rGroup);

    const torusMat = rIdx === 0 ? cyanEmissiveMat : rIdx === 1 ? lavenderEmissiveMat : emeraldEmissiveMat;
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(radius, rIdx === 2 ? 0.016 : 0.011, 10, 96),
      torusMat
    );
    rGroup.add(torus);

    // 72 precision vernier degree ticks around each ring
    const tickPts: THREE.Vector3[] = [];
    const tickCount = 72;
    for (let t = 0; t < tickCount; t++) {
      const a = (t / tickCount) * Math.PI * 2;
      const inner = radius - (t % 6 === 0 ? 0.11 : 0.045);
      const outer = radius + (t % 6 === 0 ? 0.06 : 0.02);
      tickPts.push(
        new THREE.Vector3(Math.cos(a) * inner, Math.sin(a) * inner, 0),
        new THREE.Vector3(Math.cos(a) * outer, Math.sin(a) * outer, 0)
      );
    }
    rGroup.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(tickPts),
        rIdx === 1 ? lavenderLineMat : cyanLineMat
      )
    );
    vernierRings.push(rGroup);
  });

  // Architectural plumb-line & caliper crosshairs through the crucible center
  const axisPts = [
    new THREE.Vector3(-3.2, 0, 0),
    new THREE.Vector3(3.2, 0, 0),
    new THREE.Vector3(0, -2.1, 0),
    new THREE.Vector3(0, 2.1, 0),
    new THREE.Vector3(0, 0, -2.6),
    new THREE.Vector3(0, 0, 2.0),
  ];
  const crucibleAxes = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(axisPts),
    subtleGridLineMat
  );
  crucibleGroup.add(crucibleAxes);

  // ── 3. SIX SCULPTURAL CAPABILITY INSTRUMENTS (Workshop -> Atlas Regions) ──
  // Each capability is built on a precision-milled architectural base plate with its own
  // unmistakable 3D mechanism. In World One, the active capability moves into the center
  // of the Workshop Crucible while the other 5 orbit in calibrated formation.
  // In World Two, the 6 plates unfold outward to form the 6 regions & outcome monuments
  // across the 3 terraced horizons of The Atlas of Possibility!

  interface InstrumentPod {
    group: THREE.Group;
    plateMat: THREE.MeshStandardMaterial;
    rimMat: THREE.MeshBasicMaterial;
    sculpture: THREE.Group;
    // Specific sub-elements for procedural animation
    writeFolios?: THREE.Mesh[];
    automateGates?: THREE.Group[];
    automatePulse?: THREE.Mesh;
    decideBranches?: THREE.Line[];
    decidePrism?: THREE.Mesh;
    decideBeam?: THREE.Mesh;
    bilingualHelixA?: THREE.Mesh;
    bilingualHelixB?: THREE.Mesh;
    bilingualRungs?: THREE.LineSegments;
    memoryStrata?: Array<{ mesh: THREE.Mesh; durable: boolean }>;
    visionBlades?: THREE.Mesh[];
    voiceWaveRing?: THREE.LineLoop;
    voiceWaveGeo?: THREE.BufferGeometry;
    atlasMonument: THREE.Group;
  }

  const pods: InstrumentPod[] = [];

  // Target positions in World Two (The Atlas of Possibility):
  // Arranged across 3 stepped elevation terraces:
  // West Terrace (01 Basic - Available Now): Write (-3.25) & Vision/Voice (-1.85)
  // Central Terrace (02 Consumer - Coming Soon): Bilingual (-0.58) & Memory (+0.68)
  // East Terrace (03 Business - Coming Soon): Automate (+1.95) & Decide (+3.28)
  const atlasPlacements = [
    { x: -3.25, y: 0.82, z: 0.55 },  // 01 Write -> Document Monument (Basic)
    { x: 1.95, y: 1.28, z: -0.25 },  // 02 Automate -> Workflow Conduit (Business)
    { x: 3.28, y: 1.38, z: 0.45 },   // 03 Decide -> Decision Spire (Business)
    { x: -0.58, y: 1.04, z: 0.38 },  // 04 Swedish + English -> Bilingual Bridge (Consumer)
    { x: 0.68, y: 1.1, z: -0.32 },   // 05 Memory -> Curated Context Vault (Consumer)
    { x: -1.85, y: 0.88, z: -0.22 }, // 06 Vision & Voice -> Multimodal Intake (Basic)
  ];

  CAPABILITY_CHAMBER_MODULES.forEach((mod, idx) => {
    const group = new THREE.Group();
    root.add(group);

    // Shared Precision Architectural Base Plate (reused in both Workshop and Atlas!)
    const plateMat = new THREE.MeshStandardMaterial({
      color: "#142436",
      emissive: mod.accent,
      emissiveIntensity: 0.28,
      metalness: 0.82,
      roughness: 0.22,
    });
    const basePlate = new THREE.Mesh(
      new RoundedBoxGeometry(1.22, 0.07, 0.92, 2, 0.025),
      plateMat
    );
    group.add(basePlate);

    const rimMat = new THREE.MeshBasicMaterial({
      color: mod.accent,
      transparent: true,
      opacity: 0.75,
    });
    const rimFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.015, 0.95),
      rimMat
    );
    rimFrame.position.y = 0.038;
    group.add(rimFrame);

    const sculpture = new THREE.Group();
    sculpture.position.y = 0.42;
    group.add(sculpture);

    // Rising Architectural Outcome Monument for World Two (The Atlas of Possibility)
    const atlasMonument = new THREE.Group();
    atlasMonument.position.y = 0.08;
    group.add(atlasMonument);

    const pod: InstrumentPod = {
      group,
      plateMat,
      rimMat,
      sculpture,
      atlasMonument,
    };

    if (idx === 0) {
      // ── 01 WRITE: Fragments aligning into a layered architectural document folio ──
      const folios: THREE.Mesh[] = [];
      for (let f = 0; f < 5; f++) {
        const sheet = new THREE.Mesh(
          new RoundedBoxGeometry(0.76, 0.022, 0.56, 1, 0.008),
          translucentGlassMat
        );
        // Etched cyan paragraph lines on each translucent sheet
        const linePts = [
          new THREE.Vector3(-0.28, 0.015, -0.16),
          new THREE.Vector3(0.26, 0.015, -0.16),
          new THREE.Vector3(-0.28, 0.015, -0.05),
          new THREE.Vector3(0.22, 0.015, -0.05),
          new THREE.Vector3(-0.28, 0.015, 0.06),
          new THREE.Vector3(0.28, 0.015, 0.06),
          new THREE.Vector3(-0.28, 0.015, 0.17),
          new THREE.Vector3(0.12, 0.015, 0.17),
        ];
        sheet.add(
          new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(linePts),
            cyanLineMat
          )
        );
        sculpture.add(sheet);
        folios.push(sheet);
      }
      // Vertical precision alignment rails
      [-0.42, 0.42].forEach(rx => {
        const rail = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.78, 8),
          alloyMat
        );
        rail.position.set(rx, 0, 0);
        sculpture.add(rail);
      });
      pod.writeFolios = folios;

      // Atlas Outcome: Cantilevered Document Spire
      const docSpire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.62, 1.05, 0.44)),
        cyanLineMat
      );
      docSpire.position.y = 0.55;
      atlasMonument.add(docSpire);
    } else if (idx === 1) {
      // ── 02 AUTOMATE: Separate components interlocking into a 4-gate escapement mechanism ──
      const gates: THREE.Group[] = [];
      for (let g = 0; g < 4; g++) {
        const gateGrp = new THREE.Group();
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.26, 0.018, 8, 6),
          g % 2 === 0 ? alloyMat : translucentGlassMat
        );
        ring.rotation.y = Math.PI / 2;
        gateGrp.add(ring);

        const edge = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(
            [0, 1, 2, 3, 4, 5].map(k => {
              const a = (k / 6) * Math.PI * 2;
              return new THREE.Vector3(0, Math.cos(a) * 0.28, Math.sin(a) * 0.28);
            })
          ),
          cyanLineMat
        );
        gateGrp.add(edge);
        sculpture.add(gateGrp);
        gates.push(gateGrp);
      }
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 1.05, 8),
        cyanEmissiveMat
      );
      shaft.rotation.z = Math.PI / 2;
      sculpture.add(shaft);

      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 12, 12),
        emeraldEmissiveMat
      );
      sculpture.add(pulse);
      pod.automateGates = gates;
      pod.automatePulse = pulse;

      // Atlas Outcome: Synchronized Workflow Arches
      for (let a = 0; a < 3; a++) {
        const arch = new THREE.Mesh(
          new THREE.TorusGeometry(0.32 + a * 0.06, 0.01, 8, 32, Math.PI),
          emeraldEmissiveMat
        );
        arch.position.set((a - 1) * 0.26, 0.35, 0);
        atlasMonument.add(arch);
      }
    } else if (idx === 2) {
      // ── 03 DECIDE: Branching structures converging into a crystalline decision prism ──
      const branches: THREE.Line[] = [];
      for (let b = 0; b < 6; b++) {
        const angle = (b / 6) * Math.PI * 2;
        const start = new THREE.Vector3(-0.48, Math.cos(angle) * 0.34, Math.sin(angle) * 0.34);
        const mid = new THREE.Vector3(-0.18, Math.cos(angle) * 0.16, Math.sin(angle) * 0.16);
        const end = new THREE.Vector3(0.02, 0, 0);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(20)),
          b % 2 === 0 ? lavenderLineMat : cyanLineMat
        );
        sculpture.add(line);
        branches.push(line);
      }
      const prismGeo = new THREE.OctahedronGeometry(0.22, 0);
      const prism = new THREE.Mesh(prismGeo, translucentGlassMat);
      prism.add(new THREE.LineSegments(new THREE.EdgesGeometry(prismGeo), lavenderLineMat));
      sculpture.add(prism);

      // Single resolved output vector
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.006, 0.56, 8),
        emeraldEmissiveMat
      );
      beam.rotation.z = -Math.PI / 2;
      beam.position.x = 0.3;
      sculpture.add(beam);

      pod.decideBranches = branches;
      pod.decidePrism = prism;
      pod.decideBeam = beam;

      // Atlas Outcome: Elevated Decision Spire & Topographic Beacon
      const spire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.ConeGeometry(0.34, 0.95, 4)),
        lavenderLineMat
      );
      spire.position.y = 0.56;
      atlasMonument.add(spire);
    } else if (idx === 3) {
      // ── 04 SWEDISH & ENGLISH: Two independent streams aligning into a shared structure ──
      const svPts: THREE.Vector3[] = [];
      const enPts: THREE.Vector3[] = [];
      const rungPts: THREE.Vector3[] = [];
      for (let s = 0; s <= 28; s++) {
        const u = s / 28;
        const x = (u - 0.5) * 0.98;
        // Left side: wide independent oscillation; Right side: aligned parallel structure
        const spread = lerp(0.26, 0.08, smooth(u));
        const theta = u * Math.PI * 3.5;
        const pSv = new THREE.Vector3(x, Math.sin(theta) * spread, Math.cos(theta) * spread);
        const pEn = new THREE.Vector3(x, -Math.sin(theta) * spread, -Math.cos(theta) * spread);
        svPts.push(pSv);
        enPts.push(pEn);
        if (s % 4 === 0 && s > 4) {
          rungPts.push(pSv.clone(), pEn.clone());
        }
      }
      const helixA = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(svPts), 40, 0.018, 8, false),
        cyanEmissiveMat
      );
      const helixB = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(enPts), 40, 0.018, 8, false),
        lavenderEmissiveMat
      );
      const rungs = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(rungPts),
        emeraldLineMat
      );
      sculpture.add(helixA, helixB, rungs);
      pod.bilingualHelixA = helixA;
      pod.bilingualHelixB = helixB;
      pod.bilingualRungs = rungs;

      // Atlas Outcome: Twin Parallel Suspension Span
      const span = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.88, 0.42, 0.32)),
        cyanLineMat
      );
      span.position.y = 0.34;
      atlasMonument.add(span);
    } else if (idx === 4) {
      // ── 05 MEMORY: Transparent layered strata where user-selected context is locked in ──
      const strata: Array<{ mesh: THREE.Mesh; durable: boolean }> = [];
      for (let m = 0; m < 5; m++) {
        const durable = m === 0 || m === 2 || m === 4;
        const cassette = new THREE.Mesh(
          new RoundedBoxGeometry(0.68, 0.045, 0.48, 2, 0.012),
          durable ? translucentGlassMat : slateMat
        );
        cassette.add(
          new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.69, 0.048, 0.49)),
            durable ? emeraldLineMat : subtleGridLineMat
          )
        );
        sculpture.add(cassette);
        strata.push({ mesh: cassette, durable });
      }
      pod.memoryStrata = strata;

      // Atlas Outcome: Stepped Crystalline Context Vault
      const vault = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.26, 0.38, 0.82, 6)),
        lavenderLineMat
      );
      vault.position.y = 0.48;
      atlasMonument.add(vault);
    } else {
      // ── 06 VISION & VOICE: Sculptural 8-blade optical aperture + acoustic wave geometry ──
      const blades: THREE.Mesh[] = [];
      for (let b = 0; b < 8; b++) {
        const blade = new THREE.Mesh(
          new RoundedBoxGeometry(0.24, 0.07, 0.022, 1, 0.006),
          alloyMat
        );
        blade.add(
          new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.245, 0.072, 0.025)),
            cyanLineMat
          )
        );
        sculpture.add(blade);
        blades.push(blade);
      }
      const waveCount = 48;
      const wavePositions = new Float32Array(waveCount * 3);
      for (let w = 0; w < waveCount; w++) {
        const a = (w / waveCount) * Math.PI * 2;
        wavePositions[w * 3] = Math.cos(a) * 0.22;
        wavePositions[w * 3 + 1] = Math.sin(a) * 0.22;
        wavePositions[w * 3 + 2] = 0.08;
      }
      const waveGeo = new THREE.BufferGeometry();
      waveGeo.setAttribute("position", new THREE.BufferAttribute(wavePositions, 3));
      const waveRing = new THREE.LineLoop(waveGeo, emeraldLineMat);
      sculpture.add(waveRing);

      pod.visionBlades = blades;
      pod.voiceWaveRing = waveRing;
      pod.voiceWaveGeo = waveGeo;

      // Atlas Outcome: Optical & Acoustic Signal Beacon
      const beacon = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.32, 1)),
        emeraldLineMat
      );
      beacon.position.y = 0.52;
      atlasMonument.add(beacon);
    }

    pods.push(pod);
  });

  // ── 4. WORLD TWO EXCLUSIVE INFRASTRUCTURE: Terraced Topographic Plates & Interconnected Routes ──
  // These emerge directly from the unfolded Workshop structure as `accessMorph` goes 0 -> 1.
  const atlasGroup = new THREE.Group();
  root.add(atlasGroup);

  // 3 Stepped Topographic Horizon Terraces (01 Basic West, 02 Consumer Center, 03 Business East)
  const terraceConfigs = [
    { x: -2.55, y: 0.72, z: 0.16, w: 2.5, d: 2.15, mat: cyanLineMat },
    { x: 0.05, y: 0.98, z: 0.02, w: 2.5, d: 2.15, mat: lavenderLineMat },
    { x: 2.65, y: 1.24, z: 0.08, w: 2.5, d: 2.15, mat: emeraldLineMat },
  ];
  const atlasTerraces: THREE.Group[] = [];

  terraceConfigs.forEach(tc => {
    const tGrp = new THREE.Group();
    tGrp.position.set(tc.x, tc.y, tc.z);
    atlasGroup.add(tGrp);

    // Translucent architectural map plane
    const deck = new THREE.Mesh(
      new RoundedBoxGeometry(tc.w, 0.035, tc.d, 2, 0.012),
      translucentGlassMat
    );
    tGrp.add(deck);

    // Topographic elevation contour rings etched into each terrace
    [0.45, 0.78, 1.08].forEach(r => {
      const contourPts: THREE.Vector3[] = [];
      for (let s = 0; s < 40; s++) {
        const a = (s / 40) * Math.PI * 2;
        contourPts.push(new THREE.Vector3(Math.cos(a) * r, 0.024, Math.sin(a) * (r * 0.78)));
      }
      tGrp.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(contourPts), tc.mat));
    });

    // Vertical architectural stadia / elevation columns beneath the terrace
    [-tc.w * 0.44, tc.w * 0.44].forEach(cx => {
      [-tc.d * 0.42, tc.d * 0.42].forEach(cz => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.9, 6), alloyMat);
        col.position.set(cx, -0.46, cz);
        tGrp.add(col);
      });
    });

    atlasTerraces.push(tGrp);
  });

  // 6 Interconnected 3D Spatial Routes linking the 6 capability foundations into outcomes
  const routeCurves: THREE.CatmullRomCurve3[] = [];
  const routeLines: THREE.Line[] = [];
  const routePairs: Array<[number, number, THREE.LineBasicMaterial]> = [
    [0, 5, cyanLineMat],     // Write <-> Vision/Voice (Basic Preview Intake & Document Route)
    [5, 3, cyanLineMat],     // Vision/Voice -> Swedish + English Bridge
    [0, 3, lavenderLineMat], // Write -> Swedish + English Bridge
    [3, 4, lavenderLineMat], // Swedish + English <-> User-Controlled Memory (Consumer Route)
    [4, 1, emeraldLineMat],  // Memory -> Workflow Automation (Business Route)
    [1, 2, emeraldLineMat],  // Workflow Automation -> Decision Spire (Outcome Realization)
    [3, 2, lavenderLineMat], // Bilingual Bridge -> Decision Spire
  ];

  routePairs.forEach(([fromIdx, toIdx, mat]) => {
    const a = atlasPlacements[fromIdx];
    const b = atlasPlacements[toIdx];
    const mid = new THREE.Vector3(
      (a.x + b.x) * 0.5,
      Math.max(a.y, b.y) + 0.42,
      (a.z + b.z) * 0.5 - 0.15
    );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(a.x, a.y + 0.08, a.z),
      mid,
      new THREE.Vector3(b.x, b.y + 0.08, b.z),
    ]);
    routeCurves.push(curve);
    const rLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),
      mat
    );
    atlasGroup.add(rLine);
    routeLines.push(rLine);
  });

  // Luminous signal pulses travelling along the Atlas routes
  const routePulses: THREE.Mesh[] = [];
  const pulseGeo = new THREE.SphereGeometry(0.048, 10, 10);
  for (let p = 0; p < routeCurves.length; p++) {
    const pMesh = new THREE.Mesh(
      pulseGeo,
      p < 2 ? cyanEmissiveMat : p < 4 ? lavenderEmissiveMat : emeraldEmissiveMat
    );
    atlasGroup.add(pMesh);
    routePulses.push(pMesh);
  }

  // ── 5. GPU-DRIVEN 3-STATE MORPHING PRECISION DATUM FIELD (960 points) ──
  const datumCount = 960;
  const rawPos = new Float32Array(datumCount * 3);
  const workshopPos = new Float32Array(datumCount * 3);
  const atlasPos = new Float32Array(datumCount * 3);
  const phases = new Float32Array(datumCount);
  const tones = new Float32Array(datumCount);

  for (let i = 0; i < datumCount; i++) {
    const u = i / datumCount;
    const angle = i * 2.3999632; // Golden angle distribution
    const rRaw = 2.6 + (i % 17) * 0.22;

    // State 0: Unshaped raw material suspended in outer workshop void
    rawPos[i * 3] = Math.cos(angle) * rRaw * 1.35;
    rawPos[i * 3 + 1] = 0.9 + Math.sin(angle * 0.7) * 2.1;
    rawPos[i * 3 + 2] = -0.5 + Math.sin(angle) * rRaw * 0.85;

    // State 1: Calibrated cylindrical & helical strata inside The Impossible Workshop
    const ringIdx = i % 6;
    const wRadius = 1.35 + ringIdx * 0.34;
    const wTheta = u * Math.PI * 12 + ringIdx * 1.047;
    workshopPos[i * 3] = Math.cos(wTheta) * wRadius;
    workshopPos[i * 3 + 1] = 0.92 + Math.sin(wTheta) * (wRadius * 0.68);
    workshopPos[i * 3 + 2] = 0.15 - ringIdx * 0.45 + Math.cos(wTheta * 2) * 0.18;

    // State 2: Topographic contour & route grid across The Atlas of Possibility
    const terraceIdx = i % 3;
    const tc = terraceConfigs[terraceIdx];
    const contourR = 0.35 + ((i * 7) % 19) * 0.085;
    const contourA = u * Math.PI * 18;
    atlasPos[i * 3] = tc.x + Math.cos(contourA) * contourR * 1.25;
    atlasPos[i * 3 + 1] = tc.y + 0.06 + ((i % 5) * 0.14);
    atlasPos[i * 3 + 2] = tc.z + Math.sin(contourA) * contourR * 0.95;

    phases[i] = (i * 0.37) % (Math.PI * 2);
    tones[i] = (i % 3) * 0.4;
  }

  const datumGeo = new THREE.BufferGeometry();
  datumGeo.setAttribute("position", new THREE.BufferAttribute(rawPos, 3));
  datumGeo.setAttribute("aWorkshopPos", new THREE.BufferAttribute(workshopPos, 3));
  datumGeo.setAttribute("aAtlasPos", new THREE.BufferAttribute(atlasPos, 3));
  datumGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  datumGeo.setAttribute("aTone", new THREE.BufferAttribute(tones, 1));

  const datumMat = new THREE.ShaderMaterial({
    uniforms: {
      uDiscovery: { value: 1 },
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uPathwayBoost: { value: 0 },
      uColorCyan: { value: new THREE.Color("#7adbf0") },
      uColorLavender: { value: new THREE.Color("#a8b4f8") },
      uColorEmerald: { value: new THREE.Color("#6ee7b7") },
    },
    vertexShader: DATUM_VERTEX_SHADER,
    fragmentShader: DATUM_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const datumPoints = new THREE.Points(datumGeo, datumMat);
  root.add(datumPoints);

  // ── 6. CONTROLLED ARCHITECTURAL LIGHTING ──
  const workshopKeyLight = new THREE.PointLight("#7adbf0", 34, 19, 2);
  workshopKeyLight.position.set(-3.2, 2.8, 2.4);
  root.add(workshopKeyLight);

  const atlasHorizonLight = new THREE.PointLight("#a8b4f8", 28, 19, 2);
  atlasHorizonLight.position.set(3.4, 3.1, 1.8);
  root.add(atlasHorizonLight);

  const crucibleCoreLight = new THREE.PointLight("#6ee7b7", 20, 12, 2);
  crucibleCoreLight.position.set(0, 0.9, 1.6);
  root.add(crucibleCoreLight);

  return {
    root,
    // Position the translucent CSS3D studio plate cleanly in the upper-back plane
    // so the 3D Impossible Workshop and Atlas of Possibility remain unobstructed center-stage
    screenPosition: new THREE.Vector3(0, 1.88, -2.35),
    screenScale: 4.35 / screenWidth,
    update(
      progress: number,
      activeModule: number,
      accessMorph: number,
      time: number,
      assemblyProgress = 0,
      pointerX = 0,
      pointerY = 0,
      pathwayMode: "personal" | "business" = "personal"
    ) {
      const p = clamp(progress, 0, 1);
      const morph = clamp(accessMorph, 0, 1);
      const asm = clamp(assemblyProgress, 0, 1);
      const modIdx = clamp(activeModule, 0, 5);
      const isTeam = pathwayMode === "business" ? 1 : 0;

      // ── World One 5-Stage Scroll Choreography Weights ──
      // 1. Discovery (0.00 - 0.12): Raw materials & unlatching portal frames
      // 2. Activation (0.12 - 0.25): Crucible rings calibrate & awaken
      // 3. Transformation (0.25 - 0.76): Individual capability sculptures assemble
      // 4. Composition (0.76 - 0.90): All 6 instruments converge into one hexagonal system
      // 5. Preparation (0.90 - 1.00 + morph): Structure hinges open to become World Two (Atlas)
      const discovery = smooth(clamp(p / 0.16, 0.22, 1));
      const composition = smooth(clamp((p - 0.74) / 0.16, 0, 1)) * (1 - morph);
      const prepUnfold = smooth(clamp((p - 0.88) / 0.12, 0, 1) * 0.22 + morph * 0.88);

      // Update GPU Morphing Datum Field uniforms
      datumMat.uniforms.uDiscovery.value = discovery;
      datumMat.uniforms.uMorph.value = morph;
      datumMat.uniforms.uTime.value = time;
      datumMat.uniforms.uPathwayBoost.value = isTeam;

      // ── 1. Transform Architectural Portal Frames -> Atlas Topographic Horizon Decks ──
      portalFrames.forEach((fGroup, idx) => {
        const cfg = frameConfigs[idx];
        // In Discovery, outer frames start slightly rotated and lock into square alignment;
        // In Transition (prepUnfold), they hinge 90° flat into horizontal Atlas drafting planes!
        const discoveryTwist = (1 - discovery) * (idx % 2 === 0 ? 0.18 : -0.18);
        fGroup.rotation.x = lerp(0, -Math.PI / 2, prepUnfold);
        fGroup.rotation.z = discoveryTwist * (1 - prepUnfold);
        fGroup.rotation.y = pointerX * 0.04 * (1 - prepUnfold * 0.5);

        fGroup.position.x = pointerX * (0.08 * (idx + 1)) * (1 - morph * 0.6);
        fGroup.position.y = lerp(0.95, cfg.atlasY + asm * 0.12 * idx, prepUnfold);
        fGroup.position.z = lerp(cfg.z, cfg.atlasZ, prepUnfold);
        fGroup.scale.set(
          lerp(1, cfg.atlasScaleX, prepUnfold),
          lerp(1, 1.15, prepUnfold),
          1
        );
      });

      // ── 2. Transform Central Vernier Crucible -> Atlas Compass Rose & Meridian Arc ──
      crucibleGroup.position.set(
        pointerX * 0.16,
        lerp(1.08, 0.96, morph) + pointerY * 0.06,
        lerp(0.25, 0.05, morph)
      );

      // Ring 0 & 1 flatten into the Atlas Topographic Compass Rose; Ring 2 arches overhead as the Meridian Arc
      vernierRings[0].rotation.x = lerp(Math.sin(time * 0.35) * 0.22, Math.PI / 2, morph);
      vernierRings[0].rotation.z = time * 0.24 + p * Math.PI;
      vernierRings[0].scale.setScalar(lerp(1, 1.55, morph));

      vernierRings[1].rotation.y = lerp(time * -0.28 + modIdx * 0.52, 0, morph);
      vernierRings[1].rotation.x = lerp(0.38, Math.PI / 2, morph);
      vernierRings[1].rotation.z = -time * 0.18;
      vernierRings[1].scale.setScalar(lerp(1, 1.85, morph));

      // Ring 2 becomes the signature Cantilevered Meridian Arc arching over The Atlas of Possibility
      vernierRings[2].position.y = lerp(0, 0.38, morph);
      vernierRings[2].rotation.x = lerp(-0.18, 0.32, morph);
      vernierRings[2].rotation.y = lerp(time * 0.15, (asm - 0.5) * 0.35, morph);
      vernierRings[2].scale.setScalar(lerp(1, 1.65, morph));

      // ── 3. Transform the 6 Sculptural Capability Pods (Workshop Crucible <-> Atlas Regions) ──
      pods.forEach((pod, idx) => {
        const isActive = idx === modIdx;

        // World One position: Active pod enters the Crucible center; other 5 form a calibrated orbital arc
        // During Composition (p > 0.76), all 6 converge into a tight hexagonal synthesis core!
        const orbitSlot = (idx - modIdx + 6) % 6;
        const orbitAngle = (orbitSlot / 6) * Math.PI * 2 - Math.PI / 2;
        const ringRadius = lerp(2.55, 1.32, composition);

        const workshopX = isActive
          ? lerp(0, Math.cos((idx / 6) * Math.PI * 2) * 1.15, composition)
          : Math.cos(orbitAngle) * ringRadius;
        const workshopY = isActive
          ? lerp(0.56, 0.92 + Math.sin((idx / 6) * Math.PI * 2) * 0.65, composition)
          : 0.92 + Math.sin(orbitAngle) * (ringRadius * 0.54);
        const workshopZ = isActive
          ? lerp(0.88, 0.35, composition)
          : lerp(-0.65 + Math.cos(orbitAngle) * 0.35, 0.2, composition);

        const workshopScale = isActive ? lerp(1.36, 1.05, composition) : lerp(0.76, 0.96, composition);

        // World Two position: Unfolded terraced Atlas coordinates
        const atlasTarget = atlasPlacements[idx];
        const elevationLift = smooth(clamp((asm - idx * 0.08) / 0.55, 0, 1)) * 0.22;

        const targetX = lerp(workshopX, atlasTarget.x, morph) + pointerX * 0.1;
        const targetY = lerp(workshopY, atlasTarget.y + elevationLift, morph) + pointerY * 0.05;
        const targetZ = lerp(workshopZ, atlasTarget.z, morph);
        const targetScale = lerp(workshopScale, 0.98, morph);

        pod.group.position.x = lerp(pod.group.position.x || targetX, targetX, 0.22);
        pod.group.position.y = lerp(pod.group.position.y || targetY, targetY, 0.22);
        pod.group.position.z = lerp(pod.group.position.z || targetZ, targetZ, 0.22);
        pod.group.scale.setScalar(lerp(pod.group.scale.x || targetScale, targetScale, 0.22));

        pod.plateMat.emissiveIntensity = morph >= 0.48
          ? 0.55 + elevationLift * 1.4
          : isActive
          ? 0.95
          : 0.24;

        // Atlas Outcome Monument rises out of the foundation plate as World Two unfolds
        const monumentScale = smooth(clamp((morph - 0.35) / 0.55, 0, 1)) * (0.55 + 0.45 * asm);
        pod.atlasMonument.scale.set(1, Math.max(0.001, monumentScale), 1);
        pod.atlasMonument.visible = monumentScale > 0.02;

        // ── Procedural Animation of Each Capability's Sculptural Mechanism ──
        if (pod.writeFolios) {
          // 01 Write: Scattered fragments align into a crisp vertical document stack
          const align = isActive || morph > 0.3 ? smooth(clamp(discovery * 1.2, 0.3, 1)) : 0.35;
          pod.writeFolios.forEach((sheet, fIdx) => {
            const targetSheetY = (fIdx - 2) * 0.095;
            const scatterX = (1 - align) * ((fIdx % 2 === 0 ? 1 : -1) * 0.28);
            const scatterRot = (1 - align) * ((fIdx - 2) * 0.22);
            sheet.position.set(
              scatterX,
              targetSheetY + Math.sin(time * 1.8 + fIdx * 0.6) * 0.012,
              0
            );
            sheet.rotation.set(0, scatterRot, scatterRot * 0.5);
          });
        }

        if (pod.automateGates && pod.automatePulse) {
          // 02 Automate: 4 stage gates interlock and transmit a luminous signal pulse
          pod.automateGates.forEach((gate, gIdx) => {
            gate.position.x = (gIdx - 1.5) * 0.26;
            gate.rotation.x = time * (gIdx % 2 === 0 ? 0.9 : -0.9);
          });
          const pulseU = (time * 0.65) % 1;
          pod.automatePulse.position.x = (pulseU - 0.5) * 0.92;
        }

        if (pod.decidePrism && pod.decideBeam) {
          // 03 Decide: Crystalline prism rotates and projects a clear forward vector
          pod.decidePrism.rotation.y = time * 0.95;
          pod.decidePrism.rotation.x = Math.sin(time * 0.7) * 0.25;
          pod.decideBeam.scale.y = 0.75 + 0.28 * Math.sin(time * 2.4);
        }

        if (pod.bilingualHelixA && pod.bilingualHelixB && pod.bilingualRungs) {
          // 04 Swedish + English: Dual streams rotate in phase-locked harmony
          const rot = time * 0.85;
          pod.bilingualHelixA.rotation.x = rot;
          pod.bilingualHelixB.rotation.x = rot;
          pod.bilingualRungs.rotation.x = rot;
        }

        if (pod.memoryStrata) {
          // 05 Memory: User-selected durable layers lock forward; transient layers stay recessed
          pod.memoryStrata.forEach((item, mIdx) => {
            item.mesh.position.y = (mIdx - 2) * 0.105;
            item.mesh.position.z = item.durable
              ? 0.09 + Math.sin(time * 1.6 + mIdx) * 0.015
              : -0.08;
          });
        }

        if (pod.visionBlades && pod.voiceWaveGeo) {
          // 06 Vision & Voice: Sculptural 8-blade iris dilates while acoustic wave oscillates
          const apertureRadius = 0.24 + 0.055 * Math.sin(time * 2.1);
          pod.visionBlades.forEach((blade, bIdx) => {
            const a = (bIdx / 8) * Math.PI * 2 + time * 0.28;
            blade.position.set(Math.cos(a) * apertureRadius, Math.sin(a) * apertureRadius, 0);
            blade.rotation.z = a + 0.55;
          });
          const posAttr = pod.voiceWaveGeo.getAttribute("position") as THREE.BufferAttribute;
          for (let w = 0; w < posAttr.count; w++) {
            const a = (w / posAttr.count) * Math.PI * 2;
            const r = 0.16 + 0.045 * Math.sin(a * 6 + time * 4.2);
            posAttr.setXYZ(w, Math.cos(a) * r, Math.sin(a) * r, 0.06);
          }
          posAttr.needsUpdate = true;
        }
      });

      // ── 4. World Two Atlas Terraces & Interconnected Routes Emergence ──
      const atlasVisibility = smooth(clamp((morph - 0.18) / 0.65, 0, 1));
      atlasGroup.visible = atlasVisibility > 0.01;

      atlasTerraces.forEach((tGrp, tIdx) => {
        const tc = terraceConfigs[tIdx];
        const stageReveal = smooth(clamp((atlasVisibility - tIdx * 0.12) / 0.65, 0, 1));
        tGrp.scale.set(
          Math.max(0.001, stageReveal),
          1,
          Math.max(0.001, stageReveal)
        );
        tGrp.position.y = tc.y + Math.sin(time * 1.1 + tIdx) * 0.025 + (tIdx === 2 ? isTeam * 0.12 : 0);
      });

      routeLines.forEach((rLine, rIdx) => {
        const routeReveal = smooth(clamp((morph - 0.32 + asm * 0.35 - rIdx * 0.05) / 0.45, 0, 1));
        rLine.visible = routeReveal > 0.02;
      });

      routePulses.forEach((pulse, pIdx) => {
        const curve = routeCurves[pIdx];
        const u = (time * 0.28 + pIdx * 0.17 + asm * 0.5) % 1;
        curve.getPointAt(u, pulse.position);
        pulse.visible = atlasVisibility > 0.25;
      });

      // ── 5. Controlled Lighting Progression across Workshop -> Atlas ──
      workshopKeyLight.intensity = lerp(32, 42, discovery) * (1 - morph * 0.2);
      atlasHorizonLight.intensity = lerp(24, 44, morph) + isTeam * 8;
      crucibleCoreLight.intensity = lerp(22, 34, Math.max(composition, asm));
    },
  };
}
