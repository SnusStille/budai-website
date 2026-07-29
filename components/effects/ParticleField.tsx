"use client";

import { useEffect, useRef } from "react";

interface P {
  x: number; y: number; size: number; speedY: number; speedX: number;
  opacity: number; char: string; color: string;
}

const chars = ["0","1","{","}","<",">","/",";","=","+","-","*","&","|","!","?","λ","∑","∆","∞","→","⇒","≡","≠","≤","≥"];
const colors = ["rgba(0,229,255,", "rgba(185,103,255,", "rgba(0,255,157,"];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const count = Math.min(30, Math.floor(W / 50));
    const ps: P[] = [];

    for (let i = 0; i < count; i++) {
      ps.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 14 + 8,
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.12 + 0.03,
        char: chars[Math.floor(Math.random() * chars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -30) { p.y = H + 30; p.x = Math.random() * W; p.char = chars[Math.floor(Math.random() * chars.length)]; }
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;

        ctx.font = `${p.size}px var(--font-jetbrains), monospace`;
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fillText(p.char, p.x, p.y);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(rafRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" style={{ opacity: 0.5 }} />;
}
