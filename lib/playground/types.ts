/** Shared Playground types — single source of truth */

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  ts: number;
  imageUrl?: string;
  generated?: boolean;
  error?: boolean;
  status?: "sending" | "done" | "error";
  /** local-only annotations */
  rating?: "up" | "down";
  pinned?: boolean;
  ms?: number;
  tokens?: number;
  model?: string;
  /** voice / read-aloud helper */
  spoken?: boolean;
  /** the user turn this answer belongs to (used for regenerate + branching) */
  promptId?: string;
  /** sibling branch index when the same prompt has several answers */
  branch?: number;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  temporary?: boolean;
  pinned?: boolean;
};

export type MemoryItem = {
  id: string;
  text: string;
  source: "auto" | "manual";
  createdAt: number;
  category?: string;
};

export type AiActivity =
  | "idle"
  | "thinking"
  | "reading_image"
  | "analyzing"
  | "generating_image"
  | "remembering"
  | "listening"
  | "typing"
  | "error";

export type AttachmentDraft = {
  id: string;
  kind: "image" | "file";
  preview: string;
  b64: string;
  media: string;
  name: string;
  size: number;
  /** extracted text for non-image files */
  text?: string;
};

export type Mode = "single" | "dual" | "concise";

export type PersonaId = "core" | "writer" | "analyst" | "builder" | "coach" | "studio";
export type StyleId = "balanced" | "concise" | "creative" | "precise" | "stepbystep";
export type EffortId = "quick" | "balanced" | "deep";
export type AccentId = "aurora" | "violet" | "mint" | "sunset" | "ice";

export type PgSettings = {
  /** cloud memory toggle (mirrors the profile flag) */
  memoryEnabled?: boolean;
  temporaryDefault?: boolean;
  accent?: AccentId;
  sound?: boolean;
  stream?: boolean;
  persona?: PersonaId;
  style?: StyleId;
  effort?: EffortId;
  answerLang?: "sv" | "en";
  showTimestamps?: boolean;
  reduceEffects?: boolean;
  userName?: string;
};

export function newId(prefix = "c") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function titleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user" && m.content.trim());
  if (!firstUser) return "New chat";
  const t = firstUser.content.replace(/\s+/g, " ").trim();
  return (t.slice(0, 48) + (t.length > 48 ? "…" : "")) || "New chat";
}

export function memoryToPromptBlock(items: MemoryItem[], lang: "sv" | "en"): string {
  if (!items.length) return "";
  const lines = items.map((m) => `- ${m.text}`).join("\n");
  if (lang === "sv") {
    return `[BudAI långtidsminne — använd sparsamt och naturligt]\n${lines}`;
  }
  return `[BudAI long-term memory — use sparingly and naturally]\n${lines}`;
}

/** Detect natural-language image generation intent */
export function looksLikeImageGen(text: string): boolean {
  const t = text.toLowerCase().trim();
  return (
    /^(skapa|generera|rita|måla|gör)\s+(en\s+)?(bild|illustration|logo|ikon)/i.test(t) ||
    /^(create|generate|draw|paint|make)\s+(an?\s+)?(image|picture|illustration|logo|icon)/i.test(t) ||
    /^(image of|picture of|generate image|dall-?e)/i.test(t) ||
    /\b(generera bild|skapa bild|create an image|generate an image)\b/i.test(t)
  );
}

/** Rough token estimate — good enough for a live counter (≈4 chars/token). */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.round(text.trim().length / 4));
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

/** Very small cost estimate so people can see the order of magnitude (cents). */
export function estimateCostUsd(tokensIn: number, tokensOut: number): number {
  const inRate = 3 / 1_000_000;
  const outRate = 15 / 1_000_000;
  return tokensIn * inRate + tokensOut * outRate;
}

export function formatRelative(ts: number, lang: "sv" | "en"): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return lang === "sv" ? "nu" : "now";
  if (min < 60) return lang === "sv" ? `${min} min` : `${min}m`;
  const h = Math.round(min / 60);
  if (h < 24) return lang === "sv" ? `${h} tim` : `${h}h`;
  const d = Math.round(h / 24);
  return lang === "sv" ? `${d} d` : `${d}d`;
}
