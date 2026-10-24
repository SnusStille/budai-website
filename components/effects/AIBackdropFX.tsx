"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const CY = "0,229,255";
const VI = "124,92,255";
const WORDS = ["token", "embed", "attention", "softmax", "prompt", "context", "vector", "Hej!", "BudAI", "logits", "stream", "agent"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Ev = { kind: "comet" | "pulse" | "tokens" | "scan"; t0: number; dur: number; d: Record<string, number | number[] | string[]> };

/**
 * Interactive AI backdrop: a hidden neural mesh that lights up around your cursor,
 * plus rare surprises (comets, inference pulses, floating tokens, scan sweeps).
 */
export default function AIBackdropFX() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const c = cv?.getContext("2d");
    if (!cv || !c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.innerWidth < 768;
    let W = 0, H = 0;
    const N = mobile ? 26 : 72;
    const nodes = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), vx: rnd(-0.004, 0.004), vy: rnd(-0.004, 0.004), v: Math.random() < 0.4 }));
    const mouse = { x: -999, y: -999 };
    let evs: Ev[] = [];
    let raf = 0, last = 0, nextEv = performance.now() + 7000, hidden = false;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W;
      cv.height = H;
    };
    resize();

    const pos = (i: number, sy: number) => [nodes[i].x * W, ((nodes[i].y * H * 1.3 - sy * 0.12) % (H * 1.3) + H * 1.3) % (H * 1.3) - H * 0.15] as const;

    const spawn = (now: number) => {
      const r = Math.random();
      if (r < 0.3) {
        const fromLeft = Math.random() < 0.5;
        evs.push({ kind: "comet", t0: now, dur: 1100, d: { x: fromLeft ? -80 : W + 80, y: rnd(0, H * 0.7), dx: fromLeft ? 1 : -1, dy: rnd(0.25, 0.7) } });
      } else if (r < 0.62) {
        const chain: number[] = [Math.floor(Math.random() * N)];
        for (let k = 0; k < 6; k++) {
          const [px, py] = [nodes[chain[k]].x, nodes[chain[k]].y];
          let best = -1, bd = 9;
          for (let j = 0; j < N; j++) {
            if (chain.includes(j)) continue;
            const dd = Math.hypot(nodes[j].x - px, (nodes[j].y - py) * 0.6);
            if (dd < bd) { bd = dd; best = j; }
          }
          if (best < 0) break;
          chain.push(best);
        }
        evs.push({ kind: "pulse", t0: now, dur: 2200, d: { chain } });
      } else if (r < 0.88) {
        evs.push({ kind: "tokens", t0: now, dur: 3600, d: { x: Array.from({ length: 8 }, () => rnd(0.05, 0.95)), y: Array.from({ length: 8 }, () => rnd(0.4, 1)), w: Array.from({ length: 8 }, () => WORDS[Math.floor(Math.random() * WORDS.length)]) } });
      } else {
        evs.push({ kind: "scan", t0: now, dur: 1300, d: {} });
      }
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const typing = document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLInputElement;
      if (hidden || now - last < (typing ? 90 : 33)) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const sy = window.scrollY;
      c.clearRect(0, 0, W, H);
      c.globalCompositeOperation = "lighter";

      for (const n of nodes) {
        n.x += n.vx * dt * 6;
        n.y += n.vy * dt * 6;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }
      const P = nodes.map((_, i) => pos(i, sy));
      const R = 210;
      for (let i = 0; i < N; i++) {
        const dm = Math.hypot(P[i][0] - mouse.x, P[i][1] - mouse.y);
        const near = Math.max(0, 1 - dm / R);
        if (near > 0) {
          c.strokeStyle = `rgba(${CY},${near * 0.4})`;
          c.lineWidth = 0.8;
          c.beginPath();
          c.moveTo(mouse.x, mouse.y);
          c.lineTo(P[i][0], P[i][1]);
          c.stroke();
          for (let j = i + 1; j < N; j++) {
            const dj = Math.hypot(P[j][0] - mouse.x, P[j][1] - mouse.y);
            const dd = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]);
            if (dj < R && dd < 150) {
              c.strokeStyle = `rgba(${VI},${Math.min(near, 1 - dj / R) * 0.35})`;
              c.beginPath();
              c.moveTo(P[i][0], P[i][1]);
              c.lineTo(P[j][0], P[j][1]);
              c.stroke();
            }
          }
        }
        c.fillStyle = `rgba(${nodes[i].v ? VI : CY},${0.07 + near * 0.9})`;
        c.beginPath();
        c.arc(P[i][0], P[i][1], 1.2 + near * 2, 0, TAU);
        c.fill();
      }

      if (now > nextEv && evs.length < 2) {
        spawn(now);
        nextEv = now + rnd(11000, 24000);
      }
      evs = evs.filter((e) => now - e.t0 < e.dur);
      for (const e of evs) {
        const p = (now - e.t0) / e.dur;
        const env = Math.sin(Math.PI * p);
        if (e.kind === "comet") {
          const x = (e.d.x as number) + (e.d.dx as number) * p * 1100;
          const y = (e.d.y as number) + (e.d.dy as number) * p * 1100;
          const tx = x - (e.d.dx as number) * 200, ty = y - (e.d.dy as number) * 200;
          const g = c.createLinearGradient(tx, ty, x, y);
          g.addColorStop(0, `rgba(${CY},0)`);
          g.addColorStop(1, `rgba(${CY},${0.9 * env})`);
          c.strokeStyle = g;
          c.lineWidth = 1.6;
          c.beginPath();
          c.moveTo(tx, ty);
          c.lineTo(x, y);
          c.stroke();
          c.fillStyle = `rgba(255,255,255,${env})`;
          c.beginPath();
          c.arc(x, y, 2, 0, TAU);
          c.fill();
        } else if (e.kind === "pulse") {
          const chain = e.d.chain as number[];
          const seg = p * (chain.length - 1);
          for (let k = 0; k < chain.length - 1; k++) {
            const a = P[chain[k]], b = P[chain[k + 1]];
            c.strokeStyle = `rgba(${CY},${0.28 * env})`;
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(a[0], a[1]);
            c.lineTo(b[0], b[1]);
            c.stroke();
            const lit = Math.max(0, 1 - Math.abs(seg - k - 0.5) * 1.4);
            c.fillStyle = `rgba(${VI},${lit * 0.9})`;
            c.beginPath();
            c.arc(a[0], a[1], 3 + lit * 3, 0, TAU);
            c.fill();
          }
          const k = Math.min(chain.length - 2, Math.floor(seg));
          const f = seg - k;
          const a = P[chain[k]], b = P[chain[k + 1]];
          c.fillStyle = `rgba(255,255,255,${env})`;
          c.beginPath();
          c.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 3, 0, TAU);
          c.fill();
        } else if (e.kind === "tokens") {
          c.font = "11px ui-monospace, Menlo, monospace";
          (e.d.w as string[]).forEach((w, i) => {
            const x = (e.d.x as number[])[i] * W;
            const y = (e.d.y as number[])[i] * H - p * 120 - i * 6;
            c.fillStyle = `rgba(${i % 3 === 0 ? VI : CY},${env * 0.55})`;
            c.fillText(w, x, y);
          });
        } else {
          const y = p * H;
          c.fillStyle = `rgba(${CY},${0.5 * env})`;
          c.fillRect(0, y, W, 1.2);
          const g = c.createLinearGradient(0, y - 70, 0, y);
          g.addColorStop(0, `rgba(${CY},0)`);
          g.addColorStop(1, `rgba(${CY},${0.07 * env})`);
          c.fillStyle = g;
          c.fillRect(0, y - 70, W, 70);
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -999;
    };
    const onVis = () => {
      hidden = document.hidden;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[1]" />;
}
