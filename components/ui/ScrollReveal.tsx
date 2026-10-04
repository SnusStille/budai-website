"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  duration?: number;
}

export default function ScrollReveal({ children, className = "", delay = 0, direction = "up", duration = 0.55 }: Props) {
  const reduceMotion = useReducedMotion();
  const dirs = {
    up: { y: 36, x: 0, scale: 1 },
    down: { y: -36, x: 0, scale: 1 },
    left: { x: 36, y: 0, scale: 1 },
    right: { x: -36, y: 0, scale: 1 },
    scale: { x: 0, y: 0, scale: 0.96 },
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, ...dirs[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px", amount: 0.15 }}
      transition={{ duration: reduceMotion ? 0 : duration, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
