export const PLAYGROUND_PREFILL_EVENT = "budai:prefill-playground";

let pendingPrompt: string | null = null;

export function prefillPlayground(prompt: string) {
  if (typeof window === "undefined") return;
  pendingPrompt = prompt;
  window.dispatchEvent(
    new CustomEvent(PLAYGROUND_PREFILL_EVENT, {
      detail: { prompt },
    })
  );
}

export function consumePlaygroundPrefill() {
  const prompt = pendingPrompt;
  pendingPrompt = null;
  return prompt;
}
