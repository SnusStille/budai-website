"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { brainCameraAt, type BrainMotion } from "@/lib/experience/brain";

/**
 * Neural brain, raw WebGL2, no dependencies.
 *  - Brain = implicit surface (two hemispheres, folds, brainstem, cerebellum) sampled into points.
 *  - Synapses between nearby surface points. A thought-wave expands from the core; pulses travel along synapses.
 *  - focus: highlight one anatomical region (0..3, -1 = none).
 *  - activity: 0..1, makes the network visibly busier (used while the AI is working).
 *  - interactive: pointer picking, reports the hovered region through onRegionHover.
 *  - Pauses when offscreen, freezes to a still frame with reduced motion, reports WebGL failure via onFail,
 *    and releases all GPU resources on unmount.
 */

type Props = {
  progress?: number;
  motion?: MutableRefObject<BrainMotion>;
  className?: string;
  mode?: "intro" | "ambient";
  focus?: number;
  activity?: number;
  interactive?: boolean;
  onRegionHover?: (region: number) => void;
  onFail?: () => void;
  onReady?: () => void;
  settled?: boolean;
  active?: boolean;
};
type Mat = Float32Array;
type Target = { fbo: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

const VS_POINTS = `#version 300 es
precision highp float;
in vec3 aPos;
in float aSeed;
in float aR;
in float aNode;
in float aSize;
in float aRegion;
uniform mat4 uMVP;
uniform float uTime;
uniform float uSize;
out float vSeed;
out float vGlow;
out float vR;
out float vRegion;
void main() {
  vec4 clip = uMVP * vec4(aPos, 1.0);
  gl_Position = clip;
  float front = fract(uTime * 0.26) * 1.4;
  float wave = exp(-pow((aR - front) * 10.0, 2.0));
  float flick = 0.5 + 0.5 * sin(uTime * (1.4 + aSeed * 1.6) + aSeed * 60.0);
  vGlow = 0.22 + 0.9 * wave + 0.12 * flick * aNode + 0.25 * aNode;
  vSeed = aSeed;
  vR = aR;
  vRegion = aRegion;
  gl_PointSize = clamp(uSize * aSize / max(clip.w, 0.05), 1.0, 46.0);
}`;

const FS_POINTS = `#version 300 es
precision highp float;
in float vSeed;
in float vGlow;
in float vR;
in float vRegion;
uniform float uGain;
uniform float uFocus;
uniform float uActivity;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  float core = exp(-r2 * 5.0);
  float halo = smoothstep(1.0, 0.4, r2) * 0.3;
  vec3 cyan = vec3(0.0, 0.9, 1.0);
  vec3 purple = vec3(0.55, 0.36, 1.0);
  vec3 white = vec3(0.9, 1.0, 1.0);
  vec3 col = mix(cyan, purple, smoothstep(0.3, 0.9, vSeed + vR * 0.25));
  col = mix(col, white, clamp(vGlow - 0.9, 0.0, 1.0) * 0.7);
  float fg = uFocus < -0.5 ? 1.0 : (abs(vRegion - uFocus) < 0.5 ? 1.8 : 0.35);
  float act = 1.0 + uActivity * 0.5;
  float I = (core + halo) * vGlow * uGain * fg * act;
  vec3 rgb = col * I;
  outColor = vec4(rgb, max(max(rgb.r, rgb.g), rgb.b));
}`;

const VS_LINES = `#version 300 es
precision highp float;
in vec3 aPos;
in float aT;
in float aSeed;
in float aR;
in float aRegion;
uniform mat4 uMVP;
uniform float uTime;
out float vT;
out float vC;
out float vR;
out float vRegion;
void main() {
  gl_Position = uMVP * vec4(aPos, 1.0);
  vT = aT;
  vC = fract(uTime * 0.34 + aSeed);
  vR = aR;
  vRegion = aRegion;
}`;

const FS_LINES = `#version 300 es
precision highp float;
in float vT;
in float vC;
in float vR;
in float vRegion;
uniform float uGain;
uniform float uTime;
uniform float uJourney;
uniform float uFocus;
uniform float uActivity;
out vec4 outColor;
void main() {
  float front = fract(uTime * 0.26) * 1.4;
  float dw = vR - front;
  float wave = exp(-dw * dw * 90.0);
  float dt = vT - vC;
  float travel = exp(-180.0 * dt * dt) * (1.0 + uActivity * 1.5);
  vec3 base = vec3(0.0, 0.30, 0.36) * 0.28;
  vec3 wcol = vec3(0.45, 0.98, 1.0);
  vec3 tcol = vec3(0.6, 0.42, 1.0);
  float fg = uFocus < -0.5 ? 1.0 : (abs(vRegion - uFocus) < 0.5 ? 1.8 : 0.35);
  vec3 rgb = (base + wcol * wave * 0.8 + tcol * travel * 0.5) * uGain * fg;
  if (vRegion < -1.5) rgb *= smoothstep(0.12, 0.46, uJourney);
  outColor = vec4(rgb, max(max(rgb.r, rgb.g), rgb.b));
}`;

const VS_FULL = `#version 300 es
precision highp float;
out vec2 vUV;
const vec2 P[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  vec2 p = P[gl_VertexID];
  gl_Position = vec4(p, 0.0, 1.0);
  vUV = p * 0.5 + 0.5;
}`;

const FS_BLUR = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex;
uniform vec2 uStep;
out vec4 o;
void main() {
  vec4 s = texture(uTex, vUV) * 0.227027;
  s += (texture(uTex, vUV + uStep * 1.0) + texture(uTex, vUV - uStep * 1.0)) * 0.1945946;
  s += (texture(uTex, vUV + uStep * 2.0) + texture(uTex, vUV - uStep * 2.0)) * 0.1216216;
  s += (texture(uTex, vUV + uStep * 3.0) + texture(uTex, vUV - uStep * 3.0)) * 0.054054;
  s += (texture(uTex, vUV + uStep * 4.0) + texture(uTex, vUV - uStep * 4.0)) * 0.016216;
  o = s;
}`;

const FS_COMPOSITE = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomAmt;
out vec4 o;
void main() {
  vec3 rgb = texture(uScene, vUV).rgb + texture(uBloom, vUV).rgb * uBloomAmt;
  o = vec4(rgb, max(max(rgb.r, rgb.g), rgb.b));
}`;

/* ---------- math ---------- */

function identity(): Mat {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}
function mul(a: Mat, b: Mat): Mat {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
}
function perspective(fovy: number, aspect: number, near: number, far: number): Mat {
  const f = 1 / Math.tan(fovy / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}
function translate(x: number, y: number, z: number): Mat {
  const m = identity();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}
function rotX(a: number): Mat {
  const m = identity();
  const c = Math.cos(a), s = Math.sin(a);
  m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
  return m;
}
function rotY(a: number): Mat {
  const m = identity();
  const c = Math.cos(a), s = Math.sin(a);
  m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
  return m;
}

/* ---------- gl helpers ---------- */

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) throw new Error("createShader failed");
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(s) || "shader";
    gl.deleteShader(s);
    throw new Error(message);
  }
  return s;
}
function link(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram();
  if (!p) throw new Error("createProgram failed");
  let vertex: WebGLShader | null = null;
  let fragment: WebGLShader | null = null;
  let linked = false;
  try {
    vertex = compile(gl, gl.VERTEX_SHADER, vs);
    fragment = compile(gl, gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, vertex);
    gl.attachShader(p, fragment);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
    linked = true;
    return p;
  } finally {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    if (!linked) gl.deleteProgram(p);
  }
}
function makeTarget(gl: WebGL2RenderingContext, w: number, h: number): Target {
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) {
    gl.deleteTexture(tex); gl.deleteFramebuffer(fbo);
    throw new Error("target alloc failed");
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (!complete) {
    gl.deleteTexture(tex); gl.deleteFramebuffer(fbo);
    throw new Error("incomplete framebuffer");
  }
  return { fbo, tex, w, h };
}
function freeTarget(gl: WebGL2RenderingContext, t: Target | null) {
  if (!t) return;
  gl.deleteTexture(t.tex);
  gl.deleteFramebuffer(t.fbo);
}

