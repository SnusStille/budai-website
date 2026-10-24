"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { buildScene, viewProjection, type SceneBuffers } from "./neural/engine";

/**
 * BudAI Neural Cinema — one dependency-free WebGL renderer for the living core.
 *
 * Two ways to use it:
 *  - mode="hero"   ambient product mark: the neural core breathes, follows the pointer,
 *                  gets busier while the AI is working. No scroll input.
 *  - mode="scroll" scroll-scrubbed flight: pass the tall section's ref and the camera
 *                  flies from outside the core, through the membrane, into the chamber.
 *
 * Frame graph (all WebGL1, no extensions required):
 *
 *   scene (RGBA8, full res) ──► bright pass (½ res)
 *                                   │
 *                         separable gaussian ×N (H then V)
 *                                   │
 *   scene ─────────────────────► composite (additive bloom + tone curve) ──► canvas
 *
 * Contract with the rest of the site:
 *  - never blocks content (canvas is decorative, aria-hidden, pointer-events-none)
 *  - falls back to a static CSS composition when WebGL is unavailable or lost
 *  - honours prefers-reduced-motion by drawing still frames instead of animating
 *  - pauses when offscreen or when the tab is hidden
 *  - releases every GL object, listener and observer on unmount
 *
 * The 9-tap separable gaussian is adapted from Jam3/glsl-fast-gaussian-blur (MIT),
 * itself based on "Efficient Gaussian Blur with Linear Sampling" (RasterGrid).
 */

type Props = {
  mode?: "hero" | "scroll";
  /** The tall section whose scroll range drives the camera (scroll mode). */
  scrollTarget?: RefObject<HTMLElement | null>;
  /** Called once if the renderer cannot run; lets the caller show CSS fallback copy. */
  onFail?: () => void;
  className?: string;
  /** Bloom strength override (defaults per mode/quality). 0 disables the whole pass. */
  glow?: number;
};

/* ─────────────────────────────── shaders ─────────────────────────────── */

const VS_POINT = `
attribute vec3 aPos;
attribute vec3 aColor;
attribute float aSize;
attribute float aSeed;
uniform mat4 uVP;
uniform float uTime;
uniform float uActivity;
uniform float uDpr;
uniform float uProgress;
uniform float uSpin;
uniform float uReveal;
varying vec3 vColor;
varying float vAlpha;
void main() {
  // slow organic rotation of the whole network (shared with the synapse pass)
  float cs = cos(uSpin);
  float sn = sin(uSpin);
  vec3 p = vec3(aPos.x * cs - aPos.z * sn, aPos.y, aPos.x * sn + aPos.z * cs);

  vec4 clip = uVP * vec4(p, 1.0);
  gl_Position = clip;

  float d = max(clip.w, 0.16);
  float twinkle = 0.62 + 0.38 * sin(uTime * (1.1 + aSeed * 2.4) + aSeed * 41.0);

  // a thought-wave sweeps the network, and the whole shell brightens while the AI works
  float wave = 0.5 + 0.5 * sin(uTime * 1.6 - p.z * 1.4 + aSeed * 6.2831);
  float activity = uActivity * (0.3 + 0.7 * wave);

  // travelling deeper softens the field; depth rather than decoration
  float deep = mix(1.0, 0.82, uProgress);
  // 30px is the sprite cap for ordinary neurons; the few oversized "heart"
  // sprites clamp much higher so they read as soft luminous discs.
  gl_PointSize = clamp(aSize * uDpr * 52.0 / d * (0.82 + 0.34 * twinkle) * (1.0 + activity * 0.6) * deep,
                       1.0, 150.0 * uDpr);

  // points right next to the lens fade instead of turning into blobs
  float near = smoothstep(0.2, 1.1, d);
  vColor = aColor * (1.0 + activity * 0.35);
  vAlpha = clamp(0.15 + 0.5 * twinkle + activity * 0.42, 0.0, 1.4)
           * (1.0 - smoothstep(28.0, 46.0, d))
           * mix(1.0, 0.9, uProgress) * near * uReveal;
}
`;

