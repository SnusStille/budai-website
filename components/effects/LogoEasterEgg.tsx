"use client";

import { useEffect, useRef, useState } from "react";
import Logo3D from "@/components/ui/Logo3D";

/**
 * BudAI logo easter egg. Every click on the menu logo advances a 15-step sequence
 * (pulse > orbit > scan > data stream > rebuild > background > terminal > page scan >
 * reward > hologram > whispers > neural net > binary rain > lock-on > developer mode).
 * Idle for a few seconds and it starts over, quietly. Nothing here touches layout.
 */

const TAU = Math.PI * 2;
const CY = "0,229,255";
const VI = "124,92,255";
const CLIP_URL = "/audio/budai-reward.mp3"; // optional: your own / licensed 3-4s clip
const CLIP_START = 0; // seconds into the clip to start from
const GLYPHS = ["0", "1", "<", ">", "{", "}", "/", "fn", "=>", "AI", "01", "</>", "::", "&&"];

type Fx = { layer: "fx" | "bg"; t0: number; dur: number; draw: (c: CanvasRenderingContext2D, p: number, s: number) => void };

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/* ---------- audio: built-in original sting (or your clip if present) ---------- */
async function playReward(hasClip: boolean) {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (hasClip) {
    try {
      const el = new Audio(CLIP_URL);
      el.currentTime = CLIP_START;
      el.volume = 0.6;
      await el.play();
      window.setTimeout(() => {
        let v = 0.6;
        const id = window.setInterval(() => {
          v -= 0.06;
          if (v <= 0) {
            window.clearInterval(id);
            el.pause();
          } else el.volume = v;
        }, 70);
      }, 3000);
      return;
    } catch {
      /* fall through to the synthesized sting */
    }
  }
  if (!AC) return;
  const ctx = new AC();
  await ctx.resume?.();
  const t0 = ctx.currentTime + 0.03;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.linearRampToValueAtTime(0.42, t0 + 0.03);
  master.gain.setValueAtTime(0.42, t0 + 3.0);
  master.gain.linearRampToValueAtTime(0.0001, t0 + 3.8);
  master.connect(ctx.destination);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(900, t0);
  lp.frequency.exponentialRampToValueAtTime(5200, t0 + 1.9);
  lp.connect(master);

  const sub = (at: number, from: number, to: number, g: number) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(from, at);
    o.frequency.exponentialRampToValueAtTime(to, at + 0.9);
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(g, at);
    gn.gain.exponentialRampToValueAtTime(0.001, at + 1.1);
    o.connect(gn).connect(master);
    o.start(at);
    o.stop(at + 1.2);
  };
  sub(t0, 70, 36, 0.9); // impact
  sub(t0 + 1.95, 80, 40, 1); // resolve

  [130.81, 196, 329.63, 493.88, 587.33].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.detune.value = i % 2 ? 5 : -5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0 + 0.1);
    g.gain.linearRampToValueAtTime(0.07, t0 + 0.5);
    g.gain.setValueAtTime(0.07, t0 + 1.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.6);
    o.connect(g).connect(lp);
    o.start(t0 + 0.1);
    o.stop(t0 + 3.7);
  });

  [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51].forEach((f, i) => {
    const st = t0 + 1.05 + i * 0.105;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, st);
    g.gain.exponentialRampToValueAtTime(0.14, st + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, st + 0.22);
    o.connect(g).connect(master);
    o.start(st);
    o.stop(st + 0.25);
  });

  [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
    const st = t0 + 1.95;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, st);
    g.gain.exponentialRampToValueAtTime(0.11, st + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, st + 1.4);
    o.connect(g).connect(lp);
    o.start(st);
    o.stop(st + 1.5);
  });

  const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource();
  ns.buffer = nb;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(400, t0 + 0.2);
  bp.frequency.exponentialRampToValueAtTime(7000, t0 + 1.9);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t0 + 0.2);
  ng.gain.exponentialRampToValueAtTime(0.16, t0 + 1.9);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.05);
  ns.connect(bp).connect(ng).connect(master);
  ns.start(t0 + 0.2);
  ns.stop(t0 + 2.1);
  window.setTimeout(() => void ctx.close(), 4300);
}

