"use client";

import { Analytics } from "@vercel/analytics/next";

/** Vercel supplies the insights endpoint; local/Arena/self-hosted servers do not. */
export default function VercelAnalytics({ enabled = false }: { enabled?: boolean }) {
  return enabled ? <Analytics /> : null;
}