/* ---------- brain geometry ---------- */

/** Signed distance to a brain: two hemispheres, cortical folds, brainstem, cerebellum. */
function sdfBrain(x: number, y: number, z: number) {
  const ax = Math.max(Math.abs(x) - 0.1, 0);
  const low = Math.min(1, Math.max(0, (-y - 0.12) / 0.55));
  const rx = 0.98 * (1 - 0.22 * low);
  const ry = 0.74 * (1 - 0.1 * low);
  const rz = 0.84 * (1 - 0.08 * low) * (z > 0 ? 1.08 : 1);
  const e = Math.sqrt((ax / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2) - 1;
  const fold =
    0.045 *
    Math.sin(3.4 * x + 1.9 * Math.sin(2.6 * y)) *
    Math.sin(3.1 * y + 1.4 * Math.sin(3.7 * z)) *
    Math.sin(3.7 * z + 1.2 * Math.sin(3.0 * x));
  const dBrain = e * 0.74 + fold;

  const by = -0.8, bz = -0.07;
  const ay = y + 0.45, az = z + 0.05;
  const h = Math.min(1, Math.max(0, (ay * by + az * bz) / (by * by + bz * bz)));
  const sy = y - (-0.45 + by * h);
  const sz = z - (-0.05 + bz * h);
  const dStem = Math.sqrt(x * x + sy * sy + sz * sz) - 0.13;

  const cx = x / 0.46, cy = (y + 0.62) / 0.22, cz = (z + 0.5) / 0.24;
  const dCer = (Math.sqrt(cx * cx + cy * cy + cz * cz) - 1) * 0.22 + 0.006 * Math.sin(y * 70);

  return Math.min(dBrain, dStem, dCer);
}

function sampleBrain(surfTarget: number, innerTarget: number) {
  const surf: number[] = [];
  const inner: number[] = [];
  for (let it = 0; it < 500000 && (surf.length / 3 < surfTarget || inner.length / 3 < innerTarget); it++) {
    const x = (Math.random() * 2 - 1) * 1.15;
    const y = (Math.random() * 2 - 1) * 1.0 - 0.2;
    const z = (Math.random() * 2 - 1) * 1.0;
    const d = sdfBrain(x, y, z);
    if (Math.abs(d) < 0.026 && surf.length / 3 < surfTarget) surf.push(x, y, z);
    else if (d < -0.14 && inner.length / 3 < innerTarget) inner.push(x, y, z);
  }
  return { surf, inner };
}

/** Anatomical region of a point (-1 = none). 0 write, 1 memory, 2 decide, 3 voice & vision. */
function regionOf(x: number, y: number, z: number) {
  if (z > 0.35) return 0;
  if (Math.abs(x) > 0.6 && y < 0.1 && Math.abs(z) < 0.5) return 1;
  if (y > 0.4) return 2;
  if (z < -0.3) return 3;
  return -1;
}

function buildBrain(mobile: boolean) {
  const { surf, inner } = sampleBrain(mobile ? 820 : 1280, mobile ? 260 : 460);
  const nSurf = surf.length / 3;
  const nInner = inner.length / 3;
  const all = [...surf, ...inner];

  const deg = new Uint8Array(nSurf);
  const edges: number[] = [];
  const thr2 = 0.155 * 0.155;
  for (let i = 0; i < nSurf; i++) {
    if (deg[i] >= 3) continue;
    for (let j = i + 1; j < nSurf && deg[i] < 3; j++) {
      if (deg[j] >= 3) continue;
      const dx = surf[i * 3] - surf[j * 3];
      const dy = surf[i * 3 + 1] - surf[j * 3 + 1];
      const dz = surf[i * 3 + 2] - surf[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < thr2 && Math.random() < 0.85) {
        edges.push(i, j);
        deg[i]++;
        deg[j]++;
      }
    }
  }

  // point record: x y z seed r node size region (8 floats)
  const N = nSurf + nInner;
  const dustCount = mobile ? 320 : 620;
  const pointData = new Float32Array((N + dustCount) * 8);
  for (let i = 0; i < N; i++) {
    const o = i * 8;
    const x = all[i * 3], y = all[i * 3 + 1], z = all[i * 3 + 2];
    pointData[o] = x;
    pointData[o + 1] = y;
    pointData[o + 2] = z;
    pointData[o + 3] = Math.random();
    pointData[o + 4] = Math.hypot(x, y, z);
    pointData[o + 5] = i < nSurf && deg[i] >= 2 ? 1 : 0;
    pointData[o + 6] = i < nSurf && deg[i] >= 2 ? 1.7 : 1.0;
    pointData[o + 7] = regionOf(x, y, z);
  }
  for (let k = 0; k < dustCount; k++) {
    const o = (N + k) * 8;
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const sq = Math.sqrt(1 - u * u);
    const r = 2.2 + Math.random() * 4.5;
    pointData[o] = sq * Math.cos(t) * r;
    pointData[o + 1] = u * r;
    pointData[o + 2] = sq * Math.sin(t) * r;
    pointData[o + 3] = Math.random();
    pointData[o + 4] = 9;
    pointData[o + 5] = 0;
    pointData[o + 6] = 0.8;
    pointData[o + 7] = -1;
  }

  // synapse vertex: x y z t seed r region (7 floats), two per edge
  const E = edges.length / 2;
  const interiorEdges: number[][] = [];
  for (let i = 0; i < nInner - 3; i++) {
    for (let j = i + 1; j < Math.min(nInner, i + 18); j++) {
      const a = inner.slice(i * 3, i * 3 + 3), b = inner.slice(j * 3, j * 3 + 3);
      if (Math.hypot(...a.map((v, k) => v - b[k])) < .48) { interiorEdges.push([...a, ...b]); break; }
    }
  }
  for (let rail = 0; rail < 8; rail++) {
    const angle = rail * Math.PI / 4;
    for (let k = 0; k < 20; k++) {
      const r = .28 + k * .075;
      const nextR = .28 + (k + 1) * .075;
      interiorEdges.push([Math.cos(angle) * r, Math.sin(angle) * r, -.4 - k * .8, Math.cos(angle) * nextR, Math.sin(angle) * nextR, -1.2 - k * .8]);
    }
  }
  const lineData = new Float32Array((E + interiorEdges.length) * 2 * 7);
  for (let e = 0; e < E; e++) {
    const seed = Math.random();
    for (let v = 0; v < 2; v++) {
      const idx = edges[e * 2 + v];
      const o = (e * 2 + v) * 7;
      const x = surf[idx * 3], y = surf[idx * 3 + 1], z = surf[idx * 3 + 2];
      lineData[o] = x;
      lineData[o + 1] = y;
      lineData[o + 2] = z;
      lineData[o + 3] = v;
      lineData[o + 4] = seed;
      lineData[o + 5] = Math.hypot(x, y, z);
      lineData[o + 6] = regionOf(x, y, z);
    }
  }
  interiorEdges.forEach((edge, i) => {
    for (let v = 0; v < 2; v++) {
      const o = ((E + i) * 2 + v) * 7;
      lineData.set([edge[v * 3], edge[v * 3 + 1], edge[v * 3 + 2], v, (i * .618) % 1, .3, -2], o);
    }
  });
  return { pointData, N, dustCount, lineData, E: E + interiorEdges.length };
}

/* ---------- component ---------- */

export default function BrainFlight({
  progress = 0,
  motion,
  className = "",
  mode = "intro",
  focus = -1,
  activity = 0,
  interactive = false,
  onRegionHover,
  onFail,
  onReady,
  settled = true,
  active = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const progRef = useRef(progress);
  const motionRef = useRef(motion);
  motionRef.current = motion;
  const settledRef = useRef(settled);
  const activeRef = useRef(active);
  const focusRef = useRef(focus);
  const activityRef = useRef(activity);
  const hoverCbRef = useRef(onRegionHover);
  const failCbRef = useRef(onFail);
  const readyCbRef = useRef(onReady);
  const kickRef = useRef<(() => void) | null>(null);

  useEffect(() => { activeRef.current = active; if (active) kickRef.current?.(); }, [active]);
  useEffect(() => { settledRef.current = settled; }, [settled]);
  useEffect(() => { progRef.current = progress; }, [progress]);
  useEffect(() => { focusRef.current = focus; kickRef.current?.(); }, [focus]);
  useEffect(() => { activityRef.current = activity; kickRef.current?.(); }, [activity]);
  useEffect(() => { hoverCbRef.current = onRegionHover; }, [onRegionHover]);
  useEffect(() => { failCbRef.current = onFail; }, [onFail]);
  useEffect(() => { readyCbRef.current = onReady; }, [onReady]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ambient = mode === "ambient";
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) {
      failCbRef.current?.();
      return;
    }

    let alive = true;
    let running = false;
    let visible = true;
    let raf = 0;

    let pointProg: WebGLProgram | null = null;
    let lineProg: WebGLProgram | null = null;
    let blurProg: WebGLProgram | null = null;
    let compProg: WebGLProgram | null = null;
    let pointVao: WebGLVertexArrayObject | null = null;
    let lineVao: WebGLVertexArrayObject | null = null;
    let emptyVao: WebGLVertexArrayObject | null = null;
    let pointBuf: WebGLBuffer | null = null;
    let lineBuf: WebGLBuffer | null = null;
    let scene: Target | null = null;
    let bA: Target | null = null;
    let bB: Target | null = null;

    const disposeResources = () => {
      freeTarget(gl, scene); freeTarget(gl, bA); freeTarget(gl, bB);
      if (pointProg) gl.deleteProgram(pointProg);
      if (lineProg) gl.deleteProgram(lineProg);
      if (blurProg) gl.deleteProgram(blurProg);
      if (compProg) gl.deleteProgram(compProg);
      if (pointBuf) gl.deleteBuffer(pointBuf);
      if (lineBuf) gl.deleteBuffer(lineBuf);
      if (pointVao) gl.deleteVertexArray(pointVao);
      if (lineVao) gl.deleteVertexArray(lineVao);
      if (emptyVao) gl.deleteVertexArray(emptyVao);
    };

    // hover picking data (brain surface points that belong to a region)
    let pickPos = new Float32Array(0);
    let pickReg = new Int8Array(0);
    let lastMvp: Mat | null = null;
    let lastHover = -2;
    let curAct = activityRef.current;
    let departure = settledRef.current ? 1 : 0;
    let tgtFocus = focusRef.current;

    try {
      pointProg = link(gl, VS_POINTS, FS_POINTS);
      lineProg = link(gl, VS_LINES, FS_LINES);
      blurProg = link(gl, VS_FULL, FS_BLUR);
      compProg = link(gl, VS_FULL, FS_COMPOSITE);

      const mobile = window.innerWidth < 768;
      const debug = gl.getExtension("WEBGL_debug_renderer_info");
      const software = !!debug && /swiftshader|llvmpipe|software/i.test(String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)));
      const { pointData, N, dustCount, lineData, E } = buildBrain(mobile);
      const totalPoints = N + dustCount;

      const picks: number[] = [];
      const pickRegs: number[] = [];
      for (let i = 0; i < N; i++) {
        const reg = pointData[i * 8 + 7];
        if (reg >= 0) {
          picks.push(pointData[i * 8], pointData[i * 8 + 1], pointData[i * 8 + 2]);
          pickRegs.push(reg);
        }
      }
      pickPos = new Float32Array(picks);
      pickReg = new Int8Array(pickRegs);

      emptyVao = gl.createVertexArray();
      pointVao = gl.createVertexArray();
      lineVao = gl.createVertexArray();
      pointBuf = gl.createBuffer();
      lineBuf = gl.createBuffer();
      if (!emptyVao || !pointVao || !lineVao || !pointBuf || !lineBuf) throw new Error("gl alloc failed");

      const attr = (prog: WebGLProgram, name: string, size: number, stride: number, off: number) => {
        const loc = gl.getAttribLocation(prog, name);
        if (loc >= 0) {
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off);
        }
      };

      const STRIDE_P = 32;
      gl.bindVertexArray(pointVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
      gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.STATIC_DRAW);
      attr(pointProg, "aPos", 3, STRIDE_P, 0);
      attr(pointProg, "aSeed", 1, STRIDE_P, 12);
      attr(pointProg, "aR", 1, STRIDE_P, 16);
      attr(pointProg, "aNode", 1, STRIDE_P, 20);
      attr(pointProg, "aSize", 1, STRIDE_P, 24);
      attr(pointProg, "aRegion", 1, STRIDE_P, 28);

      const STRIDE_L = 28;
      gl.bindVertexArray(lineVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.STATIC_DRAW);
      attr(lineProg, "aPos", 3, STRIDE_L, 0);
      attr(lineProg, "aT", 1, STRIDE_L, 12);
      attr(lineProg, "aSeed", 1, STRIDE_L, 16);
      attr(lineProg, "aR", 1, STRIDE_L, 20);
      attr(lineProg, "aRegion", 1, STRIDE_L, 24);
      gl.bindVertexArray(null);

      gl.useProgram(blurProg);
      gl.uniform1i(gl.getUniformLocation(blurProg, "uTex"), 0);
      gl.useProgram(compProg);
      gl.uniform1i(gl.getUniformLocation(compProg, "uScene"), 0);
      gl.uniform1i(gl.getUniformLocation(compProg, "uBloom"), 1);

      const pU = (name: string) => gl.getUniformLocation(pointProg!, name);
      const lU = (name: string) => gl.getUniformLocation(lineProg!, name);
      const uPoint = {
        mvp: pU("uMVP"), time: pU("uTime"), size: pU("uSize"), gain: pU("uGain"),
        focus: pU("uFocus"), activity: pU("uActivity"),
      };
      const uLine = {
        mvp: lU("uMVP"), time: lU("uTime"), gain: lU("uGain"),
        focus: lU("uFocus"), activity: lU("uActivity"), journey: lU("uJourney"),
      };
      const uBlur = { step: gl.getUniformLocation(blurProg, "uStep") };
      const uComp = { amt: gl.getUniformLocation(compProg, "uBloomAmt") };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, software ? .75 : mobile ? 1 : 1.25);
        const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
        const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
        if (w === canvas.width && h === canvas.height && scene) return;
        canvas.width = w;
        canvas.height = h;
        freeTarget(gl, scene);
        freeTarget(gl, bA);
        freeTarget(gl, bB);
        scene = makeTarget(gl, w, h);
        bA = makeTarget(gl, Math.max(2, w >> 2), Math.max(2, h >> 2));
        bB = makeTarget(gl, Math.max(2, w >> 2), Math.max(2, h >> 2));
      };

      const blurPass = (src: WebGLTexture, dst: Target, dx: number, dy: number) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
        gl.viewport(0, 0, dst.w, dst.h);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, src);
        gl.uniform2f(uBlur.step, dx, dy);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const render = (t: number, p: number) => {
        if (!scene || !bA || !bB) return;
        const W = canvas.width;
        const H = canvas.height;

        const fly = ambient ? 0 : Math.pow(Math.min(1, p / 0.92), 2.0);
        const controlled = motionRef.current?.current;
        const pose = controlled ? brainCameraAt(controlled) : null;
        let camZ = pose?.z ?? (ambient ? 3.95 + departure * .65 : 5.2 - 5.6 * fly);
        if (controlled?.kind === "intro") camZ += (4.6 - camZ) * departure;
        const camX = pose?.x ?? (ambient ? Math.sin(t * 0.15) * .25 : Math.sin(fly * Math.PI) * .55);
        const yaw = pose?.yaw ?? (t * (ambient ? .09 : .12) + fly * 1.1 + departure * .24);
        const tilt = pose?.tilt ?? (ambient ? .12 : .22 - .18 * fly);
        canvas.dataset.cameraZ = camZ.toFixed(4);
        canvas.dataset.sequence = controlled?.kind ?? mode;
        canvas.dataset.cameraPose = [camX, pose?.y ?? .25, camZ, yaw, tilt].map(n => n.toFixed(5)).join(",");
        const proj = perspective(0.87, W / H, 0.05, 50);
        const mvp = mul(proj, mul(translate(-camX, -(pose?.y ?? .25), -camZ), mul(rotX(tilt), rotY(yaw))));
        lastMvp = mvp;

        const intro = ambient ? 0.7 : 0.35 + 0.65 * Math.min(1, t / 0.9);
        const gain = Math.min(1, t * 1.4) * intro * (1 + 1.0 * fly);
        const focusNow = tgtFocus;

        gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fbo);
        gl.viewport(0, 0, scene.w, scene.h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);

        gl.useProgram(lineProg);
        gl.uniform1f(uLine.journey, controlled?.kind === "journey" ? controlled.progress : 0);
        gl.bindVertexArray(lineVao);
        gl.uniformMatrix4fv(uLine.mvp, false, mvp);
        gl.uniform1f(uLine.time, t);
        gl.uniform1f(uLine.gain, gain * 0.9);
        gl.uniform1f(uLine.focus, focusNow);
        gl.uniform1f(uLine.activity, curAct);
        gl.drawArrays(gl.LINES, 0, E * 2);

        gl.useProgram(pointProg);
        gl.bindVertexArray(pointVao);
        gl.uniformMatrix4fv(uPoint.mvp, false, mvp);
        gl.uniform1f(uPoint.time, t);
        gl.uniform1f(uPoint.size, 15 * (H / 900));
        gl.uniform1f(uPoint.focus, focusNow);
        gl.uniform1f(uPoint.activity, curAct);
        gl.uniform1f(uPoint.gain, gain);
        gl.drawArrays(gl.POINTS, 0, N);
        gl.uniform1f(uPoint.gain, gain * 0.55);
        gl.drawArrays(gl.POINTS, N, totalPoints - N);
        gl.bindVertexArray(null);

        gl.disable(gl.BLEND);
        gl.useProgram(blurProg);
        gl.bindVertexArray(emptyVao);
        blurPass(scene.tex, bA, 2 / scene.w, 0);
        blurPass(bA.tex, bB, 0, 2 / bA.h);


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, W, H);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(compProg);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, scene.tex);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, bB.tex);
        gl.uniform1f(uComp.amt, ambient ? 0.7 : 1.1 + fly * 0.5);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
      };

      const start = performance.now();
      let last = 0;
      let reportedReady = false;
      const frame = (now: number) => {
        if (!alive) return;
        if ((!visible || document.hidden || !activeRef.current) && !reduced) {
          running = false;
          return;
        }
        if (!reduced && now - last < 30) { raf = requestAnimationFrame(frame); return; }
        last = now;
        try {
          resize();
          tgtFocus = focusRef.current;
          curAct += (activityRef.current - curAct) * 0.06;
          departure += ((settledRef.current ? 1 : 0) - departure) * .13;
          render(reduced ? 2 : (now - start) / 1000, progRef.current);
          if (!reportedReady) {
            reportedReady = true;
            canvas.dataset.rendered = "true";
            readyCbRef.current?.();
          }
        } catch {
          alive = false;
          running = false;
          failCbRef.current?.();
          return;
        }
        if (reduced) {
          running = false;
          return;
        }
        running = true;
        raf = requestAnimationFrame(frame);
      };

      kickRef.current = () => {
        if (alive && visible && !document.hidden && activeRef.current && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      };

      running = true;
      raf = requestAnimationFrame(frame);

    } catch (err) {
      alive = false;
      running = false;
      cancelAnimationFrame(raf);
      kickRef.current = null;
      disposeResources();
      console.warn("BrainFlight disabled:", err);
      failCbRef.current?.();
      return;
    }

    // pause when offscreen, resume when visible
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && alive && !running) kickRef.current?.();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); running = false; }
      else kickRef.current?.();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      running = false;
      failCbRef.current?.();
    };
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    const resizeObserver = new ResizeObserver(() => kickRef.current?.());
    resizeObserver.observe(canvas);

    // interaction: project brain regions and report the nearest one under the pointer
    const onMove = (e: PointerEvent) => {
      if (!interactive || !lastMvp || pickPos.length === 0) return;
      const m = lastMvp;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let best = -1;
      let bestD = 26 * 26;
      for (let i = 0; i < pickReg.length; i++) {
        const x = pickPos[i * 3], y = pickPos[i * 3 + 1], z = pickPos[i * 3 + 2];
        const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
        if (cw <= 0.01) continue;
        const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
        const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
        const sx = (cx / cw * 0.5 + 0.5) * rect.width;
        const sy = (0.5 - cy / cw * 0.5) * rect.height;
        const d = (sx - mx) ** 2 + (sy - my) ** 2;
        if (d < bestD) {
          bestD = d;
          best = pickReg[i];
        }
      }
      if (best !== lastHover) {
        lastHover = best;
        hoverCbRef.current?.(best);
      }
    };
    const onLeave = () => {
      if (lastHover !== -1) {
        lastHover = -1;
        hoverCbRef.current?.(-1);
      }
    };
    if (interactive) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
    }

    return () => {
      alive = false;
      running = false;
      cancelAnimationFrame(raf);
      kickRef.current = null;
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      if (interactive) {
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
      }
      disposeResources();
    };
  }, [mode, interactive]);

  return (
    <canvas
      ref={ref}
      data-brain-canvas
      aria-hidden
      className={`${interactive ? "pointer-events-auto" : "pointer-events-none"} absolute inset-0 h-full w-full ${className}`}
    />
  );
}