/* ---------- canvas effects ---------- */
const ring = (cx: number, cy: number): Fx => ({
  layer: "fx", t0: 0, dur: 900,
  draw: (c, p) => {
    for (const d of [0, 0.25]) {
      const q = (p - d) / (1 - d);
      if (q <= 0) continue;
      c.strokeStyle = `rgba(${CY},${(1 - q) * 0.7})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(cx, cy, 6 + q * 64, 0, TAU);
      c.stroke();
    }
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, 46);
    g.addColorStop(0, `rgba(${CY},${(1 - p) * 0.45})`);
    g.addColorStop(1, `rgba(${CY},0)`);
    c.fillStyle = g;
    c.fillRect(cx - 50, cy - 50, 100, 100);
  },
});

const orbit = (cx: number, cy: number): Fx => {
  const ps = Array.from({ length: 16 }, () => ({ r: rnd(24, 54), sp: rnd(1.4, 3) * (Math.random() < 0.5 ? -1 : 1), ph: rnd(0, TAU), sz: rnd(1, 2.2), v: Math.random() < 0.5 }));
  return {
    layer: "fx", t0: 0, dur: 3600,
    draw: (c, p, s) => {
      const env = Math.sin(Math.PI * p);
      for (const o of ps) {
        const a = o.ph + s * o.sp;
        const x = cx + Math.cos(a) * o.r;
        const y = cy + Math.sin(a) * o.r * 0.55;
        c.fillStyle = `rgba(${o.v ? VI : CY},${env * 0.9})`;
        c.beginPath();
        c.arc(x, y, o.sz, 0, TAU);
        c.fill();
      }
    },
  };
};

const scan = (cx: number, cy: number): Fx => ({
  layer: "fx", t0: 0, dur: 900,
  draw: (c, p) => {
    const y = cy - 30 + p * 60;
    const g = c.createLinearGradient(cx - 50, 0, cx + 50, 0);
    g.addColorStop(0, `rgba(${CY},0)`);
    g.addColorStop(0.5, `rgba(${CY},${0.9 * Math.sin(Math.PI * p)})`);
    g.addColorStop(1, `rgba(${CY},0)`);
    c.fillStyle = g;
    c.fillRect(cx - 50, y, 100, 1.5);
    c.strokeStyle = `rgba(${CY},${0.7 * Math.sin(Math.PI * p)})`;
    c.lineWidth = 1;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x0 = cx + sx * 26, y0 = cy + sy * 26;
      c.beginPath();
      c.moveTo(x0, y0 - sy * 8);
      c.lineTo(x0, y0);
      c.lineTo(x0 - sx * 8, y0);
      c.stroke();
    }
  },
});

const stream = (cx: number, cy: number): Fx => {
  const ps = Array.from({ length: 48 }, () => ({ a: rnd(-0.7, 0.9), v: rnd(90, 260), g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], sz: rnd(10, 13), d: rnd(0, 0.35), v2: Math.random() < 0.4 }));
  return {
    layer: "fx", t0: 0, dur: 2000,
    draw: (c, p, s) => {
      c.font = "11px ui-monospace, Menlo, monospace";
      for (const o of ps) {
        const t = s - o.d;
        if (t < 0) continue;
        const life = Math.min(1, t / 1.5);
        if (life >= 1) continue;
        const x = cx + Math.cos(o.a) * o.v * t;
        const y = cy + Math.sin(o.a) * o.v * t + 40 * t * t;
        c.fillStyle = `rgba(${o.v2 ? VI : CY},${(1 - life) * 0.9})`;
        c.font = `${o.sz}px ui-monospace, Menlo, monospace`;
        c.fillText(o.g, x, y);
      }
    },
  };
};

const rebuild = (cx: number, cy: number): Fx => {
  const ps = Array.from({ length: 70 }, () => { const a = rnd(0, TAU), r = rnd(40, 130); return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, v: Math.random() < 0.4 }; });
  return {
    layer: "fx", t0: 0, dur: 1700,
    draw: (c, p) => {
      const k = p < 0.42 ? ease(p / 0.42) : p < 0.58 ? 1 : 1 - ease((p - 0.58) / 0.42);
      for (const o of ps) {
        const x = cx + o.x * k, y = cy + o.y * k;
        c.strokeStyle = `rgba(${o.v ? VI : CY},${0.18 * k})`;
        c.lineWidth = 0.7;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(x, y);
        c.stroke();
        c.fillStyle = `rgba(${o.v ? VI : CY},${0.4 + 0.5 * k})`;
        c.beginPath();
        c.arc(x, y, 1.6, 0, TAU);
        c.fill();
      }
      if (p > 0.9) {
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, 60);
        g.addColorStop(0, `rgba(255,255,255,${(1 - p) * 6})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.fillRect(cx - 64, cy - 64, 128, 128);
      }
    },
  };
};

