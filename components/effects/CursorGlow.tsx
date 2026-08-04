"use client";

import { useEffect, useRef } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

export default function CursorGlow() {
  const pos = useMousePosition();
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${pos.x - 200}px, ${pos.y - 200}px)`;
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pos.x, pos.y]);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[5]"
      style={{
        background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
