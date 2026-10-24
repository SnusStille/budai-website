/**
 * STILLEDEV — turns the logotype into a point cloud.
 *
 * The brand mark in the opening is not an image of a logo: the wordmark is drawn to an
 * offscreen canvas, its pixels are sampled, and each sample becomes a point that the light
 * field settles into. Edge samples are flagged so the outline burns hotter than the fill —
 * which is what makes bloom read as a physical light installation rather than a decal.
 *
 * Runs once at boot, off the critical path, with a hard timeout: if the webfont is slow or
 * blocked the scene falls back to a geometric monogram instead of hanging.
 */

export type MarkSample = {
  /** xyz triplets, already in world space. */
  positions: Float32Array;
  /** 1.0 for outline pixels, 0 for fill. */
  edges: Float32Array;
  count: number;
  /** aspect ratio of the drawn mark (width / height), for camera framing. */
  aspect: number;
};

export type MarkOptions = {
  text?: string;
  fontFamily?: string;
  weight?: number;
  /** Max points kept (extra samples are dropped at random). */
  maxPoints?: number;
  /** World-space width the mark should occupy. */
  worldWidth?: number;
  /** Horizontal scale applied before sampling — the studio's mark sits slightly expanded. */
  stretch?: number;
  /** Letter tracking in em. */
  tracking?: number;
  /** Pixels skipped per scan step; lower = denser sampling. */
  stride?: number;
  /** Give up after this many ms and fall back. */
  timeoutMs?: number;
};

/** Cylindrical wrap: bends the baseline so the wordmark is a surface in space, not a plane. */
function curve(x: number, half: number) {
  const t = x / half;
  return -(t * t) * 0.42;
}

export async function sampleWordmark(opts: MarkOptions = {}): Promise<MarkSample | null> {
  const {
    text = "STILLEDEV",
    fontFamily = '"Archivo Variable", "Archivo", system-ui, sans-serif',
    weight = 700,
    maxPoints = 18000,
    worldWidth = 11.2,
    stretch = 1.06,
    tracking = 0.055,
    stride = 3,
    timeoutMs = 1400,
  } = opts;

  if (typeof document === "undefined") return null;

  // Wait for the display face — but never longer than the timeout, and never block the film.
  try {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts) await Promise.race([
      fonts.load(`${weight} 160px ${fontFamily.split(",")[0]}`).then(() => fonts.ready),
      new Promise((r) => setTimeout(r, timeoutMs)),
    ]);
  } catch {
    /* fall through with whatever is available */
  }

  const W = 1600;
  const H = 460;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(stretch, 1);
  ctx.font = `${weight} 250px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";

  const chars = Array.from(text);
  const adv = chars.map((c) => ctx.measureText(c).width);
  const trackPx = 250 * tracking;
  const total = adv.reduce((a, b) => a + b, 0) + trackPx * (chars.length - 1);
  let x = -total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, 0);
    x += adv[i] + trackPx;
  }
  ctx.restore();

  const { data } = ctx.getImageData(0, 0, W, H);
  const alphaAt = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= W || py >= H) return 0;
    return data[(py * W + px) * 4 + 3];
  };

  // Pass 1 — collect every covered pixel with its outline flag.
  const hits: number[] = [];
  const edgeFlags: number[] = [];
  let minX = W;
  let maxX = 0;
  for (let py = 0; py < H; py += stride) {
    for (let px = 0; px < W; px += stride) {
      const a = alphaAt(px, py);
      if (a < 128) continue;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      // an outline pixel has a neighbour that is empty
      const thin =
        alphaAt(px - stride, py) < 128 ||
        alphaAt(px + stride, py) < 128 ||
        alphaAt(px, py - stride) < 128 ||
        alphaAt(px, py + stride) < 128;
      hits.push(px, py);
      edgeFlags.push(thin ? 1 : 0);
    }
  }
  const found = hits.length / 2;
  if (found < 240) return null;

  // Pass 2 — keep the budget, biased toward the outline (it carries the shape's energy).
  const scale = worldWidth / Math.max(1, maxX - minX);
  const half = worldWidth / 2;
  const edgeTotal = edgeFlags.reduce((a, b) => a + b, 0);
  const fillTotal = found - edgeTotal;
  const edgeBudget = Math.min(edgeTotal, Math.round(maxPoints * 0.62));
  const fillBudget = Math.min(fillTotal, maxPoints - edgeBudget);
  const edgeKeep = edgeTotal > 0 ? edgeBudget / edgeTotal : 0;
  const fillKeep = fillTotal > 0 ? fillBudget / fillTotal : 0;

  const positions: number[] = [];
  const edges: number[] = [];
  for (let i = 0; i < found; i++) {
    const isEdge = edgeFlags[i] === 1;
    if (Math.random() > (isEdge ? edgeKeep : fillKeep)) continue;
    const px = hits[i * 2];
    const py = hits[i * 2 + 1];
    const wx = (px - (minX + maxX) / 2) * scale;
    const wy = -(py - H / 2) * scale;
    const wz = curve(wx, half) + (Math.random() - 0.5) * 0.1;
    positions.push(wx, wy, wz);
    edges.push(isEdge ? 1 : 0);
  }

  const count = positions.length / 3;
  if (count < 240) return null;
  return {
    positions: new Float32Array(positions),
    edges: new Float32Array(edges),
    count,
    aspect: Math.max(1, maxX - minX) / (250 * 1.05),
  };
}

/**
 * Fallback monogram: two interlocked rings + a bar, sampled as points.
 * Used only if the logotype cannot be rasterised (rare). Keeps the opening honest —
 * something still forms out of the dark.
 */
export function geometricMark(count: number): MarkSample {
  const positions = new Float32Array(count * 3);
  const edges = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = i % 3;
    const a = Math.random() * Math.PI * 2;
    if (r === 0) {
      const rad = 2.6;
      positions[i * 3] = Math.cos(a) * rad - 1.6;
      positions[i * 3 + 1] = Math.sin(a) * rad;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      edges[i] = 1;
    } else if (r === 1) {
      const rad = 2.6;
      positions[i * 3] = Math.cos(a) * rad + 1.6;
      positions[i * 3 + 1] = Math.sin(a) * rad;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      edges[i] = 1;
    } else {
      positions[i * 3] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 1] = 3.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      edges[i] = 0;
    }
  }
  return { positions, edges, count, aspect: 2.6 };
}