const bgWave = (cx: number, cy: number, w: number, h: number): Fx => {
  const cols = Array.from({ length: 34 }, () => ({ x: rnd(0, w), sp: rnd(120, 340), len: rnd(40, 120), ph: rnd(0, h) }));
  return {
    layer: "bg", t0: 0, dur: 3400,
    draw: (c, p, s) => {
      const env = Math.sin(Math.PI * p);
      for (let i = 0; i < 3; i++) {
        const q = (p * 1.4 - i * 0.18);
        if (q <= 0 || q >= 1) continue;
        c.strokeStyle = `rgba(${CY},${(1 - q) * 0.16 * env})`;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(cx, cy, q * Math.max(w, h), 0, TAU);
        c.stroke();
      }
      for (const o of cols) {
        const y = ((o.ph + s * o.sp) % (h + o.len)) - o.len;
        const g = c.createLinearGradient(0, y, 0, y + o.len);
        g.addColorStop(0, `rgba(${CY},0)`);
        g.addColorStop(1, `rgba(${CY},${0.22 * env})`);
        c.fillStyle = g;
        c.fillRect(o.x, y, 1, o.len);
      }
    },
  };
};

const pageScan = (w: number, h: number): Fx => ({
  layer: "fx", t0: 0, dur: 1900,
  draw: (c, p) => {
    const y = p * h;
    const g = c.createLinearGradient(0, y - 90, 0, y);
    g.addColorStop(0, `rgba(${CY},0)`);
    g.addColorStop(1, `rgba(${CY},0.1)`);
    c.fillStyle = g;
    c.fillRect(0, y - 90, w, 90);
    c.fillStyle = `rgba(${CY},0.7)`;
    c.fillRect(0, y, w, 1.5);
    c.font = "10px ui-monospace, Menlo, monospace";
    c.fillStyle = `rgba(${CY},0.8)`;
    c.fillText(`SCANNING ${String(Math.round(p * 100)).padStart(3, "0")}%`, 14, Math.max(14, y - 8));
  },
});

const burst = (w: number, h: number): Fx => {
  const cx = w / 2, cy = h / 2;
  const ps = Array.from({ length: 150 }, () => { const a = rnd(0, TAU); return { a, v: rnd(120, 560), life: rnd(1.2, 2.6), c: Math.random() < 0.45 ? VI : Math.random() < 0.5 ? CY : "255,255,255", sz: rnd(0.8, 2.2), d: Math.random() < 0.4 ? 1.95 : 0 }; });
  return {
    layer: "fx", t0: 0, dur: 3800,
    draw: (c, p, s) => {
      for (const t of [0, 0.35, 1.95]) {
        const q = (s - t) / 1.6;
        if (q <= 0 || q >= 1) continue;
        c.strokeStyle = `rgba(${t === 1.95 ? "255,255,255" : CY},${(1 - q) * 0.6})`;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(cx, cy, q * Math.max(w, h) * 0.55, 0, TAU);
        c.stroke();
      }
      for (const o of ps) {
        const t = s - o.d;
        if (t < 0 || t > o.life) continue;
        const dist = o.v * (1 - Math.exp(-t * 2.2)) / 2.2;
        c.fillStyle = `rgba(${o.c},${(1 - t / o.life) * 0.9})`;
        c.beginPath();
        c.arc(cx + Math.cos(o.a) * dist, cy + Math.sin(o.a) * dist, o.sz, 0, TAU);
        c.fill();
      }
      if (s > 1.95 && s < 2.25) {
        c.fillStyle = `rgba(255,255,255,${(1 - (s - 1.95) / 0.3) * 0.18})`;
        c.fillRect(0, 0, w, h);
      }
    },
  };
};

