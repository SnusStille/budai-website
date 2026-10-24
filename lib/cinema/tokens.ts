/**
 * STILLEDEV — art direction tokens shared by the WebGL world and the CSS.
 *
 * Colors are authored in OKLCH (perceptually uniform, so "same lightness" *looks* the same
 * across hues) and converted to sRGB for three.js at runtime. The CSS layer reads the same
 * values through the custom properties defined in app/globals.css, which keeps the film and
 * the interface on one palette instead of two approximations of one.
 */

/** Björn Ottosson's OKLab → linear sRGB, then the sRGB OETF. Public-domain math. */
export function oklchToRgb([L, C, h]: [number, number, number]): [number, number, number] {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const oetf = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  const cl = (x: number) => Math.min(1, Math.max(0, x));
  return [cl(oetf(r)), cl(oetf(g)), cl(oetf(bl))];
}

export const oklchCss = (L: number, C: number, h: number) => `oklch(${L} ${C} ${h})`;

type Ok = [number, number, number];

export const ART = {
  /** The void the film is projected into. */
  void: [0.115, 0.021, 258] as Ok,
  /** Deep graphite used for structure bodies. */
  graphite: [0.22, 0.016, 255] as Ok,
  /** Cold silver — the brand's primary surface tone. */
  silver: [0.9, 0.008, 230] as Ok,
  /** Signal blue — the single accent. Everything else stays achromatic. */
  signal: [0.76, 0.13, 222] as Ok,
  /** Deeper electric blue for the far end of gradients. */
  volt: [0.55, 0.185, 258] as Ok,
  /** Aurora teal, only ever a minority colour (light bleeding through glass). */
  bleed: [0.82, 0.1, 186] as Ok,
  /** Rare copper ember — reserved for "live/now" marks. Never decorative. */
  ember: [0.79, 0.13, 68] as Ok,
};

export type Quality = {
  /** Dots forming the STILLEDEV light installation. */
  markPoints: number;
  /** Ambient dust in the near field. */
  dustPoints: number;
  /** Slabs in the data-architecture forest. */
  slabs: number;
  /** Nodes in the automation lattice. */
  latticeNodes: number;
  /** Icosahedron subdivisions for the AI core. */
  coreDetail: number;
  /** Device pixel ratio ceiling. */
  dpr: number;
  /** Bloom resolution scale. */
  bloomScale: number;
  bloomStrength: number;
  /** Physically-shaded glass on the monolith. Expensive: high tier only. */
  glass: boolean;
  /** Grain + chromatic aberration in the grade pass. */
  grain: boolean;
};

export const QUALITY: Record<"high" | "medium" | "low", Quality> = {
  high: {
    markPoints: 26000,
    dustPoints: 2600,
    slabs: 190,
    latticeNodes: 46,
    coreDetail: 48,
    dpr: 1.85,
    bloomScale: 1,
    bloomStrength: 0.62,
    glass: true,
    grain: true,
  },
  medium: {
    markPoints: 14000,
    dustPoints: 1500,
    slabs: 110,
    latticeNodes: 30,
    coreDetail: 24,
    dpr: 1.5,
    bloomScale: 0.75,
    bloomStrength: 0.58,
    glass: false,
    grain: true,
  },
  low: {
    markPoints: 6500,
    dustPoints: 700,
    slabs: 54,
    latticeNodes: 18,
    coreDetail: 12,
    dpr: 1.25,
    bloomScale: 0.5,
    bloomStrength: 0.5,
    glass: false,
    grain: false,
  },
};

/**
 * Pick a tier. Deliberately conservative: a mid-range phone should get a *shorter,
 * calmer* version of the film, not a stuttering copy of the desktop one.
 */
export function pickQuality(): Quality {
  if (typeof window === "undefined") return QUALITY.medium;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 720;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return QUALITY.low;
  if (coarse || narrow) return mem <= 4 || cores <= 4 ? QUALITY.low : QUALITY.medium;
  if (mem <= 4 || cores <= 4) return QUALITY.medium;
  return QUALITY.high;
}
