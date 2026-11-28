"use client";

/**
 * Page transition template for Labs routes.
 * Uses opacity-only transition to avoid creating a containing block that
 * would break position:fixed elements (header, FABs) inside the page.
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.22,
        ease: [0.2, 0.0, 0, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