const FS_POINT = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  float core = exp(-r2 * 4.4);
  float halo = pow(1.0 - r2, 2.6) * 0.3;
  vec3 col = vColor * (core + halo);
  gl_FragColor = vec4(col, (core + halo) * vAlpha);
}
`;

const VS_LINE = `
attribute vec3 aPos;
attribute vec3 aColor;
attribute float aAlpha;
uniform mat4 uVP;
uniform float uTime;
uniform float uActivity;
uniform float uSpin;
uniform float uReveal;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float cs = cos(uSpin);
  float sn = sin(uSpin);
  vec3 p = vec3(aPos.x * cs - aPos.z * sn, aPos.y, aPos.x * sn + aPos.z * cs);
  vec4 clip = uVP * vec4(p, 1.0);
  gl_Position = clip;

  float flow = 0.5 + 0.5 * sin(uTime * 2.2 + aPos.z * 1.7 + aPos.x * 0.8);
  vColor = aColor;
  vAlpha = aAlpha * (0.5 + 0.5 * flow) * (1.0 + uActivity * 0.9)
           * smoothstep(0.2, 1.1, max(clip.w, 0.16)) * uReveal;
}
`;

const FS_LINE = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(vColor, vAlpha);
}
`;

/* fullscreen quad used by the post passes */
const VS_QUAD = `
attribute vec2 aQuad;
varying vec2 vUv;
void main() {
  vUv = aQuad * 0.5 + 0.5;
  gl_Position = vec4(aQuad, 0.0, 1.0);
}
`;

const FS_BRIGHT = `
precision mediump float;
uniform sampler2D uTex;
uniform float uThreshold;
uniform float uKnee;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(uTex, vUv).rgb;
  float lum = max(c.r, max(c.g, c.b));
  // soft knee so the pass fades in instead of clipping a hard edge
  float soft = clamp(lum - uThreshold + uKnee, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-4);
  float w = max(soft, lum - uThreshold) / max(lum, 1e-4);
  gl_FragColor = vec4(c * w, 1.0);
}
`;