const neural = (w: number, h: number): Fx => {
  const ns = Array.from({ length: 44 }, () => ({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-16, 16), vy: rnd(-16, 16), v: Math.random() < 0.4 }));
  return {
    layer: "bg", t0: 0, dur: 4200,
    draw: (c, p, s) => {
      const env = Math.sin(Math.PI * p);
      const pos = ns.map((n) => [n.x + n.vx * s, n.y + n.vy * s] as const);
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1], d = Math.hypot(dx, dy);
          if (d < 170) {
            c.strokeStyle = `rgba(${CY},${(1 - d / 170) * 0.2 * env})`;
            c.lineWidth = 0.7;
            c.beginPath();
            c.moveTo(pos[i][0], pos[i][1]);
            c.lineTo(pos[j][0], pos[j][1]);
            c.stroke();
          }
        }
      }
      ns.forEach((n, i) => {
        c.fillStyle = `rgba(${n.v ? VI : CY},${0.7 * env})`;
        c.beginPath();
        c.arc(pos[i][0], pos[i][1], 2, 0, TAU);
        c.fill();
      });
    },
  };
};

const rain = (w: number, h: number): Fx => {
  const cols = Array.from({ length: Math.floor(w / 26) }, (_, i) => ({ x: i * 26 + 6, sp: rnd(90, 260), ph: rnd(0, h), ch: Array.from({ length: 14 }, () => (Math.random() < 0.5 ? "0" : "1")) }));
  return {
    layer: "bg", t0: 0, dur: 3200,
    draw: (c, p, s) => {
      const env = Math.sin(Math.PI * p);
      c.font = "12px ui-monospace, Menlo, monospace";
      for (const o of cols) {
        const y0 = ((o.ph + s * o.sp) % (h + 200)) - 200;
        o.ch.forEach((ch, i) => {
          c.fillStyle = `rgba(${CY},${(i / o.ch.length) * 0.22 * env})`;
          c.fillText(ch, o.x, y0 + i * 14);
        });
      }
    },
  };
};

const lock = (r: DOMRect): Fx => ({
  layer: "fx", t0: 0, dur: 1500,
  draw: (c, p) => {
    const k = p < 0.4 ? 1 - ease(p / 0.4) : 0;
    const pad = 8 + k * 46;
    const a = Math.min(1, p * 4) * (p > 0.8 ? (1 - p) * 5 : 1);
    c.strokeStyle = `rgba(${CY},${a * 0.9})`;
    c.lineWidth = 1.5;
    const x0 = r.left - pad, y0 = r.top - pad, x1 = r.right + pad, y1 = r.bottom + pad, l = 9;
    for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      c.beginPath();
      c.moveTo(x, y + dy * l);
      c.lineTo(x, y);
      c.lineTo(x + dx * l, y);
      c.stroke();
    }
    if (p > 0.4) {
      c.font = "10px ui-monospace, Menlo, monospace";
      c.fillStyle = `rgba(${CY},${a})`;
      c.fillText("LOCKED", x0, y1 + 16);
    }
  },
});

