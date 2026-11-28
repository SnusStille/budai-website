"use client";

/**
 * Missing Pieces — plain-language list of what we still don't know about
 * the project. Appears inside the Project Brief card area and shows the
 * customer exactly what BudAI will ask about next, demystifying the process.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Circle, HelpCircle } from "lucide-react";

interface Data {
  customer_goal?: string | null;
  key_features?: string[];
  budget?: string | null;
  budget_info?: { amount?: number | null; status?: string };
  timeline?: string | null;
  target_audience?: string | null;
  technical_complexity?: string | null;
  conversation_stage?: string;
  confidence?: {
    overall_score?: number;
    project_description?: string;
    requirements_clarity?: string;
    budget_clarity?: string;
    timeline_clarity?: string;
    target_audience_clarity?: string;
    contact_info?: string;
    missing_critical?: string[];
  };
}

export default function MissingPieces({ data, lang }: { data: Data | null; lang: "sv" | "en" }) {
  const items = useMemo(() => {
    if (!data) return [] as { key: string; label: string; priority: "high" | "med" | "low" }[];
    const out: { key: string; label: string; priority: "high" | "med" | "low" }[] = [];
    const sv = lang === "sv";

    const hasGoal = !!data.customer_goal && data.customer_goal.length > 8;
    const hasFeatures = (data.key_features?.length ?? 0) >= 2;
    const hasBudget = !!data.budget || (data.budget_info?.amount !== null && data.budget_info?.amount !== undefined) || data.budget_info?.status === "flexible";
    const hasTimeline = !!data.timeline;
    const hasAudience = !!data.target_audience;

    if (!hasGoal) out.push({ key: "goal", label: sv ? "Vad du vill bygga" : "What you want to build", priority: "high" });
    if (!hasFeatures) out.push({ key: "features", label: sv ? "De viktigaste funktionerna" : "The key features", priority: "high" });
    if (!hasAudience && hasFeatures) out.push({ key: "audience", label: sv ? "Vem som kommer använda det" : "Who will use it", priority: "med" });
    if (!hasBudget && hasFeatures) out.push({ key: "budget", label: sv ? "Din budget" : "Your budget", priority: "med" });
    if (!hasTimeline && hasBudget) out.push({ key: "timeline", label: sv ? "Önskad tidsram" : "Desired timeline", priority: "low" });

    return out.slice(0, 4);
  }, [data, lang]);

  if (items.length === 0) return null;
  // Don't show on submitted stage
  if (data?.conversation_stage === "submitted" || data?.conversation_stage === "closed") return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="pbc-missing"
    >
      <div className="pbc-missing-head">
        <HelpCircle size={10} />
        <span>{lang === "sv" ? "Vi utforskar tillsammans" : "We're figuring out together"}</span>
      </div>
      <ul className="pbc-missing-list">
        {items.map((it, i) => (
          <motion.li
            key={it.key}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
            className={`pbc-missing-item pbc-missing-${it.priority}`}
          >
            <Circle size={6} className="pbc-missing-dot" />
            <span>{it.label}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
