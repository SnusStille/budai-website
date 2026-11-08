/** Session-only companion preference; never uses analytics or stores personal data. */
export const COMPANION_HIDDEN_KEY = "budai:companion:hidden:v1";
export const COMPANION_VISIBILITY_EVENT = "budai:companion:visibility";

export function readCompanionHidden() {
  try { return sessionStorage.getItem(COMPANION_HIDDEN_KEY) === "1"; } catch { return false; }
}

export function setCompanionHidden(hidden: boolean) {
  try {
    if (hidden) sessionStorage.setItem(COMPANION_HIDDEN_KEY, "1");
    else sessionStorage.removeItem(COMPANION_HIDDEN_KEY);
  } catch { /* The event keeps this page usable if storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent(COMPANION_VISIBILITY_EVENT, { detail: hidden }));
}
