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
 * Contract with the rest of the site:
 *  - never blocks content (canvas is decorative, aria-hidden, pointer-events-none)
 *  - falls back to a static CSS glow when WebGL is unavailable or lost
 *  - honours prefers-reduced-motion by drawing still frames instead of animating
 *  - pauses when offscreen or when the tab is hidden
 *  - releases every GL object, listener and observer on unmount
 */

type Props = {
  mode?: "hero" | "scroll";
  /** The tall section whose scroll range drives the camera (scroll mode). */
  scrollTarget?: RefObject<HTMLElement | null>;
  /** Called once if the renderer cannot run; lets the caller show CSS fallback copy. */
  onFail?: () => void;
  className?: string;
};

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
  // a thought-wave sweeps the network while the AI is working
  float wave = 0.5 + 0.5 * sin(uTime * 1.6 - p.z * 1.4 + aSeed * 6.2831);
  float activity = uActivity * (0.35 + 0.65 * wave);

  // travelling deeper softens the field; depth rather than decoration
  float deep = mix(1.0, 0.8, uProgress);
  gl_PointSize = clamp(aSize * uDpr * 48.0 / d * (0.84 + 0.32 * twinkle) * (1.0 + activity * 0.55) * deep,
                       1.0, 26.0 * uDpr);

  // points passing right by the lens fade instead of becoming blobs
  float near = smoothstep(0.22, 1.15, d);
  vColor = aColor;
  vAlpha = clamp(0.26 + 0.68 * twinkle + activity * 0.4, 0.0, 1.4)
           * (1.0 - smoothstep(26.0, 44.0, d)) * mix(1.0, 0.88, uProgress) * near;
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
  float core = exp(-r2 * 4.6);
  float halo = pow(1.0 - r2, 2.4) * 0.26;
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
  vAlpha = aAlpha * (0.55 + 0.45 * flow) * (1.0 + uActivity * 0.8)
           * smoothstep(0.22, 1.15, max(clip.w, 0.16));
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

function link(
  gl: WebGLRenderingContext,
  vsSrc: string,
  fsSrc: string
): WebGLProgram | null {
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

export default function NeuralCinema({ mode = "hero", scrollTarget, onFail, className = "" }: Props) {
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
          ? 0.34
          : Math.min(1.1, 0.75 + window.innerWidth / 3600)
        : mobile
          ? mem <= 4
            ? 0.34
            : 0.46
          : Math.min(1.2, 0.85 + window.innerWidth / 4200);

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = (canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      }) ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
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
    if (!pointProg || !lineProg) {
      if (pointProg) gl.deleteProgram(pointProg);
      if (lineProg) gl.deleteProgram(lineProg);
      setFailed(true);
      onFail?.();
      return;
    }

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
      lPos: gl.getAttribLocation(lineProg, "aPos"),
      lColor: gl.getAttribLocation(lineProg, "aColor"),
      lAlpha: gl.getAttribLocation(lineProg, "aAlpha"),
      lVP: gl.getUniformLocation(lineProg, "uVP"),
      lTime: gl.getUniformLocation(lineProg, "uTime"),
      lActivity: gl.getUniformLocation(lineProg, "uActivity"),
      lSpin: gl.getUniformLocation(lineProg, "uSpin"),
    };

    const buffers: WebGLBuffer[] = [];
    const makeBuffer = (data: Float32Array) => {
      const b = gl!.createBuffer();
      if (!b) return null;
      gl!.bindBuffer(gl!.ARRAY_BUFFER, b);
      gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW);
      buffers.push(b);
      return b;
    };

    const bPos = makeBuffer(scene.pointPos);
    const bColor = makeBuffer(scene.pointColor);
    const bSize = makeBuffer(scene.pointSize);
    const bSeed = makeBuffer(scene.pointSeed);
    const lPos = makeBuffer(scene.linePos);
    const lColor = makeBuffer(scene.lineColor);
    const lAlpha = makeBuffer(scene.lineAlpha);

    if (!bPos || !bColor || !bSize || !bSeed || !lPos || !lColor || !lAlpha) {
      buffers.forEach((b) => gl!.deleteBuffer(b));
      gl.deleteProgram(pointProg);
      gl.deleteProgram(lineProg);
      setFailed(true);
      onFail?.();
      return;
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive: makes sprites bloom against the dark
    gl.clearColor(0, 0, 0, 0);

    let w = 1;
    let h = 1;
    let dpr = 1;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.75);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl!.viewport(0, 0, canvas.width, canvas.height);
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

    const draw = () => {
      const aspect = w / h;
      const vp = viewProjection(progress, aspect, pointer, time);
      const spin = time * 0.055 + progress * 1.35 + pointer.x * 0.12;
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      if (scene.pointCount > 0) {
        gl!.useProgram(pointProg);
        gl!.uniformMatrix4fv(loc.pVP, false, vp);
        gl!.uniform1f(loc.pTime, time);
        gl!.uniform1f(loc.pActivity, activity);
        gl!.uniform1f(loc.pDpr, dpr);
        gl!.uniform1f(loc.pProgress, progress);
        gl!.uniform1f(loc.pSpin, spin);

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
        gl!.useProgram(lineProg);
        gl!.uniformMatrix4fv(loc.lVP, false, vp);
        gl!.uniform1f(loc.lTime, time);
        gl!.uniform1f(loc.lActivity, activity);
        gl!.uniform1f(loc.lSpin, spin);

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
      if (staticFrame) draw();
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
      buffers.forEach((b) => gl!.deleteBuffer(b));
      gl!.deleteProgram(pointProg!);
      gl!.deleteProgram(lineProg!);
      // Deliberately no WEBGL_lose_context here: in React StrictMode the effect
      // runs twice in development, and a force-lost context cannot be re-acquired
      // on the same canvas. Dropping every object is enough; the browser reclaims
      // the context when the canvas is collected.
    }

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
