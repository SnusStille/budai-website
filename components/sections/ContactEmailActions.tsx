"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";

export default function ContactEmailActions() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      <a href={CONTACT_MAILTO} className="inline-flex min-h-12 items-center gap-3 rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.05] px-4 py-3 text-sm text-white transition-colors hover:border-accent-cyan/50 hover:bg-accent-cyan/[0.09]">
        <Mail size={16} className="text-accent-cyan" aria-hidden="true" />
        <span><span className="block text-[10px] uppercase tracking-[0.12em] text-muted">{sv ? "Skriv direkt" : "Email directly"}</span><span className="font-medium">{CONTACT_EMAIL}</span></span>
      </a>
      <button type="button" onClick={copyAddress} className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/80 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
        {status === "copied" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
        {status === "copied" ? (sv ? "Kopierad" : "Copied") : (sv ? "Kopiera e-post" : "Copy email")}
      </button>
      <span className={status === "error" ? "text-xs text-muted" : "sr-only"} role="status" aria-live="polite">
        {status === "copied" ? (sv ? "E-postadressen kopierad." : "Email address copied.") : status === "error" ? (sv ? "Kunde inte kopiera. Markera adressen och kopiera den manuellt." : "Could not copy. Select the address and copy it manually.") : ""}
      </span>
    </div>
  );
}
