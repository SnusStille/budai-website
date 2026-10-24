/**
 * BudAI neural scene — pure geometry + camera math.
 *
 * No DOM, no WebGL: everything here is deterministic and unit-testable in Node.
 * The renderer (NeuralCinema) owns the GPU; this module only builds buffers.
 *
 * Design notes
 * ------------
 * The world is a single continuous space (not separate scenes), so one camera can
 * fly through it without cuts:
 *
 *   1. CORE   — an organic, folded, two-lobed neuron shell (brain-inspired) at the origin.
 *   2. WEB    — a looser outer network around the core (depth, "atmosphere").
 *   3. FIELD  — a long deep-field chamber that starts inside the core and recedes
 *               towards -Z, so entering the core means travelling *through* it.
 *   4. FOCUS  — a dense luminous cluster far down the chamber: the destination.
 *
 * Techniques adapted from the references we audited (all MIT / public domain):
 *   - fibonacci-sphere point sampling + additive sprite glow  → Neuralis, threejs-brain
 *   - anatomical two-lobe/fold silhouette vocabulary          → alexgarbi10/threejs
 *   - scroll-scrubbed camera along a spline of keyframes      → jasc66/scroll-flyover
 * All code below is written for this codebase, no source was copied.
 */

export type Vec3 = [number, number, number];

export type SceneBuffers = {
  /** interleaved point streams */
  pointPos: Float32Array;
  pointColor: Float32Array;
  pointSize: Float32Array;
  pointSeed: Float32Array;
  pointCount: number;
  /** interleaved line streams (2 vertices per segment) */
  linePos: Float32Array;
  lineColor: Float32Array;
  lineAlpha: Float32Array;
  lineCount: number;
};

/* ------------------------------------------------------------------ noise */

