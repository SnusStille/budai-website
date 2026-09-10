"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";

/** Magnetic CTA pull — disabled on touch / reduced-motion for perf. */
export default function Magnetic({
  children,
  strength = 0.25,
  className = "inline-block",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduce && window.innerWidth >= 768);
  }, []);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setPos({ x: x * strength, y: y * strength });
  };

  const onMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
