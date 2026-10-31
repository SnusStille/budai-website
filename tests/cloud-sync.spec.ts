import { test, expect } from "@playwright/test";
import { syncMessagesToStore } from "../lib/playground/cloudStore";
import { newId, type ChatMessage } from "../lib/playground/types";
import type { SupabaseClient } from "@supabase/supabase-js";

test("cloud snapshots retain client identity and do not reinsert messages", async () => {
  const rows: Array<{ id: string; meta: { client_id?: string } }> = [];
  let failRead = false;
  const db = { from(table: string) {
    return {
      update() { return { eq() { return { eq() { return { in: async () => ({ error: null }) }; } }; } }; },
      select() { return { eq: async () => ({ data: rows, error: failRead ? { message: "offline" } : null }) }; },
      async insert(items: Array<{ id?: string; meta: { client_id?: string } }>) {
        expect(table).toBe("messages");
        for (const item of items) rows.push({ id: item.id || `db-${rows.length}`, meta: item.meta });
        return { error: null };
      },
    };
  } } as unknown as SupabaseClient;
  const id = newId("m");
  expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f-]{27}$/);
  const one: ChatMessage = { id, role: "user", content: "First", ts: 1 };
  // Include an older non-UUID client id to exercise meta-based matching.
  const two: ChatMessage = { id: "m-legacy", role: "assistant", content: "Reply", ts: 2 };
  expect((await syncMessagesToStore(db, "user", "thread", [one])).ok).toBe(true);
  expect((await syncMessagesToStore(db, "user", "thread", [one, two])).ok).toBe(true);
  expect((await syncMessagesToStore(db, "user", "thread", [one, two])).ok).toBe(true);
  expect(rows).toHaveLength(2);
  failRead = true;
  const three: ChatMessage = { id: newId("m"), role: "user", content: "Another", ts: 3 };
  expect((await syncMessagesToStore(db, "user", "thread", [one, two, three])).ok).toBe(false);
  expect(rows).toHaveLength(2);
});
