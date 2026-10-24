/**
 * STILLEDEV — cinematic timeline engine (pure, framework-free, unit-testable).
 *
 * Model (borrowed from production scroll-3D practice):
 *
 *   scroll position → normalized scene progress → camera/object/material state → render frame
 *
 * Scroll is treated as an INPUT signal, never as an animation engine. Every state the
 * renderer uses is a deterministic function of that signal, which is what makes reverse
 * scrolling, fast flicks, resizes and address-bar collapses behave correctly: the same
 * scroll offset always produces the same frame.
 *
 * Camera keyframes are anchored to the *measured* position of each DOM scene rather than
 * hand-tuned percentages, so the film stays in sync with the layout on every viewport.
 */

export type Vec3 = { x: number; y: number; z: number };
export type SceneId =
  | "arrival"
  | "descent"
  | "intelligence"
  | "construction"
  | "systems"
  | "works"
  | "contact";

/** Ordered journey. `scene` ties a camera chapter to a DOM section id. */
export const SCENE_ORDER: SceneId[] = [
  "arrival",
  "descent",
  "intelligence",
  "construction",
  "systems",
  "works",
  "contact",
];

export type CameraKey = {
  scene: SceneId;
  /** Camera position when this scene is centred in the viewport. */
  pos: Vec3;
  /** Look-at target. */
  look: Vec3;
  /** Vertical field of view in degrees. */
  fov: number;
  /** Cinematic roll in radians (banking through turns). */
  roll: number;
  /** Fog density — the atmosphere tightens and releases between scenes. */
  fog: number;
};

/**
 * One continuous world the camera flies through along -Z.
 * Objects in world.ts are placed to match these anchors.
 */
export const CAMERA_KEYS: Record<SceneId, CameraKey> = {
  arrival: {
    scene: "arrival",
    pos: { x: 0, y: 1.05, z: 15.6 },
    look: { x: 0, y: 1.25, z: 0 },
    fov: 34,
    roll: 0,
    fog: 0.028,
  },
  descent: {
    scene: "descent",
    pos: { x: -2.15, y: 2.35, z: 8.4 },
    look: { x: 0.35, y: 1.6, z: -1.2 },
    fov: 39,
    roll: 0.024,
    fog: 0.021,
  },
  intelligence: {
    scene: "intelligence",
    pos: { x: 3.05, y: 2.05, z: 1.35 },
    look: { x: -0.15, y: 2.3, z: -6.4 },
    fov: 36,
    roll: -0.03,
    fog: 0.019,
  },
  construction: {
    scene: "construction",
    pos: { x: -3.6, y: 1.5, z: -6.4 },
    look: { x: 0.6, y: 1.7, z: -12.6 },
    fov: 42,
    roll: 0.026,
    fog: 0.016,
  },
  systems: {
    scene: "systems",
    pos: { x: 2.3, y: 3.35, z: -13.6 },
    look: { x: -0.25, y: 2.35, z: -19.4 },
    fov: 38,
    roll: -0.02,
    fog: 0.018,
  },
  works: {
    scene: "works",
    pos: { x: -1.45, y: 2.0, z: -21.4 },
    look: { x: 0.9, y: 2.1, z: -27.6 },
    fov: 40,
    roll: 0.014,
    fog: 0.015,
  },
  contact: {
    scene: "contact",
    pos: { x: 0, y: 1.6, z: -30.2 },
    look: { x: 0, y: 1.9, z: -36.4 },
    fov: 33,
    roll: 0,
    fog: 0.026,
  },
};

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Cubic smoothstep — used for in-between easing of keyframes. */
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/**
 * Quintic smoothstep (Perlin's improved curve): zero first AND second derivative at both
 * ends, so a camera never "snaps" when it crosses a keyframe boundary.
 */
export const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/**
 * Frame-rate independent damping. `rate` ≈ how fast we approach the target.
 * Exponential, so 30fps and 144fps feel identical.
 */
export const damp = (current: number, target: number, rate: number, dt: number) =>
   target + (current - target) * Math.exp(-rate * dt);

export const mixVec3 = (a: Vec3, b: Vec3, t: number): Vec3 => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
});

