"use client";

import { track } from "@vercel/analytics";
import { readConsent } from "@/lib/consent";

export type BusinessEvent =
  | "contact_cta_click"
  | "contact_email_click"
  | "waitlist_cta_click"
  | "contact_form_submitted"
  | "waitlist_signup";

/** No personal/form data is included. Analytics events require explicit opt-in. */
export function trackBusinessEvent(name: BusinessEvent): void {
  if (readConsent() !== "accepted" || typeof window === "undefined") return;
  track(name, { path: window.location.pathname });
}
