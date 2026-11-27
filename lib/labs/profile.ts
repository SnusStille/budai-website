/**
 * Stilledev Labs — Parse AI output blocks ([[PROFILE:]] and [[SUMMARY:]]).
 *
 * Every AI response ends with a structured JSON block that updates the
 * project profile. This module extracts and validates it.
 */

export type ProjectCategory =
  | "website"
  | "web_application"
  | "mobile_app"
  | "ai_service"
  | "automation"
  | "ecommerce"
  | "booking_system"
  | "saas_platform"
  | "integration"
  | "consulting"
  | "other"
  | "unknown";

export type ComplexityLevel = "low" | "medium" | "high" | "very_high" | null;
export type AssessmentLevel = "realistic" | "tight" | "unrealistic" | "unknown" | null;
export type ConversationStage = "discovery" | "scoping" | "assessment" | "contact_ready" | "closed";

export interface ProjectProfile {
  project_title: string | null;
  project_category: ProjectCategory;
  customer_goal: string | null;
  target_audience: string | null;
  problem: string | null;
  proposed_solution: string | null;
  key_features: string[];
  technical_requirements: string[];
  technical_complexity: ComplexityLevel;
  budget: string | null;
  budget_assessment: AssessmentLevel;
  timeline: string | null;
  timeline_assessment: AssessmentLevel;
  business_risks: string[];
  technical_risks: string[];
  opportunities: string[];
  competition: string | null;
  recommended_mvp: string | null;
  next_steps: string | null;
  unanswered_questions: string[];
  decision_maker: string | null;
  conversation_stage: ConversationStage;
  priority_score: number;
  priority_strengths: string[];
  priority_concerns: string[];
  priority_recommendation: string | null;
  profile_changed: string[];
}

export interface SummaryProfile extends ProjectProfile {
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company?: string;
  preferred_contact?: "email" | "phone" | "digital_meeting";
}

const VALID_CATEGORIES = new Set<ProjectCategory>([
  "website", "web_application", "mobile_app", "ai_service", "automation",
  "ecommerce", "booking_system", "saas_platform", "integration", "consulting",
  "other", "unknown",
]);

const VALID_COMPLEXITY = new Set(["low", "medium", "high", "very_high"]);
const VALID_ASSESSMENT = new Set(["realistic", "tight", "unrealistic", "unknown"]);
const VALID_STAGES = new Set<ConversationStage>([
  "discovery", "scoping", "assessment", "contact_ready", "closed",
]);

function safeString(v: unknown, maxLen = 2000): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim().slice(0, maxLen);
  return null;
}

function safeArray(v: unknown, maxItems = 20, maxLen = 500): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim().slice(0, maxLen))
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
}

function safeCategory(v: unknown): ProjectCategory {
  if (typeof v === "string" && VALID_CATEGORIES.has(v as ProjectCategory)) return v as ProjectCategory;
  return "unknown";
}

function safeComplexity(v: unknown): ComplexityLevel {
  if (typeof v === "string" && VALID_COMPLEXITY.has(v)) return v as ComplexityLevel;
  return null;
}

function safeAssessment(v: unknown): AssessmentLevel {
  if (typeof v === "string" && VALID_ASSESSMENT.has(v)) return v as AssessmentLevel;
  return null;
}

function safeStage(v: unknown): ConversationStage {
  if (typeof v === "string" && VALID_STAGES.has(v as ConversationStage)) return v as ConversationStage;
  return "discovery";
}

function safeScore(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.min(100, Math.round(v)));
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (Number.isFinite(n)) return Math.max(0, Math.min(100, n));
  }
  return 0;
}

function mergeProfile(prev: ProjectProfile, next: Partial<ProjectProfile>): ProjectProfile {
  // Merge arrays by replacing with new values (AI provides complete lists)
  // But scalar fields only update if not null
  const out: ProjectProfile = { ...prev };

  for (const [key, value] of Object.entries(next)) {
    if (value === null || value === undefined) continue;
    const outRecord = out as unknown as Record<string, unknown>;
    if (Array.isArray(value)) {
      outRecord[key] = value;
    } else {
      outRecord[key] = value;
    }
  }
  return out;
}

/**
 * Extract the [[PROFILE: ...]] block from AI output.
 * Returns the clean text for display and the parsed profile (or null if not present).
 */
export function extractProfile(text: string): {
  clean: string;
  profile: ProjectProfile | null;
  profileChanged: string[];
} {
  const m = text.match(/\[\[PROFILE:\s*([\s\S]*?)\]\]/i);
  if (!m) return { clean: text.trim(), profile: null, profileChanged: [] };

  let profile: ProjectProfile | null = null;
  let changed: string[] = [];

  try {
    const parsed = JSON.parse(m[1].trim());
    if (parsed && typeof parsed === "object") {
      profile = {
        project_title: safeString(parsed.project_title, 120),
        project_category: safeCategory(parsed.project_category),
        customer_goal: safeString(parsed.customer_goal),
        target_audience: safeString(parsed.target_audience),
        problem: safeString(parsed.problem),
        proposed_solution: safeString(parsed.proposed_solution),
        key_features: safeArray(parsed.key_features, 10),
        technical_requirements: safeArray(parsed.technical_requirements, 10),
        technical_complexity: safeComplexity(parsed.technical_complexity),
        budget: safeString(parsed.budget, 200),
        budget_assessment: safeAssessment(parsed.budget_assessment),
        timeline: safeString(parsed.timeline, 200),
        timeline_assessment: safeAssessment(parsed.timeline_assessment),
        business_risks: safeArray(parsed.business_risks, 8),
        technical_risks: safeArray(parsed.technical_risks, 8),
        opportunities: safeArray(parsed.opportunities, 8),
        competition: safeString(parsed.competition),
        recommended_mvp: safeString(parsed.recommended_mvp),
        next_steps: safeString(parsed.next_steps),
        unanswered_questions: safeArray(parsed.unanswered_questions, 12),
        decision_maker: safeString(parsed.decision_maker, 200),
        conversation_stage: safeStage(parsed.conversation_stage),
        priority_score: safeScore(parsed.priority_score),
        priority_strengths: safeArray(parsed.priority_strengths, 5),
        priority_concerns: safeArray(parsed.priority_concerns, 5),
        priority_recommendation: safeString(parsed.priority_recommendation, 500),
        profile_changed: safeArray(parsed.profile_changed, 30, 60),
      };
      changed = profile.profile_changed;
    }
  } catch {
    // If JSON parsing fails, the block is malformed; return clean text without profile
  }

  const clean = text.replace(m[0], "").trim();
  return { clean, profile, profileChanged: changed };
}

