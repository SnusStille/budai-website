"use client";

import { motion } from "framer-motion";

// A hand-drawn-looking highlighter stroke that draws itself in under a word,
// used to emphasize key terms across headlines instead of relying on color
// alone. Meant to sit inside a `relative inline-block` wrapper around the
// word it underlines.
export default function MarkerUnderline({
  color = "#00e5ff",
  delay = 0,
  duration = 0.7,
  thickness = 6,
  viewOnce = true,
}: {
  color?: string;
  delay?: number;
  duration?: number;
  thickness?: number;
  viewOnce?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
      className="absolute left-[-2%] -bottom-1 w-[104%] h-[0.4em] pointer-events-none overflow-visible"
      aria-hidden="true"
    >
      <motion.path
        d="M2,12 C45,18 85,5 120,10 C150,14 175,7 198,11"
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.5 }}
        viewport={{ once: viewOnce }}
        transition={{ duration, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
