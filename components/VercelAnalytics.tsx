"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { readConsent, subscribeConsent, type ConsentChoice } from "@/lib/consent";

/**
 * Analytics is loaded only when the deployment enables it AND the visitor has
 * explicitly accepted. Declining (or not choosing yet) loads nothing.
 * The initial render matches SSR (nothing), so there is no hydration mismatch.
 */
export default function VercelAnalytics({ enabled = false }: { enabled?: boolean }) {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    return subscribeConsent(setConsent);
  }, []);

  if (!enabled || consent !== "accepted") return null;
  return <Analytics />;
}
