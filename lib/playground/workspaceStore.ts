/** Explicit, device-only workspace saving. Nothing is stored until the user saves. */
export type WorkspaceDraft = { msgId: string; title: string; body: string };
const key = (owner: string) => `budai-workspace-draft-v1:${owner}`;

export function readWorkspaceDraft(owner: string): WorkspaceDraft | null {
  try {
    const value = JSON.parse(localStorage.getItem(key(owner)) || "null");
    if (!value || typeof value.msgId !== "string" || typeof value.title !== "string" || typeof value.body !== "string") return null;
    return { msgId: value.msgId, title: value.title, body: value.body };
  } catch { return null; }
}

export function saveWorkspaceDraft(owner: string, draft: WorkspaceDraft): boolean {
  if (!draft.body.trim() || draft.body.length > 100_000) return false;
  try { localStorage.setItem(key(owner), JSON.stringify(draft)); return true; }
  catch { return false; }
}

export function deleteWorkspaceDraft(owner: string): boolean {
  try { localStorage.removeItem(key(owner)); return true; }
  catch { return false; }
}
