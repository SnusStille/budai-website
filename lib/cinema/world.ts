"use client";

/**
 * STILLEDEV — the world the site is filmed inside.
 *
 * One persistent three.js scene spanning ~58 world units along -Z. The camera does not cut
 * between sections: it travels. Seven DOM scenes anchor seven camera keyframes (see
 * lib/cinema/timeline.ts) and every object here fades in and out around its own scene via
 * `presence()`, so the page reads as one continuous dolly shot under one art direction.
 *
 * Built to three constraints at once:
 *   1. Quality   — PBR metal + a procedurally generated studio environment, bloom, film grade,
 *                  a camera that banks into turns.
 *   2. Restraint — objects far off-camera are hidden, not just dimmed; the loop stops when the
 *                  tab hides; nothing is re-created per frame (scratch objects, dynamic buffers).
 *   3. Escape    — every feature degrades. No WebGL, reduced motion, save-data and older phones
 *                  get a calmer or a still version, never a broken one.
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { ART, type Quality } from "@/lib/cinema/tokens";
import {
  SCENE_ORDER,
  cameraAt,
  clamp01,
  damp,
  presence,
  smootherstep,
  type SceneId,
} from "@/lib/cinema/timeline";
import type { MarkSample } from "@/lib/cinema/mark";
import {
  coreFragment,
  coreVertex,
  edgeFragment,
  edgeVertex,
  gradeFragment,
  gradeVertex,
  gridFragment,
  gridVertex,
  linkFragment,
  linkVertex,
  markFragment,
  markVertex,
} from "@/lib/cinema/shaders";

export type ScrollInput = {
  p: number;
  index: number;
  t: number;
  vel: number;
  ids: SceneId[];
};

export type CinemaHandle = {
  setScroll(s: ScrollInput): void;
  setPointer(x: number, y: number): void;
  /** 0..1 boot sequence — the light field only forms the mark once the film has started. */
  setIntro(v: number): void;
  setHover(i: number): void;
  setPaused(v: boolean): void;
  dispose(): void;
};

const TAU = Math.PI * 2;
type Ok = [number, number, number];

/**
 * OKLCH → linear sRGB → THREE.Color tagged as sRGB, so the WebGL world and the CSS custom
 * properties are literally the same colours (one art direction, two renderers).
 */
