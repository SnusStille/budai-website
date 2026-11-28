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
  | "game_development"
  | "roblox"
  | "fivem"
  | "integration"
  | "consulting"
  | "other"
  | "unknown";

export type ComplexityLevel = "low" | "medium" | "high" | "very_high" | null;
export type AssessmentLevel = "realistic" | "tight" | "unrealistic" | "unknown" | null;
export type ConversationStage = "discovery" | "scoping" | "assessment" | "blueprint_ready" | "conclusion_proposed" | "awaiting_confirmation" | "contact_ready" | "submitted" | "closed";

export type RequestType = "new_development" | "debugging" | "optimization" | "extension" | "integration" | "consultation" | "unknown";

export type CustomerType = "private" | "business" | "entrepreneur" | "gamer" | "existing_client" | "unknown";
export type ClientIntent = "new_build" | "enhancement" | "debug" | "quote" | "meeting" | "advice" | "collaboration" | "unknown";
export type InfoSource = "customer_confirmed" | "customer_estimate" | "ai_inferred" | "ai_suggested" | "unknown";
export type ConclusionState = "not_started" | "proposed" | "customer_reviewing" | "confirmed" | "submitted" | null;

export interface CustomerInfo {
  type: CustomerType;
  name: string | null;
  company_name: string | null;
  industry: string | null;
  niche: string | null;
  role: string | null;
  website: string | null;
  existing_relationship: boolean;
}

export interface BudgetInfo {
  amount: number | null;
  currency: string | null;
  raw_text: string | null;
  status: "confirmed" | "estimate" | "flexible" | "unknown";
  pricing_preference: "fixed_price" | "hourly" | "discuss" | "unknown";
}

export interface DeadlineInfo {
  desired_start: string | null;
  desired_completion: string | null;
  hard_deadline: boolean | null;
  flexibility: string | null;
}

export interface ConclusionData {
  state: ConclusionState;
  presented_at: string | null;
  confirmed_at: string | null;
  customer_notes: string | null;
  changes_requested: string | null;
}

export interface FieldTracking {
  [field: string]: InfoSource;
}

export type ConfidenceField = "clear" | "partial" | "missing";

export interface RealityCheck {
  technically_feasible: boolean | null;
  simpler_alternatives: string[];
  external_services_needed: string[];
  integration_risks: string[];
  security_concerns: string[];
  budget_scope_fit: AssessmentLevel;
  recommended_first_steps: string[];
  red_flags: string[];
}

export interface ScopePhase {
  phase: "mvp" | "v2" | "v3";
  name: string;
  description: string | null;
  features: string[];
  estimated_complexity: ComplexityLevel;
}

export interface ConfidenceAssessment {
  project_description: ConfidenceField;
  requirements_clarity: ConfidenceField;
  budget_clarity: ConfidenceField;
  timeline_clarity: ConfidenceField;
  technical_clarity: ConfidenceField;
  target_audience_clarity: ConfidenceField;
  customer_info_clarity: ConfidenceField;
  business_context_clarity: ConfidenceField;
  contact_info: ConfidenceField;
  overall_score: number; // 0-100
  missing_critical: string[];
}

