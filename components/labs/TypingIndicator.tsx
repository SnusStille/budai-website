"use client";

/**
 * Typing indicator — staged thinking states shown while waiting for first AI token.
 * Cycles through "Analyzing", "Thinking", "Drafting" to give a sense of active processing.
 * Three bouncing dots pulse below the label.
 */
import { useState, useEffect } from "react";

const STAGES_SV = ["Analyserar…", "Tänker…", "Formulerar svar…"];
const STAGES_EN = ["Analyzing…", "Thinking…", "Drafting response…"];

export default function TypingIndicator({ lang = "en" }: { lang?: "sv" | "en" }) {
  const stages = lang === "sv" ? STAGES_SV : STAGES_EN;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Cycle through stages every 1.8s to show progress
    const id = setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 1800);
    return () => clearInterval(id);
  }, [stages.length]);

  return (
    <span className="ti-wrap" role="status" aria-live="polite" aria-label={stages[stage]}>
      <span className="ti-stage">{stages[stage]}</span>
      <span className="ti-dots">
        {[0,1,2].map(i => (
          <span
            key={i}
            className="ti-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
    </span>
  );
}
