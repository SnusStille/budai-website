/**
 * Legacy re-exports — prefer @/lib/playground/*
 */
export type { ChatRole, ChatMessage, Conversation, MemoryItem } from "@/lib/playground/types";
export {
  newId,
  titleFromMessages,
  memoryToPromptBlock,
} from "@/lib/playground/types";

export {
  loadLocalConversations as loadConversations,
  saveLocalConversations as saveConversations,
  upsertLocalConversation as upsertConversation,
  deleteLocalConversation as deleteConversation,
  loadLocalMemory as loadMemory,
} from "@/lib/playground/localStore";

// stubs kept for older call sites
export function saveMemory(_items: unknown) {}
export function addMemory() { return []; }
export function removeMemory() { return []; }
export function clearMemory() {}
export function extractMemoryCandidates() { return [] as string[]; }

export type DeviceContext = Record<string, unknown>;
export function collectDeviceContext(): DeviceContext { return {}; }
export function contextToPromptBlock() { return ""; }