export interface ProjectProfile {
  project_title: string | null;
  project_category: ProjectCategory;
  request_type: RequestType;
  // ── v4: Enhanced customer understanding ──
  client_intent: ClientIntent;
  customer: CustomerInfo;
  customer_goal: string | null;
  target_audience: string | null;
  problem: string | null;
  proposed_solution: string | null;
  // Features split: required vs nice-to-have
  key_features: string[]; // required / must-have for MVP
  nice_to_have_features: string[]; // optional / future
  suggested_features: string[]; // features BudAI suggests that customer didn't mention
  technical_requirements: string[];
  existing_systems: string[];
  external_integrations: string[];
  suggested_tech_stack: string[];
  technical_complexity: ComplexityLevel;
  // Budget: both raw and structured
  budget: string | null;
  budget_info: BudgetInfo;
  budget_assessment: AssessmentLevel;
  timeline: string | null;
  deadline_info: DeadlineInfo;
  timeline_assessment: AssessmentLevel;
  business_risks: string[];
  technical_risks: string[];
  opportunities: string[];
  competition: string | null;
  inspirations: string[]; // reference sites/products
  recommended_mvp: string | null;
  // Project Blueprint (professional brief fields)
  blueprint_ready: boolean;
  executive_summary: string | null;
  success_criteria: string[];
  // Scope phasing
  phases: ScopePhase[];
  // Technical Reality Check (internal — for Oliver's eyes)
  reality_check: RealityCheck;
  // Project Confidence (internal — how ready is this for Oliver to review?)
  confidence: ConfidenceAssessment;
  // Conclusion engine
  conclusion: ConclusionData;
  // Tracking: which fields come from where
  field_sources: FieldTracking;
  // Next best question (what BudAI plans to ask next — internal)
  next_best_question: string | null;
  // Legacy / retained
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
  "ecommerce", "booking_system", "saas_platform", "game_development",
  "roblox", "fivem", "integration", "consulting",
  "other", "unknown",
]);

const VALID_COMPLEXITY = new Set(["low", "medium", "high", "very_high"]);
const VALID_ASSESSMENT = new Set(["realistic", "tight", "unrealistic", "unknown"]);
const VALID_STAGES = new Set<ConversationStage>([
  "discovery", "scoping", "assessment", "blueprint_ready",
  "conclusion_proposed", "awaiting_confirmation", "contact_ready", "submitted", "closed",
]);

const VALID_REQUEST_TYPES = new Set<RequestType>([
  "new_development", "debugging", "optimization", "extension", "integration", "consultation", "unknown",
]);

const VALID_CUSTOMER_TYPES = new Set<CustomerType>([
  "private", "business", "entrepreneur", "gamer", "existing_client", "unknown",
]);
const VALID_CLIENT_INTENTS = new Set<ClientIntent>([
  "new_build", "enhancement", "debug", "quote", "meeting", "advice", "collaboration", "unknown",
]);
const VALID_INFO_SOURCES = new Set<InfoSource>([
  "customer_confirmed", "customer_estimate", "ai_inferred", "ai_suggested", "unknown",
]);
const VALID_BUDGET_STATUS = new Set(["confirmed", "estimate", "flexible", "unknown"] as const);
const VALID_PRICING_PREF = new Set(["fixed_price", "hourly", "discuss", "unknown"] as const);
const VALID_CONCLUSION_STATES = new Set<ConclusionState>([
  "not_started", "proposed", "customer_reviewing", "confirmed", "submitted", null,
]);

const VALID_CONFIDENCE = new Set<ConfidenceField>(["clear", "partial", "missing"]);

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

function safeRequestType(v: unknown): RequestType {
  if (typeof v === "string" && VALID_REQUEST_TYPES.has(v as RequestType)) return v as RequestType;
  return "unknown";
}

function safeConfidenceField(v: unknown): ConfidenceField {
  if (typeof v === "string" && VALID_CONFIDENCE.has(v as ConfidenceField)) return v as ConfidenceField;
  return "missing";
}

