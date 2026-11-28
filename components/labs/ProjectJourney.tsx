"use client";

/**
 * Project Journey — discreet progress indicator.
 * Shows where the customer is in the consultation:
 * Discovery → Understanding → Scope → Review → Submitted.
 * Appears once the conversation starts; never looks like a form.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";

type Stage =
  | "discovery"
  | "scoping"
  | "assessment"
  | "blueprint_ready"
  | "conclusion_proposed"
  | "awaiting_confirmation"
  | "contact_ready"
  | "submitted"
  | "closed";

const STAGES_SV: { key: Stage; label: string }[] = [
  { key: "discovery", label: "Förstår idén" },
  { key: "scoping", label: "Utforskar omfattning" },
  { key: "assessment", label: "Bedömer" },
  { key: "blueprint_ready", label: "Sammanfattar" },
  { key: "submitted", label: "Skickat" },
];

const STAGES_EN: { key: Stage; label: string }[] = [
  { key: "discovery", label: "Understanding" },
  { key: "scoping", label: "Exploring scope" },
  { key: "assessment", label: "Assessing" },
  { key: "blueprint_ready", label: "Summarizing" },
  { key: "submitted", label: "Submitted" },
];

function getActiveIndex(stage: Stage, lang: "sv" | "en"): number {
  const stages = lang === "sv" ? STAGES_SV : STAGES_EN;
  // Map conversation stages to journey stages
  const mapping: Record<Stage, number> = {
    discovery: 0,
    scoping: 1,
    assessment: 2,
    blueprint_ready: 3,
    conclusion_proposed: 3,
    awaiting_confirmation: 3,
    contact_ready: 4,
    submitted: 4,
    closed: 4,
  };
  return Math.min(mapping[stage] ?? 0, stages.length - 1);
}

export default function ProjectJourney({
  stage,
  lang,
  visible = true,
}: {
  stage: Stage;
  lang: "sv" | "en";
  visible?: boolean;
}) {
  const stages = lang === "sv" ? STAGES_SV : STAGES_EN;
  const activeIdx = useMemo(() => getActiveIndex(stage, lang), [stage, lang]);

  if (!visible) return null;

  // Show from first message onwards so customer always sees progress
  if (stage === "discovery") {
    // Discovery stage — show "Start" dot active
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="pj-container"
      role="progressbar"
      aria-valuenow={activeIdx + 1}
      aria-valuemin={1}
      aria-valuemax={stages.length}
      aria-label={lang === "sv" ? "Konsultationsframsteg" : "Consultation progress"}
    >
      <div className="pj-track">
        {stages.map((s, i) => (
          <div key={s.key} className="pj-step">
            <div className={`pj-dot ${i <= activeIdx ? "pj-dot-active" : ""} ${i === activeIdx ? "pj-dot-current" : ""}`}>
              {i < activeIdx ? (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : null}
            </div>
            {i < stages.length - 1 && (
              <div className={`pj-line ${i < activeIdx ? "pj-line-active" : ""}`} />
            )}
          </div>
        ))}
      </div>
      <div className="pj-labels">
        {stages.map((s, i) => (
          <span
            key={s.key}
            className={`pj-label ${i === activeIdx ? "pj-label-current" : ""} ${i < activeIdx ? "pj-label-done" : ""}`}
          >
            {s.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
