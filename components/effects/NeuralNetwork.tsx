"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number; y: number; vx: number; vy: number; r: number;
  layer: number; pulse: number; pulseSpeed: number;
}

export default function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const isMobile = W < 768;
    const count = isMobile ? 60 : 140;
    const nodes: Node[] = [];
    const layers = 3;

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        layer: Math.floor(Math.random() * layers),
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    const colors = ["rgba(0, 229, 255,", "rgba(185, 103, 255,", "rgba(0, 255, 157,"];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        const dx = n.x - mouseRef.current.x;
        const dy = n.y - mouseRef.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200 && d > 0) {
          const f = (200 - d) / 200;
          n.vx += (dx / d) * f * 0.03;
          n.vy += (dy / d) * f * 0.03;
        }
        n.vx *= 0.999; n.vy *= 0.999;

        const alpha = 0.4 + Math.sin(n.pulse) * 0.3;
        const color = colors[n.layer];

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `${color} ${alpha})`;
        ctx.fill();

        if (n.r > 1.2) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
          g.addColorStop(0, `${color} 0.1)`);
          g.addColorStop(1, `${color} 0)`);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = a.layer === b.layer ? 180 : 120;

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.12;
            const color = colors[a.layer];
            ctx.beginPath();
            ctx.strokeStyle = `${color} ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      const mg = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 250
      );
      mg.addColorStop(0, "rgba(0, 229, 255, 0.06)");
      mg.addColorStop(1, "rgba(0, 229, 255, 0)");
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
