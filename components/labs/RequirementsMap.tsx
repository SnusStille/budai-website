"use client";

/**
 * Infrastructure Map — intelligent detection of supporting systems the
 * project will likely need, inferred from features + service category.
 *
 * This is the "thinking one step ahead" capability: when a customer says
 * "I want users to be able to book appointments", we surface that they'll
 * also likely need authentication, a database, email notifications, calendar
 * sync, and GDPR handling.
 *
 * Signals come from both customer-stated features (local keyword detection)
 * and any reality_check.external_services_needed BudAI identified server-side.
 * Detected items are presented as humble suggestions ("likely needed") —
 * never as mandatory, always with room for BudAI to correct.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Lock, Database, CreditCard, Settings, Mail, Search,
  Smartphone, BarChart3, Shield, Cloud, Share2, Bell,
  type LucideIcon,
} from "lucide-react";

interface Data {
  key_features?: string[];
  nice_to_have_features?: string[];
  suggested_features?: string[];
  customer_goal?: string | null;
  problem?: string | null;
  reality_check?: {
    external_services_needed?: string[];
    integration_risks?: string[];
    security_concerns?: string[];
  };
}

interface Need {
  id: string;
  icon: LucideIcon;
  sv: string;
  en: string;
  keywords: RegExp;
  color: string;
}

// Patterns BudAI/client uses to infer infrastructure needs
const NEEDS: Need[] = [
  { id: "auth", icon: Lock, sv: "Användarinloggning", en: "User authentication",
    keywords: /\b(logga\s*in|login|log\s*in|konto|account|användare|user|sign\s*up|registr|register|password|lösenord|profil)\b/i,
    color: "#00e5ff" },
  { id: "database", icon: Database, sv: "Databas", en: "Database",
    keywords: /\b(spara|lagra|save|store|data|profil|inlägg|post|content|lista|list|bokning|booking|ordrar|orders)\b/i,
    color: "#7c5cff" },
  { id: "payments", icon: CreditCard, sv: "Betalningar", en: "Payments",
    keywords: /\b(betal|prenumeration|payment|subscription|köp|buy|checkout|stripe|swish|faktura|invoice|kassa)\b/i,
    color: "#34d399" },
  { id: "admin", icon: Settings, sv: "Adminpanel", en: "Admin panel",
    keywords: /\b(hantera|admin|manage|dashboard|backend|cms|redigera|edit|innehåll|content)\b/i,
    color: "#fbbf24" },
  { id: "email", icon: Mail, sv: "E-post / notiser", en: "Email / notifications",
    keywords: /\b(notifiering|bekräftelse|email|e-post|notis|notification|skicka|send|mail|påminnelse|reminder|utskick)\b/i,
    color: "#fb923c" },
  { id: "seo", icon: Search, sv: "SEO / synlighet", en: "SEO / discoverability",
    keywords: /\b(hitta|sök|SEO|search|google|synas|rank|trafik|organic)\b/i,
    color: "#a78bfa" },
  { id: "mobile", icon: Smartphone, sv: "Mobilanpassning", en: "Mobile responsive",
    keywords: /\b(mobil|mobile|telefon|phone|app|responsive|adaptiv)\b/i,
    color: "#f472b6" },
  { id: "analytics", icon: BarChart3, sv: "Statistik", en: "Analytics",
    keywords: /\b(statistik|analytics|data|mät|track|mätvärden|insikt|insight|rapport|report)\b/i,
    color: "#60a5fa" },
  { id: "gdpr", icon: Shield, sv: "GDPR / säkerhet", en: "GDPR / security",
    keywords: /\b(gdpr|personuppgifter|personlig|PII|integritet|privacy|säkerhet|security|krypter|encrypt|efterlevnad|compliance)\b/i,
    color: "#f87171" },
  { id: "hosting", icon: Cloud, sv: "Hosting / driftsättning", en: "Hosting / deployment",
    keywords: /\b(hosting|drift|deploy|server|moln|cloud|domän|domain|ssl)\b/i,
    color: "#94a3b8" },
  { id: "integration", icon: Share2, sv: "Integrationer", en: "Integrations",
    keywords: /\b(integrat|api|webhook|zapier|sync|koppla|connect|third.?party|tredje part|calendly|google|calendar)\b/i,
    color: "#22d3ee" },
  { id: "realtime", icon: Bell, sv: "Realtid / notiser", en: "Realtime / push",
    keywords: /\b(realtid|real.?time|push|live|notis|notification|chat|meddelande|message)\b/i,
    color: "#fcd34d" },
];

export default function RequirementsMap({ data, lang }: { data: Data | null; lang: "sv" | "en" }) {
  const detected = useMemo(() => {
    if (!data) return [] as { need: Need; source: "features" | "services" }[];
    const text = [
      data.customer_goal || "",
      data.problem || "",
      ...(data.key_features || []),
      ...(data.nice_to_have_features || []),
      ...(data.suggested_features || []),
      ...(data.reality_check?.external_services_needed || []),
    ].join(" ").toLowerCase();
    if (text.length < 15) return [];

    const found: { need: Need; source: "features" | "services" }[] = [];
    for (const n of NEEDS) {
      if (n.keywords.test(text)) {
        found.push({ need: n, source: "features" });
      }
    }
    return found.slice(0, 8);
  }, [data]);

  if (detected.length === 0) return null;
  if (!data?.key_features?.length && !data?.customer_goal) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3, ease: [0.16, 1, 0.36, 1] }}
      className="req-map"
    >
      <div className="req-map-head">
        <span className="req-map-head-icon"><Shield size={11} /></span>
        <span className="req-map-title">{lang === "sv" ? "Du behöver troligen också" : "You'll likely also need"}</span>
        <span className="req-map-hint">{lang === "sv" ? "baserat på din idé" : "based on your idea"}</span>
      </div>
      <div className="req-map-grid">
        {detected.map(({ need }, i) => {
          const Icon = need.icon;
          return (
            <motion.div
              key={need.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.35 + i * 0.04 }}
              className="req-map-item"
              style={{ "--req-color": need.color } as React.CSSProperties}
            >
              <Icon size={12} className="req-map-item-icon" />
              <span>{lang === "sv" ? need.sv : need.en}</span>
            </motion.div>
          );
        })}
      </div>
      <p className="req-map-footnote">
        {lang === "sv"
          ? "Detta är preliminära observationer — vi går igenom exakt vad som behövs."
          : "These are preliminary observations — we'll walk through exactly what's needed."}
      </p>
    </motion.div>
  );
}
