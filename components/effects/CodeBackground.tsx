"use client";

import { motion } from "framer-motion";

const codeSnippets = [
  "const ai = new BudAI();",
  "await automate.process();",
  "const result = analyze(data);",
  "system.optimize();",
  "const insight = extract();",
  "workflow.enhance();",
  "data.transform();",
];

export default function CodeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-35">
      {Array.from({ length: 5 }).map((_, row) => (
        <motion.div
          key={row}
          initial={{ x: "100vw", opacity: 0 }}
          animate={{ x: "-100vw", opacity: [0, 0.5, 0] }}
          transition={{
            duration: 7 + row * 0.4,
            repeat: Infinity,
            ease: "linear",
            delay: row * 0.25,
          }}
          className="absolute whitespace-nowrap text-xs font-mono text-accent-cyan/50 will-change-transform"
          style={{
            top: `${20 + row * 14}%`,
            textShadow: "0 0 8px rgba(0,229,255,0.15)",
            pointerEvents: "none",
          }}
        >
          {codeSnippets[row % codeSnippets.length]}
        </motion.div>
      ))}
    </div>
  );
}