function safeCustomerType(v: unknown): CustomerType {
  if (typeof v === "string" && VALID_CUSTOMER_TYPES.has(v as CustomerType)) return v as CustomerType;
  return "unknown";
}
function safeClientIntent(v: unknown): ClientIntent {
  if (typeof v === "string" && VALID_CLIENT_INTENTS.has(v as ClientIntent)) return v as ClientIntent;
  return "unknown";
}
function safeInfoSource(v: unknown): InfoSource {
  if (typeof v === "string" && VALID_INFO_SOURCES.has(v as InfoSource)) return v as InfoSource;
  return "unknown";
}
function safeNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.round(v);
  return null;
}
function safeBool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}
function safeCustomer(v: unknown): CustomerInfo {
  const empty: CustomerInfo = {
    type: "unknown", name: null, company_name: null, industry: null,
    niche: null, role: null, website: null, existing_relationship: false,
  };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  return {
    type: safeCustomerType(o.type),
    name: safeString(o.name, 200),
    company_name: safeString(o.company_name, 200),
    industry: safeString(o.industry, 200),
    niche: safeString(o.niche, 200),
    role: safeString(o.role, 200),
    website: safeString(o.website, 300),
    existing_relationship: typeof o.existing_relationship === "boolean" ? o.existing_relationship : false,
  };
}
function safeBudgetInfo(v: unknown): BudgetInfo {
  const empty: BudgetInfo = {
    amount: null, currency: null, raw_text: null, status: "unknown", pricing_preference: "unknown",
  };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  return {
    amount: safeNumber(o.amount),
    currency: typeof o.currency === "string" ? o.currency.slice(0, 3).toUpperCase() : null,
    raw_text: safeString(o.raw_text, 200),
    status: typeof o.status === "string" && VALID_BUDGET_STATUS.has(o.status as any) ? o.status as any : "unknown",
    pricing_preference: typeof o.pricing_preference === "string" && VALID_PRICING_PREF.has(o.pricing_preference as any) ? o.pricing_preference as any : "unknown",
  };
}
function safeDeadlineInfo(v: unknown): DeadlineInfo {
  const empty: DeadlineInfo = { desired_start: null, desired_completion: null, hard_deadline: null, flexibility: null };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  return {
    desired_start: safeString(o.desired_start, 200),
    desired_completion: safeString(o.desired_completion, 200),
    hard_deadline: safeBool(o.hard_deadline),
    flexibility: safeString(o.flexibility, 200),
  };
}
function safeConclusion(v: unknown): ConclusionData {
  const empty: ConclusionData = { state: "not_started", presented_at: null, confirmed_at: null, customer_notes: null, changes_requested: null };
  if (!v || typeof v !== "object") return empty;
  const o = v as Record<string, unknown>;
  const state = VALID_CONCLUSION_STATES.has(o.state as ConclusionState) ? (o.state as ConclusionState) : "not_started";
  return {
    state,
    presented_at: safeString(o.presented_at, 50),
    confirmed_at: safeString(o.confirmed_at, 50),
    customer_notes: safeString(o.customer_notes, 2000),
    changes_requested: safeString(o.changes_requested, 2000),
  };
}
function safeFieldTracking(v: unknown): FieldTracking {
  if (!v || typeof v !== "object") return {};
  const out: FieldTracking = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "string" && VALID_INFO_SOURCES.has(val as InfoSource)) {
      out[k] = val as InfoSource;
    }
  }
  return out;
}

function safeRealityCheck(v: unknown): RealityCheck {
  const empty: RealityCheck = {
    technically_feasible: null,
    simpler_alternatives: [],
    external_services_needed: [],
    integration_risks: [],
    security_concerns: [],
    budget_scope_fit: null,
    recommended_first_steps: [],
    red_flags: [],
  };
  if (!v || typeof v !== "object") return empty;
  const obj = v as Record<string, unknown>;
  return {
    technically_feasible: typeof obj.technically_feasible === "boolean" ? obj.technically_feasible : null,
    simpler_alternatives: safeArray(obj.simpler_alternatives, 5, 200),
    external_services_needed: safeArray(obj.external_services_needed, 5, 100),
    integration_risks: safeArray(obj.integration_risks, 5, 200),
    security_concerns: safeArray(obj.security_concerns, 5, 200),
    budget_scope_fit: safeAssessment(obj.budget_scope_fit),
    recommended_first_steps: safeArray(obj.recommended_first_steps, 5, 200),
    red_flags: safeArray(obj.red_flags, 5, 200),
  };
}

