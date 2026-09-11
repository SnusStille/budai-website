/**
 * Guest / offline conversation persistence (localStorage).
 * Members use Supabase via cloudStore.
 */
import {
  type Conversation,
  type ChatMessage,
  type MemoryItem,
  newId,
  titleFromMessages,
} from "@/lib/playground/types";

const HIST_KEY = "budai-pg-history-v2";
const MEM_KEY = "budai-pg-memory-v2"; // guests: unused for cloud memory
const SETTINGS_KEY = "budai-pg-settings-v1";
const MAX_GUEST_CONVOS = 5;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type PgSettings = {
  memoryEnabled: boolean;
  temporaryDefault: boolean;
};

export function loadSettings(): PgSettings {
  if (typeof window === "undefined") return { memoryEnabled: true, temporaryDefault: false };
  return safeParse(localStorage.getItem(SETTINGS_KEY), {
    memoryEnabled: true,
    temporaryDefault: false,
  });
}

export function saveSettings(s: PgSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

export function loadLocalConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  const list = safeParse<Conversation[]>(localStorage.getItem(HIST_KEY), []);
  return list
    .filter((c) => c && Array.isArray(c.messages))
    .map((c) => ({
      ...c,
      createdAt: c.createdAt || c.updatedAt || Date.now(),
      updatedAt: c.updatedAt || Date.now(),
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_GUEST_CONVOS);
}

export function saveLocalConversations(list: Conversation[]) {
  if (typeof window === "undefined") return;
  const trimmed = [...list]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_GUEST_CONVOS);
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota */
  }
}

export function upsertLocalConversation(convo: Conversation) {
  const list = loadLocalConversations().filter((c) => c.id !== convo.id);
  list.unshift(convo);
  saveLocalConversations(list);
}

export function deleteLocalConversation(id: string) {
  saveLocalConversations(loadLocalConversations().filter((c) => c.id !== id));
}

export function createLocalDraft(temporary = false): Conversation {
  const now = Date.now();
  return {
    id: newId("local"),
    title: temporary ? "Temporary chat" : "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
    temporary,
  };
}

export function persistLocalMessages(
  id: string | null,
  messages: ChatMessage[],
  opts?: { temporary?: boolean; title?: string }
): Conversation {
  const existing = id ? loadLocalConversations().find((c) => c.id === id) : null;
  const cid = existing?.id || id || newId("local");
  const title =
    opts?.title ||
    (messages.length ? titleFromMessages(messages) : existing?.title || "New chat");
  const convo: Conversation = {
    id: cid,
    title,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
    messages,
    temporary: opts?.temporary ?? existing?.temporary ?? false,
  };
  if (!convo.temporary && messages.length > 0) {
    upsertLocalConversation(convo);
  } else if (convo.temporary) {
    // temporary: keep only in-memory — remove from store if was saved
    deleteLocalConversation(cid);
  }
  return convo;
}

// Guest memory is not used (members only) — stubs for API parity
export function loadLocalMemory(): MemoryItem[] {
  return [];
}
