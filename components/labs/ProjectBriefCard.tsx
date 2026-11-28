"use client";

/**
 * Project Brief Card — a live, compact visualization of the project taking shape.
 *
 * Appears once there's enough data to show something meaningful (title + goal, or
 * 3+ confirmed fields). Shows: project title, goal summary, complexity badge,
 * budget/timeline indicators, key features chips, and a progress meter showing
 * how complete the brief is.
 *
 * This is THE moment where the customer sees their idea materialize.
 */
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Target, Clock, Wallet, Layers, AlertTriangle, CheckCircle2, Sparkles, ChevronRight, Rocket } from "lucide-react";

interface PhaseDef {
  phase: "mvp" | "v2" | "v3";
  name: string;
  description: string | null;
  features: string[];
  estimated_complexity?: string | null;
}

interface BriefData {
  project_title?: string | null;
  customer_goal?: string | null;
  problem?: string | null;
  target_audience?: string | null;
  key_features?: string[];
  nice_to_have_features?: string[];
  suggested_features?: string[];
  technical_complexity?: "low" | "medium" | "high" | "very_high" | null;
  budget?: string | null;
  budget_info?: {
    amount?: string | null;
    range?: string | null;
    constraint?: string | null;
    budget_assessment?: "realistic" | "tight" | "unrealistic" | "unknown" | null;
  };
  budget_assessment?: "realistic" | "tight" | "unrealistic" | "unknown" | null;
  budget_range?: string | null;
  timeline?: string | null;
  timeline_assessment?: "realistic" | "tight" | "unrealistic" | "unknown" | null;
  conversation_stage?: string;
  recommended_mvp?: string | null;
  phases?: PhaseDef[];
  field_sources?: Record<string, string>;
  confidence?: {
    overall_score?: number;
    project_description?: string;
    requirements_clarity?: string;
    budget_clarity?: string;
    timeline_clarity?: string;
    target_audience_clarity?: string;
    contact_info?: string;
  };
  reality_check?: {
    budget_scope_fit?: string;
    simpler_alternatives?: string[];
    red_flags?: string[];
    technically_feasible?: boolean | null;
  };
  business_risks?: string[];
  technical_risks?: string[];
}

function complexityLabel(c: string | null | undefined, lang: "sv" | "en") {
  const map: Record<string, { sv: string; en: string; color: string }> = {
    low:        { sv: "Låg",         en: "Low",         color: "#34d399" },
    medium:     { sv: "Medel",       en: "Medium",      color: "#fbbf24" },
    high:       { sv: "Hög",         en: "High",        color: "#fb923c" },
    very_high:  { sv: "Mycket hög",  en: "Very high",   color: "#f87171" },
  };
  if (!c || !map[c]) return null;
  return { label: lang === "sv" ? map[c].sv : map[c].en, color: map[c].color };
}