function safePhases(v: unknown): ScopePhase[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 3).map((p, i) => {
    const phaseNames: ScopePhase["phase"][] = ["mvp", "v2", "v3"];
    if (!p || typeof p !== "object") {
      return { phase: phaseNames[i] || "mvp", name: "", description: null, features: [], estimated_complexity: null };
    }
    const obj = p as Record<string, unknown>;
    return {
      phase: phaseNames[i] || "mvp",
      name: typeof obj.name === "string" ? obj.name.slice(0, 80) : (i === 0 ? "MVP" : `Version ${i + 1}`),
      description: safeString(obj.description, 500),
      features: safeArray(obj.features, 8, 200),
      estimated_complexity: safeComplexity(obj.estimated_complexity),
    };
  });
}

function safeConfidence(v: unknown): ConfidenceAssessment {
  const empty: ConfidenceAssessment = {
    project_description: "missing",
    requirements_clarity: "missing",
    budget_clarity: "missing",
    timeline_clarity: "missing",
    technical_clarity: "missing",
    target_audience_clarity: "missing",
    customer_info_clarity: "missing",
    business_context_clarity: "missing",
    contact_info: "missing",
    overall_score: 0,
    missing_critical: [],
  };
  if (!v || typeof v !== "object") return empty;
  const obj = v as Record<string, unknown>;
  return {
    project_description: safeConfidenceField(obj.project_description),
    requirements_clarity: safeConfidenceField(obj.requirements_clarity),
    budget_clarity: safeConfidenceField(obj.budget_clarity),
    timeline_clarity: safeConfidenceField(obj.timeline_clarity),
    technical_clarity: safeConfidenceField(obj.technical_clarity),
    target_audience_clarity: safeConfidenceField(obj.target_audience_clarity),
    customer_info_clarity: safeConfidenceField(obj.customer_info_clarity),
    business_context_clarity: safeConfidenceField(obj.business_context_clarity),
    contact_info: safeConfidenceField(obj.contact_info),
    overall_score: safeScore(obj.overall_score),
    missing_critical: safeArray(obj.missing_critical, 8, 150),
  };
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
  // Deep merge: nested objects merged, arrays replaced, scalars overwritten when non-null
  const out: ProjectProfile = { ...prev };
  const nestedObjectKeys = new Set([
    "reality_check", "confidence", "customer", "budget_info",
    "deadline_info", "conclusion",
  ]);

  for (const [key, value] of Object.entries(next)) {
    if (value === null || value === undefined) continue;
    const outRecord = out as unknown as Record<string, unknown>;
    if (Array.isArray(value)) {
      outRecord[key] = value;
    } else if (nestedObjectKeys.has(key) && typeof value === "object" && outRecord[key] && typeof outRecord[key] === "object") {
      outRecord[key] = { ...(outRecord[key] as object), ...value };
    } else if (key === "field_sources" && typeof value === "object" && outRecord[key] && typeof outRecord[key] === "object") {
      outRecord[key] = { ...(outRecord[key] as object), ...value };
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
        request_type: safeRequestType(parsed.request_type),
        client_intent: safeClientIntent(parsed.client_intent),
        customer: safeCustomer(parsed.customer),
        customer_goal: safeString(parsed.customer_goal),
        target_audience: safeString(parsed.target_audience),
        problem: safeString(parsed.problem),
        proposed_solution: safeString(parsed.proposed_solution),
        key_features: safeArray(parsed.key_features, 12),
        nice_to_have_features: safeArray(parsed.nice_to_have_features || parsed.optional_features, 10),
        suggested_features: safeArray(parsed.suggested_features, 8),
        technical_requirements: safeArray(parsed.technical_requirements, 10),
        existing_systems: safeArray(parsed.existing_systems, 8),
        external_integrations: safeArray(parsed.external_integrations, 8),
        suggested_tech_stack: safeArray(parsed.suggested_tech_stack, 6),
        technical_complexity: safeComplexity(parsed.technical_complexity),
        budget: safeString(parsed.budget, 200),
        budget_info: safeBudgetInfo(parsed.budget_info),
        budget_assessment: safeAssessment(parsed.budget_assessment),
        timeline: safeString(parsed.timeline, 200),
        deadline_info: safeDeadlineInfo(parsed.deadline_info),
        timeline_assessment: safeAssessment(parsed.timeline_assessment),
        business_risks: safeArray(parsed.business_risks, 8),
        technical_risks: safeArray(parsed.technical_risks, 8),
        opportunities: safeArray(parsed.opportunities, 8),
        competition: safeString(parsed.competition),
        inspirations: safeArray(parsed.inspirations, 6, 200),
        recommended_mvp: safeString(parsed.recommended_mvp),
        blueprint_ready: typeof parsed.blueprint_ready === "boolean" ? parsed.blueprint_ready : false,
        executive_summary: safeString(parsed.executive_summary, 800),
        success_criteria: safeArray(parsed.success_criteria, 6, 200),
        phases: safePhases(parsed.phases),
        reality_check: safeRealityCheck(parsed.reality_check),
        confidence: safeConfidence(parsed.confidence),
        conclusion: safeConclusion(parsed.conclusion),
        field_sources: safeFieldTracking(parsed.field_sources),
        next_best_question: safeString(parsed.next_best_question, 300),
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
      const base: ProjectProfile = {
        project_title: safeString(parsed.project_title, 120),
        project_category: safeCategory(parsed.project_category),
        request_type: safeRequestType(parsed.request_type),
        client_intent: safeClientIntent(parsed.client_intent),
        customer: safeCustomer(parsed.customer),
        customer_goal: safeString(parsed.customer_goal),
        target_audience: safeString(parsed.target_audience),
        problem: safeString(parsed.problem),
        proposed_solution: safeString(parsed.proposed_solution),
        key_features: safeArray(parsed.key_features, 12),
        nice_to_have_features: safeArray(parsed.nice_to_have_features || parsed.optional_features, 10),
        suggested_features: safeArray(parsed.suggested_features, 8),
        technical_requirements: safeArray(parsed.technical_requirements, 10),
        existing_systems: safeArray(parsed.existing_systems, 8),
        external_integrations: safeArray(parsed.external_integrations, 8),
        suggested_tech_stack: safeArray(parsed.suggested_tech_stack, 6),
        technical_complexity: safeComplexity(parsed.technical_complexity),
        budget: safeString(parsed.budget, 200),
        budget_info: safeBudgetInfo(parsed.budget_info),
        budget_assessment: safeAssessment(parsed.budget_assessment),
        timeline: safeString(parsed.timeline, 200),
        deadline_info: safeDeadlineInfo(parsed.deadline_info),
        timeline_assessment: safeAssessment(parsed.timeline_assessment),
        business_risks: safeArray(parsed.business_risks, 8),
        technical_risks: safeArray(parsed.technical_risks, 8),
        opportunities: safeArray(parsed.opportunities, 8),
        competition: safeString(parsed.competition),
        inspirations: safeArray(parsed.inspirations, 6, 200),
        recommended_mvp: safeString(parsed.recommended_mvp),
        blueprint_ready: typeof parsed.blueprint_ready === "boolean" ? parsed.blueprint_ready : false,
        executive_summary: safeString(parsed.executive_summary, 800),
        success_criteria: safeArray(parsed.success_criteria, 6, 200),
        phases: safePhases(parsed.phases),
        reality_check: safeRealityCheck(parsed.reality_check),
        confidence: safeConfidence(parsed.confidence),
        conclusion: safeConclusion(parsed.conclusion),
        field_sources: safeFieldTracking(parsed.field_sources),
        next_best_question: safeString(parsed.next_best_question, 300),
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
