"use client";

/**
 * Page transition template for Labs routes.
 * Provides a subtle fade + slight upward slide when navigating between
 * Labs pages (e.g., /labs → /labs/[id]) and from/to other site sections.
 * Respects prefers-reduced-motion.
 */
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

export default function LabsTemplate({ children }: { children: ReactNode }) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        duration: 0.22,
        ease: [0.2, 0.0, 0, 1],
      }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
