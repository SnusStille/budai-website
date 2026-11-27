"use client";

/**
 * Project Blueprint visual card.
 * Shown inside the chat flow when BudAI has gathered enough information to present
 * a structured project brief. Gives the customer a clear, professional summary —
 * feels like a real consulting deliverable, not just chat text.
 */
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb, Target, Layers } from "lucide-react";

interface BlueprintPhase {
  phase: string;
  name: string;
  description: string | null;
  features: string[];
}

interface ProjectBlueprintData {
  project_title: string | null;
  executive_summary: string | null;
  project_category: string;
  customer_goal: string | null;
  target_audience: string | null;
  key_features: string[];
  suggested_features: string[];
  technical_requirements: string[];
  suggested_tech_stack: string[];
  recommended_mvp: string | null;
  technical_risks: string[];
  opportunities: string[];
  phases: BlueprintPhase[];
}

interface Props {
  data: ProjectBlueprintData;
  lang: "sv" | "en";
}

const labels = {
  sv: {
    title: "Projektöversikt",
    summary: "Sammanfattning",
    goal: "Mål",
    audience: "Målgrupp",
    features: "Kärnfunktioner",
    suggested: "Föreslagna förbättringar",
    tech: "Tekniska krav",
    stack: "Föreslagen teknik",
    risks: "Risker att hantera",
    opportunities: "Möjligheter",
    mvp: "Föreslagen MVP",
    phases: "Fasplan",
    disclaimer: "Detta är en preliminär bedömning baserad på vår konversation. Oliver går igenom och återkommer med en konkret offert.",
  },
  en: {
    title: "Project Blueprint",
    summary: "Summary",
    goal: "Goal",
    audience: "Target audience",
    features: "Core features",
    suggested: "Suggested improvements",
    tech: "Technical requirements",
    stack: "Suggested tech",
    risks: "Risks to address",
    opportunities: "Opportunities",
    mvp: "Proposed MVP",
    phases: "Phased plan",
    disclaimer: "This is a preliminary assessment based on our conversation. Oliver will review and return with a concrete quote.",
  },
};

const complexityColors: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  very_high: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function ProjectBlueprint({ data, lang }: Props) {
  const L = labels[lang];

  const hasContent =
    data.executive_summary ||
    (data.key_features && data.key_features.length > 0) ||
    (data.phases && data.phases.length > 0) ||
    data.recommended_mvp;

  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="labs-blueprint"
    >
      <div className="labs-blueprint-header">
        <div className="labs-blueprint-icon">
          <Layers size={16} />
        </div>
        <div>
          <div className="labs-blueprint-label">{L.title}</div>
          {data.project_title && <div className="labs-blueprint-title">{data.project_title}</div>}
        </div>
      </div>

      <div className="labs-blueprint-body">
        {data.executive_summary && (
          <BlueprintSection icon={<Target size={13} />} title={L.summary}>
            <p>{data.executive_summary}</p>
          </BlueprintSection>
        )}

        <div className="labs-blueprint-grid">
          {data.customer_goal && (
            <BlueprintSection icon={<Target size={13} />} title={L.goal}>
              <p>{data.customer_goal}</p>
            </BlueprintSection>
          )}
          {data.target_audience && (
            <BlueprintSection title={L.audience}>
              <p>{data.target_audience}</p>
            </BlueprintSection>
          )}
        </div>

        {data.key_features.length > 0 && (
          <BlueprintSection title={L.features} icon={<CheckCircle2 size={13} />}>
            <ul className="labs-bp-list">
              {data.key_features.slice(0, 6).map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </BlueprintSection>
        )}

        {data.suggested_features.length > 0 && (
          <BlueprintSection title={L.suggested} icon={<Lightbulb size={13} />} tone="suggestion">
            <ul className="labs-bp-list labs-bp-list-suggested">
              {data.suggested_features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </BlueprintSection>
        )}

        <div className="labs-blueprint-grid">
          {data.technical_requirements.length > 0 && (
            <BlueprintSection title={L.tech}>
              <ul className="labs-bp-list labs-bp-list-compact">
                {data.technical_requirements.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </BlueprintSection>
          )}
          {data.suggested_tech_stack.length > 0 && (
            <BlueprintSection title={L.stack}>
              <div className="labs-bp-tags">
                {data.suggested_tech_stack.slice(0, 5).map((t, i) => (
                  <span key={i} className="labs-bp-tag">{t}</span>
                ))}
              </div>
            </BlueprintSection>
          )}
        </div>

        {data.technical_risks.length > 0 && (
          <BlueprintSection title={L.risks} icon={<AlertTriangle size={13} />} tone="warning">
            <ul className="labs-bp-list labs-bp-list-warning">
              {data.technical_risks.slice(0, 4).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </BlueprintSection>
        )}

        {data.recommended_mvp && (
          <BlueprintSection title={L.mvp}>
            <p>{data.recommended_mvp}</p>
          </BlueprintSection>
        )}

        {data.phases && data.phases.length > 0 && data.phases.some(p => p.features.length > 0 || p.description) && (
          <BlueprintSection title={L.phases}>
            <div className="labs-bp-phases">
              {data.phases.map((p, i) => {
                if (!p.description && p.features.length === 0) return null;
                return (
                  <div key={i} className="labs-bp-phase">
                    <div className="labs-bp-phase-header">
                      <span className="labs-bp-phase-num">{i + 1}</span>
                      <span className="labs-bp-phase-name">{p.name}</span>
                    </div>
                    {p.description && <p className="labs-bp-phase-desc">{p.description}</p>}
                    {p.features.length > 0 && (
                      <ul className="labs-bp-list labs-bp-list-compact">
                        {p.features.slice(0, 4).map((f, j) => <li key={j}>{f}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </BlueprintSection>
        )}
      </div>

      <div className="labs-blueprint-footer">{L.disclaimer}</div>
    </motion.div>
  );
}

function BlueprintSection({
  title,
  children,
  icon,
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "suggestion" | "warning";
}) {
  return (
    <div className={`labs-bp-section labs-bp-section-${tone}`}>
      <div className="labs-bp-section-title">
        {icon && <span className="labs-bp-section-icon">{icon}</span>}
        {title}
      </div>
      <div className="labs-bp-section-body">{children}</div>
    </div>
  );
}