function toColor(ok: Ok) {
  const [L, C, hDeg] = ok;
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const cl = (v: number) => Math.min(1, Math.max(0, v));
  const lin: Ok = [
    cl(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    cl(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    cl(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
  const c = new THREE.Color();
  // setRGB with an explicit colour space keeps three from double-decoding the value
  return c.setRGB(lin[0], lin[1], lin[2], THREE.SRGBColorSpace);
}

/** Deterministic PRNG: the composition is reproducible, so a screenshot always matches. */
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createCinemaWorld(
  canvas: HTMLCanvasElement,
  opts: {
    quality: Quality;
    mark: MarkSample | null;
    reduceMotion: boolean;
    coarse: boolean;
    onStatus?: (s: "live" | "idle" | "lost") => void;
  }
): CinemaHandle {
  const q = opts.quality;
  const rnd = mulberry(20261024);
  const reduce = opts.reduceMotion;
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  const dpr = Math.min(window.devicePixelRatio || 1, q.dpr);
  const size = { w: window.innerWidth, h: window.innerHeight };

  /* ── renderer ─────────────────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // MSAA comes from the HDR composer target instead
    alpha: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(size.w, size.h, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const voidColor = toColor(ART.void);
  scene.background = voidColor.clone();
  scene.fog = new THREE.FogExp2(voidColor.getHex(), 0.028);

  const camera = new THREE.PerspectiveCamera(34, size.w / size.h, 0.1, 240);
  camera.position.set(0, 1.05, 15.6);

  /* ── environment: a studio, generated instead of downloaded ───────────────── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envRT = pmrem.fromScene(envScene, 0.05);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.45;
  envScene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose();
  });
  pmrem.dispose();

  /* ── lights: a cool key, a hard signal rim, and one lamp inside the core ─── */
  scene.add(new THREE.AmbientLight(toColor(ART.silver), 0.14));
  const keyLight = new THREE.DirectionalLight(toColor(ART.silver), 1.25);
  keyLight.position.set(6, 12, 9);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(toColor(ART.signal), 2.0);
  rimLight.position.set(-8, 4, -14);
  scene.add(rimLight);
  const coreLight = new THREE.PointLight(toColor(ART.signal), 8, 30, 2);
  coreLight.position.set(0, 2.6, -7);
  scene.add(coreLight);

  /* ── shared materials ────────────────────────────────────────────────────── */
  const metal = keep(
    new THREE.MeshStandardMaterial({
      color: toColor(ART.graphite),
      metalness: 1,
      roughness: 0.3,
      envMapIntensity: 0.9,
    })
  );
  const metalDark = keep(
    new THREE.MeshStandardMaterial({
      color: toColor([0.16, 0.014, 255]),
      metalness: 1,
      roughness: 0.52,
      envMapIntensity: 0.55,
    })
  );
  /** Real transmission only on the high tier; everything else fakes glass with reflections. */
  const glass = q.glass
    ? keep(
        new THREE.MeshPhysicalMaterial({
          color: toColor(ART.silver),
          metalness: 0,
          roughness: 0.05,
          transmission: 0.92,
          thickness: 1.4,
          ior: 1.45,
          attenuationColor: toColor(ART.signal),
          attenuationDistance: 5,
          envMapIntensity: 1.15,
        })
      )
    : keep(
        new THREE.MeshStandardMaterial({
          color: toColor(ART.graphite),
          metalness: 0.9,
          roughness: 0.08,
          envMapIntensity: 1.25,
          transparent: true,
          opacity: 0.5,
        })
      );

  const edgeMat = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: toColor(ART.signal) },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
      },
      vertexShader: edgeVertex,
      fragmentShader: edgeFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );

  /* ── 1. the brand, written in light (and its closing echo) ───────────────── */
  const markUniforms = (tint?: Ok) => ({
    uTime: { value: 0 },
    uForm: { value: 0 },
    uScatter: { value: 0 },
    uSize: { value: opts.coarse ? 3.0 : 2.3 },
    uDpr: { value: dpr },
    uOpacity: { value: 1 },
    uColorA: { value: toColor([0.74, 0.045, 235]) },
    uColorB: { value: toColor(tint ?? ART.signal) },
    uEdgeColor: { value: toColor(ART.silver) },
  });

  /**
   * The field is a cold nebula shell with a disc bias; the mark is the sampled logotype.
   * `position` and `aField` share one attribute — the shader does the morphing, the CPU
   * never touches the buffer again.
   */
  function buildMarkField(mark: MarkSample | null, budget: number) {
    const n = mark ? mark.count : Math.min(budget, 8000);
    const markPos = new Float32Array(n * 3);
    const fieldPos = new Float32Array(n * 3);
    const edge = new Float32Array(n);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = rnd() * TAU;
      const v = Math.acos(2 * rnd() - 1);
      const r = 5.5 + Math.pow(rnd(), 0.55) * 26;
      fieldPos[i * 3] = Math.sin(v) * Math.cos(u) * r;
      fieldPos[i * 3 + 1] = Math.cos(v) * r * 0.3 + (rnd() - 0.5) * 1.4 + 1.4;
      fieldPos[i * 3 + 2] = Math.sin(v) * Math.sin(u) * r * 0.72;
      if (mark) {
        markPos[i * 3] = mark.positions[i * 3];
        markPos[i * 3 + 1] = mark.positions[i * 3 + 1] + 1.45;
        markPos[i * 3 + 2] = mark.positions[i * 3 + 2];
        edge[i] = mark.edges[i];
      } else {
        markPos[i * 3] = fieldPos[i * 3] * 0.38;
        markPos[i * 3 + 1] = (fieldPos[i * 3 + 1] - 1.4) * 0.38 + 1.4;
        markPos[i * 3 + 2] = fieldPos[i * 3 + 2] * 0.38;
        edge[i] = rnd() > 0.62 ? 1 : 0;
      }
      seed[i] = rnd();
    }
    const geo = keep(new THREE.BufferGeometry());
    const fieldAttr = new THREE.BufferAttribute(fieldPos, 3);
    geo.setAttribute("position", fieldAttr);
    geo.setAttribute("aField", fieldAttr);
    geo.setAttribute("aMark", new THREE.BufferAttribute(markPos, 3));
    geo.setAttribute("aEdge", new THREE.BufferAttribute(edge, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.4, 0), 52);
    return geo;
  }

  const markGeo = buildMarkField(opts.mark, q.markPoints);
  const markMat = keep(
    new THREE.ShaderMaterial({
      uniforms: markUniforms(),
      vertexShader: markVertex,
      fragmentShader: markFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const markPoints = new THREE.Points(markGeo, markMat);
  markPoints.frustumCulled = false;
  scene.add(markPoints);

  const outroMat = keep(
    new THREE.ShaderMaterial({
      uniforms: markUniforms(ART.bleed),
      vertexShader: markVertex,
      fragmentShader: markFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  // same geometry, its own uniforms: the opening brand, remembered at the end of the run
  const outroPoints = new THREE.Points(markGeo, outroMat);
  outroPoints.position.set(0, 1.9, -36.2);
  outroPoints.scale.setScalar(0.58);
  outroPoints.frustumCulled = false;
  scene.add(outroPoints);

  /* ── 2. near-field dust — the room is never empty ────────────────────────── */
  const dustN = q.dustPoints;
  const dustPos = new Float32Array(dustN * 3);
  const dustSeed = new Float32Array(dustN);
  const dustEdge = new Float32Array(dustN);
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = (rnd() - 0.5) * 52;
    dustPos[i * 3 + 1] = rnd() * 13 - 1.1;
    dustPos[i * 3 + 2] = 22 - rnd() * 70;
    dustSeed[i] = rnd();
  }
  const dustGeo = keep(new THREE.BufferGeometry());
  const dustAttr = new THREE.BufferAttribute(dustPos, 3);
  dustGeo.setAttribute("position", dustAttr);
  dustGeo.setAttribute("aField", dustAttr);
  dustGeo.setAttribute("aMark", dustAttr);
  dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeed, 1));
  dustGeo.setAttribute("aEdge", new THREE.BufferAttribute(dustEdge, 1));
  const dustMat = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        ...markUniforms(),
        uSize: { value: opts.coarse ? 2.2 : 1.6 },
        uOpacity: { value: 0.4 },
        uColorA: { value: toColor([0.88, 0.008, 232]) },
        uColorB: { value: toColor(ART.signal) },
        uEdgeColor: { value: toColor(ART.signal) },
      },
      vertexShader: markVertex,
      fragmentShader: markFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  /* ── 3. the floor: a measured grid the dolly travels over ────────────────── */
  const gridMat = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: toColor([0.62, 0.035, 230]) },
        uPulse: { value: toColor(ART.signal) },
        uTime: { value: 0 },
        uOpacity: { value: 0.6 },
        uCell: { value: 2.6 },
      },
      vertexShader: gridVertex,
      fragmentShader: gridFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  );
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(260, 260)), gridMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.35, -12);
  scene.add(floor);

  /* ── 4. arrival structure: pillars + glass catching a controlled highlight ── */
  const arrival = new THREE.Group();
  arrival.position.set(0, 0, -4.4);
  scene.add(arrival);
  const arrivalSlabs = Math.max(18, Math.round(q.slabs * 0.55));
  {
    const bodyGeo = keep(new THREE.BoxGeometry(1, 1, 1));
    const pillars = new THREE.InstancedMesh(bodyGeo, metal, arrivalSlabs);
    const capGeo = keep(new THREE.PlaneGeometry(1, 1));
    const caps = new THREE.InstancedMesh(capGeo, edgeMat, arrivalSlabs);
    const capSeed = new Float32Array(arrivalSlabs);
    capGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(capSeed, 1));
    const mtx = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const e = new THREE.Euler();
    const qt = new THREE.Quaternion();
    for (let i = 0; i < arrivalSlabs; i++) {
      const ang = Math.PI + (rnd() - 0.5) * 2.6;
      const rad = 6 + rnd() * 17;
      const h = 2.6 + Math.pow(rnd(), 1.7) * 15;
      p.set(Math.cos(ang) * rad * 1.7, -1.3 + h / 2, Math.sin(ang) * rad * 0.5 - 2.5);
      s.set(0.3 + rnd() * 1.5, h, 0.24 + rnd() * 0.7);
      e.set(0, (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.05);
      qt.setFromEuler(e);
      mtx.compose(p, qt, s);
      pillars.setMatrixAt(i, mtx);
      // a lit cap on each pillar: reads as architecture with fixtures, not grey boxes
      mtx.compose(
        new THREE.Vector3(p.x, p.y + h / 2 + 0.02, p.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, e.y)),
        new THREE.Vector3(s.x * 0.96, s.z * 0.96, 1)
      );
      caps.setMatrixAt(i, mtx);
      capSeed[i] = i / arrivalSlabs;
    }
    pillars.frustumCulled = false;
    caps.frustumCulled = false;
    arrival.add(pillars, caps);

    const panelGeo = keep(new THREE.BoxGeometry(4.6, 7.4, 0.2));
    const panel = new THREE.Mesh(panelGeo, glass);
    panel.position.set(-4.6, 2.5, -3.4);
    panel.rotation.set(0.02, 0.44, 0.03);
    const panel2 = new THREE.Mesh(panelGeo, glass);
    panel2.position.set(5.6, 3.2, -5.6);
    panel2.rotation.set(-0.02, -0.52, -0.04);
    panel2.scale.set(0.74, 1.16, 1);
    arrival.add(panel, panel2);
  }

  /* ── 5. Scene C — the intelligence core ──────────────────────────────────── */
  const core = new THREE.Group();
  core.position.set(0, 2.5, -7);
  scene.add(core);
  const coreMat = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.17 },
        uScale: { value: 1.45 },
        uReveal: { value: 0 },
        uOpacity: { value: 0 },
        uColorA: { value: toColor([0.28, 0.075, 252]) },
        uColorB: { value: toColor([0.58, 0.12, 222]) },
        uRim: { value: toColor(ART.signal) },
      },
      vertexShader: coreVertex,
      fragmentShader: coreFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    })
  );
  const shell = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(1.62, q.coreDetail)), coreMat);
  shell.renderOrder = 3;
  core.add(shell);

  const innerGeo = keep(new THREE.IcosahedronGeometry(1.02, 1));
  const innerWireMat = keep(
    new THREE.LineBasicMaterial({
      color: toColor(ART.signal),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  const innerWire = new THREE.LineSegments(keep(new THREE.WireframeGeometry(innerGeo)), innerWireMat);
  innerWire.renderOrder = 1;
  core.add(innerWire);

  const innerMat = keep(
    new THREE.MeshBasicMaterial({
      color: toColor(ART.silver),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  const innerGlow = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(0.44, 2)), innerMat);
  innerGlow.renderOrder = 2;
  core.add(innerGlow);

  const ringGeo = keep(new THREE.TorusGeometry(1, 0.014, 4, 200));
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(ringGeo, metal);
    ring.scale.setScalar(2.15 + i * 0.44);
    ring.rotation.set(Math.PI / 2 + i * 0.52, i * 0.7, i * 0.31);
    rings.push(ring);
    core.add(ring);
  }
  const blades = new THREE.Group();
  const bladeGeo = keep(new THREE.BoxGeometry(0.06, 0.62, 2.9));
  for (let i = 0; i < 5; i++) {
    const blade = new THREE.Mesh(bladeGeo, metalDark);
    const a = (i / 5) * TAU;
    blade.position.set(Math.cos(a) * 2.8, Math.sin(a * 2) * 0.5, Math.sin(a) * 2.8);
    blade.rotation.y = -a;
    blades.add(blade);
  }
  core.add(blades);

  /* ── 6. Scene D — construction: structure plus floating surfaces ─────────── */
  const arch = new THREE.Group();
  arch.position.set(0, 0, -12.6);
  scene.add(arch);
  const screens: THREE.Mesh[] = [];
  {
    const slabCount = Math.max(12, q.slabs - arrivalSlabs);
    const bodyGeo = keep(new THREE.BoxGeometry(1, 1, 1));
    const inst = new THREE.InstancedMesh(bodyGeo, metalDark, slabCount);
    const mtx = new THREE.Matrix4();
    for (let i = 0; i < slabCount; i++) {
      const ang = Math.PI + (rnd() - 0.5) * 3.0;
      const rad = 7 + rnd() * 15;
      const h = 1.8 + Math.pow(rnd(), 1.6) * 12;
      mtx.compose(
        new THREE.Vector3(Math.cos(ang) * rad * 1.9, -1.3 + h / 2, Math.sin(ang) * rad * 0.55 + 2.5),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (rnd() - 0.5) * 1.1, 0)),
        new THREE.Vector3(0.28 + rnd() * 1.2, h, 0.2 + rnd() * 0.6)
      );
      inst.setMatrixAt(i, mtx);
    }
    inst.frustumCulled = false;
    arch.add(inst);

    // Dark tilted surfaces with a lit top edge: "interfaces" as architecture, never a
    // fake dashboard. The real interface lives in the DOM, in this same scene.
    const screenGeo = keep(new THREE.BoxGeometry(3.1, 1.85, 0.06));
    const stripGeo = keep(new THREE.PlaneGeometry(3.1, 0.022));
    const stripSeed = new Float32Array(9);
    const strips = new THREE.InstancedMesh(stripGeo, edgeMat, 9);
    stripGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(stripSeed, 1));
    for (let i = 0; i < 9; i++) {
      const row = i % 3;
      const column = Math.floor(i / 3);
      const m = new THREE.Mesh(screenGeo, i % 3 === 0 ? glass : metal);
      m.position.set((column - 1) * 4.15 + (row - 1) * 0.4, 1.25 + row * 2.15, 1.7 - row * 0.75);
      m.rotation.set(0.03 * (row - 1), (column - 1) * 0.16 + 0.06, 0.02);
      m.userData.base = { rotY: m.rotation.y, x: m.position.x, y: m.position.y };
      screens.push(m);
      arch.add(m);
      strips.setMatrixAt(i, new THREE.Matrix4().compose(
        new THREE.Vector3(m.position.x, m.position.y + 0.95, m.position.z),
        new THREE.Quaternion().setFromEuler(m.rotation),
        new THREE.Vector3(1, 1, 1)
      ));
      stripSeed[i] = i / 9;
    }
    strips.frustumCulled = false;
    arch.add(strips);
  }

  /* ── 7. Scene E — automation: loose parts that find each other ──────────── */
  const systems = new THREE.Group();
  systems.position.set(0, 2.3, -19.4);
  scene.add(systems);
  const nodeN = q.latticeNodes;
  const nodeAssembled: THREE.Vector3[] = [];
  const nodeScattered: THREE.Vector3[] = [];
  const nodesNow: THREE.Vector3[] = [];
  for (let i = 0; i < nodeN; i++) {
    const layer = i % 3;
    const k = Math.floor(i / 3);
    const a = (k / Math.max(1, Math.floor(nodeN / 3))) * TAU + layer * 0.72;
    const rad = 2.4 + layer * 1.55;
    nodeAssembled.push(
      new THREE.Vector3(Math.cos(a) * rad, (layer - 1) * 1.5 + Math.sin(a * 3) * 0.3, Math.sin(a) * rad * 0.62)
    );
    nodeScattered.push(new THREE.Vector3((rnd() - 0.5) * 18, (rnd() - 0.5) * 9 + 1, (rnd() - 0.5) * 14));
    nodesNow.push(nodeScattered[i].clone());
  }
  const nodeMesh = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.3, 0.3, 0.3)), metal, nodeN);
  nodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  nodeMesh.frustumCulled = false;
  systems.add(nodeMesh);

  // connect the two nearest neighbours of every node — a graph, not a scribble
  const links: [number, number][] = [];
  for (let i = 0; i < nodeN; i++) {
    const nearest = nodeAssembled
      .map((v, j) => ({ j, d: v.distanceToSquared(nodeAssembled[i]) }))
      .filter((x) => x.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const b of nearest) if (b.d < 30 && i < b.j) links.push([i, b.j]);
  }
  const linkPos = new Float32Array(Math.max(1, links.length) * 6);
  const linkPath = new Float32Array(Math.max(1, links.length) * 2);
  const linkSeed = new Float32Array(Math.max(1, links.length) * 2);
  for (let i = 0; i < links.length; i++) {
    linkPath[i * 2] = 0;
    linkPath[i * 2 + 1] = 1;
    const s = rnd();
    linkSeed[i * 2] = s;
    linkSeed[i * 2 + 1] = s;
  }
  const linkGeo = keep(new THREE.BufferGeometry());
  const linkPosAttr = new THREE.BufferAttribute(linkPos, 3);
  linkPosAttr.setUsage(THREE.DynamicDrawUsage);
  linkGeo.setAttribute("position", linkPosAttr);
  linkGeo.setAttribute("aPath", new THREE.BufferAttribute(linkPath, 1));
  linkGeo.setAttribute("aSeed", new THREE.BufferAttribute(linkSeed, 1));
  linkGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
  const linkMat = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: toColor([0.6, 0.05, 228]) },
        uPulse: { value: toColor(ART.signal) },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uFlow: { value: 1 },
      },
      vertexShader: linkVertex,
      fragmentShader: linkFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const linkLines = new THREE.LineSegments(linkGeo, linkMat);
  linkLines.frustumCulled = false;
  systems.add(linkLines);

  const nodeGlowMat = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        ...markUniforms(),
        uForm: { value: 1 },
        uSize: { value: 7.5 },
        uOpacity: { value: 0 },
        uColorA: { value: toColor(ART.signal) },
        uColorB: { value: toColor(ART.silver) },
        uEdgeColor: { value: toColor(ART.silver) },
      },
      vertexShader: markVertex,
      fragmentShader: markFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const nodeGlowGeo = keep(new THREE.BufferGeometry());
  const ngPos = new Float32Array(nodeN * 3);
  nodeAssembled.forEach((v, i) => ngPos.set([v.x, v.y, v.z], i * 3));
  const ngAttr = new THREE.BufferAttribute(ngPos, 3);
  nodeGlowGeo.setAttribute("position", ngAttr);
  nodeGlowGeo.setAttribute("aField", ngAttr);
  nodeGlowGeo.setAttribute("aMark", ngAttr);
  const ngSeed = new Float32Array(nodeN);
  const ngEdge = new Float32Array(nodeN).fill(1);
  for (let i = 0; i < nodeN; i++) ngSeed[i] = rnd();
  nodeGlowGeo.setAttribute("aSeed", new THREE.BufferAttribute(ngSeed, 1));
  nodeGlowGeo.setAttribute("aEdge", new THREE.BufferAttribute(ngEdge, 1));
  nodeGlowGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  const nodeGlow = new THREE.Points(nodeGlowGeo, nodeGlowMat);
  nodeGlow.frustumCulled = false;
  systems.add(nodeGlow);

  /* ── 8. Scene F — physical mounts behind the project displays ───────────── */
  const works = new THREE.Group();
  works.position.set(0, 2.1, -27.6);
  scene.add(works);
  const mounts: { mesh: THREE.Mesh; halo: THREE.Mesh; glow: number }[] = [];
  {
    const frameGeo = keep(new THREE.BoxGeometry(5.4, 3.1, 0.1));
    const haloGeo = keep(new THREE.PlaneGeometry(5.55, 3.25));
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(frameGeo, metalDark);
      const a = (i / 4) * TAU + Math.PI * 0.15;
      mesh.position.set(Math.cos(a) * 6.9, i % 2 === 0 ? 1.05 : -0.4, Math.sin(a) * 3.2 - 1);
      mesh.rotation.set(0.02, Math.PI + Math.cos(a) * 0.5, 0);
      const halo = new THREE.Mesh(haloGeo, edgeMat);
      halo.position.copy(mesh.position);
      halo.position.z -= 0.1;
      halo.rotation.copy(mesh.rotation);
      mounts.push({ mesh, halo, glow: 0 });
      works.add(mesh, halo);
    }
  }

  /* ── post: bloom, then the print grade ───────────────────────────────────── */
  const rt = new THREE.WebGLRenderTarget(Math.max(2, Math.floor(size.w * dpr)), Math.max(2, Math.floor(size.h * dpr)), {
    type: THREE.HalfFloatType,
    samples: q.glass ? 4 : 2,
  });
  keep(rt);
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(dpr);
  composer.setSize(size.w, size.h);
  const bloomSize = new THREE.Vector2(
    Math.max(2, Math.floor(size.w * q.bloomScale)),
    Math.max(2, Math.floor(size.h * q.bloomScale))
  );
  const bloom = new UnrealBloomPass(bloomSize, q.bloomStrength, 0.52, 0.84);
  const grade = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uVignette: { value: 1.0 },
      uGrain: { value: q.grain ? 0.026 : 0 },
      uAberr: { value: 0.002 },
      uTime: { value: 0 },
      uBloom: { value: q.bloomStrength },
    },
    vertexShader: gradeVertex,
    fragmentShader: gradeFragment,
  });
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(grade);

  /* ── frame state ────────────────────────────────────────────────────────── */
  const keys = { p: 0, index: 0, t: 0, vel: 0, ids: SCENE_ORDER as SceneId[] };
  const cur = {
    pos: new THREE.Vector3(0, 1.05, 15.6),
    look: new THREE.Vector3(0, 1.25, 0),
    fov: 34,
    roll: 0,
    fog: 0.028,
  };
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let intro = reduce ? 1 : 0;
  let hover = -1;
  let paused = false;
  let raf = 0;
  let disposed = false;
  let dirty = true;
  const mtxS = new THREE.Matrix4();
  const vS = new THREE.Vector3();
  const vS2 = new THREE.Vector3();
  const eS = new THREE.Euler();
  const qS = new THREE.Quaternion();
  const sS = new THREE.Vector3();

  // adaptive quality: two quiet steps down, never back up (no pulsing)
  let qualityStep = 0;
  let frameAcc = 0;
  let frameCount = 0;

  /** Scene index of a DOM section, tolerant of sections that are not mounted yet. */
  const idxOf = (id: SceneId) => {
    const i = keys.ids.indexOf(id);
    if (i >= 0) return i;
    const base = SCENE_ORDER.indexOf(id);
    return (base * Math.max(1, keys.ids.length - 1)) / Math.max(1, SCENE_ORDER.length - 1);
  };

  function updateWorld(now: number, dt: number) {
    const cont = keys.index + keys.t;
    const pArrival = presence(cont, idxOf("arrival"), 1.6);
    const pDescend = presence(cont, idxOf("descent"));
    const pCore = presence(cont, idxOf("intelligence"));
    const pArch = presence(cont, idxOf("construction"));
    const pSys = presence(cont, idxOf("systems"));
    const pWorks = presence(cont, idxOf("works"));
    const pEnd = presence(cont, idxOf("contact"), 1.8);

    /* the mark forms on boot, holds, then tears apart as the camera moves on */
    const hold = smootherstep(1 - clamp01((cont - 0.05) / 0.8));
    const form = clamp01(intro) * (0.12 + 0.88 * hold);
    const scatter = clamp01((cont - 0.34) * 1.25);
    markMat.uniforms.uForm.value = form;
    markMat.uniforms.uScatter.value = Math.max(scatter, keys.vel * 0.18);
    markMat.uniforms.uOpacity.value = 0.22 + pArrival * 0.78;
    markPoints.visible = form > 0.02 || scatter < 0.98;
    markPoints.rotation.y = Math.sin(now * 0.06) * 0.045 + ptr.x * 0.05;
    markPoints.rotation.x = -ptr.y * 0.035;

    outroMat.uniforms.uForm.value = clamp01(intro) * smootherstep(pEnd);
    outroMat.uniforms.uScatter.value = 0;
    outroMat.uniforms.uOpacity.value = 0.1 + pEnd * 0.9;
    outroPoints.visible = pEnd > 0.02;
    outroPoints.rotation.y = Math.sin(now * 0.08) * 0.06;

    /* arrival structure */
    arrival.visible = pArrival + pDescend > 0.03;
    edgeMat.uniforms.uOpacity.value =
      0.16 + pArrival * 0.42 + pArch * 0.4 + pWorks * 0.5 * (hover >= 0 ? 1 : 0.25);
    keyLight.intensity = 1.0 + pArrival * 0.4 + pArch * 0.3;

    /* the core opens as the scene explains what is inside it */
    core.visible = pCore > 0.02;
    const reveal = smootherstep(pCore);
    coreMat.uniforms.uReveal.value = reveal;
    coreMat.uniforms.uOpacity.value = pCore * 0.95;
    shell.scale.setScalar(1 + reveal * 0.22);
    innerWireMat.opacity = reveal * 0.8;
    innerWire.scale.setScalar(0.84 + reveal * 0.24 + Math.sin(now * 0.5) * 0.012);
    innerWire.rotation.y = -now * 0.16;
    innerWire.rotation.x = now * 0.07;
    innerMat.opacity = 0.25 + reveal * 0.7;
    innerGlow.scale.setScalar(0.7 + reveal * 0.5 + Math.sin(now * 1.6) * 0.05);
    coreLight.intensity = 4 + reveal * 30;
    core.rotation.y = now * 0.07 + cont * 0.5;
    blades.rotation.y = -now * 0.12;
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i];
      r.rotation.z += dt * (0.1 + i * 0.07) * (i % 2 ? -1 : 1);
      r.rotation.x += dt * 0.028 * (i % 2 ? 1 : -1);
    }

    /* construction */
    arch.visible = pArch > 0.02;
    arch.rotation.y = Math.sin(now * 0.05) * 0.028 + ptr.x * 0.028;
    for (let i = 0; i < screens.length; i++) {
      const s = screens[i];
      const base = s.userData.base as { rotY: number; x: number; y: number };
      s.rotation.y = base.rotY + Math.sin(now * 0.35 + i) * 0.03 + ptr.x * 0.05;
      s.position.y = base.y + Math.sin(now * 0.4 + i * 1.7) * 0.045;
    }

    /* automation — the assembly IS the argument, so it is driven by the reader's scroll */
    systems.visible = pSys > 0.02;
    const gather = smootherstep(pSys);
    for (let i = 0; i < nodeN; i++) {
      const n = nodesNow[i];
      n.copy(nodeScattered[i]).lerp(nodeAssembled[i], gather);
      n.y += Math.sin(now * 0.7 + i) * 0.05 * gather;
      sS.setScalar(0.62 + gather * 0.5);
      mtxS.compose(n, qS.setFromEuler(eS.set(0.2 * gather, now * 0.2 + i, 0)), sS);
      nodeMesh.setMatrixAt(i, mtxS);
    }
    nodeMesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < links.length; i++) {
      const a = nodesNow[links[i][0]];
      const b = nodesNow[links[i][1]];
      linkPos[i * 6] = a.x;
      linkPos[i * 6 + 1] = a.y;
      linkPos[i * 6 + 2] = a.z;
      linkPos[i * 6 + 3] = b.x;
      linkPos[i * 6 + 4] = b.y;
      linkPos[i * 6 + 5] = b.z;
    }
    linkPosAttr.needsUpdate = true;
    linkMat.uniforms.uOpacity.value = gather * 0.9;
    linkMat.uniforms.uFlow.value = 0.6 + keys.vel * 3.6;
    nodeGlowMat.uniforms.uOpacity.value = gather * 0.75;
    systems.rotation.y = now * 0.03;

    /* works */
    works.visible = pWorks > 0.02;
    works.rotation.y = Math.sin(now * 0.07) * 0.022 + ptr.x * 0.04;
    works.rotation.x = -ptr.y * 0.025;
    for (let i = 0; i < mounts.length; i++) {
      const m = mounts[i];
      m.glow = damp(m.glow, hover === i ? 1 : 0, 6, dt);
      const g = m.glow * (0.3 + pWorks * 0.7);
      m.mesh.scale.setScalar(1 + g * 0.03);
      m.halo.scale.setScalar(1 + g * 0.045);
    }

    dustMat.uniforms.uOpacity.value = 0.26 + pDescend * 0.3 + pEnd * 0.2;
    dust.rotation.y = now * 0.008;
    gridMat.uniforms.uOpacity.value = 0.28 + pDescend * 0.34 + pArch * 0.3 + pWorks * 0.22;
    // the void itself warms and cools along the run
    scene.fog instanceof THREE.FogExp2 && voidColor.lerp(toColor(ART.volt), 0.0008 * pSys);
  }

  function renderFrame(now: number, dt: number) {
    const k = cameraAt(keys.index, keys.t, keys.p, keys.ids);
    cur.pos.x = damp(cur.pos.x, k.pos.x, 6.5, dt);
    cur.pos.y = damp(cur.pos.y, k.pos.y, 6.5, dt);
    cur.pos.z = damp(cur.pos.z, k.pos.z, 7.6, dt);
    cur.look.x = damp(cur.look.x, k.look.x, 6.2, dt);
    cur.look.y = damp(cur.look.y, k.look.y, 6.2, dt);
    cur.look.z = damp(cur.look.z, k.look.z, 6.2, dt);
    // a little FOV breathing on fast scroll reads as speed, not as a zoom control
    cur.fov = damp(cur.fov, k.fov + keys.vel * 2.4, 5.2, dt);
    cur.roll = damp(cur.roll, k.roll, 4.4, dt);
    cur.fog = damp(cur.fog, k.fog, 3.0, dt);
    ptr.x = damp(ptr.x, ptr.tx, 3.2, dt);
    ptr.y = damp(ptr.y, ptr.ty, 3.2, dt);

    const life = reduce ? 0 : 1;
    vS.set(
      cur.pos.x + ptr.x * 0.6 + (Math.sin(now * 0.21) * 0.085 + Math.sin(now * 0.07) * 0.05) * life,
      cur.pos.y - ptr.y * 0.32 + Math.cos(now * 0.17) * 0.05 * life,
      cur.pos.z
    );
    camera.position.copy(vS);
    camera.up.set(Math.sin(cur.roll + ptr.x * 0.012), Math.cos(cur.roll), 0);
    vS2.set(cur.look.x + ptr.x * 0.18, cur.look.y - ptr.y * 0.1, cur.look.z);
    camera.lookAt(vS2);
    if (Math.abs(camera.fov - cur.fov) > 0.008) {
      camera.fov = cur.fov;
      camera.updateProjectionMatrix();
    }
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = cur.fog;

    markMat.uniforms.uTime.value = now;
    outroMat.uniforms.uTime.value = now;
    dustMat.uniforms.uTime.value = now;
    coreMat.uniforms.uTime.value = now * 0.42;
    edgeMat.uniforms.uTime.value = now;
    gridMat.uniforms.uTime.value = now;
    linkMat.uniforms.uTime.value = now;
    nodeGlowMat.uniforms.uTime.value = now;
    grade.uniforms.uTime.value = now;
    grade.uniforms.uAberr.value = 0.0016 + keys.vel * 0.012;
    bloom.strength = Math.min(1.1, q.bloomStrength * (1 + keys.vel * 0.26));
    grade.uniforms.uBloom.value = bloom.strength;

    updateWorld(now, dt);
    composer.render();
  }

  /* ── loop ───────────────────────────────────────────────────────────────── */
  const clockStart = performance.now();
  let last = clockStart;
  function loop(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(loop);
    if (paused || document.hidden) return;
    const dt = Math.min(0.05, Math.max(0.0005, (now - last) / 1000));
    last = now;
    const t = (now - clockStart) / 1000;
    // in reduced-motion mode nothing animates on its own: we render only when input changed
    if (reduce && !dirty) return;
    renderFrame(t, dt);
    dirty = false;

    if (!reduce) {
      frameAcc += dt;
      frameCount++;
      if (frameCount >= 72) {
        const avg = frameAcc / frameCount;
        frameAcc = 0;
        frameCount = 0;
        if (avg > 0.0215 && qualityStep < 2) {
          qualityStep++;
          if (qualityStep === 1) {
            const next = Math.max(1, dpr * 0.8);
            renderer.setPixelRatio(next);
            composer.setPixelRatio(next);
            markMat.uniforms.uDpr.value = next;
            outroMat.uniforms.uDpr.value = next;
            dustMat.uniforms.uDpr.value = next;
            nodeGlowMat.uniforms.uDpr.value = next;
            grade.uniforms.uGrain.value = 0;
          } else {
            bloom.strength *= 0.6;
            nodeGlow.visible = false;
            floor.visible = false;
            // thin the point budget instead of dropping frames
            markGeo.setDrawRange(0, Math.floor(markGeo.attributes.position.count * 0.6));
          }
        }
      }
    }
  }

  /* ── events ─────────────────────────────────────────────────────────────── */
  let resizeQueued = false;
  const onResize = () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      if (disposed) return;
      size.w = window.innerWidth;
      size.h = window.innerHeight;
      camera.aspect = size.w / Math.max(1, size.h);
      camera.updateProjectionMatrix();
      renderer.setSize(size.w, size.h, false);
      composer.setSize(size.w, size.h);
      bloom.setSize(
        Math.max(2, Math.floor(size.w * q.bloomScale)),
        Math.max(2, Math.floor(size.h * q.bloomScale))
      );
      dirty = true;
    });
  };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onVisibility = () => {
    if (!document.hidden) {
      last = performance.now();
      dirty = true;
      opts.onStatus?.("live");
    } else {
      opts.onStatus?.("idle");
    }
  };
  const onContextLost = (e: Event) => {
    e.preventDefault();
    paused = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    opts.onStatus?.("lost");
  };
  const onContextRestored = () => {
    paused = false;
    last = performance.now();
    dirty = true;
    if (!reduce && !raf) raf = requestAnimationFrame(loop);
    opts.onStatus?.("live");
  };
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  if (!opts.coarse) window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost as EventListener, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored as EventListener, false);

  if (reduce) renderFrame(0, 0.016);
  else raf = requestAnimationFrame(loop);

  return {
    setScroll(s) {
      keys.p = s.p;
      keys.index = s.index;
      keys.t = s.t;
      keys.vel = s.vel;
      if (s.ids?.length) keys.ids = s.ids;
      dirty = true;
    },
    setPointer(x, y) {
      ptr.tx = x;
      ptr.ty = y;
    },
    setIntro(v) {
      intro = clamp01(v);
      dirty = true;
    },
    setHover(i) {
      hover = i;
      dirty = true;
    },
    setPaused(v) {
      paused = v;
      dirty = true;
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost as EventListener);
      canvas.removeEventListener("webglcontextrestored", onContextRestored as EventListener);
      envRT.dispose();
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          /* already released */
        }
      }
      try {
        composer.dispose();
      } catch {
        /* older three signature */
      }
      renderer.dispose();
      scene.clear();
    },
  };
}
