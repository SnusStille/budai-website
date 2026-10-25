import { clamp, lerp, smooth } from "./timeline";

export type BrainMotion = { kind: "intro" | "hero" | "journey"; progress: number; entry?: number };
export const BRAIN_STORY_ORIGIN = -6.25;
export const PLAYGROUND_PLANE_Z = -22;
export const HERO_POSE = { x: 0, y: 0.25, z: BRAIN_STORY_ORIGIN + 4.6, yaw: 0.10, tilt: 0.10 } as const;

export function originalStageAt(progress: number) {
  return Math.min(3, Math.floor(clamp((progress - 0.075) / 0.55) * 4));
}

/**
 * Absolute, C1-continuous camera poses across intro → hero → journey.
 * At intro(1), hero(0), and journey(0), world pose is HERO_POSE (z = -1.65)
 * and brain offset is BRAIN_STORY_ORIGIN (-6.25), giving local distance +4.6.
 */
export function brainCameraAt({ kind, progress }: BrainMotion) {
  const p = clamp(progress);
  if (kind === "hero") {
    return { x: 0, y: HERO_POSE.y, z: HERO_POSE.z, yaw: HERO_POSE.yaw, tilt: HERO_POSE.tilt };
  }
  if (kind === "intro") {
    const travel = smooth(clamp((p - 0.06) / 0.84));
    const settle = smooth(p);
    return {
      x: 0.08 * Math.sin(p * Math.PI),
      y: lerp(0.22, HERO_POSE.y, settle),
      z: lerp(4.9, HERO_POSE.z, travel),
      yaw: lerp(-0.14, HERO_POSE.yaw, settle),
      tilt: lerp(0.14, HERO_POSE.tilt, settle),
    };
  }
  const beats = [
    { at: 0, z: 4.6, y: 0.25, yaw: 0.10, tilt: 0.10 },
    { at: 0.25, z: 3.6, y: 0.22, yaw: -0.14, tilt: 0.13 },
    { at: 0.56, z: 0.62, y: 0.13, yaw: 0.04, tilt: 0.06 },
    { at: 0.80, z: -1.2, y: 0.06, yaw: 0, tilt: 0 },
    { at: 1, z: -2.8, y: 0.03, yaw: 0, tilt: 0 },
  ];
  let i = 0;
  while (i < beats.length - 2 && p > beats[i + 1].at) i++;
  const a = beats[i], b = beats[i + 1], t = smooth((p - a.at) / (b.at - a.at));
  return {
    x: 0.04 * Math.sin(p * Math.PI * 2),
    y: lerp(a.y, b.y, t),
    z: BRAIN_STORY_ORIGIN + lerp(a.z, b.z, t),
    yaw: lerp(a.yaw, b.yaw, t),
    tilt: lerp(a.tilt, b.tilt, t),
  };
}

/** Only the canonical neural brain; branding is never a render target for this scene. */
export function brainVisualAt(motion: BrainMotion) {
  if (motion.kind === "intro") {
    const p = clamp(motion.progress);
    const travel = smooth(clamp((p - 0.06) / 0.84));
    const dip = 1.35 * Math.sin(p * Math.PI);
    return {
      offset: lerp(0, BRAIN_STORY_ORIGIN, travel) + dip,
      neural: 0.22 * Math.sin(p * Math.PI),
      focus: -1,
      cortex: 1,
    };
  }
  if (motion.kind === "hero") {
    return { offset: BRAIN_STORY_ORIGIN, neural: 0, focus: -1, cortex: 1 };
  }
  return {
    offset: BRAIN_STORY_ORIGIN,
    neural: smooth((motion.progress - 0.58) / 0.25),
    focus: motion.progress < 0.67 ? originalStageAt(motion.progress) : -1,
    cortex: 1 - smooth((motion.progress - 0.67) / 0.3),
  };
}

export function brainJourneyProgress(y: number, top: number, height: number, viewport: number) {
  return clamp((y - top) / Math.max(1, height - viewport));
}

/** Stable target: lens changes, never framebuffers on every scroll tick. */
export function brainFovAt(motion: BrainMotion | undefined, height: number, mobile: boolean) {
  if (motion?.kind !== "journey") return mobile ? 1.35 : 0.87;
  return 0.87;
}

export function playgroundArrivalAt(progress: number) {
  return smooth((progress - 0.68) / 0.32);
}

/** The real console's perspective comes from the SAME camera distance, not a timer. */
export function playgroundProjectionAt(progress: number) {
  const camera = brainCameraAt({ kind: "journey", progress, entry: 1 });
  const distance = camera.z - PLAYGROUND_PLANE_Z;
  const finalDistance = brainCameraAt({ kind: "journey", progress: 1 }).z - PLAYGROUND_PLANE_Z;
  return { depth: Math.max(0, (distance / finalDistance - 1) * 1400), tilt: (1 - playgroundArrivalAt(progress)) * 1.8 };
}
