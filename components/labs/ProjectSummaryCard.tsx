"use client";

/**
 * Project Summary Card — presented to the customer for confirmation
 * before the brief is sent to Oliver.
 *
 * Clear, structured, honest about unknowns. Customer can confirm,
 * request changes, or add info.
 */
import { motion } from "framer-motion";
import { Check, Pencil, ArrowRight, AlertCircle } from "lucide-react";

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
  // sv/en labels come via translation
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
  changeRequest: string;
  disclaimer: string;
}

export default function ProjectSummaryCard({
  data,
  onConfirm,
  onEdit,
  onAddInfo,
  confirmed = false,
  submitted = false,
}: {
  data: SummaryData;
  onConfirm?: () => void;
  onEdit?: () => void;
  onAddInfo?: () => void;
  confirmed?: boolean;
  submitted?: boolean;
}) {
  const { labels } = data;
  const missing = labels.notStated;

  const feats = data.key_features?.length ? data.key_features : [];
  const niceToHave = data.nice_to_have_features?.length ? data.nice_to_have_features : [];

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
        {submitted && (
          <div className="psc-submitted-badge">
            <Check size={12} /> Skickat
          </div>
        )}
      </div>

      <h3 className="psc-project-name">{data.project_title || "—"}</h3>
      <p className="psc-subtitle">{labels.subtitle}</p>

      <div className="psc-grid">
        <Section label={labels.need} value={data.customer_goal || data.problem} missing={missing} />
        <Section label={labels.audience} value={data.target_audience} missing={missing} />

        {feats.length > 0 && (
          <div className="psc-section psc-section-wide">
            <h4>{labels.features}</h4>
            <ul>
              {feats.map((f, i) => (
                <li key={i}><span className="psc-dot psc-dot-req" />{f}</li>
              ))}
            </ul>
          </div>
        )}

        {niceToHave.length > 0 && (
          <div className="psc-section psc-section-wide">
            <h4>{labels.niceToHave}</h4>
            <ul>
              {niceToHave.map((f, i) => (
                <li key={i}><span className="psc-dot psc-dot-opt" />{f}</li>
              ))}
            </ul>
          </div>
        )}

        <Section label={labels.budget} value={data.budget} missing={labels.notDiscussed} />
        <Section label={labels.timeline} value={data.timeline} missing={labels.notDiscussed} />

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
            {labels.addInfo}
          </button>
          <button type="button" className="psc-btn psc-btn-ghost" onClick={onEdit}>
            <Pencil size={12} /> {labels.edit}
          </button>
        </div>
      )}

      {confirmed && !submitted && (
        <div className="psc-confirmed">
          <Check size={14} /> <span>Tack. Din projektbrief skickas till Oliver nu.</span>
        </div>
      )}
    </motion.div>
  );
}

function Section({ label, value, missing }: { label: string; value?: string | null; missing: string }) {
  return (
    <div className="psc-section">
      <h4>{label}</h4>
      <p className={value ? "psc-value" : "psc-missing"}>{value || missing}</p>
    </div>
  );
}
