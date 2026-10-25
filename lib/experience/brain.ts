import { clamp, lerp, smooth } from "./timeline";

export type BrainMotion = { kind: "intro" | "hero" | "journey"; progress: number };
/** Absolute, reversible camera travel. Decorative pulse time never changes this pose. */
export function brainCameraAt({ kind, progress }: BrainMotion) {
  const p = clamp(progress);
  if (kind === "hero") return { x: 0, y: .25, z: 4.6, yaw: .24, tilt: .12 };
  if (kind === "intro") return { x: .06 * Math.sin(p * Math.PI), y: .25, z: lerp(4.9, 3.65, smooth(p)), yaw: lerp(-.12, .24, p), tilt: .12 };
  const travel = smooth(p);
  return { x: .16 * Math.sin(p * Math.PI * 2), y: lerp(.25, .03, travel), z: lerp(4.6, -2.8, travel), yaw: lerp(.24, -.09, travel), tilt: lerp(.12, -.025, travel) };
}
export function brainJourneyProgress(y: number, top: number, height: number, viewport: number) {
  return clamp((y - top) / Math.max(1, height - viewport));
}
