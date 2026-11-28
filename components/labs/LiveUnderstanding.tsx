"use client";

/**
 * Live Project Understanding panel — a small, discrete indicator that shows
 * what we already know about the customer's project, in real time.
 *
 * Always honest: only shows fields marked as customer_confirmed. Collapsed by
 * default on mobile, expands to a compact chip-cloud on click.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Building2, User, Clock, Wallet, Target, Layers, Sparkles } from "lucide-react";

interface Profile {
  customer?: {
    type?: string;
    industry?: string;
    role?: string;
    company_name?: string;
  };
  project_category?: string;
  budget?: string;
  timeline?: string;
  target_audience?: string;
  key_features?: string[];
  client_intent?: string;
  field_sources?: Record<string, string>;
  conversation_stage?: string;
}

interface Labels {
  title: string;
  confirmed: string;
  customerType: string;
  industry: string;
  category: string;
  budget: string;
  timeline: string;
  audience: string;
  features: string;
  intent: string;
  nothingYet: string;
  stillLearning: string;
}

const customerTypeSv: Record<string, string> = {
  private: "Privatperson",
  business: "Företag",
  entrepreneur: "Entreprenör",
  gamer: "Gamer/FiveM",
  existing: "Befintlig kund",
};
const intentSv: Record<string, string> = {
  new_build: "Nybygge",
  enhancement: "Förbättring",
  debug: "Felsöka",
  extend: "Utöka",
  quote: "Offert",
  meeting: "Möte",
  advice: "Rådgivning",
  long_term: "Långsiktigt",
  evaluate: "Utvärdera idé",
};

function getCustomerTypeLabel(v: string | undefined, lang: "sv" | "en") {
  if (!v) return null;
  if (lang === "sv") return customerTypeSv[v] || v;
  const map: Record<string, string> = {
    private: "Private", business: "Business", entrepreneur: "Entrepreneur",
    gamer: "Gamer/FiveM", existing: "Existing client",
  };
  return map[v] || v;
}
function getIntentLabel(v: string | undefined, lang: "sv" | "en") {
  if (!v) return null;
  if (lang === "sv") return intentSv[v] || v;
  const map: Record<string, string> = {
    new_build: "New build", enhancement: "Enhancement", debug: "Debug",
    extend: "Extend", quote: "Quote", meeting: "Meeting",
    advice: "Advice", long_term: "Long-term", evaluate: "Evaluate idea",
  };
  return map[v] || v;
}

export default function LiveUnderstanding({
  profile,
  lang,
  labels,
  stage,
}: {
  profile: Profile | null;
  lang: "sv" | "en";
  labels: Labels;
  stage: string;
}) {
  const [open, setOpen] = useState(false);

  if (!profile) return null;
  if (stage === "discovery") return null; // don't show before we have anything

  const isConfirmed = (field: string) => {
    const src = profile.field_sources?.[field];
    return src === "customer_confirmed" || src === "customer_estimate";
  };

  const items: { icon: any; label: string; value: string | null; key: string }[] = [
    { icon: User, label: labels.customerType, value: getCustomerTypeLabel(profile.customer?.type, lang), key: "customer.type" },
    { icon: Building2, label: labels.industry, value: profile.customer?.industry || null, key: "customer.industry" },
    { icon: Layers, label: labels.category, value: profile.project_category || null, key: "project_category" },
    { icon: Wallet, label: labels.budget, value: profile.budget || null, key: "budget" },
    { icon: Clock, label: labels.timeline, value: profile.timeline || null, key: "timeline" },
    { icon: Target, label: labels.audience, value: profile.target_audience || null, key: "target_audience" },
    { icon: Sparkles, label: labels.intent, value: getIntentLabel(profile.client_intent, lang), key: "client_intent" },
  ];

  const confirmed = items.filter(i => i.value && isConfirmed(i.key));
  const estimated = items.filter(i => i.value && !isConfirmed(i.key));
  const hasAny = confirmed.length > 0 || estimated.length > 0;

  // Count features we know about
  const knownFeats = (profile.key_features || []).slice(0, 3);

  return (
    <div className="lu-wrap">
      <button
        type="button"
        className="lu-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="lu-dot" aria-hidden />
        <span className="lu-count">{confirmed.length}</span>
        <span className="lu-label">
          {lang === "sv" ? "saker vi vet" : "things we know"}
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lu-panel"
          >
            {!hasAny && knownFeats.length === 0 && (
              <p className="lu-empty">{labels.nothingYet}</p>
            )}
            {confirmed.length > 0 && (
              <div className="lu-group">
                <div className="lu-group-label">
                  <span className="lu-group-dot lu-dot-confirmed" />
                  {labels.confirmed}
                </div>
                <div className="lu-chips">
                  {confirmed.map(i => (
                    <span key={i.key} className="lu-chip lu-chip-confirmed" title={i.label}>
                      <i.icon size={10} />
                      {i.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {estimated.length > 0 && (
              <div className="lu-group">
                <div className="lu-group-label">
                  <span className="lu-group-dot lu-dot-estimate" />
                  {labels.stillLearning}
                </div>
                <div className="lu-chips">
                  {estimated.map(i => (
                    <span key={i.key} className="lu-chip lu-chip-estimate" title={i.label}>
                      <i.icon size={10} />
                      {i.value}
                      <span className="lu-chip-ques">?</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {knownFeats.length > 0 && (
              <div className="lu-group">
                <div className="lu-group-label">{labels.features}</div>
                <ul className="lu-feats">
                  {knownFeats.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                  {(profile.key_features?.length || 0) > 3 && (
                    <li className="lu-feats-more">+{(profile.key_features!.length - 3)} {lang === "sv" ? "till" : "more"}</li>
                  )}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
