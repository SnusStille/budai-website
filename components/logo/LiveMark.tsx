"use client";

import { useEffect, useState } from "react";
import BudAILogo, { type LogoSize } from "@/components/ui/BudAILogo";
import { onBrainActivity } from "@/lib/logo/activity";

/**
 * The mark as it appears in the chrome. It listens for the Playground's
 * "BudAI is working" signal and shifts into its thinking state — so the logo
 * itself reacts while the AI generates, anywhere on the site.
 */
export default function LiveMark({ size = "sm" }: { size?: LogoSize }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => onBrainActivity(setBusy), []);

  return <BudAILogo size={size} animated motion={busy ? "thinking" : "idle"} interactive />
;
}
