"use client";

import { useEffect, useState } from "react";

const codeSnippets = [
  "const ai = new BudAI();",
  "await automate.process();",
  "const result = analyze(data);",
  "system.optimize();",
  "const insight = extract();",
  "workflow.enhance();",
];

/** CSS-only marquee — no framer infinite loops per row */
export default function CodeBackground() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  if (!ok) return null;

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none" aria-hidden>
      {codeSnippets.slice(0, 5).map((snippet, row) => (
        <div
          key={row}
          className="absolute whitespace-nowrap text-xs font-mono text-accent-cyan/45 code-marquee"
          style={{
            top: `${18 + row * 15}%`,
            animationDuration: `${18 + row * 3}s`,
            animationDelay: `${row * -2.5}s`,
            textShadow: "0 0 8px rgba(0,229,255,0.12)",
          }}
        >
          {snippet}&nbsp;&nbsp;&nbsp;{snippet}&nbsp;&nbsp;&nbsp;{snippet}&nbsp;&nbsp;&nbsp;{snippet}
        </div>
      ))}
    </div>
  );
}