/**
 * Extract [[SUMMARY: ...]] block (replaces PROFILE when contact info is shared).
 */
export function extractSummary(text: string): {
  clean: string;
  summary: SummaryProfile | null;
} {
  const m = text.match(/\[\[SUMMARY:\s*([\s\S]*?)\]\]/i);
  if (!m) return { clean: text.trim(), summary: null };

  let summary: SummaryProfile | null = null;

  try {
    const parsed = JSON.parse(m[1].trim());
    if (parsed && typeof parsed === "object") {
      const base = {
        project_title: safeString(parsed.project_title, 120),
        project_category: safeCategory(parsed.project_category),
        customer_goal: safeString(parsed.customer_goal),
        target_audience: safeString(parsed.target_audience),
        problem: safeString(parsed.problem),
        proposed_solution: safeString(parsed.proposed_solution),
        key_features: safeArray(parsed.key_features, 10),
        technical_requirements: safeArray(parsed.technical_requirements, 10),
        technical_complexity: safeComplexity(parsed.technical_complexity),
        budget: safeString(parsed.budget, 200),
        budget_assessment: safeAssessment(parsed.budget_assessment),
        timeline: safeString(parsed.timeline, 200),
        timeline_assessment: safeAssessment(parsed.timeline_assessment),
        business_risks: safeArray(parsed.business_risks, 8),
        technical_risks: safeArray(parsed.technical_risks, 8),
        opportunities: safeArray(parsed.opportunities, 8),
        competition: safeString(parsed.competition),
        recommended_mvp: safeString(parsed.recommended_mvp),
        next_steps: safeString(parsed.next_steps),
        unanswered_questions: safeArray(parsed.unanswered_questions, 12),
        decision_maker: safeString(parsed.decision_maker, 200),
        conversation_stage: "contact_ready" as ConversationStage,
        priority_score: safeScore(parsed.priority_score),
        priority_strengths: safeArray(parsed.priority_strengths, 5),
        priority_concerns: safeArray(parsed.priority_concerns, 5),
        priority_recommendation: safeString(parsed.priority_recommendation, 500),
        profile_changed: safeArray(parsed.profile_changed, 30, 60),
      };
      summary = {
        ...base,
        contact_name: safeString(parsed.contact_name, 200) || undefined,
        contact_email: safeString(parsed.contact_email, 200) || undefined,
        contact_phone: safeString(parsed.contact_phone, 50) || undefined,
        company: safeString(parsed.company, 200) || undefined,
        preferred_contact: ["email", "phone", "digital_meeting"].includes(parsed.preferred_contact)
          ? parsed.preferred_contact
          : undefined,
      };
    }
  } catch {
    // malformed
  }

  const clean = text.replace(m[0], "").trim();
  return { clean, summary };
}

/**
 * Check if the AI message is asking for contact details.
 * Used to trigger the contact form in the UI.
 */
export function detectContactRequest(text: string, lang: "sv" | "en"): boolean {
  const lower = text.toLowerCase();
  const phrasesSv = [
    "kontaktuppgifter",
    "lämna dina kontaktuppgifter",
    "dina kontaktuppgifter",
    "hör av sig",
    "höra av sig",
    "kontakta dig",
    "mailadress",
    "e-postadress",
    "telefonnummer",
    "namn och email",
    "namn och e-post",
    "oliver kan höra av sig",
    "oliver hör av sig",
    "oliver tittar närmare",
    "oliver kan kontakta dig",
    "han kan höra av sig",
    "han kan kontakta dig",
  ];
  const phrasesEn = [
    "contact details",
    "contact information",
    "your contact",
    "get in touch",
    "reach out",
    "reach you",
    "email address",
    "phone number",
    "oliver will review",
    "oliver will reach out",
    "oliver can reach",
    "leave your details",
    "leave your contact",
    "he will be in touch",
  ];
  const phrases = lang === "sv" ? phrasesSv : phrasesEn;
  return phrases.some((p) => lower.includes(p));
}

/**
 * Detect email/phone in a text (used to auto-fill contact form).
 */
export function detectContactInfo(text: string): {
  email?: string;
  phone?: string;
} {
  const result: { email?: string; phone?: string } = {};
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];
  const phoneMatch = text.match(/(?:\+46|0)\s?[-\s]?\d[\d\s-]{6,14}\d/);
  if (phoneMatch) result.phone = phoneMatch[0].replace(/\s+/g, " ").trim();
  return result;
}

export { mergeProfile };

/**
 * Serialize the project profile into a compact string for the AI system prompt.
 */
export function formatProfileForPrompt(profile: ProjectProfile | null): string {
  if (!profile) return "(empty — project profile not yet established)";
  return JSON.stringify(profile, null, 2);
}
