/**
 * One tiny broadcast channel for "BudAI is working".
 * The Playground emits it while a response streams; the mark in the navbar,
 * the intro and any loading state listen and speed up in response.
 */
export const BRAIN_EVENT = "budai:brain";

export function emitBrainActivity(busy: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BRAIN_EVENT, { detail: { busy } }));
}

export function onBrainActivity(handler: (busy: boolean) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ busy?: boolean }>).detail;
    handler(Boolean(detail?.busy));
  };
  window.addEventListener(BRAIN_EVENT, listener);
  return () => window.removeEventListener(BRAIN_EVENT, listener);
}
