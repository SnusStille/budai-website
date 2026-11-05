"use client";

/**
 * Single source of truth for the optional analytics consent.
 *
 * `CookieConsent` writes the choice, `VercelAnalytics` reads it, and the footer
 * can reopen the banner. Nothing else may decide whether analytics loads.
 * The same storage key is used by the browser regression suite.
 */

export type ConsentChoice = "accepted" | "declined";

export const CONSENT_STORAGE_KEY = "budai-cookies";
export const CONSENT_CHANGE_EVENT = "budai:consent-change";
export const CONSENT_SETTINGS_EVENT = "budai:cookie-settings";

/** In-page fallback when localStorage is unavailable (e.g. private mode). */
let memoryChoice: ConsentChoice | null = null;

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return memoryChoice;
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "accepted" || stored === "declined") return stored;
  } catch {
    /* storage unavailable — fall back to the in-page choice */
  }
  return memoryChoice;
}

export function writeConsent(choice: ConsentChoice): void {
  memoryChoice = choice;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* the choice still applies for this page view */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/** Notifies about in-page changes and changes made in another tab. */
export function subscribeConsent(listener: (choice: ConsentChoice | null) => void): () => void {
  const notify = () => listener(readConsent());
  window.addEventListener(CONSENT_CHANGE_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT));
}
