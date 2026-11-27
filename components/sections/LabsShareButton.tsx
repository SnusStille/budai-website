"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export default function LabsShareButton({ lang }: { lang: "sv" | "en" }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const sv = lang === "sv";

  const share = async () => {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(new URL(sv ? "/sv/labs" : "/labs", window.location.origin).href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 2600);
    }
  };

  return (
    <div className="labs-share-wrap">
      <button type="button" className="labs-share-button" onClick={share}>
        {copied ? <Check size={14} aria-hidden="true" /> : <Share2 size={14} aria-hidden="true" />}
        {copied ? (sv ? "Länken kopierad" : "Link copied") : (sv ? "Dela Labs" : "Share Labs")}
        {!copied && <Copy size={12} aria-hidden="true" />}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {failed ? (sv ? "Kunde inte kopiera länken." : "Could not copy the link.") : copied ? (sv ? "Labs-länken kopierad." : "Labs link copied.") : ""}
      </span>
    </div>
  );
}
