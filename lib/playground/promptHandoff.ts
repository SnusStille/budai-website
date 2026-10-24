/**
 * A one-page, in-memory bridge between the landing-page ask box and the lazy
 * Playground chunk. It avoids putting draft text in the URL or another store.
 */
const PENDING_KEY = "__budaiPendingPlaygroundPrompt";

type HandoffWindow = Window & { [PENDING_KEY]?: string };

export function stagePlaygroundPrompt(value: string) {
  const text = value.trim();
  if (!text) return;

  (window as HandoffWindow)[PENDING_KEY] = text;
  window.dispatchEvent(new CustomEvent("budai:prompt", { detail: text }));
}

export function consumePlaygroundPrompt() {
  const target = window as HandoffWindow;
  const text = target[PENDING_KEY];
  delete target[PENDING_KEY];
  return typeof text === "string" ? text : undefined;
}
