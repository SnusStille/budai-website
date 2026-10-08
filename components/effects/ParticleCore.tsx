"use client";

import { useEffect, useRef } from "react";

type V3 = [number, number, number];
const TAU = Math.PI * 2;
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function sphere(n: number): V3[] {
  const out: V3[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    out.push([Math.cos(g * i) * r, y, Math.sin(g * i) * r]);
  }
  return out;
}

/** Points laid along the BudAI "</>" mark. */
function mark(n: number): V3[] {
  const segs: [number, number, number, number][] = [
    [-0.38, -0.5, -0.86, 0], [-0.86, 0, -0.38, 0.5],
    [0.38, -0.5, 0.86, 0], [0.86, 0, 0.38, 0.5],
    [0.14, -0.62, -0.14, 0.62],
  ];
  const lens = segs.map(([a, b, c, d]) => Math.hypot(c - a, d - b));
  const total = lens.reduce((x, y) => x + y, 0);
  const out: V3[] = [];
  for (let i = 0; i < n; i++) {
    let u = (i / n) * total;
    let k = 0;
    while (k < segs.length - 1 && u > lens[k]) {
      u -= lens[k];
      k++;
    }
    const [a, b, c, d] = segs[k];
    const f = u / lens[k];
    out.push([a + (c - a) * f, b + (d - b) * f, (Math.random() - 0.5) * 0.22]);
  }
  return out;
}

/** Dependency-free 3D particle scene: a rotating neural sphere that morphs into the </> mark. */
export default function ParticleCore() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    const N = mobile ? 110 : 210;
    const S = sphere(N);
    const G = mark(N);
    let size = 0;

    const resize = () => {
      size = Math.min(window.innerWidth * 0.92, 680);
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let tx = 0, ty = 0, mx = 0, my = 0, spin = 0.6, raf = 0, last = 0, visible = true, boost = 0;
    const onType = () => {
      boost = 1;
    };
    const F = 520;

    const frame = (now: number, m: number, boost = 0) => {
      const R = size * 0.3;
      const cx = size / 2, cy = size / 2;
      const wrapped = ((spin + Math.PI) % TAU) - Math.PI;
      const ry = wrapped * (1 - m) + mx * 0.5;
      const rx = 0.25 * (1 - m) + my * 0.35;
      const cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);

      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = "lighter";
      const P: [number, number, number][] = [];
      for (let i = 0; i < N; i++) {
        const x = (S[i][0] + (G[i][0] - S[i][0]) * m) * R;
        const y = (S[i][1] + (G[i][1] - S[i][1]) * m) * R;
        const z = (S[i][2] + (G[i][2] - S[i][2]) * m) * R;
        const x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
        const y2 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
        const sc = F / (F + z2);
        P.push([cx + x1 * sc, cy + y2 * sc, sc]);
      }

      const L = size * (0.085 + boost * 0.03);
      ctx.lineWidth = 0.8;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1];
          const d2 = dx * dx + dy * dy;
          if (d2 < L * L) {
            ctx.strokeStyle = `rgba(0,229,255,${(1 - Math.sqrt(d2) / L) * 0.32})`;
            ctx.beginPath();
            ctx.moveTo(P[i][0], P[i][1]);
            ctx.lineTo(P[j][0], P[j][1]);
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < N; i++) {
        const t = i / N, sc = P[i][2];
        const a = Math.max(0.15, Math.min(1, 0.25 + (sc - 0.75) * 2.2));
        ctx.fillStyle = `rgba(${Math.round(124 * t)},${Math.round(229 - 137 * t)},255,${a})`;
        ctx.beginPath();
        ctx.arc(P[i][0], P[i][1], 1 + 1.7 * sc, 0, TAU);
        ctx.fill();
      }
    };

    if (reduced || mobile) {
      frame(0, 0);
      return;
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 33) return;
      last = now;
      const cyc = (now / 1000) % 10.5; // sphere 0-4s, morph, mark 5.5-9s, morph back
      let m = 0;
      if (cyc >= 4 && cyc < 5.5) m = ease((cyc - 4) / 1.5);
      else if (cyc >= 5.5 && cyc < 9) m = 1;
      else if (cyc >= 9) m = 1 - ease((cyc - 9) / 1.5);
      boost *= 0.94;
      spin += 0.006 + boost * 0.05;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      frame(now, m, boost);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("budai:typing", onType);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("budai:typing", onType);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute left-1/2 top-[3%] -translate-x-1/2 pointer-events-none opacity-70 [mask-image:radial-gradient(circle,#000_42%,transparent_72%)] [-webkit-mask-image:radial-gradient(circle,#000_42%,transparent_72%)]"
    />
  );
}
