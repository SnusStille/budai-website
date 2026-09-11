/**
 * Member cloud conversations & memory via Supabase (RLS).
 * Uses append-friendly updates — never blindly wipe on every keystroke.
 */
import { createClient } from "@/lib/supabase/client";
import {
  type Conversation,
  type ChatMessage,
  type MemoryItem,
  titleFromMessages,
} from "@/lib/playground/types";

async function getUser() {
  const sb = createClient();
  if (!sb) return { sb: null, user: null };
  const {
    data: { user },
  } = await sb.auth.getUser();
  return { sb, user };
}

/** Lightweight list for sidebar — no full message bodies */
export async function listConversations(limit = 40): Promise<
  Pick<Conversation, "id" | "title" | "updatedAt" | "createdAt" | "temporary" | "pinned">[]
> {
  const { sb, user } = await getUser();
  if (!sb || !user) return [];
  const { data, error } = await sb
    .from("conversations")
    .select("id,title,updated_at,created_at,archived,pinned")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[cloud] listConversations", error.message);
    return [];
  }
  return (data || []).map((c) => ({
    id: c.id,
    title: c.title || "New chat",
    updatedAt: +new Date(c.updated_at),
    createdAt: +new Date(c.created_at),
    pinned: !!c.pinned,
    temporary: false,
  }));
}

export async function loadConversation(id: string): Promise<Conversation | null> {
  const { sb, user } = await getUser();
  if (!sb || !user) return null;
  const { data: c, error } = await sb
    .from("conversations")
    .select("id,title,updated_at,created_at,pinned")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !c) return null;
  const { data: msgs } = await sb
    .from("messages")
    .select("id,role,content,image_url,generated_image_url,created_at,meta")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);
  return {
    id: c.id,
    title: c.title,
    updatedAt: +new Date(c.updated_at),
    createdAt: +new Date(c.created_at),
    pinned: !!c.pinned,
    messages: (msgs || []).map((m) => ({
      id: m.id,
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
      ts: +new Date(m.created_at),
      imageUrl: m.image_url || m.generated_image_url || undefined,
      generated: !!(m.generated_image_url || m.meta?.generated),
    })),
  };
}

/**
 * Create empty conversation immediately (fixes New Chat).
 * Returns UUID from server.
 */
export async function createConversation(title = "New chat"): Promise<string | null> {
  const { sb, user } = await getUser();
  if (!sb || !user) return null;
  const { data, error } = await sb
    .from("conversations")
    .insert({ user_id: user.id, title })
    .select("id")
    .single();
  if (error) {
    console.warn("[cloud] createConversation", error.message);
    return null;
  }
  return data.id;
}

export async function renameConversation(id: string, title: string) {
  const { sb, user } = await getUser();
  if (!sb || !user) return false;
  const { error } = await sb
    .from("conversations")
    .update({ title: title.slice(0, 80), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  return !error;
}

export async function deleteConversation(id: string) {
  const { sb, user } = await getUser();
  if (!sb || !user) return;
  await sb.from("conversations").delete().eq("id", id).eq("user_id", user.id);
}

/**
 * Sync messages: append-only for new ids; update title from first user msg.
 * Avoids full wipe which caused races with New Chat.
 */
export async function syncMessages(
  conversationId: string,
  messages: ChatMessage[],
  opts?: { temporary?: boolean }
): Promise<{ ok: boolean; title?: string }> {
  if (opts?.temporary) return { ok: true };
  const { sb, user } = await getUser();
  if (!sb || !user) return { ok: false };

  const title = messages.length ? titleFromMessages(messages) : "New chat";
  await sb
    .from("conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", user.id);

  // Fetch existing message ids
  const { data: existing } = await sb
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId);
  const have = new Set((existing || []).map((m) => m.id));

  const toInsert = messages.filter((m) => !have.has(m.id) && m.role !== "system");
  if (toInsert.length) {
    const { error } = await sb.from("messages").insert(
      toInsert.map((m) => ({
        id: isUuid(m.id) ? m.id : undefined,
        conversation_id: conversationId,
        user_id: user.id,
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
        image_url: m.imageUrl && !m.imageUrl.startsWith("data:") && !m.generated ? m.imageUrl : null,
        generated_image_url: m.generated && m.imageUrl && !m.imageUrl.startsWith("data:") ? m.imageUrl : null,
        meta: {
          generated: !!m.generated,
          has_data_image: !!(m.imageUrl && m.imageUrl.startsWith("data:")),
        },
      }))
    );
    if (error) {
      // Fallback: insert without custom ids
      console.warn("[cloud] sync insert", error.message);
      await sb.from("messages").insert(
        toInsert.map((m) => ({
          conversation_id: conversationId,
          user_id: user.id,
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
          meta: { generated: !!m.generated, client_id: m.id },
        }))
      );
    }
  }
  return { ok: true, title };
}

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

export async function fetchMemories(): Promise<MemoryItem[]> {
  const { sb, user } = await getUser();
  if (!sb || !user) return [];
  const { data, error } = await sb
    .from("memories")
    .select("id,content,source,created_at,category")
    .eq("user_id", user.id)
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(40);
  if (error) return [];
  return (data || []).map((m) => ({
    id: m.id,
    text: m.content,
    source: m.source === "manual" ? "manual" : "auto",
    createdAt: +new Date(m.created_at),
    category: m.category || "general",
  }));
}

export async function updateMemory(id: string, text: string) {
  const { sb, user } = await getUser();
  if (!sb || !user) return;
  await sb
    .from("memories")
    .update({ content: text.slice(0, 400), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
}

export async function deleteMemory(id: string) {
  const { sb, user } = await getUser();
  if (!sb || !user) return;
  await sb.from("memories").update({ active: false }).eq("id", id).eq("user_id", user.id);
}

export async function clearMemories() {
  const { sb, user } = await getUser();
  if (!sb || !user) return;
  await sb.from("memories").update({ active: false }).eq("user_id", user.id);
}

export async function setMemoryEnabled(enabled: boolean) {
  const { sb, user } = await getUser();
  if (!sb || !user) return;
  await sb.from("profiles").update({ memory_enabled: enabled }).eq("id", user.id);
}

export async function getMemoryEnabled(): Promise<boolean> {
  const { sb, user } = await getUser();
  if (!sb || !user) return true;
  const { data } = await sb.from("profiles").select("memory_enabled").eq("id", user.id).maybeSingle();
  return data?.memory_enabled !== false;
}

export async function addManualMemory(text: string) {
  const { sb, user } = await getUser();
  if (!sb || !user) return null;
  const clean = text.trim().slice(0, 400);
  if (!clean) return null;
  const { data, error } = await sb
    .from("memories")
    .insert({
      user_id: user.id,
      content: clean,
      source: "manual",
      category: "general",
      confidence: 1,
    })
    .select("id,content,source,created_at")
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    text: data.content,
    source: "manual" as const,
    createdAt: +new Date(data.created_at),
  };
}
