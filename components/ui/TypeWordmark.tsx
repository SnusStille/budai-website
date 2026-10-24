"use client";

import { useEffect, useState } from "react";

const WORD = "BudAI";

/**
 * The wordmark. It used to type and delete itself forever, which read as a bug on
 * mobile screenshots and made a brand mark feel unstable. It now settles immediately
 * and only performs a single, quick letter-assemble on first paint.
 */
export default function TypeWordmark() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOn(true);
      return;
    }
    const id = window.setTimeout(() => setOn(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <span className="inline-flex items-baseline text-[1.05rem] font-bold tracking-tight text-white sm:text-[1.15rem]">
      {WORD.split("").map((c, i) => (
        <span
          key={i}
          className={`inline-block transition-[opacity,transform] duration-300 ease-out ${
            i >= 3 ? "text-accent-cyan" : ""
          } ${on ? "translate-y-0 opacity-100" : "translate-y-0.5 opacity-0"}`}
          style={{ transitionDelay: `${i * 45}ms` }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}