/* ---------- component ---------- */
export default function LogoEasterEgg() {
  const fxRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const fxs = useRef<Fx[]>([]);
  const raf = useRef(0);
  const count = useRef(0);
  const lastClick = useRef(0);
  const lockUntil = useRef(0);
  const idle = useRef(0);
  const timers = useRef<number[]>([]);
  const hasClip = useRef<boolean | null>(null);
  const rewardPlayed = useRef(false);

  const [reward, setReward] = useState<{ stage: number; out: boolean } | null>(null);
  const [ringDisplay, setRing] = useState<{ x: number; y: number; n: number } | null>(null);
  const [dev, setDev] = useState<{ lines: string[]; out: boolean } | null>(null);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.current.push(id);
      return id;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      size.current = { w: window.innerWidth, h: window.innerHeight, dpr };
      for (const cv of [fxRef.current, bgRef.current]) {
        if (!cv) continue;
        cv.width = Math.floor(size.current.w * dpr);
        cv.height = Math.floor(size.current.h * dpr);
        cv.style.width = `${size.current.w}px`;
        cv.style.height = `${size.current.h}px`;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = (now: number) => {
      const { w, h, dpr } = size.current;
      const list = fxs.current;
      for (const [layer, cv] of [["fx", fxRef.current], ["bg", bgRef.current]] as const) {
        const c = cv?.getContext("2d");
        if (!c) continue;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, w, h);
        c.globalCompositeOperation = "lighter";
        for (const f of list) {
          if (f.layer !== layer) continue;
          const el = now - f.t0;
          if (el >= 0 && el <= f.dur) f.draw(c, Math.min(1, el / f.dur), el / 1000);
        }
      }
      fxs.current = list.filter((f) => now - f.t0 < f.dur);
      if (fxs.current.length) raf.current = requestAnimationFrame(tick);
      else {
        raf.current = 0;
        for (const cv of [fxRef.current, bgRef.current]) cv?.getContext("2d")?.clearRect(0, 0, cv.width, cv.height);
      }
    };
    const add = (fx: Fx) => {
      fx.t0 = performance.now();
      fxs.current.push(fx);
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const logo = (el?: HTMLElement | null) => {
      const a = el ?? document.querySelector<HTMLElement>("[data-budai-logo]");
      const svg = a?.querySelector("svg")?.getBoundingClientRect();
      const r = svg ?? a?.getBoundingClientRect() ?? new DOMRect(20, 18, 42, 42);
      return { a, r, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const tag = (a: HTMLElement | null, step: number, ms: number) => {
      if (!a) return;
      a.removeAttribute("data-egg");
      void a.offsetWidth;
      a.setAttribute("data-egg", String(step));
      later(() => a.removeAttribute("data-egg"), ms);
    };

    const typeInto = (lines: string[], set: (l: string[]) => void, cps: number, done?: () => void) => {
      let li = 0, ci = 0;
      const out: string[] = [""];
      const step = () => {
        if (li >= lines.length) return done?.();
        ci++;
        out[li] = lines[li].slice(0, ci);
        set([...out]);
        if (ci >= lines[li].length) {
          li++;
          ci = 0;
          out.push("");
          later(step, 260);
        } else later(step, 1000 / cps);
      };
      step();
    };
    const onClick = (ev?: Event) => {
      const clicked = (ev as CustomEvent<{ el?: HTMLElement | null }> | undefined)?.detail?.el ?? null;
      const now = performance.now();
      if (now - lastClick.current < 260 || now < lockUntil.current) return;
      lastClick.current = now;
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => {
        count.current = 0;
        setRing(null);
      }, 9000);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const step = ++count.current;
      const { a, r, x, y } = logo(clicked);
      const { w, h } = size.current;
      setRing({ x, y, n: step });
      if (step === 1 && hasClip.current === null) {
        hasClip.current = false;
        fetch(CLIP_URL, { method: "HEAD" }).then((res) => (hasClip.current = res.ok)).catch(() => undefined);
      }

      if (reduced) {
        if (step >= 15) count.current = 0;
        return;
      }

      switch (step) {
        case 1: // pulse
          tag(a, 1, 900);
          add(ring(x, y));
          break;
        case 2: // orbiting particles
          tag(a, 2, 600);
          add(orbit(x, y));
          break;
        case 3: // glitch + scan + status
          tag(a, 3, 600);
          add(scan(x, y));
          break;
        case 4: // data streams out
          tag(a, 4, 600);
          add(stream(x, y));
          break;
        case 5: // transform + rebuild
          lockUntil.current = now + 1800;
          tag(a, 5, 1800);
          add(rebuild(x, y));
          break;
        case 6: // background reacts
          tag(a, 6, 700);
          add(ring(x, y));
          add(bgWave(x, y, w, h));
          break;
        case 7: // core pulse + data flow
          tag(a, 1, 900);
          add(ring(x, y));
          add(stream(x, y));
          break;
        case 8: // page scan
          tag(a, 3, 600);
          add(pageScan(w, h));
          break;
        case 9: { // reward: big animation + one short sting
          lockUntil.current = now + 4000;
          tag(a, 5, 1800);
          add(burst(w, h));
          setReward({ stage: 0, out: false });
          later(() => setReward({ stage: 1, out: false }), 500);
          later(() => setReward({ stage: 2, out: false }), 1150);
          later(() => setReward({ stage: 3, out: false }), 1950);
          later(() => setReward({ stage: 3, out: true }), 3400);
          later(() => setReward(null), 3900);
          if (!rewardPlayed.current || count.current !== 0) {
            rewardPlayed.current = true;
            void playReward(!!hasClip.current).catch(() => undefined);
          }
          break;
        }
        case 10: // hologram flip
          tag(a, 10, 1100);
          add(ring(x, y));
          break;
        case 11:
          tag(a, 2, 600);
          add(orbit(x, y));
          break;
        case 12:
          tag(a, 6, 700);
          add(neural(w, h));
          break;
        case 13:
          tag(a, 4, 600);
          add(rain(w, h));
          break;
        case 14:
          tag(a, 3, 600);
          add(lock(r));
          break;
        default: { // 15: developer mode
          lockUntil.current = now + 5200;
          tag(a, 5, 1800);
          add(burst(w, h));
          add(bgWave(x, y, w, h));
          document.documentElement.dataset.devMode = "on";
          later(() => delete document.documentElement.dataset.devMode, 14000);
          setDev({ lines: [], out: false });
          later(() => typeInto(["BUDAI // DEVELOPER MODE", "CORE ONLINE", "STILLEDEV"], (l) => setDev({ lines: l.filter((s, i) => s || i === 0), out: false }), 30), 400);
          later(() => setDev((d) => (d ? { ...d, out: true } : d)), 4600);
          later(() => setDev(null), 5200);
          count.current = 0;
          rewardPlayed.current = false;
          later(() => setRing(null), 2800);
        }
      }
    };

    window.addEventListener("budai:logo-click", onClick);
    return () => {
      window.removeEventListener("budai:logo-click", onClick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
      window.clearTimeout(idle.current);
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <>
      <canvas ref={bgRef} aria-hidden className="pointer-events-none fixed inset-0 z-[2]" />
      <canvas ref={fxRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70]" />

      {ringDisplay && (
        <svg
          aria-hidden
          width="72"
          height="72"
          viewBox="-36 -36 72 72"
          className="pointer-events-none fixed z-[71]"
          style={{ left: ringDisplay.x - 36, top: ringDisplay.y - 36, filter: "drop-shadow(0 0 4px rgba(0,229,255,0.7))" }}
        >
          {Array.from({ length: 15 }, (_, i) => {
            const a = ((-90 + i * 24) * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={Math.cos(a) * 28}
                y1={Math.sin(a) * 28}
                x2={Math.cos(a) * 33}
                y2={Math.sin(a) * 33}
                stroke={i < ringDisplay.n ? (i % 3 === 2 ? "#7c5cff" : "#00e5ff") : "rgba(255,255,255,0.14)"}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}

      {reward && (
        <div aria-hidden className={`pointer-events-none fixed inset-0 z-[80] flex flex-col items-center justify-center transition-opacity duration-500 ${reward.out ? "opacity-0" : "opacity-100"}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(2,2,5,0.45),rgba(2,2,5,0.88))]" />
          <div className="relative scale-[1.7] sm:scale-[2.3]">
            <Logo3D />
          </div>
          <div className="relative mt-24 space-y-2 text-center font-mono sm:mt-32">
            {reward.stage >= 1 && <p className="bud-pop text-xs tracking-[0.35em] text-white/60">10 YEARS OF CODE</p>}
            {reward.stage >= 2 && <p className="bud-pop text-xs tracking-[0.35em] text-white/60">2 YEARS OF BUDAI</p>}
            {reward.stage >= 3 && <p className="bud-pop bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-2xl font-bold tracking-[0.3em] text-transparent sm:text-3xl">WE MADE IT.</p>}
          </div>
        </div>
      )}

      {dev && (
        <div aria-hidden className={`pointer-events-none fixed inset-0 z-[80] flex items-center justify-center transition-opacity duration-500 ${dev.out ? "opacity-0" : "opacity-100"}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(2,2,5,0.35),rgba(2,2,5,0.9))]" />
          <div className="bud-scanlines absolute inset-0" />
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-accent-cyan/30 bg-[#07070e]/90 p-6 font-mono shadow-[0_0_90px_-20px_rgba(0,229,255,0.6)] backdrop-blur-xl">
            {dev.lines.map((l, i) => (
              <p key={i} className={i === 0 ? "text-sm tracking-[0.18em] text-accent-cyan" : i === 1 ? "mt-3 text-sm tracking-[0.2em] text-accent-green" : "mt-1 text-2xl font-bold tracking-[0.4em] text-white"}>
                {l}
                {i === dev.lines.length - 1 && <span className="bud-caret" />}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
