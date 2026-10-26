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

/**
 * Directed pacing helper: creates an intentional approach (0..0.24),
 * a calm inspection plateau (0.24..0.78) so transformations can breathe,
 * and a clean resolution handoff (0.78..1.0).
 */
function directedPacing(u: number): number {
  const c = clamp(u, 0, 1);
  if (c < 0.24) return smooth(c / 0.24) * 0.86;
  if (c < 0.78) return 0.86 + ((c - 0.24) / 0.54) * 0.14;
  return 1;
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
    // Parabolic arc during transition so points lift through an architectural meridian as they unfold
    float arcLift = sin(uMorph * 3.14159265) * 0.38;
    vec3 morphed = mix(worldOne, aAtlasPos, uMorph);
    morphed.y += arcLift * (0.4 + 0.6 * aTone);

    float drift = sin(uTime * 1.1 + aPhase) * mix(0.038, 0.015, uMorph);
    morphed.y += drift;
    morphed.x += cos(uTime * 0.8 + aPhase * 1.3) * 0.018 * (1.0 - uMorph * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);
    float dist = max(1.5, -mvPosition.z);
    gl_PointSize = clamp((2.5 + 1.15 * sin(uTime * 1.5 + aPhase)) * uPixelRatio * (8.5 / dist), 1.1, 7.2);
    vAlpha = (0.34 + 0.32 * sin(uTime * 1.25 + aPhase)) * mix(0.85, 1.0, uMorph);
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
    float soft = smoothstep(0.5, 0.06, d);
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
 *   A 3-tier architectural precision instrument atelier (Background Astrolabe Rotunda,
 *   Midground Articulated Caliper Armatures & Vernier Crucible, Foreground Optical Reticle)
 *   where raw fragments physically assemble into 6 bespoke capability mechanisms.
 *
 * WORLD TWO — THE ATLAS OF POSSIBILITY (`accessMorph` 0.5 -> 1.0):
 *   "One capability is a tool. Connected capabilities create possibilities."
 *   The Workshop's Astrolabe Rotunda hinges 90° flat into the Great Cartographic Horizon,
 *   its 6 Articulated Caliper Arms extend into structural suspension trusses across 3
 *   stepped topographic terraces (01 Basic, 02 Consumer, 03 Business), and its 6 capability
 *   mechanisms rise into interconnected Architectural Outcome Landmarks joined by luminous
 *   3D spatial routes.
 */
export function createCapabilityEngine(
  parent: THREE.Group,
  screenWidth = 1080
): CapabilityEngine {
  const root = new THREE.Group();
  root.position.set(0, 0, 0);
  parent.add(root);

  // ── Shared Precision Materials (PASS C — Frosted Glass, Machined Titanium, Controlled Emissives) ──
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: "#24374c",
    metalness: 0.88,
    roughness: 0.2,
  });
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: "#0b1420",
    metalness: 0.76,
    roughness: 0.28,
  });
  const frostedGlassMat = new THREE.MeshPhysicalMaterial({
    color: "#15344f",
    emissive: "#0c253b",
    emissiveIntensity: 0.42,
    metalness: 0.15,
    roughness: 0.12,
    transmission: 0.42,
    transparent: true,
    opacity: 0.74,
  });
  const prismGlassMat = new THREE.MeshPhysicalMaterial({
    color: "#1e3a5c",
    emissive: "#233c6e",
    emissiveIntensity: 0.58,
    metalness: 0.22,
    roughness: 0.08,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.84,
  });
  const cyanEmissiveMat = new THREE.MeshBasicMaterial({
    color: "#7adbf0",
    transparent: true,
    opacity: 0.9,
  });
  const lavenderEmissiveMat = new THREE.MeshBasicMaterial({
    color: "#a8b4f8",
    transparent: true,
    opacity: 0.88,
  });
  const emeraldEmissiveMat = new THREE.MeshBasicMaterial({
    color: "#6ee7b7",
    transparent: true,
    opacity: 0.9,
  });
  const warmVernierMat = new THREE.MeshBasicMaterial({
    color: "#dff6ff",
    transparent: true,
    opacity: 0.92,
  });

  const cyanLineMat = new THREE.LineBasicMaterial({
    color: "#7adbf0",
    transparent: true,
    opacity: 0.52,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lavenderLineMat = new THREE.LineBasicMaterial({
    color: "#a8b4f8",
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const emeraldLineMat = new THREE.LineBasicMaterial({
    color: "#6ee7b7",
    transparent: true,
    opacity: 0.54,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const bgArchitecturalLineMat = new THREE.LineBasicMaterial({
    color: "#578fae",
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  // ── TIER 1 (BACKGROUND): ARCHITECTURAL ASTROLABE ROTUNDA -> GREAT CARTOGRAPHIC HORIZON ──
  // In World One, 3 concentric architectural meridian domes & 8 radial stadia ribs frame the
  // deep background of The Impossible Workshop. In World Two, they hinge 90° flat into the
  // expansive circular Cartographic Horizon of The Atlas of Possibility!
  const rotundaRings: THREE.Group[] = [];
  const rotundaConfigs = [
    { radius: 3.15, z: -1.45, atlasY: 0.48, atlasScale: 1.48 },
    { radius: 2.55, z: -2.05, atlasY: 0.72, atlasScale: 1.38 },
    { radius: 1.95, z: -2.65, atlasY: 0.96, atlasScale: 1.28 },
  ];

  rotundaConfigs.forEach((cfg, rIdx) => {
    const rGroup = new THREE.Group();
    rGroup.position.set(0, 1.05, cfg.z);
    root.add(rGroup);

    // Chamfered architectural ring segments
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.radius, 0.022, 8, 96),
      rIdx % 2 === 0 ? titaniumMat : obsidianMat
    );
    rGroup.add(ringMesh);

    // Outer technical hairline & 96 graduation stadia marks
    const gradPts: THREE.Vector3[] = [];
    const count = 96;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const rIn = cfg.radius - (i % 8 === 0 ? 0.14 : 0.05);
      const rOut = cfg.radius + (i % 8 === 0 ? 0.08 : 0.025);
      gradPts.push(
        new THREE.Vector3(Math.cos(a) * rIn, Math.sin(a) * rIn, 0),
        new THREE.Vector3(Math.cos(a) * rOut, Math.sin(a) * rOut, 0)
      );
    }
    // 8 radial meridian spokes connecting the rotunda
    for (let s = 0; s < 8; s++) {
      const a = (s / 8) * Math.PI * 2;
      gradPts.push(
        new THREE.Vector3(Math.cos(a) * (cfg.radius * 0.42), Math.sin(a) * (cfg.radius * 0.42), 0),
        new THREE.Vector3(Math.cos(a) * cfg.radius, Math.sin(a) * cfg.radius, 0)
      );
    }
    rGroup.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(gradPts),
        rIdx === 0 ? cyanLineMat : bgArchitecturalLineMat
      )
    );
    rotundaRings.push(rGroup);
  });

  // ── TIER 2 (MIDGROUND): CENTRAL VERNIER CRUCIBLE -> ATLAS COMPASS ROSE & MERIDIAN ARC ──
  const crucibleGroup = new THREE.Group();
  crucibleGroup.position.set(0, 1.05, 0.25);
  root.add(crucibleGroup);

  // Central Open Split-Stadia Axis (leaves the central focal aperture unobstructed)
  const spinePts = [
    new THREE.Vector3(-0.09, -1.75, -0.55),
    new THREE.Vector3(-0.09, -0.35, -0.55),
    new THREE.Vector3(0.09, -1.75, -0.55),
    new THREE.Vector3(0.09, -0.35, -0.55),
    new THREE.Vector3(-0.09, 0.65, -0.55),
    new THREE.Vector3(-0.09, 1.65, -0.55),
    new THREE.Vector3(0.09, 0.65, -0.55),
    new THREE.Vector3(0.09, 1.65, -0.55),
  ];
  const centralSpine = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(spinePts),
    bgArchitecturalLineMat
  );
  crucibleGroup.add(centralSpine);

  const vernierRings: THREE.Group[] = [];
  [1.72, 2.08, 2.46].forEach((radius, rIdx) => {
    const rGroup = new THREE.Group();
    crucibleGroup.add(rGroup);

    const torusMat = rIdx === 0 ? cyanEmissiveMat : rIdx === 1 ? lavenderEmissiveMat : emeraldEmissiveMat;
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(radius, rIdx === 2 ? 0.01 : 0.007, 10, 96),
      torusMat
    );
    rGroup.add(torus);

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

  const axisPts = [
    new THREE.Vector3(-3.1, 0, 0),
    new THREE.Vector3(3.1, 0, 0),
    new THREE.Vector3(0, -2.0, 0),
    new THREE.Vector3(0, 2.0, 0),
  ];
  crucibleGroup.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(axisPts),
      bgArchitecturalLineMat
    )
  );

  // ── TIER 3 (FOREGROUND): OPTICAL FRAMING CALIPERS ──
  const fgCalipers = new THREE.Group();
  fgCalipers.position.set(0, 1.05, 1.45);
  root.add(fgCalipers);
  [-2.55, 2.55].forEach(bx => {
    const sign = Math.sign(bx);
    const bracketPts = [
      new THREE.Vector3(bx - sign * 0.28, 1.25, 0),
      new THREE.Vector3(bx, 1.25, 0),
      new THREE.Vector3(bx, -1.05, 0),
      new THREE.Vector3(bx - sign * 0.28, -1.05, 0),
    ];
    fgCalipers.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(bracketPts),
        cyanLineMat
      )
    );
  });

  // ── 4. SIX ARTICULATED CAPABILITY ARMATURES & SCULPTURAL MECHANISMS ──
  // Instead of floating on chunky gray rectangular slabs, each capability is mounted inside a
  // circular Precision Gimbal Cradle (`gimbalCradle`) connected by an articulated truss arm
  // (`tetherLine`) to the central spine!

  interface InstrumentPod {
    group: THREE.Group;
    tetherGeo: THREE.BufferGeometry;
    cradleRingMat: THREE.MeshBasicMaterial;
    sculpture: THREE.Group;
    writeBlocks?: Array<{ mesh: THREE.Mesh; rawPos: THREE.Vector3; rawRot: THREE.Euler; targetPos: THREE.Vector3 }>;
    writeScanner?: THREE.Mesh;
    automateGates?: THREE.Group[];
    automateRods?: THREE.Mesh[];
    automatePulse?: THREE.Mesh;
    decideBranches?: THREE.Line[];
    decideWeights?: THREE.Mesh[];
    decidePrism?: THREE.Mesh;
    decideBeam?: THREE.Mesh;
    bilingualHelixA?: THREE.Mesh;
    bilingualHelixB?: THREE.Mesh;
    bilingualRungs?: THREE.LineSegments;
    bilingualFork?: THREE.Mesh;
    memoryStrata?: Array<{ mesh: THREE.Mesh; clampMesh: THREE.Mesh; durable: boolean }>;
    visionBlades?: THREE.Mesh[];
    visionFrustum?: THREE.LineSegments;
    voiceWaveRing?: THREE.LineLoop;
    voiceWaveGeo?: THREE.BufferGeometry;
    atlasMonument: THREE.Group;
  }

  const pods: InstrumentPod[] = [];

  // Target positions in World Two (The Atlas of Possibility):
  // Stepped across 3 distinct topographic regions:
  // West Terrace (01 Basic - Available Now): Write (-3.2) & Vision/Voice (-1.85)
  // Central Terrace (02 Consumer - Coming Soon): Bilingual (-0.55) & Memory (+0.68)
  // East Terrace (03 Business - Coming Soon): Automate (+1.95) & Decide (+3.25)
  const atlasPlacements = [
    { x: -3.2, y: 0.84, z: 0.52 },   // 01 Write -> Editorial Folio Tower (Basic)
    { x: 1.95, y: 1.28, z: -0.22 },  // 02 Automate -> Workflow Aqueduct (Business)
    { x: 3.25, y: 1.4, z: 0.45 },    // 03 Decide -> Executive Decision Citadel (Business)
    { x: -0.55, y: 1.06, z: 0.36 },  // 04 Swedish + English -> Twin Suspension Span (Consumer)
    { x: 0.68, y: 1.12, z: -0.28 },  // 05 Memory -> Curated Context Archive (Consumer)
    { x: -1.85, y: 0.9, z: -0.2 },   // 06 Vision & Voice -> Multimodal Signal Observatory (Basic)
  ];

  CAPABILITY_CHAMBER_MODULES.forEach((mod, idx) => {
    const group = new THREE.Group();
    root.add(group);

    // Articulated Radial Caliper Tether connecting this instrument to the Central Crucible Spine
    const tetherGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.05, 0.25),
      new THREE.Vector3(0, 1.05, 0.25),
    ]);
    const tetherLine = new THREE.Line(
      tetherGeo,
      idx % 2 === 0 ? cyanLineMat : lavenderLineMat
    );
    root.add(tetherLine);

    // Precision Circular Optical Stage & Gimbal Cradle (replaces the flat rectangular slab!)
    const cradleOuter = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.018, 10, 48),
      titaniumMat
    );
    cradleOuter.rotation.x = Math.PI / 2;
    group.add(cradleOuter);

    const cradleRingMat = new THREE.MeshBasicMaterial({
      color: mod.accent,
      transparent: true,
      opacity: 0.82,
    });
    const cradleInner = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.01, 8, 48),
      cradleRingMat
    );
    cradleInner.rotation.x = Math.PI / 2;
    group.add(cradleInner);

    // Translucent optical lens disc inside the gimbal cradle
    const lensDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.018, 36),
      frostedGlassMat
    );
    group.add(lensDisc);

    // Reticle crosshairs etched into the optical lens disc
    const reticlePts = [
      new THREE.Vector3(-0.44, 0.012, 0),
      new THREE.Vector3(0.44, 0.012, 0),
      new THREE.Vector3(0, 0.012, -0.44),
      new THREE.Vector3(0, 0.012, 0.44),
    ];
    group.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(reticlePts),
        cyanLineMat
      )
    );

    const sculpture = new THREE.Group();
    sculpture.position.y = 0.38;
    group.add(sculpture);

    // Rising Architectural Outcome Landmark for World Two (The Atlas of Possibility)
    const atlasMonument = new THREE.Group();
    atlasMonument.position.y = 0.04;
    group.add(atlasMonument);

    const pod: InstrumentPod = {
      group,
      tetherGeo,
      cradleRingMat,
      sculpture,
      atlasMonument,
    };

    if (idx === 0) {
      // ── 01 WRITING: 15 Raw Typographic Clauses & Translucent Folios Assembling ──
      const blocks: Array<{
        mesh: THREE.Mesh;
        rawPos: THREE.Vector3;
        rawRot: THREE.Euler;
        targetPos: THREE.Vector3;
      }> = [];

      for (let row = 0; row < 5; row++) {
        // Backing translucent folio plane
        const folioPlane = new THREE.Mesh(
          new RoundedBoxGeometry(0.72, 0.018, 0.48, 1, 0.006),
          frostedGlassMat
        );
        const targetY = (row - 2) * 0.1;
        sculpture.add(folioPlane);
        blocks.push({
          mesh: folioPlane,
          rawPos: new THREE.Vector3(
            (row % 2 === 0 ? -1 : 1) * (0.42 + row * 0.08),
            targetY + (row - 2) * 0.14,
            (row % 3 - 1) * 0.26
          ),
          rawRot: new THREE.Euler((row - 2) * 0.35, (row % 2 ? 0.5 : -0.5), (row - 2) * 0.28),
          targetPos: new THREE.Vector3(0, targetY, 0),
        });

        // 2 physical typographic clause bars per folio that snap into column alignment
        for (let col = 0; col < 2; col++) {
          const w = col === 0 ? 0.32 : 0.24;
          const clause = new THREE.Mesh(
            new THREE.BoxGeometry(w, 0.016, 0.045),
            row === 2 ? emeraldEmissiveMat : cyanEmissiveMat
          );
          sculpture.add(clause);
          blocks.push({
            mesh: clause,
            rawPos: new THREE.Vector3(
              (col === 0 ? -0.55 : 0.55) + (row - 2) * 0.12,
              targetY + 0.08 * (col === 0 ? 1 : -1),
              0.28 * (col === 0 ? 1 : -1)
            ),
            rawRot: new THREE.Euler(0.4, col ? -0.6 : 0.6, 0.3),
            targetPos: new THREE.Vector3(col === 0 ? -0.14 : 0.18, targetY + 0.016, (row % 2 - 0.5) * 0.14),
          });
        }
      }

      // Precision vertical typesetting guide rods & active scanning rule
      [-0.4, 0.4].forEach(rx => {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.72, 8), titaniumMat);
        rod.position.set(rx, 0, 0);
        sculpture.add(rod);
      });
      const scanner = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.012, 0.54), warmVernierMat);
      sculpture.add(scanner);

      pod.writeBlocks = blocks;
      pod.writeScanner = scanner;

      // Atlas Outcome Landmark 01: Cantilevered Editorial Folio Tower
      for (let t = 0; t < 4; t++) {
        const tier = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(0.66 - t * 0.08, 0.22, 0.46 - t * 0.05)),
          cyanLineMat
        );
        tier.position.y = 0.24 + t * 0.24;
        atlasMonument.add(tier);
      }
    } else if (idx === 1) {
      // ── 02 AUTOMATION: Disconnected Components Interlocking into a Horological Workflow ──
      const gates: THREE.Group[] = [];
      const rods: THREE.Mesh[] = [];
      for (let g = 0; g < 4; g++) {
        const gateGrp = new THREE.Group();
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.25, 0.02, 8, 6),
          g % 2 === 0 ? titaniumMat : prismGlassMat
        );
        ring.rotation.y = Math.PI / 2;
        gateGrp.add(ring);

        const innerGear = new THREE.Mesh(
          new THREE.TorusGeometry(0.14, 0.01, 6, 12),
          g === 3 ? emeraldEmissiveMat : cyanEmissiveMat
        );
        innerGear.rotation.y = Math.PI / 2;
        gateGrp.add(innerGear);

        sculpture.add(gateGrp);
        gates.push(gateGrp);

        if (g < 3) {
          const rod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.009, 0.009, 0.28, 6),
            cyanEmissiveMat
          );
          rod.rotation.z = Math.PI / 2;
          rod.position.set((g - 1) * 0.26, (g % 2 === 0 ? 1 : -1) * 0.14, 0);
          sculpture.add(rod);
          rods.push(rod);
        }
      }
      const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), emeraldEmissiveMat);
      sculpture.add(pulse);

      pod.automateGates = gates;
      pod.automateRods = rods;
      pod.automatePulse = pulse;

      // Atlas Outcome Landmark 02: Synchronized Workflow Aqueduct Arches
      for (let a = 0; a < 4; a++) {
        const arch = new THREE.Mesh(
          new THREE.TorusGeometry(0.3 + a * 0.05, 0.011, 8, 36, Math.PI),
          emeraldEmissiveMat
        );
        arch.position.set((a - 1.5) * 0.22, 0.36, 0);
        atlasMonument.add(arch);
      }
    } else if (idx === 2) {
      // ── 03 DECISION-MAKING: Branching Paths Converging into One Resolved Outcome Vector ──
      const branches: THREE.Line[] = [];
      const weights: THREE.Mesh[] = [];
      for (let b = 0; b < 6; b++) {
        const angle = (b / 6) * Math.PI * 2;
        const start = new THREE.Vector3(-0.52, Math.cos(angle) * 0.36, Math.sin(angle) * 0.36);
        const mid = new THREE.Vector3(-0.2, Math.cos(angle) * 0.18, Math.sin(angle) * 0.18);
        const end = new THREE.Vector3(0.0, 0, 0);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)),
          b === 0 ? emeraldLineMat : b % 2 === 0 ? lavenderLineMat : cyanLineMat
        );
        sculpture.add(line);
        branches.push(line);

        const weightNode = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.04, 0),
          b === 0 ? emeraldEmissiveMat : lavenderEmissiveMat
        );
        weightNode.position.copy(start);
        sculpture.add(weightNode);
        weights.push(weightNode);
      }
      const prismGeo = new THREE.OctahedronGeometry(0.24, 0);
      const prism = new THREE.Mesh(prismGeo, prismGlassMat);
      prism.add(new THREE.LineSegments(new THREE.EdgesGeometry(prismGeo), warmVernierMat));
      sculpture.add(prism);

      // Resolved forward outcome vector + target ring
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.006, 0.62, 8),
        emeraldEmissiveMat
      );
      beam.rotation.z = -Math.PI / 2;
      beam.position.x = 0.32;
      sculpture.add(beam);

      pod.decideBranches = branches;
      pod.decideWeights = weights;
      pod.decidePrism = prism;
      pod.decideBeam = beam;

      // Atlas Outcome Landmark 03: Executive Decision Citadel Spire
      const spire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.ConeGeometry(0.36, 1.15, 4)),
        lavenderLineMat
      );
      spire.position.y = 0.64;
      atlasMonument.add(spire);
    } else if (idx === 3) {
      // ── 04 SWEDISH & ENGLISH: Two Independent Streams Resonating into One Shared Structure ──
      // Uniquely BudAI visual signature: Nordic Cyan (SV) & Evening Lavender (EN) streams
      // entering through a central harmonic tuning bridge and aligning into phase-locked rails!
      const svPts: THREE.Vector3[] = [];
      const enPts: THREE.Vector3[] = [];
      const rungPts: THREE.Vector3[] = [];
      for (let s = 0; s <= 32; s++) {
        const u = s / 32;
        const x = (u - 0.5) * 1.04;
        const spread = lerp(0.3, 0.085, smooth(u));
        const theta = u * Math.PI * 4.0;
        const pSv = new THREE.Vector3(x, Math.sin(theta) * spread, Math.cos(theta) * spread);
        const pEn = new THREE.Vector3(x, -Math.sin(theta) * spread, -Math.cos(theta) * spread);
        svPts.push(pSv);
        enPts.push(pEn);
        if (s % 3 === 0 && s >= 6) {
          rungPts.push(pSv.clone(), pEn.clone());
        }
      }
      const helixA = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(svPts), 48, 0.02, 8, false),
        cyanEmissiveMat
      );
      const helixB = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(enPts), 48, 0.02, 8, false),
        lavenderEmissiveMat
      );
      const rungs = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(rungPts),
        emeraldLineMat
      );
      // Central Harmonic Tuning Ring where the two language streams lock phase
      const tuningFork = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.014, 8, 36),
        warmVernierMat
      );
      tuningFork.rotation.y = Math.PI / 2;
      sculpture.add(helixA, helixB, rungs, tuningFork);

      pod.bilingualHelixA = helixA;
      pod.bilingualHelixB = helixB;
      pod.bilingualRungs = rungs;
      pod.bilingualFork = tuningFork;

      // Atlas Outcome Landmark 04: Twin-Arch Bilingual Suspension Span
      [-0.12, 0.12].forEach((zOff, sIdx) => {
        const arch = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.012, 8, 40, Math.PI),
          sIdx === 0 ? cyanEmissiveMat : lavenderEmissiveMat
        );
        arch.position.set(0, 0.28, zOff);
        atlasMonument.add(arch);
      });
    } else if (idx === 4) {
      // ── 05 MEMORY: Transparent Context Strata with Explicit User-Controlled Clamps ──
      const strata: Array<{ mesh: THREE.Mesh; clampMesh: THREE.Mesh; durable: boolean }> = [];
      for (let m = 0; m < 5; m++) {
        const durable = m === 0 || m === 2 || m === 4;
        const cassette = new THREE.Mesh(
          new RoundedBoxGeometry(0.68, 0.042, 0.46, 2, 0.01),
          durable ? frostedGlassMat : obsidianMat
        );
        cassette.add(
          new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.69, 0.045, 0.47)),
            durable ? emeraldLineMat : bgArchitecturalLineMat
          )
        );
        // Mechanical retention caliper clamp on user-selected layers
        const clampMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.06, 0.52),
          durable ? emeraldEmissiveMat : titaniumMat
        );
        clampMesh.position.x = -0.34;
        cassette.add(clampMesh);

        sculpture.add(cassette);
        strata.push({ mesh: cassette, clampMesh, durable });
      }
      pod.memoryStrata = strata;

      // Atlas Outcome Landmark 05: Stepped Crystalline Context Archive
      const vault = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.28, 0.4, 0.92, 6)),
        lavenderLineMat
      );
      vault.position.y = 0.52;
      atlasMonument.add(vault);
    } else {
      // ── 06 VISION & VOICE: Dual Input Pathways (Optical Frustum + Acoustic Wave) -> 10-Blade Iris ──
      const blades: THREE.Mesh[] = [];
      for (let b = 0; b < 10; b++) {
        const blade = new THREE.Mesh(
          new RoundedBoxGeometry(0.24, 0.065, 0.02, 1, 0.006),
          titaniumMat
        );
        blade.add(
          new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(0.245, 0.068, 0.024)),
            cyanLineMat
          )
        );
        sculpture.add(blade);
        blades.push(blade);
      }

      // Left Pathway: Optical Perspective Frustum (Vision Input)
      const frustumGeo = new THREE.EdgesGeometry(new THREE.ConeGeometry(0.22, 0.42, 4));
      const frustum = new THREE.LineSegments(frustumGeo, cyanLineMat);
      frustum.rotation.z = -Math.PI / 2;
      frustum.position.set(-0.34, 0, 0.12);
      sculpture.add(frustum);

      // Right Pathway: 3D Harmonic Standing-Wave Ring (Voice Input)
      const waveCount = 56;
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
      pod.visionFrustum = frustum;
      pod.voiceWaveRing = waveRing;
      pod.voiceWaveGeo = waveGeo;

      // Atlas Outcome Landmark 06: Multimodal Signal Observatory
      const beacon = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.34, 1)),
        emeraldLineMat
      );
      beacon.position.y = 0.54;
      atlasMonument.add(beacon);
    }

    pods.push(pod);
  });

  // ── 5. WORLD TWO: STEPPED TOPOGRAPHIC TERRACES, OUTCOME CARTOUCHES & INTERCONNECTED ROUTES ──
  const atlasGroup = new THREE.Group();
  root.add(atlasGroup);

  // 3 Circular/Octagonal Architectural Topographic Terraces (West: Basic, Center: Consumer, East: Business)
  const terraceConfigs = [
    { x: -2.52, y: 0.72, z: 0.16, r: 1.32, mat: cyanLineMat },
    { x: 0.06, y: 0.98, z: 0.04, r: 1.36, mat: lavenderLineMat },
    { x: 2.62, y: 1.24, z: 0.1, r: 1.38, mat: emeraldLineMat },
  ];
  const atlasTerraces: THREE.Group[] = [];

  terraceConfigs.forEach(tc => {
    const tGrp = new THREE.Group();
    tGrp.position.set(tc.x, tc.y, tc.z);
    atlasGroup.add(tGrp);

    // Translucent octagonal architectural drafting platform
    const deck = new THREE.Mesh(
      new THREE.CylinderGeometry(tc.r, tc.r * 0.92, 0.036, 8),
      frostedGlassMat
    );
    tGrp.add(deck);

    // 4 concentric topographic elevation contour rings + radial compass hairlines
    [0.38, 0.68, 0.98, 1.28].forEach((r, cIdx) => {
      const contourPts: THREE.Vector3[] = [];
      for (let s = 0; s < 48; s++) {
        const a = (s / 48) * Math.PI * 2;
        contourPts.push(
          new THREE.Vector3(
            Math.cos(a) * r,
            0.022 + cIdx * 0.018,
            Math.sin(a) * (r * 0.76)
          )
        );
      }
      tGrp.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(contourPts), tc.mat));
    });

    // Sub-surface architectural stadia columns anchoring the terrace into deep space
    for (let c = 0; c < 4; c++) {
      const a = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.95, 6), titaniumMat);
      col.position.set(Math.cos(a) * (tc.r * 0.72), -0.48, Math.sin(a) * (tc.r * 0.56));
      tGrp.add(col);
    }

    atlasTerraces.push(tGrp);
  });

  // 7 Multi-Strand 3D Spatial Routes linking the 6 capability foundations across the Atlas
  const routeCurves: THREE.CatmullRomCurve3[] = [];
  const routeLines: THREE.Line[] = [];
  const routePairs: Array<[number, number, THREE.LineBasicMaterial]> = [
    [0, 5, cyanLineMat],     // Write <-> Vision/Voice (Basic Preview Intake & Document Route)
    [5, 3, cyanLineMat],     // Vision/Voice -> Swedish + English Bridge
    [0, 3, lavenderLineMat], // Write -> Swedish + English Bridge
    [3, 4, lavenderLineMat], // Swedish + English <-> User-Controlled Memory (Consumer Route)
    [4, 1, emeraldLineMat],  // Memory -> Workflow Automation (Business Route)
    [1, 2, emeraldLineMat],  // Workflow Automation -> Decision Citadel (Outcome Realization)
    [3, 2, lavenderLineMat], // Bilingual Bridge -> Decision Citadel
  ];

  routePairs.forEach(([fromIdx, toIdx, mat]) => {
    const a = atlasPlacements[fromIdx];
    const b = atlasPlacements[toIdx];
    const mid = new THREE.Vector3(
      (a.x + b.x) * 0.5,
      Math.max(a.y, b.y) + 0.44,
      (a.z + b.z) * 0.5 - 0.14
    );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(a.x, a.y + 0.06, a.z),
      mid,
      new THREE.Vector3(b.x, b.y + 0.06, b.z),
    ]);
    routeCurves.push(curve);
    const rLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),
      mat
    );
    atlasGroup.add(rLine);
    routeLines.push(rLine);
  });

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

  // ── 6. GPU-DRIVEN 3-STATE MORPHING PRECISION DATUM FIELD (960 points) ──
  const datumCount = 960;
  const rawPos = new Float32Array(datumCount * 3);
  const workshopPos = new Float32Array(datumCount * 3);
  const atlasPos = new Float32Array(datumCount * 3);
  const phases = new Float32Array(datumCount);
  const tones = new Float32Array(datumCount);

  for (let i = 0; i < datumCount; i++) {
    const u = i / datumCount;
    const angle = i * 2.3999632;
    const rRaw = 2.5 + (i % 17) * 0.22;

    rawPos[i * 3] = Math.cos(angle) * rRaw * 1.32;
    rawPos[i * 3 + 1] = 1.0 + Math.sin(angle * 0.7) * 2.0;
    rawPos[i * 3 + 2] = -0.5 + Math.sin(angle) * rRaw * 0.85;

    const ringIdx = i % 6;
    const wRadius = 1.32 + ringIdx * 0.32;
    const wTheta = u * Math.PI * 12 + ringIdx * 1.047;
    workshopPos[i * 3] = Math.cos(wTheta) * wRadius;
    workshopPos[i * 3 + 1] = 1.05 + Math.sin(wTheta) * (wRadius * 0.68);
    workshopPos[i * 3 + 2] = 0.15 - ringIdx * 0.42 + Math.cos(wTheta * 2) * 0.16;

    const terraceIdx = i % 3;
    const tc = terraceConfigs[terraceIdx];
    const contourR = 0.32 + ((i * 7) % 19) * 0.082;
    const contourA = u * Math.PI * 18;
    atlasPos[i * 3] = tc.x + Math.cos(contourA) * contourR * 1.22;
    atlasPos[i * 3 + 1] = tc.y + 0.05 + ((i % 5) * 0.14);
    atlasPos[i * 3 + 2] = tc.z + Math.sin(contourA) * contourR * 0.92;

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

  // ── 7. CONTROLLED ARCHITECTURAL LIGHTING ──
  const workshopKeyLight = new THREE.PointLight("#7adbf0", 36, 20, 2);
  workshopKeyLight.position.set(-3.2, 2.9, 2.5);
  root.add(workshopKeyLight);

  const atlasHorizonLight = new THREE.PointLight("#a8b4f8", 30, 20, 2);
  atlasHorizonLight.position.set(3.4, 3.2, 1.9);
  root.add(atlasHorizonLight);

  const crucibleCoreLight = new THREE.PointLight("#6ee7b7", 24, 13, 2);
  crucibleCoreLight.position.set(0, 1.05, 1.7);
  root.add(crucibleCoreLight);

  return {
    root,
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

      // Local progress inside the active capability's scroll window, shaped by directedPacing()
      const moduleLocalRaw = clamp((p - modIdx / 6) * 6, 0, 1);
      const pacedLocal = directedPacing(moduleLocalRaw);

      // 5-Stage Workshop Choreography Weights
      const discovery = smooth(clamp(p / 0.15, 0.24, 1));
      const composition = smooth(clamp((p - 0.75) / 0.15, 0, 1)) * (1 - morph);
      const prepUnfold = smooth(clamp((p - 0.88) / 0.12, 0, 1) * 0.22 + morph * 0.88);

      datumMat.uniforms.uDiscovery.value = discovery;
      datumMat.uniforms.uMorph.value = morph;
      datumMat.uniforms.uTime.value = time;
      datumMat.uniforms.uPathwayBoost.value = isTeam;

      // ── 1. Tier 1 Background: Astrolabe Rotunda -> Great Cartographic Horizon ──
      rotundaRings.forEach((rGroup, rIdx) => {
        const cfg = rotundaConfigs[rIdx];
        rGroup.rotation.x = lerp(0, -Math.PI / 2, prepUnfold);
        rGroup.rotation.z = time * (rIdx % 2 === 0 ? 0.08 : -0.06) + p * 0.6;
        rGroup.rotation.y = pointerX * 0.05 * (1 - prepUnfold * 0.5);

        rGroup.position.x = -pointerX * (0.12 * (rIdx + 1)) * (1 - morph * 0.5);
        rGroup.position.y = lerp(1.05, cfg.atlasY + asm * 0.08 * rIdx, prepUnfold);
        rGroup.position.z = lerp(cfg.z, 0.05 - rIdx * 0.45, prepUnfold);
        rGroup.scale.setScalar(lerp(1, cfg.atlasScale, prepUnfold));
      });

      // ── 2. Tier 2 Midground: Central Vernier Crucible -> Atlas Compass Rose & Meridian Arc ──
      crucibleGroup.position.set(
        pointerX * 0.14,
        lerp(1.05, 0.56, morph) + pointerY * 0.06,
        lerp(0.15, -0.1, morph)
      );
      centralSpine.scale.y = lerp(1, 0.45, morph);

      vernierRings[0].rotation.x = lerp(Math.sin(time * 0.35) * 0.14, Math.PI / 2, morph);
      vernierRings[0].rotation.z = time * 0.22 + p * Math.PI;
      vernierRings[0].scale.setScalar(lerp(1, 1.28, morph));

      vernierRings[1].rotation.y = lerp(Math.sin(time * 0.28 + modIdx * 0.55) * 0.26, 0, morph);
      vernierRings[1].rotation.x = lerp(0.18, Math.PI / 2, morph);
      vernierRings[1].rotation.z = -time * 0.16;
      vernierRings[1].scale.setScalar(lerp(1, 1.42, morph));

      // Ring 2 hinges into a low-angle Cantilevered Horizon Arc framing the 3 octagonal terraces
      vernierRings[2].position.y = lerp(0, -0.08, morph);
      vernierRings[2].rotation.x = lerp(-0.14, Math.PI * 0.44, morph);
      vernierRings[2].rotation.y = lerp(Math.cos(time * 0.22 + modIdx * 0.4) * 0.22, (asm - 0.5) * 0.24, morph);
      vernierRings[2].scale.setScalar(lerp(1, 1.32, morph));

      // ── 3. Tier 3 Foreground: Optical Framing Calipers Parallax ──
      fgCalipers.position.x = pointerX * 0.24;
      fgCalipers.position.y = 1.05 + pointerY * 0.1;
      fgCalipers.scale.setScalar(lerp(1, 1.32, morph));
      fgCalipers.visible = morph < 0.72;

      // ── 4. Six Articulated Capability Armatures & Sculptural Mechanisms ──
      pods.forEach((pod, idx) => {
        const isActive = idx === modIdx;

        const orbitSlot = (idx - modIdx + 6) % 6;
        const orbitAngle = (orbitSlot / 6) * Math.PI * 2 - Math.PI / 2;
        const ringRadius = lerp(2.35, 1.28, composition);

        const workshopX = isActive
          ? lerp(0, Math.cos((idx / 6) * Math.PI * 2) * 1.12, composition)
          : Math.cos(orbitAngle) * ringRadius;
        const workshopY = isActive
          ? lerp(0.68, 1.05 + Math.sin((idx / 6) * Math.PI * 2) * 0.62, composition)
          : 1.05 + Math.sin(orbitAngle) * (ringRadius * 0.52);
        const workshopZ = isActive
          ? lerp(0.96, 0.35, composition)
          : lerp(-0.55 + Math.cos(orbitAngle) * 0.32, 0.22, composition);

        const workshopScale = isActive
          ? lerp(1.48, 1.06, composition)
          : lerp(0.74, 0.96, composition);

        const atlasTarget = atlasPlacements[idx];
        const elevationLift = smooth(clamp((asm - idx * 0.08) / 0.55, 0, 1)) * 0.22;

        const targetX = lerp(workshopX, atlasTarget.x, morph) + pointerX * 0.1;
        const targetY = lerp(workshopY, atlasTarget.y + elevationLift, morph) + pointerY * 0.05;
        const targetZ = lerp(workshopZ, atlasTarget.z, morph);
        const targetScale = lerp(workshopScale, 1.0, morph);

        pod.group.position.x = lerp(pod.group.position.x || targetX, targetX, 0.24);
        pod.group.position.y = lerp(pod.group.position.y || targetY, targetY, 0.24);
        pod.group.position.z = lerp(pod.group.position.z || targetZ, targetZ, 0.24);
        pod.group.scale.setScalar(lerp(pod.group.scale.x || targetScale, targetScale, 0.24));

        // Update the Articulated Radial Caliper Tether connecting the spine to this pod
        const tetherAttr = pod.tetherGeo.getAttribute("position") as THREE.BufferAttribute;
        tetherAttr.setXYZ(0, crucibleGroup.position.x, crucibleGroup.position.y, crucibleGroup.position.z);
        tetherAttr.setXYZ(1, pod.group.position.x, pod.group.position.y, pod.group.position.z);
        tetherAttr.needsUpdate = true;

        pod.cradleRingMat.opacity = morph >= 0.48 ? 0.88 : isActive ? 0.96 : 0.38;

        // Rising Architectural Outcome Monument in World Two
        const monumentScale = smooth(clamp((morph - 0.32) / 0.55, 0, 1)) * (0.58 + 0.42 * asm);
        pod.atlasMonument.scale.set(1, Math.max(0.001, monumentScale), 1);
        pod.atlasMonument.visible = monumentScale > 0.02;

        // ── Meaningful Capability Transformations (PASS E — STORYTELLING) ──
        const activeAssemble = isActive ? pacedLocal : morph > 0.35 ? 1 : 0.28;

        if (pod.writeBlocks && pod.writeScanner) {
          // 01 Writing: 15 scattered typographic clauses & folios physically align into a structured document
          pod.writeBlocks.forEach((b, bIdx) => {
            b.mesh.position.lerpVectors(b.rawPos, b.targetPos, activeAssemble);
            b.mesh.position.y += Math.sin(time * 1.6 + bIdx * 0.4) * 0.008;
            b.mesh.rotation.set(
              b.rawRot.x * (1 - activeAssemble),
              b.rawRot.y * (1 - activeAssemble),
              b.rawRot.z * (1 - activeAssemble)
            );
          });
          pod.writeScanner.position.y = Math.sin(time * 2.2) * 0.24;
          pod.writeScanner.visible = isActive || morph > 0.4;
        }

        if (pod.automateGates && pod.automateRods && pod.automatePulse) {
          // 02 Automation: Separated eccentric rings & linkage rods snap onto a coherent workflow axis
          pod.automateGates.forEach((gate, gIdx) => {
            const alignedX = (gIdx - 1.5) * 0.25;
            const scatteredY = (1 - activeAssemble) * ((gIdx % 2 === 0 ? 1 : -1) * 0.28);
            const scatteredZ = (1 - activeAssemble) * ((gIdx - 1.5) * 0.18);
            gate.position.set(alignedX, scatteredY, scatteredZ);
            gate.rotation.x = time * (gIdx % 2 === 0 ? 1.05 : -1.05);
          });
          pod.automateRods.forEach((rod, rIdx) => {
            rod.scale.y = Math.max(0.1, activeAssemble);
            rod.position.y = (rIdx % 2 === 0 ? 1 : -1) * lerp(0.28, 0.13, activeAssemble);
          });
          const pulseU = (time * 0.68) % 1;
          pod.automatePulse.position.x = (pulseU - 0.5) * 0.88;
        }

        if (pod.decideBranches && pod.decideWeights && pod.decidePrism && pod.decideBeam) {
          // 03 Decision-Making: Branching paths weigh scenarios and resolve into a single forward vector
          pod.decidePrism.rotation.y = time * 0.92;
          pod.decidePrism.rotation.x = Math.sin(time * 0.7) * 0.22;
          pod.decideBeam.scale.y = lerp(0.25, 1.05, activeAssemble) + 0.15 * Math.sin(time * 2.6);
          pod.decideWeights.forEach((wMesh, wIdx) => {
            const uBranch = ((time * 0.45 + wIdx * 0.16) % 1) * activeAssemble;
            const angle = (wIdx / 6) * Math.PI * 2;
            wMesh.position.set(
              lerp(-0.52, 0, uBranch),
              Math.cos(angle) * 0.36 * (1 - uBranch),
              Math.sin(angle) * 0.36 * (1 - uBranch)
            );
          });
        }

        if (pod.bilingualHelixA && pod.bilingualHelixB && pod.bilingualRungs && pod.bilingualFork) {
          // 04 Swedish & English: Dual streams pass through the tuning fork into phase-locked parity
          const rot = time * 0.88;
          pod.bilingualHelixA.rotation.x = rot;
          pod.bilingualHelixB.rotation.x = rot;
          pod.bilingualRungs.rotation.x = rot;
          pod.bilingualFork.position.x = Math.sin(time * 1.4) * 0.22;
          pod.bilingualFork.scale.setScalar(0.92 + 0.12 * Math.sin(time * 2.8));
        }

        if (pod.memoryStrata) {
          // 05 Memory: User-selected durable layers lock forward into emerald clamps; transient layers stay recessed
          pod.memoryStrata.forEach((item, mIdx) => {
            item.mesh.position.y = (mIdx - 2) * 0.105;
            item.mesh.position.z = item.durable
              ? lerp(0.02, 0.12, activeAssemble) + Math.sin(time * 1.5 + mIdx) * 0.012
              : lerp(0, -0.1, activeAssemble);
          });
        }

        if (pod.visionBlades && pod.visionFrustum && pod.voiceWaveGeo) {
          // 06 Vision & Voice: Optical frustum and acoustic wave converge into the 10-blade iris aperture
          const apertureRadius = lerp(0.32, 0.21, activeAssemble) + 0.04 * Math.sin(time * 2.1);
          pod.visionBlades.forEach((blade, bIdx) => {
            const a = (bIdx / 10) * Math.PI * 2 + time * 0.26;
            blade.position.set(Math.cos(a) * apertureRadius, Math.sin(a) * apertureRadius, 0);
            blade.rotation.z = a + 0.52;
          });
          pod.visionFrustum.position.x = lerp(-0.46, -0.22, activeAssemble);
          pod.visionFrustum.rotation.x = time * 0.65;

          const posAttr = pod.voiceWaveGeo.getAttribute("position") as THREE.BufferAttribute;
          for (let w = 0; w < posAttr.count; w++) {
            const a = (w / posAttr.count) * Math.PI * 2;
            const r = 0.16 + 0.048 * Math.sin(a * 6 + time * 4.4);
            posAttr.setXYZ(w, Math.cos(a) * r, Math.sin(a) * r, 0.06);
          }
          posAttr.needsUpdate = true;
        }
      });

      // ── 5. World Two Atlas Terraces & Interconnected Routes Emergence ──
      const atlasVisibility = smooth(clamp((morph - 0.16) / 0.65, 0, 1));
      atlasGroup.visible = atlasVisibility > 0.01;

      atlasTerraces.forEach((tGrp, tIdx) => {
        const tc = terraceConfigs[tIdx];
        const stageReveal = smooth(clamp((atlasVisibility - tIdx * 0.11) / 0.65, 0, 1));
        tGrp.scale.set(
          Math.max(0.001, stageReveal),
          1,
          Math.max(0.001, stageReveal)
        );
        tGrp.position.y = tc.y + Math.sin(time * 1.1 + tIdx) * 0.022 + (tIdx === 2 ? isTeam * 0.12 : 0);
        tGrp.rotation.y = (asm - 0.5) * 0.12 * (tIdx - 1);
      });

      routeLines.forEach((rLine, rIdx) => {
        const routeReveal = smooth(clamp((morph - 0.28 + asm * 0.35 - rIdx * 0.045) / 0.45, 0, 1));
        rLine.visible = routeReveal > 0.02;
      });

      routePulses.forEach((pulse, pIdx) => {
        const curve = routeCurves[pIdx];
        const u = (time * 0.3 + pIdx * 0.17 + asm * 0.5) % 1;
        curve.getPointAt(u, pulse.position);
        pulse.visible = atlasVisibility > 0.22;
      });

      // ── 6. Controlled Lighting Progression across Workshop -> Atlas ──
      workshopKeyLight.intensity = lerp(34, 44, discovery) * (1 - morph * 0.18);
      atlasHorizonLight.intensity = lerp(26, 46, morph) + isTeam * 8;
      crucibleCoreLight.intensity = lerp(24, 36, Math.max(composition, asm));
    },
  };
}