/** 9-tap separable gaussian (MIT, Jam3/glsl-fast-gaussian-blur). */
const FS_BLUR = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform vec2 uDirection;
varying vec2 vUv;
void main() {
  vec2 off1 = vec2(1.3846153846) * uDirection;
  vec2 off2 = vec2(3.2307692308) * uDirection;
  vec4 color = texture2D(uTex, vUv) * 0.2270270270;
  color += texture2D(uTex, vUv + off1 * uTexel) * 0.3162162162;
  color += texture2D(uTex, vUv - off1 * uTexel) * 0.3162162162;
  color += texture2D(uTex, vUv + off2 * uTexel) * 0.0702702703;
  color += texture2D(uTex, vUv - off2 * uTexel) * 0.0702702703;
  gl_FragColor = color;
}
`;

const FS_COMPOSITE = `
precision mediump float;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uGlow;
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;
void main() {
  vec4 scene = texture2D(uScene, vUv);
  vec3 bloom = texture2D(uBloom, vUv).rgb;
  vec3 c = scene.rgb + bloom * uGlow;

  // exponential filmic shoulder: keeps highlights from clipping while letting
  // the core actually read as bright (a pure Reinhard curve crushed everything)
  // Preserve the cyan/violet identity in the hot core. Additive accumulation
  // drives all three channels into the tonemap's shoulder at once, which reads as
  // flat white; pushing saturation on the *linear* value first keeps the hue.
  float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = max(mix(vec3(luma), c, 1.35), 0.0);

  c = vec3(1.0) - exp(-c * 1.05);

  // vignette keeps the eye on the core and hides the canvas edge
  vec2 d = vUv - 0.5;
  float vig = 1.0 - dot(d, d) * 0.38;
  c *= clamp(vig, 0.0, 1.0);

  // dither: kills banding in the very dark gradients
  float n = fract(sin(dot(vUv * uResolution + uTime, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) / 255.0;

  float a = clamp(max(scene.a, max(bloom.r, max(bloom.g, bloom.b)) * uGlow), 0.0, 1.0);
  gl_FragColor = vec4(c, a);
}
`;

/* ─────────────────────────────── helpers ─────────────────────────────── */

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[NeuralCinema] shader:", gl.getShaderInfoLog(sh));
    }
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[NeuralCinema] link:", gl.getProgramInfoLog(prog));
    }
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

type Target = { fbo: WebGLFramebuffer | null; tex: WebGLTexture | null; w: number; h: number };

export default function NeuralCinema({
  mode = "hero",
  scrollTarget,
  onFail,
  className = "",
  glow,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const quality =
      mode === "hero"
        ? mobile
          ? 0.32
          : Math.min(1.15, 0.8 + window.innerWidth / 3600)
        : mobile
          ? mem <= 4
            ? 0.4
            : 0.52
          : Math.min(1.25, 0.9 + window.innerWidth / 4200);

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = (canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }) || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }

    if (!gl || (typeof gl.isContextLost === "function" && gl.isContextLost())) {
      setFailed(true);
      onFail?.();
      return;
    }

    const scene: SceneBuffers = buildScene({ quality, deep: mode === "scroll" });

    const pointProg = link(gl, VS_POINT, FS_POINT);
    const lineProg = link(gl, VS_LINE, FS_LINE);
    const brightProg = link(gl, VS_QUAD, FS_BRIGHT);
    const blurProg = link(gl, VS_QUAD, FS_BLUR);
    const compProg = link(gl, VS_QUAD, FS_COMPOSITE);

    if (!pointProg || !lineProg) {
      [pointProg, lineProg, brightProg, blurProg, compProg].forEach((p) => p && gl!.deleteProgram(p));
      setFailed(true);
      onFail?.();
      return;
    }

    // Bloom is optional: no post programs → straight to the canvas.
    const useBloom = !!(brightProg && blurProg && compProg) && glow !== 0;
    const glowStrength = glow ?? (mobile ? 0.95 : 1.25);
    const blurPasses = mobile ? 2 : 3;

    const loc = {
      pPos: gl.getAttribLocation(pointProg, "aPos"),
      pColor: gl.getAttribLocation(pointProg, "aColor"),
      pSize: gl.getAttribLocation(pointProg, "aSize"),
      pSeed: gl.getAttribLocation(pointProg, "aSeed"),
      pVP: gl.getUniformLocation(pointProg, "uVP"),
      pTime: gl.getUniformLocation(pointProg, "uTime"),
      pActivity: gl.getUniformLocation(pointProg, "uActivity"),
      pDpr: gl.getUniformLocation(pointProg, "uDpr"),
      pProgress: gl.getUniformLocation(pointProg, "uProgress"),
      pSpin: gl.getUniformLocation(pointProg, "uSpin"),
      pReveal: gl.getUniformLocation(pointProg, "uReveal"),
      lPos: gl.getAttribLocation(lineProg, "aPos"),
      lColor: gl.getAttribLocation(lineProg, "aColor"),
      lAlpha: gl.getAttribLocation(lineProg, "aAlpha"),
      lVP: gl.getUniformLocation(lineProg, "uVP"),
      lTime: gl.getUniformLocation(lineProg, "uTime"),
      lActivity: gl.getUniformLocation(lineProg, "uActivity"),
      lSpin: gl.getUniformLocation(lineProg, "uSpin"),
      lReveal: gl.getUniformLocation(lineProg, "uReveal"),
      qQuad: brightProg ? gl.getAttribLocation(brightProg, "aQuad") : -1,
      brightTex: brightProg ? gl.getUniformLocation(brightProg, "uTex") : null,
      brightThreshold: brightProg ? gl.getUniformLocation(brightProg, "uThreshold") : null,
      brightKnee: brightProg ? gl.getUniformLocation(brightProg, "uKnee") : null,
      blurTex: blurProg ? gl.getUniformLocation(blurProg, "uTex") : null,
      blurTexel: blurProg ? gl.getUniformLocation(blurProg, "uTexel") : null,
      blurDir: blurProg ? gl.getUniformLocation(blurProg, "uDirection") : null,
      compScene: compProg ? gl.getUniformLocation(compProg, "uScene") : null,
      compBloom: compProg ? gl.getUniformLocation(compProg, "uBloom") : null,
      compGlow: compProg ? gl.getUniformLocation(compProg, "uGlow") : null,
      compTime: compProg ? gl.getUniformLocation(compProg, "uTime") : null,
      compRes: compProg ? gl.getUniformLocation(compProg, "uResolution") : null,
    };

    const buffers: WebGLBuffer[] = [];
    const makeBuffer = (data: Float32Array, target: number) => {
      const b = gl!.createBuffer();
      if (!b) return null;
      gl!.bindBuffer(target, b);
      gl!.bufferData(target, data, gl!.STATIC_DRAW);
      buffers.push(b);
      return b;
    };

    const quadBuf = makeBuffer(new Float32Array([-1, -1, 3, -1, -1, 3]), gl.ARRAY_BUFFER);
    const bPos = makeBuffer(scene.pointPos, gl.ARRAY_BUFFER);
    const bColor = makeBuffer(scene.pointColor, gl.ARRAY_BUFFER);
    const bSize = makeBuffer(scene.pointSize, gl.ARRAY_BUFFER);
    const bSeed = makeBuffer(scene.pointSeed, gl.ARRAY_BUFFER);
    const lPos = makeBuffer(scene.linePos, gl.ARRAY_BUFFER);
    const lColor = makeBuffer(scene.lineColor, gl.ARRAY_BUFFER);
    const lAlpha = makeBuffer(scene.lineAlpha, gl.ARRAY_BUFFER);

    if (!quadBuf || !bPos || !bColor || !bSize || !bSeed || !lPos || !lColor || !lAlpha) {
      buffers.forEach((b) => gl!.deleteBuffer(b));
      [pointProg, lineProg, brightProg, blurProg, compProg].forEach(
        (p) => p && gl!.deleteProgram(p)
      );
      setFailed(true);
      onFail?.();
      return;
    }

    /* ---- render targets ---- */
    const targets: Target[] = [];
    const makeTarget = (w: number, h: number): Target | null => {
      const tex = gl!.createTexture();
      const fbo = gl!.createFramebuffer();
      if (!tex || !fbo) {
        if (tex) gl!.deleteTexture(tex);
        if (fbo) gl!.deleteFramebuffer(fbo);
        return null;
      }
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
      const ok = gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.bindTexture(gl!.TEXTURE_2D, null);
      if (!ok) {
        gl!.deleteTexture(tex);
        gl!.deleteFramebuffer(fbo);
        return null;
      }
      const t: Target = { fbo, tex, w, h };
      targets.push(t);
      return t;
    };
    const freeTargets = () => {
      targets.forEach((t) => {
        if (t.tex) gl!.deleteTexture(t.tex);
        if (t.fbo) gl!.deleteFramebuffer(t.fbo);
      });
      targets.length = 0;
    };

    let sceneRT: Target | null = null;
    let brightRT: Target | null = null;
    let blurA: Target | null = null;
    let blurB: Target | null = null;

    let w = 1;
    let h = 1;
    let dpr = 1;
    let bloomEnabled = useBloom;
    let retargeted = false;

    const ensureTargets = () => {
      if (!bloomEnabled) return;
      if (retargeted && sceneRT && brightRT && blurA && blurB) return;
      freeTargets();
      const halfW = Math.max(1, Math.round(w / 2));
      const halfH = Math.max(1, Math.round(h / 2));
      sceneRT = makeTarget(Math.max(1, Math.round(w * dpr)), Math.max(1, Math.round(h * dpr)));
      brightRT = makeTarget(halfW, halfH);
      blurA = makeTarget(halfW, halfH);
      blurB = makeTarget(halfW, halfH);
      if (!sceneRT || !brightRT || !blurA || !blurB) {
        // no FBO support after all — render straight to the canvas
        bloomEnabled = false;
        freeTargets();
        sceneRT = brightRT = blurA = blurB = null;
      }
      retargeted = true;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.6);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      retargeted = false;
      ensureTargets();
      if (staticFrame) draw();
    };

    /* ---- interaction state ---- */
    let visible = true;
    let running = true;
    let raf = 0;
    let last = 0;
    let time = 0;
    let progress = 0;
    let progressTarget = 0;
    let activity = 0;
    let activityTarget = 0;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const staticFrame = reduced;

    const readProgress = () => {
      if (mode !== "scroll") return 0;
      const el = scrollTarget?.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 0;
      return clamp01(-rect.top / total);
    };

    const bindTarget = (t: Target | null) => {
      if (t) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, t.fbo);
        gl!.viewport(0, 0, t.w, t.h);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const drawScene = (spin: number) => {
      const aspect = w / h;
      const vp = viewProjection(progress, aspect, pointer, time, mode === "hero" ? 0 : 1);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      if (scene.pointCount > 0) {
        gl!.useProgram(pointProg!);
        gl!.uniformMatrix4fv(loc.pVP, false, vp);
        gl!.uniform1f(loc.pTime, time);
        gl!.uniform1f(loc.pActivity, activity);
        gl!.uniform1f(loc.pDpr, dpr);
        gl!.uniform1f(loc.pProgress, progress);
        gl!.uniform1f(loc.pSpin, spin);
        gl!.uniform1f(loc.pReveal, 1);

        gl!.bindBuffer(gl!.ARRAY_BUFFER, bPos);
        gl!.enableVertexAttribArray(loc.pPos);
        gl!.vertexAttribPointer(loc.pPos, 3, gl!.FLOAT, false, 0, 0);
        gl!.bindBuffer(gl!.ARRAY_BUFFER, bColor);
        gl!.enableVertexAttribArray(loc.pColor);
        gl!.vertexAttribPointer(loc.pColor, 3, gl!.FLOAT, false, 0, 0);
        gl!.bindBuffer(gl!.ARRAY_BUFFER, bSize);
        gl!.enableVertexAttribArray(loc.pSize);
        gl!.vertexAttribPointer(loc.pSize, 1, gl!.FLOAT, false, 0, 0);
        gl!.bindBuffer(gl!.ARRAY_BUFFER, bSeed);
        gl!.enableVertexAttribArray(loc.pSeed);
        gl!.vertexAttribPointer(loc.pSeed, 1, gl!.FLOAT, false, 0, 0);

        gl!.drawArrays(gl!.POINTS, 0, scene.pointCount);
      }

      if (scene.lineCount > 0) {
        gl!.useProgram(lineProg!);
        gl!.uniformMatrix4fv(loc.lVP, false, vp);
        gl!.uniform1f(loc.lTime, time);
        gl!.uniform1f(loc.lActivity, activity);
        gl!.uniform1f(loc.lSpin, spin);
        gl!.uniform1f(loc.lReveal, 1);

        gl!.bindBuffer(gl!.ARRAY_BUFFER, lPos);
        gl!.enableVertexAttribArray(loc.lPos);
        gl!.vertexAttribPointer(loc.lPos, 3, gl!.FLOAT, false, 0, 0);
        gl!.bindBuffer(gl!.ARRAY_BUFFER, lColor);
        gl!.enableVertexAttribArray(loc.lColor);
        gl!.vertexAttribPointer(loc.lColor, 3, gl!.FLOAT, false, 0, 0);
        gl!.bindBuffer(gl!.ARRAY_BUFFER, lAlpha);
        gl!.enableVertexAttribArray(loc.lAlpha);
        gl!.vertexAttribPointer(loc.lAlpha, 1, gl!.FLOAT, false, 0, 0);

        gl!.drawArrays(gl!.LINES, 0, scene.lineCount * 2);
      }
    };

    const drawQuad = () => {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuf!);
      const a = loc.qQuad >= 0 ? loc.qQuad : 0;
      gl!.enableVertexAttribArray(a);
      gl!.vertexAttribPointer(a, 2, gl!.FLOAT, false, 0, 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    };

    const draw = () => {
      // The world rotates for life — but the flight path is built in a fixed world,
      // so the rotation has to settle to zero before the camera enters the chamber.
      // (Without this, the destination is spun out of frame by the end of the flight.)
      const rawSpin = time * 0.055 + progress * 1.1 + pointer.x * 0.12;
      const settle = 1 - clamp01((progress - 0.18) / 0.3);
      const spin = rawSpin * settle;

      if (!bloomEnabled || !sceneRT) {
        bindTarget(null);
        drawScene(spin);
        return;
      }

      // 1. scene → offscreen. The sprites must still accumulate additively here:
      // without blending each sprite's quad overwrites the ones behind it, which
      // punches crescent-shaped holes out of every overlapping neuron.
      bindTarget(sceneRT);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE);
      drawScene(spin);
      gl!.disable(gl!.BLEND);

      // 2. bright pass
      gl!.disable(gl!.BLEND);
      bindTarget(brightRT);
      gl!.useProgram(brightProg!);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, sceneRT.tex);
      gl!.uniform1i(loc.brightTex!, 0);
      gl!.uniform1f(loc.brightThreshold!, 0.08);
      gl!.uniform1f(loc.brightKnee!, 0.12);
      drawQuad();

      // 3. separable blur, ping-pong. Each extra pass widens the radius: the first
      // gives a tight glow, the later ones the wide atmospheric halo.
      gl!.useProgram(blurProg!);
      let src = brightRT!;
      for (let i = 0; i < blurPasses; i++) {
        const spread = i === 0 ? 1.0 : 2.2 + i * 1.2;
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, blurA!.fbo);
        gl!.viewport(0, 0, blurA!.w, blurA!.h);
        gl!.bindTexture(gl!.TEXTURE_2D, src.tex);
        gl!.uniform2f(loc.blurTexel!, 1 / blurA!.w, 1 / blurA!.h);
        gl!.uniform2f(loc.blurDir!, spread, 0);
        drawQuad();

        gl!.bindFramebuffer(gl!.FRAMEBUFFER, blurB!.fbo);
        gl!.viewport(0, 0, blurB!.w, blurB!.h);
        gl!.bindTexture(gl!.TEXTURE_2D, blurA!.tex);
        gl!.uniform2f(loc.blurDir!, 0, spread);
        drawQuad();
        src = blurB!;
      }

      // 4. composite to the canvas
      bindTarget(null);
      gl!.useProgram(compProg!);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, sceneRT.tex);
      gl!.uniform1i(loc.compScene!, 0);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, blurB!.tex);
      gl!.uniform1i(loc.compBloom!, 1);
      gl!.uniform1f(loc.compGlow!, glowStrength);
      gl!.uniform1f(loc.compTime!, time);
      gl!.uniform2f(loc.compRes!, canvas.width, canvas.height);
      drawQuad();
      gl!.activeTexture(gl!.TEXTURE0);
    };

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (!visible || document.visibilityState === "hidden") {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      time += dt;

      progressTarget = readProgress();
      progress += (progressTarget - progress) * Math.min(1, dt * 5.5);
      activity += (activityTarget - activity) * Math.min(1, dt * 3.5);
      pointer.x += (pointerTarget.x - pointer.x) * Math.min(1, dt * 3);
      pointer.y += (pointerTarget.y - pointer.y) * Math.min(1, dt * 3);

      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE); // additive: sprites bloom against the dark
      draw();
    };

    /* ---- observers / listeners ---- */
    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointerTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onActivity = (e: Event) => {
      const level = (e as CustomEvent<{ level?: number }>).detail?.level;
      activityTarget = typeof level === "number" ? clamp01(level) : 1;
      if (staticFrame) {
        activity = activityTarget;
        draw();
      }
    };
    const onVisibility = () => {
      last = performance.now();
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    const onRestored = () => window.location.reload();

    if (!mobile) window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("budai:activity", onActivity);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    resize();

    function teardown() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("budai:activity", onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas!.removeEventListener("webglcontextlost", onLost);
      canvas!.removeEventListener("webglcontextrestored", onRestored);
      freeTargets();
      buffers.forEach((b) => gl!.deleteBuffer(b));
      [pointProg, lineProg, brightProg, blurProg, compProg].forEach(
        (p) => p && gl!.deleteProgram(p)
      );
      // Deliberately no WEBGL_lose_context here: in React StrictMode the effect
      // runs twice in development, and a force-lost context cannot be re-acquired
      // on the same canvas. Dropping every object is enough; the browser reclaims
      // the context when the canvas is collected.
    }

    if (staticFrame) {
      // Still frame. Redraw only when the section actually scrolls.
      let pending = 0;
      const onScrollStatic = () => {
        if (pending) return;
        pending = requestAnimationFrame(() => {
          pending = 0;
          progressTarget = readProgress();
          progress = progressTarget; // no easing: no motion sickness
          draw();
        });
      };
      window.addEventListener("scroll", onScrollStatic, { passive: true });
      draw();
      return () => {
        cancelAnimationFrame(pending);
        window.removeEventListener("scroll", onScrollStatic);
        teardown();
      };
    }

    last = performance.now();
    raf = requestAnimationFrame(frame);

    return teardown;
    // scrollTarget/onFail are stable refs/callbacks from the caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div ref={hostRef} className={`relative h-full w-full ${className}`} aria-hidden="true">
      {failed ? (
        // WebGL unavailable: a composed still that still feels like BudAI, never a blank box.
        <div className="absolute inset-0 neural-fallback">
          <div className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-cyan/20" />
          <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-purple/25" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan/25 blur-xl" />
        </div>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="presentation" />
      )}
    </div>
  );
}
