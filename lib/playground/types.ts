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
  kind: "image";
  preview: string;
  b64: string;
  media: string;
  name: string;
  size: number;
};

export type Mode = "single" | "dual" | "concise";

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
