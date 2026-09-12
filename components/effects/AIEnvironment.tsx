"use client";

import { useEffect, useRef } from "react";

/**
 * Marked AI + code infrastructure background.
 * One canvas, ~30fps, mobile-lite, paused off-tab.
 */
export default function AIEnvironment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);

    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    if (reduced) {
      // Static ambient only
      const g = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, Math.max(W, H) * 0.5);
      g.addColorStop(0, "rgba(0,229,255,0.1)");
      g.addColorStop(0.45, "rgba(185,103,255,0.05)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      return;
    }

    // Hex lattice nodes
    const nodeCount = isMobile ? 8 : 18;
    type Node = { x: number; y: number; vx: number; vy: number; r: number; hue: number; p: number; pulse: number };
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1.1 + Math.random() * 1.8,
      hue: Math.random() > 0.55 ? 0 : Math.random() > 0.5 ? 1 : 2,
      p: Math.random() * Math.PI * 2,
      pulse: 0.8 + Math.random() * 0.4,
    }));

    // Code rain columns — denser & brighter
    const glyphs = "01<>{}[]/=+*;:#λ∑→αβγδεζη01{}<>AI_CORE_RUN_async_await_fn";
    const colCount = isMobile ? 4 : 8;
    type Col = {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      opacity: number;
      size: number;
    };
    const cols: Col[] = Array.from({ length: colCount }, () => {
      const len = 8 + Math.floor(Math.random() * 14);
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 0.55 + Math.random() * 1.1,
        chars: Array.from({ length: len }, () => glyphs[Math.floor(Math.random() * glyphs.length)]),
        opacity: 0.14 + Math.random() * 0.18,
        size: 10 + Math.floor(Math.random() * 5),
      };
    });

    // Horizontal scan / data packets
    type Packet = { x: number; y: number; vx: number; w: number; hue: number };
    const packets: Packet[] = Array.from({ length: isMobile ? 2 : 5 }, () => ({
      x: Math.random() * W,
      y: 80 + Math.random() * (H - 160),
      vx: 1.2 + Math.random() * 2.4,
      w: 40 + Math.random() * 80,
      hue: Math.random() > 0.5 ? 0 : 1,
    }));

    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    if (!isMobile) window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    let running = true;
    let last = performance.now();
    const FRAME_MS = isMobile ? 66 : 40; // ~15fps mobile / 25fps desktop

    const bloom = (cx: number, cy: number, r: number, c: string) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, c);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };

    const colors = [
      (a: number) => `rgba(0,229,255,${a})`,
      (a: number) => `rgba(185,103,255,${a})`,
      (a: number) => `rgba(0,255,157,${a})`,
    ];

    const draw = (now: number) => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(draw);
      if (now - last < FRAME_MS) return;
      last = now;

      ctx.clearRect(0, 0, W, H);

      // Strong ambient blooms
      bloom(W * 0.5, H * 0.22, Math.min(W, H) * 0.48, "rgba(0,229,255,0.11)");
      bloom(W * 0.82, H * 0.5, Math.min(W, H) * 0.36, "rgba(185,103,255,0.09)");
      bloom(W * 0.15, H * 0.72, Math.min(W, H) * 0.3, "rgba(0,255,157,0.06)");

      // Soft perspective grid lines (few, not dense)
      ctx.strokeStyle = "rgba(0,229,255,0.04)";
      ctx.lineWidth = 1;
      const gy = H * 0.55;
      for (let i = 0; i < 8; i++) {
        const y = gy + i * i * 6;
        if (y > H) break;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Code rain
      for (const col of cols) {
        col.y += col.speed;
        if (col.y > H + col.chars.length * 16) {
          col.y = -col.chars.length * 16;
          col.x = Math.random() * W;
        }
        ctx.font = `${col.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        for (let i = 0; i < col.chars.length; i++) {
          const yy = col.y + i * (col.size + 4);
          if (yy < -20 || yy > H + 20) continue;
          const a = col.opacity * (1 - i / col.chars.length);
          ctx.fillStyle = i === 0 ? colors[0](Math.min(0.95, a * 2.2)) : colors[0](a);
          ctx.fillText(col.chars[i], col.x, yy);
        }
        if (Math.random() < 0.04) {
          const idx = Math.floor(Math.random() * col.chars.length);
          col.chars[idx] = glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }

      // Data packets (horizontal streaks)
      for (const pk of packets) {
        pk.x += pk.vx;
        if (pk.x > W + pk.w) {
          pk.x = -pk.w;
          pk.y = 80 + Math.random() * (H - 160);
        }
        const grad = ctx.createLinearGradient(pk.x, 0, pk.x + pk.w, 0);
        const c = pk.hue === 0 ? "0,229,255" : "185,103,255";
        grad.addColorStop(0, `rgba(${c},0)`);
        grad.addColorStop(0.5, `rgba(${c},0.45)`);
        grad.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(pk.x, pk.y, pk.w, 2);
        // head dot
        ctx.beginPath();
        ctx.arc(pk.x + pk.w * 0.7, pk.y + 1, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},0.9)`;
        ctx.fill();
      }

      // Neural links
      const linkDist = isMobile ? 120 : 165;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const d = Math.sqrt(d2);
            const op = (1 - d / linkDist) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = colors[a.hue](op);
            ctx.lineWidth = 0.7;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.p += 0.025 * n.pulse;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        if (!isMobile) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180 && d > 0) {
            const f = ((180 - d) / 180) * 0.03;
            n.vx += (dx / d) * f;
            n.vy += (dy / d) * f;
          }
          n.vx *= 0.994;
          n.vy *= 0.994;
        }

        const pulse = 0.45 + Math.sin(n.p) * 0.35;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = colors[n.hue](pulse);
        ctx.fill();
        // glow halo on larger nodes
        if (n.r > 1.8) {
          bloom(n.x, n.y, n.r * 6, colors[n.hue](0.12));
        }
      }

      if (!isMobile && mouse.x > 0) {
        bloom(mouse.x, mouse.y, 200, "rgba(0,229,255,0.07)");
      }
    };

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) {
        last = performance.now();
        rafRef.current = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (!isMobile) window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden
      style={{ opacity: 1 }}
    />
  );
}
