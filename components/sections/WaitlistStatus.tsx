"use client";

import { useEffect, useState } from "react";
import { getWaitlistStatus } from "@/lib/data";

export default function WaitlistStatus({ email, sv, refParam }: { email: string; sv: boolean; refParam: string }) {
  const [s, setS] = useState<Awaited<ReturnType<typeof getWaitlistStatus>>>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    void getWaitlistStatus(email).then(setS);
  }, [email]);
  if (!s) return null;
  const link = s.code ? `${window.location.origin}/?${refParam}=${s.code}` : "";
  return (
    <div className="mx-auto mb-6 max-w-sm rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
      <p className="text-3xl font-bold text-white">#{s.position} <span className="text-base font-normal text-muted">{sv ? `av ${s.total}` : `of ${s.total}`}</span></p>
      <p className="mt-1 text-sm text-muted">
        {sv ? "Bjud in en kollega så flyttar du upp i kön." : "Invite a colleague and move up the line."}
        {s.referrals > 0 && <span className="text-accent-green"> {sv ? `${s.referrals} inbjudna hittills.` : `${s.referrals} invited so far.`}</span>}
      </p>
      {link && (
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(link).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); })}
          className="mt-3 w-full truncate rounded-xl border border-white/15 px-3 py-2 font-mono text-xs text-white hover:border-accent-cyan/40 transition-colors"
        >
          {copied ? (sv ? "Kopierad ✓" : "Copied ✓") : link}
        </button>
      )}
    </div>
  );
}
