"use client";

import { useEffect, useState } from "react";
import BudAILogo from "@/components/ui/BudAILogo";
import { LOGO_CANDIDATES } from "@/components/logo/candidates";

export const LIVE_LOGO_KEY = "budai.logo.live";

/**
 * The mark used in the navigation. Defaults to the shipped BudAI Lattice mark —
 * unless a Logo Lab challenger has been switched on for a live trial, in which
 * case that candidate is drawn instead (identical SVG source, zero drift).
 */
export default function LiveMark({ px = 58 }: { px?: number }) {
  const [liveId, setLiveId] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const stored = window.localStorage.getItem(LIVE_LOGO_KEY);
        setLiveId(stored && LOGO_CANDIDATES.some((c) => c.id === stored) ? stored : null);
      } catch {
        setLiveId(null);
      }
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("budai:logo", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("budai:logo", read);
    };
  }, []);

  const candidate = liveId ? LOGO_CANDIDATES.find((c) => c.id === liveId) : null;
  if (!candidate) return <BudAILogo size="sm" animated motion="idle" />;

  return (
    <span
      className="live-mark"
      aria-label={`BudAI — ${candidate.name} (Logo Lab trial)`}
      dangerouslySetInnerHTML={{ __html: candidate.build(px, "dark") }}
    />
  );
}
