"use client";

/**
 * Project Summary Card — presented to the customer for confirmation
 * before the brief is sent to Oliver.
 *
 * Clear, structured, honest about unknowns ("Ej angivet").
 * Customer can confirm, request changes, or add info.
 * Inline edit buttons pre-fill the input with correction prompts.
 */
import { motion } from "framer-motion";
import { Check, Pencil, Plus, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";

export interface SummaryData {
  project_title?: string | null;
  customer_goal?: string | null;
  target_audience?: string | null;
  problem?: string | null;
  proposed_solution?: string | null;
  key_features?: string[];
  nice_to_have_features?: string[];
  budget?: string | null;
  timeline?: string | null;
  recommended_mvp?: string | null;
  executive_summary?: string | null;
  customer_name?: string | null;
  company?: string | null;
  contact_email?: string | null;
  labels: SummaryLabels;
}

export interface SummaryLabels {
  title: string;
  subtitle: string;
  project: string;
  need: string;
  audience: string;
  features: string;
  niceToHave: string;
  budget: string;
  timeline: string;
  recommendation: string;
  nextStep: string;
  notStated: string;
  notDiscussed: string;
  confirm: string;
  edit: string;
  addInfo: string;
  disclaimer: string;
  aiGeneratedNote: string;
  confidence: string;
}

interface Props {
  data: SummaryData;
  onConfirm: () => void;
  onInlineEdit: (field: string, currentValue?: string) => void;
  onAddInfo: () => void;
  confirmed: boolean;
  submitted: boolean;
  confidence?: number; // 0-100 AI confidence in the summary
  lang: "sv" | "en";
}

export default function ProjectSummaryCard({
  data,
  onConfirm,
  onInlineEdit,
  onAddInfo,
  confirmed,
  submitted,
  confidence = 70,
  lang,
}: Props) {
  const { labels } = data;
  const missing = labels.notStated;
  const feats = data.key_features?.length ? data.key_features : [];
  const niceToHave = data.nice_to_have_features?.length ? data.nice_to_have_features : [];
  const [expanded, setExpanded] = useState(true);

  const confidenceColor = confidence >= 85 ? "#34d399" : confidence >= 65 ? "#fbbf24" : "#f87171";
  const confidenceLabel =
    confidence >= 85 ? (lang === "sv" ? "Hög säkerhet" : "High confidence") :
    confidence >= 65 ? (lang === "sv" ? "Medel säkerhet" : "Medium confidence") :
    (lang === "sv" ? "Granska noggrant" : "Review carefully");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="psc-wrap"
    >
      <div className="psc-header">
        <div className="psc-badge" aria-hidden>
          <AlertCircle size={12} />
          {labels.title}
        </div>
        <div className="psc-header-right">
          <div className="psc-confidence" title={confidenceLabel} style={{ color: confidenceColor }}>
            <span className="psc-confidence-dot" style={{ background: confidenceColor }} />
            {confidenceLabel}
          </div>
          {submitted && (
            <div className="psc-submitted-badge">
              <Check size={12} /> {lang === "sv" ? "Skickat" : "Sent"}
            </div>
          )}
          <button
            type="button"
            className="psc-collapse-btn"
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? (lang === "sv" ? "Dölj" : "Collapse") : (lang === "sv" ? "Visa" : "Expand")}
          >
            {expanded ? "−" : "+"}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <h3 className="psc-project-name">{data.project_title || "—"}</h3>
          <p className="psc-subtitle">{labels.subtitle}</p>

          <div className="psc-ai-note">
            <Sparkles size={11} />
            <span>{labels.aiGeneratedNote}</span>
          </div>

          <div className="psc-grid">
            <EditableSection label={labels.need} value={data.customer_goal || data.problem} missing={missing} field="need" onEdit={onInlineEdit} />
            <EditableSection label={labels.audience} value={data.target_audience} missing={missing} field="audience" onEdit={onInlineEdit} />

            {feats.length > 0 && (
              <div className="psc-section psc-section-wide">
                <h4>{labels.features}</h4>
                <ul>
                  {feats.map((f, i) => (
                    <li key={i}>
                      <span className="psc-dot psc-dot-req" />
                      <span className="psc-feat-text">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {niceToHave.length > 0 && (
              <div className="psc-section psc-section-wide">
                <h4>{labels.niceToHave}</h4>
                <ul>
                  {niceToHave.map((f, i) => (
                    <li key={i}>
                      <span className="psc-dot psc-dot-opt" />
                      <span className="psc-feat-text">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <EditableSection label={labels.budget} value={data.budget} missing={labels.notDiscussed} field="budget" onEdit={onInlineEdit} />
            <EditableSection label={labels.timeline} value={data.timeline} missing={labels.notDiscussed} field="timeline" onEdit={onInlineEdit} />

            {data.recommended_mvp && (
              <div className="psc-section psc-section-wide">
                <h4>{labels.recommendation}</h4>
                <p className="psc-recommendation">{data.recommended_mvp}</p>
              </div>
            )}

            <div className="psc-section psc-section-wide psc-next-step">
              <h4>{labels.nextStep}</h4>
              <p>{labels.disclaimer}</p>
            </div>
          </div>

          {!submitted && !confirmed && (
            <div className="psc-actions">
              <button type="button" className="psc-btn psc-btn-primary" onClick={onConfirm}>
                <Check size={14} /> {labels.confirm}
              </button>
              <button type="button" className="psc-btn psc-btn-secondary" onClick={onAddInfo}>
                <Plus size={12} /> {labels.addInfo}
              </button>
            </div>
          )}
          {confirmed && !submitted && (
            <div className="psc-confirmed">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="psc-confirmed-icon">
                <Check size={14} />
              </motion.div>
              <span>
                {lang === "sv"
                  ? "Tack. Oliver har fått din projektbrief och återkommer personligen."
                  : "Thanks. Oliver has received your project brief and will get back to you personally."}
              </span>
            </div>
          )}
        </>
      )}

      {!expanded && (
        <p className="psc-collapsed-text">
          {lang === "sv" ? "Sammanfattning dold — klicka + för att visa" : "Summary collapsed — click + to expand"}
        </p>
      )}
    </motion.div>
  );
}

function EditableSection({
  label, value, missing, field, onEdit,
}: {
  label: string;
  value?: string | null;
  missing: string;
  field: string;
  onEdit: (field: string, current?: string) => void;
}) {
  const isMissing = !value;
  return (
    <div className="psc-section psc-editable">
      <div className="psc-section-header">
        <h4>{label}</h4>
        <button
          type="button"
          className="psc-edit-field-btn"
          onClick={() => onEdit(field, value || undefined)}
          title={isMissing ? "Lägg till" : "Ändra"}
          aria-label={`${isMissing ? "Lägg till" : "Ändra"} ${label}`}
        >
          <Pencil size={10} />
        </button>
      </div>
      <p className={value ? "psc-value" : "psc-missing"}>{value || missing}</p>
    </div>
  );
}
