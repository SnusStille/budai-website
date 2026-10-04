/**
 * Guest / offline conversation persistence (localStorage).
 * Members use Supabase via cloudStore.
 */
import {
  type Conversation,
  type ChatMessage,
  type MemoryItem,
  type PgSettings,
  newId,
  titleFromMessages,
} from "@/lib/playground/types";

export type { PgSettings };

const HIST_KEY = "budai-pg-history-v2";
const MEM_KEY = "budai-pg-memory-v2"; // guests: unused for cloud memory
const SETTINGS_KEY = "budai-pg-settings-v1";
const NOTES_KEY = "budai-pg-notes-v1";
const MAX_GUEST_CONVOS = 5;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSettings(): PgSettings {
  const fallback: PgSettings = { memoryEnabled: true, temporaryDefault: false };
  if (typeof window === "undefined") return fallback;
  return { ...fallback, ...safeParse<Partial<PgSettings>>(localStorage.getItem(SETTINGS_KEY), {}) };
}

export function saveSettings(s: PgSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* */
  }
}

/* ── saved notes — snippets you keep from answers ───────── */

export type NoteItem = {
  id: string;
  text: string;
  createdAt: number;
  source?: string;
};

export function loadNotes(): NoteItem[] {
  if (typeof window === "undefined") return [];
  return safeParse<NoteItem[]>(localStorage.getItem(NOTES_KEY), []).filter(
    (n) => n && typeof n.text === "string"
  );
}

export function saveNote(text: string, source?: string): NoteItem {
  const note: NoteItem = { id: newId("n"), text: text.slice(0, 4000), createdAt: Date.now(), source };
  const next = [note, ...loadNotes()].slice(0, 200);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(next));
    } catch {
      /* full or blocked */
    }
  }
  return note;
}

export function deleteNote(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(loadNotes().filter((n) => n.id !== id)));
  } catch {
    /* */
  }
}

export function clearNotes() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTES_KEY, "[]");
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