/** Deterministic PRNG (mulberry32) so the scene is identical on every load. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cheap organic wobble: sum of a few sine harmonics, no noise tables needed. */
function wobble(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 3.1 + y * 1.7) * 0.5 +
    Math.sin(y * 4.3 - z * 2.1) * 0.3 +
    Math.sin(z * 5.7 + x * 2.9) * 0.2
  );
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Unit vector on a fibonacci sphere for index i of n. */
function fib(i: number, n: number): Vec3 {
  const y = 1 - (i / Math.max(1, n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const t = GOLDEN * i;
  return [Math.cos(t) * r, y, Math.sin(t) * r];
}

/* --------------------------------------------------------------- palette */

// Slightly above 1.0 so additive blending can reach the bloom-like top end.
const CYAN: Vec3 = [0.0, 0.92, 1.05];
const TEAL: Vec3 = [0.18, 0.85, 0.75];
const VIOLET: Vec3 = [0.52, 0.36, 1.06];
const ICE: Vec3 = [0.72, 0.9, 1.0];

function mix(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/* ------------------------------------------------------------- the shell */

/**
 * One folded hemisphere. Returns a point on its surface.
 * The silhouette reads as an organ rather than a ball: two lobes with a fissure,
 * longitudinal gyri, a flatter underside and a longer front-to-back axis.
 */
function lobePoint(dir: Vec3, side: -1 | 1): Vec3 {
  const [dx, dy, dz] = dir;

  // gyri: radial folds that follow the brain's long axis
  const az = Math.atan2(dy, dz);
  const pol = Math.atan2(dx, dy);
  const folds =
    Math.sin(az * 8.0) * 0.062 +
    Math.sin(pol * 11.0 + dz * 3.4) * 0.036 +
    Math.sin((az + pol) * 17.0) * 0.014 +
    wobble(dx * 1.7, dy * 1.7, dz * 1.7) * 0.028;
  const r = 1 + folds;

  // hemispheres, with a deep central fissure that closes towards the crown
  const gap = Math.max(0, 0.9 - Math.abs(dy + 0.05)) * 0.05;
  let x = dx * r * 0.93 + side * (0.055 + gap);
  let y = dy * r * 0.82;
  let z = dz * r * 1.1;

  // flatter underside, rounder crown, slight frontal bulge
  if (y < -0.3) y = -0.3 + (y + 0.3) * 0.5;
  if (y > 0.55) y = 0.55 + (y - 0.55) * 0.8;
  if (z > 0.45) z += (z - 0.45) * 0.12;

  return [x, y, z];
}

/** Approximate brain silhouette, in world units (long axis ~3.4). */
function brainPoint(dir: Vec3): Vec3 {
  const side: -1 | 1 = dir[0] < 0 ? -1 : 1;
  const p = lobePoint(dir, side);
  return [p[0] * 1.55, p[1] * 1.55, p[2] * 1.55];
}

/* ------------------------------------------------------------- builders */

type PointSink = {
  pos: number[];
  col: number[];
  size: number[];
  seed: number[];
};
type LineSink = { pos: number[]; col: number[]; alpha: number[] };

function pushPoint(s: PointSink, p: Vec3, c: Vec3, size: number, seed: number) {
  s.pos.push(p[0], p[1], p[2]);
  s.col.push(c[0], c[1], c[2]);
  s.size.push(size);
  s.seed.push(seed);
}

function pushLine(s: LineSink, a: Vec3, b: Vec3, c: Vec3, alpha: number) {
  s.pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  s.col.push(c[0], c[1], c[2], c[0], c[1], c[2]);
  s.alpha.push(alpha, alpha * 0.15);
}

/**
 * Synapses: connect each neuron to a couple of nearby neurons.
 * Neighbour search is done against a coarse sample, which keeps this O(n·k)
 * instead of O(n²) and produces pleasantly irregular wiring.
 */
function connect(
  lines: LineSink,
  points: Vec3[],
  colors: Vec3[],
  candidates: number[],
  perNode: number,
  maxDist: number,
  rand: () => number
) {
  for (let i = 0; i < points.length; i++) {
    if (rand() > 0.72) continue; // not every neuron is wired — looks more organic
    const p = points[i];
    let made = 0;
    for (let c = 0; c < candidates.length && made < perNode; c++) {
      const j = candidates[(c + (i * 7) % candidates.length) % candidates.length];
      if (j === i) continue;
      const q = points[j];
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const dz = q[2] - p[2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > maxDist * maxDist || d2 < 0.004) continue;
      const dist = Math.sqrt(d2);
      const t = 1 - dist / maxDist;
      // long wires are dimmer: a 1.5-unit line at full alpha reads as a laser beam
      const fade = Math.min(1, 0.42 / Math.max(dist, 0.15));
      pushLine(lines, p, q, mix(colors[i], colors[j], 0.5), (0.1 + t * 0.22) * fade);
      made++;
    }
  }
}

export type BuildOptions = {
  /** 0.35 = low-end mobile, 1 = desktop, 1.3 = large screens */
  quality?: number;
  /** hero framing never flies into the chamber, so we skip its buffers */
  deep?: boolean;
};

export function buildScene({ quality = 1, deep = true }: BuildOptions = {}): SceneBuffers {
  const q = Math.max(0.25, Math.min(1.5, quality));
  const rand = rng(1337);
  const pts: PointSink = { pos: [], col: [], size: [], seed: [] };
  const lines: LineSink = { pos: [], col: [], alpha: [] };

  /* --- 1. core: folded two-lobed neuron shell ----------------------------- */
  const shellN = Math.round(1500 * q);
  const shellPts: Vec3[] = [];
  const shellCols: Vec3[] = [];
  for (let i = 0; i < shellN; i++) {
    const dir = fib(i, shellN);
    // some points sit just under the surface: the organ has volume, not a film
    const inner = rand() < 0.26;
    const shrink = inner ? 0.62 + rand() * 0.3 : 1 - Math.pow(rand(), 3) * 0.1;
    const p = brainPoint(dir);
    const pos: Vec3 = [p[0] * shrink, p[1] * shrink, p[2] * shrink];
    const t = rand();
    const col = inner
      ? mix(VIOLET, TEAL, rand() * 0.6)
      : mix(mix(CYAN, VIOLET, t * 0.8), ICE, Math.pow(rand(), 4) * 0.95);
    shellPts.push(pos);
    shellCols.push(col);
    pushPoint(pts, pos, col, inner ? 0.35 + rand() * 0.4 : 0.5 + rand() * 0.8, rand());
  }

  // brainstem: short and tapered, dropping from the centre. Kept sparse and
  // slightly jittered — a tight run of points on a smooth curve reads as a laser
  // beam, not as tissue.
  const stemN = Math.round(70 * q);
  for (let i = 0; i < stemN; i++) {
    const t = i / stemN;
    const p: Vec3 = [
      Math.sin(t * 2.0) * 0.12 + (rand() - 0.5) * 0.09,
      -0.95 - t * 0.5,
      0.1 + t * 0.3 + Math.cos(t * 3.1) * 0.06 + (rand() - 0.5) * 0.07,
    ];
    const col = mix(TEAL, CYAN, t);
    pushPoint(pts, p, col, 0.3 + rand() * 0.35, rand());
    shellPts.push(p);
    shellCols.push(col);
  }

  // cerebellum: two lateral bulbs with folia (fine horizontal ridges)
  const cerebN = Math.round(430 * q);
  for (let i = 0; i < cerebN; i++) {
    const dir = fib(i, cerebN);
    const folia = Math.sin(dir[1] * 26.0) * 0.035;
    const r = 0.78 + folia + rand() * 0.05;
    const p: Vec3 = [
      dir[0] * r * 1.02,
      -0.78 + dir[1] * r * 0.5,
      -0.92 + dir[2] * r * 0.86,
    ];
    const col = mix(VIOLET, TEAL, rand() * 0.45);
    pushPoint(pts, p, col, 0.4 + rand() * 0.5, rand());
    shellPts.push(p);
    shellCols.push(col);
  }

  // corpus callosum: an internal arc bridging the hemispheres
  const callN = Math.round(150 * q);
  for (let i = 0; i < callN; i++) {
    const a = -Math.PI * 0.42 + (i / callN) * Math.PI * 0.84;
    const p: Vec3 = [Math.sin(a) * 0.62, -0.05 + Math.cos(a) * 0.42, Math.sin(a * 1.6) * 0.3];
    const col = mix(ICE, CYAN, rand() * 0.5);
    pushPoint(pts, p, col, 0.3 + rand() * 0.35, rand());
    shellPts.push(p);
    shellCols.push(col);
  }

  // the nucleus: a small, very bright cluster at the centre of the organ.
  // It is what the camera "arrives" at, and it brightens while the AI works.
  const nucleusN = Math.round(90 * q);
  for (let i = 0; i < nucleusN; i++) {
    const dir = fib(i, nucleusN);
    const r = Math.pow(rand(), 0.55) * 0.42;
    const p: Vec3 = [dir[0] * r, dir[1] * r * 0.8, dir[2] * r];
    pushPoint(pts, p, mix(ICE, CYAN, rand() * 0.4), 0.7 + rand() * 0.9, rand());
    shellPts.push(p);
    shellCols.push(mix(ICE, CYAN, 0.5));
  }

  // the heart: a few oversized additive sprites. In the shader their size clamps
  // high, so they render as soft luminous discs — this is what bloom latches onto.
  pushPoint(pts, [0, 0, 0], ICE, 13, 0.1);
  pushPoint(pts, [0.05, 0.02, 0.04], CYAN, 7, 0.2);
  pushPoint(pts, [-0.07, -0.03, 0.02], VIOLET, 5.5, 0.3);

  const shellCandidates = shellPts.map((_, i) => i).filter((i) => i % 3 === 0);
  connect(lines, shellPts, shellCols, shellCandidates, 2, 0.4, rand);

  // Radiance from the nucleus. Kept few and very faint on purpose: a full spoke
  // wheel turns the core back into a starburst, and the spokes that point at the
  // camera render as hard straight lines cutting across the whole organ.
  for (let i = 0; i < Math.round(22 * q); i++) {
    const dir = fib(i, 22);
    const a: Vec3 = [0, 0, 0];
    const b: Vec3 = [dir[0] * 0.85, dir[1] * 0.7, dir[2] * 0.85];
    pushLine(lines, a, b, mix(ICE, CYAN, rand()), 0.03 + rand() * 0.03);
  }

  /* --- 2. web: looser outer network -------------------------------------- */
  const webN = Math.round(720 * q);
  const webPts: Vec3[] = [];
  const webCols: Vec3[] = [];
  for (let i = 0; i < webN; i++) {
    const dir = fib(i, webN);
    const r = 2.05 + Math.pow(rand(), 0.7) * 1.9;
    const p: Vec3 = [
      dir[0] * r * 1.12,
      dir[1] * r * 0.86 + 0.15,
      dir[2] * r * 1.18,
    ];
    const col = mix(mix(VIOLET, CYAN, rand()), ICE, Math.pow(rand(), 5));
    webPts.push(p);
    webCols.push(col);
    pushPoint(pts, p, col, 0.35 + rand() * 0.55, rand());
  }
  const webCandidates = webPts.map((_, i) => i).filter((i) => i % 4 === 0);
  connect(lines, webPts, webCols, webCandidates, 1, 0.95, rand);

  /* --- 3. dust: ambient motes, sells depth even in the hero --------------- */
  const dustN = Math.round(520 * q);
  for (let i = 0; i < dustN; i++) {
    const dir = fib(i, dustN);
    const r = 3.4 + rand() * 7;
    const p: Vec3 = [dir[0] * r, dir[1] * r * 0.8, dir[2] * r - 1.5];
    const col = mix(CYAN, ICE, rand() * 0.8);
    pushPoint(pts, p, col, 0.22 + rand() * 0.4, rand());
  }

  /* --- 4. deep field chamber (skipped in hero mode) ----------------------- */
  if (deep) {
    // The chamber is a tunnel, not a box: density is highest around the axis close
    // to the far end, so travelling down it feels like approaching something.
    const fieldN = Math.round(1750 * q);
    const fieldPts: Vec3[] = [];
    const fieldCols: Vec3[] = [];
    for (let i = 0; i < fieldN; i++) {
      const t = Math.pow(rand(), 0.62); // biased towards the far end
      const z = -1.6 - t * 21.5;
      // radius shrinks as we approach the destination → a funnel, not a corridor
      const maxR = 7.2 * (1 - t * 0.72) + 0.9;
      const radius = 0.75 + Math.pow(rand(), 0.75) * maxR;
      const ang = rand() * Math.PI * 2 + t * 2.4; // slow twist
      const p: Vec3 = [Math.cos(ang) * radius, Math.sin(ang) * radius * 0.82, z];
      const col = mix(mix(VIOLET, CYAN, rand() * 0.9), ICE, t * 0.35);
      fieldPts.push(p);
      fieldCols.push(col);
      pushPoint(pts, p, col, 0.28 + rand() * 0.55, rand());
    }
    // conduits: streaks along Z sell forward motion at every speed
    for (let i = 0; i < fieldN * 0.5; i++) {
      const src = fieldPts[Math.floor(rand() * fieldPts.length)];
      const len = 0.7 + rand() * 3.2;
      pushLine(
        lines,
        [src[0], src[1], src[2]],
        [src[0] * 0.97, src[1] * 0.97, src[2] - len],
        mix(CYAN, VIOLET, rand()),
        0.05 + rand() * 0.12
      );
    }

    // the destination: a living core — a dense bright nucleus, a halo shell,
    // two orbital rings and a few short neural filaments. Arrival must read as
    // "an intelligence", not as a starburst.
    const focusZ = -22.5;
    const R = 2.0;

    // the heart of the destination
    pushPoint(pts, [0, 0, focusZ], [0.45, 0.86, 1.0], 14, 0.1);
    pushPoint(pts, [0.1, 0.05, focusZ + 0.1], CYAN, 6, 0.2);
    pushPoint(pts, [-0.12, -0.06, focusZ - 0.05], VIOLET, 4, 0.3);

    // dense nucleus: biased hard towards the centre so it has a bright heart
    const focusN = Math.round(1000 * q);
    for (let i = 0; i < focusN; i++) {
      const dir = fib(i, focusN);
      const r = (0.08 + 0.92 * Math.pow(rand(), 2.1)) * R;
      const p: Vec3 = [dir[0] * r, dir[1] * r * 0.96, focusZ + dir[2] * r * 0.88];
      const heat = 1 - r / R; // hotter at the centre
      pushPoint(pts, p, mix(mix(CYAN, ICE, heat * 0.6), VIOLET, rand() * 0.25), 0.48 + heat * 1.25, rand());
    }

    // halo shell: a thin atmosphere around the nucleus
    for (let i = 0; i < Math.round(520 * q); i++) {
      const dir = fib(i, 420);
      const r = R * (1.5 + rand() * 0.55);
      const p: Vec3 = [dir[0] * r, dir[1] * r * 0.92, focusZ + dir[2] * r * 0.75];
      pushPoint(pts, p, mix(mix(VIOLET, ICE, 0.4), CYAN, 0.3), 0.3 + rand() * 0.5, rand());
    }

    // two orbital rings: the only "constructed" shapes in the whole scene, so the
    // core reads as something made by an intelligence
    for (const [ringR, tilt, alpha] of [
      [R * 1.32, 0.42, 0.85],
      [R * 1.78, -0.6, 0.6],
    ] as const) {
      const segs = 132;
      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = ((i + 1) / segs) * Math.PI * 2;
        const pt = (a: number): Vec3 => [
          Math.cos(a) * ringR,
          Math.sin(a) * ringR * Math.sin(tilt),
          focusZ + Math.sin(a) * ringR * Math.cos(tilt),
        ];
        pushLine(lines, pt(a0), pt(a1), mix(ICE, CYAN, 0.55), alpha * 0.9);
        if (i % 4 === 0) {
          const q0 = pt(a0);
          pushPoint(pts, q0, ICE, 0.5 + rand() * 0.35, rand());
        }
      }
    }

    // short filaments: neural hairs, kept close so they read as detail not spikes
    for (let i = 0; i < 90; i++) {
      const dir = fib(i, 90);
      const from: Vec3 = [dir[0] * R * 0.9, dir[1] * R * 0.86, focusZ + dir[2] * R * 0.8];
      const len = 0.35 + rand() * 0.55;
      const to: Vec3 = [
        dir[0] * R * 0.9 + dir[0] * len,
        dir[1] * R * 0.86 + dir[1] * len,
        focusZ + dir[2] * R * 0.8 - len * 0.4,
      ];
      pushLine(lines, from, to, mix(ICE, CYAN, rand()), 0.1 + rand() * 0.1);
    }
  }

  return {
    pointPos: new Float32Array(pts.pos),
    pointColor: new Float32Array(pts.col),
    pointSize: new Float32Array(pts.size),
    pointSeed: new Float32Array(pts.seed),
    pointCount: pts.size.length,
    linePos: new Float32Array(lines.pos),
    lineColor: new Float32Array(lines.col),
    lineAlpha: new Float32Array(lines.alpha),
    lineCount: lines.alpha.length,
  };
}

/* --------------------------------------------------------------- camera */

type Key = { at: number; pos: Vec3; target: Vec3; fov: number };

/**
 * The flight path. Chapter boundaries map to these keys:
 *   0.00 hero framing · 0.30 approach · 0.52 through the membrane
 *   0.72 inside the chamber · 1.00 arriving at the core
 */
const KEYS: Key[] = [
  // the subject sits slightly above centre so the chapter copy at the bottom of the
  // viewport never competes with the brightest part of the scene
  { at: 0.0, pos: [0.0, 0.42, 6.7], target: [0, -0.42, 0], fov: 52 },
  { at: 0.3, pos: [1.75, 1.05, 4.7], target: [0, -0.34, 0], fov: 54 },
  { at: 0.52, pos: [0.55, 0.2, 2.45], target: [0, -0.16, -0.3], fov: 58 },
  { at: 0.7, pos: [0.0, 0.06, 0.6], target: [0, 0.0, -6.0], fov: 64 },
  // through the chamber: the walls rush past, the nucleus grows
  { at: 0.86, pos: [0.0, 0.0, -8.0], target: [0, 0.02, -18.0], fov: 62 },
  // arrival: close enough that the nucleus fills the upper frame behind the CTA
  { at: 1.0, pos: [0.0, 0.16, -19.3], target: [0, -0.34, -22.5], fov: 53 },
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export type Camera = { pos: Vec3; target: Vec3; fov: number };

/** Interpolate the flight path. `p` is clamped to 0..1. */
export function sampleCamera(p: number): Camera {
  const t = clamp01(p);
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const span = Math.max(1e-6, b.at - a.at);
  const k = easeInOut(clamp01((t - a.at) / span));
  return {
    pos: [
      a.pos[0] + (b.pos[0] - a.pos[0]) * k,
      a.pos[1] + (b.pos[1] - a.pos[1]) * k,
      a.pos[2] + (b.pos[2] - a.pos[2]) * k,
    ],
    target: [
      a.target[0] + (b.target[0] - a.target[0]) * k,
      a.target[1] + (b.target[1] - a.target[1]) * k,
      a.target[2] + (b.target[2] - a.target[2]) * k,
    ],
    fov: a.fov + (b.fov - a.fov) * k,
  };
}

/** Which chapter (0..n-1) a progress value belongs to. */
export function chapterFor(p: number, chapters: number): number {
  const idx = Math.floor(clamp01(p) * chapters);
  return Math.min(chapters - 1, Math.max(0, idx));
}

/* ------------------------------------------------------------------ math */

export function perspective(fovDeg: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function lookAt(eye: Vec3, target: Vec3, up: Vec3 = [0, 1, 0]): Float32Array {
  let zx = eye[0] - target[0];
  let zy = eye[1] - target[1];
  let zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len;
  zy /= len;
  zz /= len;

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz) || 1;
  xx /= len;
  xy /= len;
  xz /= len;

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const out = new Float32Array(16);
  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[3] = 0;
  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[7] = 0;
  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
  return out;
}

export function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

/**
 * View-projection for a given progress plus a small pointer-driven parallax.
 * `bias` 0..1 fades the copy-avoiding vertical offset: the scroll chapter frames the
 * subject high so chapter text can sit under it, the hero frames it dead centre.
 */
export function viewProjection(
  p: number,
  aspect: number,
  pointer: { x: number; y: number },
  time: number,
  bias = 1
): Float32Array {
  const cam = sampleCamera(p);
  cam.target = [cam.target[0], cam.target[1] * bias, cam.target[2]];
  // parallax: orbit a few degrees around the target, damped by the pointer
  const yaw = pointer.x * 0.22 + Math.sin(time * 0.13) * 0.02;
  const pitch = -pointer.y * 0.14 + Math.sin(time * 0.17) * 0.012;

  const dx = cam.pos[0] - cam.target[0];
  const dz = cam.pos[2] - cam.target[2];
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const ox = dx * cosY - dz * sinY;
  const oz = dx * sinY + dz * cosY;

  const eye: Vec3 = [cam.target[0] + ox, cam.pos[1] + pitch * 0.9, cam.target[2] + oz];
  const view = lookAt(eye, cam.target);
  const proj = perspective(cam.fov, aspect, 0.05, 140);
  return multiply(proj, view);
}

export const _internal = { fib, brainPoint, rng, smoothstep };