/**
 * Where the viewport centre sits inside the journey.
 * `centers` are normalized (0..1) positions of each scene's centre.
 *
 * Returns the segment index and its local 0..1 progress, plus a global 0..1 value.
 */
export type Journey = {
  /** 0..1 across the whole journey (clamped). */
  p: number;
  /** Index into the keyframe list of the segment we are inside. */
  index: number;
  /** Local progress within that segment. */
  t: number;
  /** True when the journey anchor list is not usable yet (first paint / hidden DOM). */
  pending: boolean;
};

export function journeyAt(scrollY: number, viewport: number, anchors: number[]): Journey {
  if (!anchors || anchors.length < 2) {
    return { p: 0, index: 0, t: 0, pending: true };
  }
  const start = anchors[0];
  const end = anchors[anchors.length - 1];
  const span = Math.max(1, end - start);
  const p = clamp01((scrollY + viewport * 0.5 - start) / span);

  // anchors are monotonically increasing → find the bracketing pair
  let index = 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (scrollY + viewport * 0.5 >= anchors[i]) index = i;
  }
  index = clamp(index, 0, anchors.length - 2);

  const a = anchors[index];
  const b = anchors[index + 1];
  const t = clamp01((scrollY + viewport * 0.5 - a) / Math.max(1, b - a));
  return { p, index, t, pending: false };
}

export type CameraState = {
  pos: Vec3;
  look: Vec3;
  fov: number;
  roll: number;
  fog: number;
  /** Which scene owns the frame right now (for DOM chrome + grading). */
  scene: SceneId;
  /** 0..1 — how far the journey has come, for global grading. */
  p: number;
};

/**
 * Deterministic camera solve for a scene index + local progress.
 * `overshoot` shapes the ease so entry/exit of each chapter feels weighted rather than linear.
 */
export function cameraAt(index: number, t: number, p: number, scenes: SceneId[] = SCENE_ORDER): CameraState {
  const keys = scenes.map((s) => CAMERA_KEYS[s]);
  const i = clamp(index, 0, keys.length - 2);
  const a = keys[i];
  const b = keys[i + 1];
  const e = smootherstep(t);
  // roll peaks mid-segment: the camera banks into the turn and settles out of it
  const bank = Math.sin(Math.PI * clamp01(t));
  return {
    pos: mixVec3(a.pos, b.pos, e),
    look: mixVec3(a.look, b.look, e),
    fov: lerp(a.fov, b.fov, e),
    roll: lerp(a.roll, b.roll, e) * 0.4 + (b.roll - a.roll) * 0.9 * bank,
    fog: lerp(a.fog, b.fog, e),
    scene: t < 0.5 ? a.scene : b.scene,
    p,
  };
}

/**
 * A 0..1 "presence" curve for world objects: an object is fully present while its own
 * scene owns the frame, and stays half-alive in the adjacent scenes. That overlap is what
 * makes one continuous world instead of seven disconnected slides.
 *
 * `cont` is the continuous scene coordinate (`index + t`); `ownIndex` is the object's scene.
 */
export function presence(cont: number, ownIndex: number, spread = 1) {
  const d = Math.abs(cont - ownIndex);
  const inner = 0.5 * spread;
  if (d <= inner) return 1;
  return clamp01(1 - (d - inner) / (1.1 * spread));
}

/**
 * Framing helper: how wide the visible frustum is at the arrival camera. The logotype's world
 * width is derived from this so the mark fills the frame on a 32:9 monitor *and* fits a phone
 * in portrait, instead of being authored for one viewport and overflowing the others.
 */
export function visibleWidthAt(key: CameraKey, aspect: number) {
  const dz = key.pos.z;
  const half = Math.tan(((key.fov * Math.PI) / 180) / 2) * Math.abs(dz);
  return Math.max(1, half * 2 * (aspect > 0 ? aspect : 1));
}

/** World-space width for a mark that should occupy ~78% of the frame, clamped for sanity. */
export function markWidthFor(aspect: number) {
  const visible = visibleWidthAt(CAMERA_KEYS.arrival, aspect);
  return clamp(visible * 0.78, 4.2, 13.2);
}