function budgetAssessmentLabel(a: string | null | undefined, lang: "sv" | "en") {
  const map: Record<string, { sv: string; en: string; color: string }> = {
    realistic:   { sv: "Realistisk",   en: "Realistic",    color: "#34d399" },
    tight:       { sv: "Stram",       en: "Tight",        color: "#fbbf24" },
    unrealistic: { sv: "Orealistisk", en: "Unrealistic",  color: "#f87171" },
  };
  if (!a || a === "unknown" || !map[a]) return null;
  return { label: lang === "sv" ? map[a].sv : map[a].en, color: map[a].color };
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export default function ProjectBriefCard({
  data,
  lang,
}: {
  data: BriefData | null;
  lang: "sv" | "en";
}) {
  if (!data) return null;

  // Only show when we have something meaningful
  const hasTitle = !!data.project_title && data.project_title.length > 2;
  const hasGoal = !!data.customer_goal && data.customer_goal.length > 5;
  const featuresCount = (data.key_features || []).length;
  const shouldShow = (hasTitle && hasGoal) || featuresCount >= 3;

  if (!shouldShow) return null;

  const score = data.confidence?.overall_score || 0;
  const scorePct = Math.min(100, Math.max(0, score));
  const comp = complexityLabel(data.technical_complexity, lang);
  const budgetAsm = budgetAssessmentLabel(data.budget_assessment, lang);

  const l = {
    briefing: lang === "sv" ? "Din projektbrief" : "Your project brief",
    building: lang === "sv" ? "Tar form…" : "Taking shape…",
    ready: lang === "sv" ? "Klar för granskning" : "Ready for review",
    goal: lang === "sv" ? "Mål" : "Goal",
    features: lang === "sv" ? "Funktioner" : "Features",
    more: lang === "sv" ? "till" : "more",
    budget: lang === "sv" ? "Budget" : "Budget",
    timeline: lang === "sv" ? "Tidsplan" : "Timeline",
    complexity: lang === "sv" ? "Komplexitet" : "Complexity",
    notSet: lang === "sv" ? "Ej angivet" : "Not set",
    progress: lang === "sv" ? "Framsteg" : "Progress",
    risks: lang === "sv" ? "Risker" : "Risks",
  };

  const stageLabels: Record<string, { sv: string; en: string }> = {
    discovery:           { sv: "Förstår idén", en: "Understanding" },
    scoping:             { sv: "Utforskar omfattning", en: "Exploring scope" },
    assessment:          { sv: "Bedömer", en: "Assessing" },
    blueprint_ready:     { sv: "Sammanfattar", en: "Summarizing" },
    conclusion_proposed: { sv: "Klar för granskning", en: "Ready to review" },
    awaiting_confirmation:{ sv: "Väntar på bekräftelse", en: "Awaiting confirmation" },
    contact_ready:       { sv: "Samlar kontaktuppgifter", en: "Collecting contact" },
    submitted:           { sv: "Skickad till Oliver", en: "Sent to Oliver" },
  };
  const stageLabel = data.conversation_stage
    ? (lang === "sv" ? stageLabels[data.conversation_stage]?.sv : stageLabels[data.conversation_stage]?.en)
    : null;

  const isReady = scorePct >= 60;
  const risks = [...(data.business_risks || []), ...(data.technical_risks || [])].slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.36, 1] }}
      className="pbc-wrap"
      role="region"
      aria-label={l.briefing}
    >
      {/* Header */}
      <div className="pbc-header">
        <div className="pbc-header-left">
          <span className="pbc-icon">
            <FileText size={13} />
          </span>
          <div>
            <div className="pbc-title">
              {data.project_title || truncate(data.customer_goal || "Project", 50)}
            </div>
            <div className="pbc-stage">
              {isReady ? (
                <><CheckCircle2 size={10} /> {l.ready}</>
              ) : (
                <><Sparkles size={10} /> {l.building}</>
              )}
              {stageLabel && <span className="pbc-stage-sep">·</span>}
              {stageLabel && <span>{stageLabel}</span>}
            </div>
          </div>
        </div>
        <div className="pbc-score-ring" style={{
          background: `conic-gradient(${scorePct >= 60 ? "#00e5ff" : scorePct >= 35 ? "#fbbf24" : "rgba(255,255,255,0.15)"} ${scorePct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
        }}>
          <div className="pbc-score-inner">
            <span className="pbc-score-num">{Math.round(scorePct)}<i>%</i></span>
          </div>
        </div>
      </div>

      {/* Goal */}
      {(data.customer_goal || data.problem) && (
        <div className="pbc-goal">
          <Target size={11} className="pbc-goal-icon" />
          <p>{truncate(data.customer_goal || data.problem || "", 160)}</p>
        </div>
      )}

      {/* Feature chips — visually separated by source */}
      {(featuresCount > 0 || (data.nice_to_have_features || []).length > 0 || (data.suggested_features || []).length > 0) && (
        <div className="pbc-section">
          <span className="pbc-section-label"><Layers size={10} /> {l.features}</span>

          {/* Customer-stated MUST-HAVE features */}
          {featuresCount > 0 && (
            <div className="pbc-feat-group">
              <span className="pbc-feat-group-label">{lang === "sv" ? "Dina krav" : "Your requirements"}</span>
              <div className="pbc-features">
                {data.key_features!.slice(0, 5).map((f, i) => (
                  <motion.span
                    key={`m-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="pbc-feat-chip pbc-feat-must"
                  >
                    {truncate(f, 30)}
                  </motion.span>
                ))}
                {featuresCount > 5 && (
                  <span className="pbc-feat-more">+{featuresCount - 5} {l.more}</span>
                )}
              </div>
            </div>
          )}

          {/* Nice-to-have features */}
          {(data.nice_to_have_features || []).length > 0 && (
            <div className="pbc-feat-group">
              <span className="pbc-feat-group-label pbc-fgl-nice">{lang === "sv" ? "Bra att ha" : "Nice to have"}</span>
              <div className="pbc-features">
                {(data.nice_to_have_features || []).slice(0, 3).map((f, i) => (
                  <motion.span
                    key={`n-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.1 + i * 0.04 }}
                    className="pbc-feat-chip pbc-feat-nice"
                  >
                    {truncate(f, 28)}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* AI-suggested features */}
          {(data.suggested_features || []).length > 0 && (
            <div className="pbc-feat-group">
              <span className="pbc-feat-group-label pbc-fgl-suggested">
                <Sparkles size={9} />
                {lang === "sv" ? "BudAI föreslår" : "BudAI suggests"}
              </span>
              <div className="pbc-features">
                {(data.suggested_features || []).slice(0, 3).map((f, i) => (
                  <motion.span
                    key={`s-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.04 }}
                    className="pbc-feat-chip pbc-feat-suggested"
                  >
                    <Sparkles size={8} />
                    {truncate(f, 26)}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MVP Phase visualization — recommended scope split across MVP / V2 / V3 */}
      {data.phases && data.phases.some(p => (p.features || []).length > 0) && (
        <div className="pbc-section">
          <span className="pbc-section-label"><Rocket size={10} /> {lang === "sv" ? "Rekommenderad uppdelning" : "Recommended phasing"}</span>
          <div className="pbc-phases">
            {(["mvp", "v2", "v3"] as const).map((phaseKey, pi) => {
              const phase = data.phases!.find(p => p.phase === phaseKey);
              const fCount = phase?.features?.length || 0;
              const labels: Record<string, { sv: string; en: string }> = {
                mvp: { sv: "MVP (lansering)", en: "MVP (launch)" },
                v2:  { sv: "V2 (nästa steg)", en: "V2 (next step)" },
                v3:  { sv: "V3 (senare)", en: "V3 (later)" },
              };
              const maxF = Math.max(1, ...data.phases!.map(p => (p.features || []).length));
              const pct = fCount > 0 ? Math.max(20, (fCount / maxF) * 100) : 0;
              const colors = ["#00e5ff", "#7c5cff", "rgba(255,255,255,0.35)"];
              return (
                <div key={phaseKey} className={`pbc-phase-row ${fCount === 0 ? "empty" : ""}`}>
                  <div className="pbc-phase-head">
                    <span className={`pbc-phase-tag pbc-phase-tag-${phaseKey}`}>
                      {lang === "sv" ? labels[phaseKey].sv : labels[phaseKey].en}
                    </span>
                    {phase?.name && phase.name.length > 0 && (
                      <span className="pbc-phase-name">{truncate(phase.name, 40)}</span>
                    )}
                    <span className="pbc-phase-count">{fCount}</span>
                  </div>
                  <div className="pbc-phase-bar-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + pi * 0.1, ease: [0.16, 1, 0.36, 1] }}
                      className="pbc-phase-bar-fill"
                      style={{ background: colors[pi] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {data.recommended_mvp && (
            <p className="pbc-mvp-note"><Rocket size={9} /> {truncate(data.recommended_mvp, 140)}</p>
          )}
        </div>
      )}

      {/* Meta row: budget, timeline, complexity */}
      <div className="pbc-meta">
        <div className="pbc-meta-item">
          <Wallet size={11} />
          <span className="pbc-meta-label">{l.budget}</span>
          {data.budget ? (
            <span className="pbc-meta-value">{truncate(data.budget, 24)}</span>
          ) : budgetAsm ? (
            <span className="pbc-meta-value" style={{ color: budgetAsm.color }}>{budgetAsm.label}</span>
          ) : (
            <span className="pbc-meta-unknown">{l.notSet}</span>
          )}
        </div>
        <div className="pbc-meta-item">
          <Clock size={11} />
          <span className="pbc-meta-label">{l.timeline}</span>
          {data.timeline ? (
            <span className="pbc-meta-value">{truncate(data.timeline, 24)}</span>
          ) : (
            <span className="pbc-meta-unknown">{l.notSet}</span>
          )}
        </div>
        {comp && (
          <div className="pbc-meta-item">
            <Layers size={11} />
            <span className="pbc-meta-label">{l.complexity}</span>
            <span className="pbc-meta-value" style={{ color: comp.color }}>{comp.label}</span>
          </div>
        )}
      </div>

      {/* Reality Check — honest feasibility / budget fit / simpler alternatives */}
      {(data.reality_check?.red_flags?.length || data.reality_check?.simpler_alternatives?.length || data.reality_check?.budget_scope_fit === "unrealistic" || data.reality_check?.technically_feasible === false || risks.length > 0) && (
        <div className="pbc-reality">
          <div className="pbc-reality-head">
            <AlertTriangle size={11} />
            <span>{lang === "sv" ? "Reality check" : "Reality check"}</span>
          </div>
          {data.reality_check?.technically_feasible === false && (
            <div className="pbc-reality-item pbc-rci-red">
              <span>{lang === "sv" ? "Viss teknisk risk identifierad" : "Some technical risk identified"}</span>
            </div>
          )}
          {data.reality_check?.budget_scope_fit === "tight" && (
            <div className="pbc-reality-item pbc-rci-amber">
              <span>{lang === "sv" ? "Budgeten kan vara något stram för alla funktioner" : "Budget may be slightly tight for all features"}</span>
            </div>
          )}
          {data.reality_check?.budget_scope_fit === "unrealistic" && (
            <div className="pbc-reality-item pbc-rci-red">
              <span>{lang === "sv" ? "Budgeten sannolikt inte i linje med omfattningen — vi diskuterar avgränsningar" : "Budget likely not aligned with scope — let's discuss trade-offs"}</span>
            </div>
          )}
          {risks.slice(0, 1).map((r, i) => (
            <div key={i} className="pbc-reality-item pbc-rci-amber">
              <span>{truncate(r, 110)}</span>
            </div>
          ))}
          {(data.reality_check?.simpler_alternatives || []).slice(0, 1).map((s, i) => (
            <div key={i} className="pbc-reality-item pbc-rci-green">
              <CheckCircle2 size={10} />
              <span>{truncate(s, 110)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="pbc-progress">
        <div className="pbc-progress-track">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.36, 1], delay: 0.2 }}
            className="pbc-progress-fill"
            style={{
              background: scorePct >= 60
                ? "linear-gradient(90deg, #00e5ff, #7c5cff)"
                : scorePct >= 35
                  ? "linear-gradient(90deg, #fbbf24, #fb923c)"
                  : "rgba(255,255,255,0.15)",
            }}
          />
        </div>
        <span className="pbc-progress-label">{l.progress}: {Math.round(scorePct)}%</span>
      </div>
    </motion.div>
  );
}
