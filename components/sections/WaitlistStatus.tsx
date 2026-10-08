"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Clock, Link2 } from "lucide-react";
import { getWaitlistStatus } from "@/lib/data";

/**
 * Queue position + referral link for a fresh signup.
 * Only rendered when the backend can actually answer (Supabase configured) —
 * no invented positions, no fake numbers.
 */
export default function WaitlistStatus({
  email,
  sv,
  refParam,
}: {
  email: string;
  sv: boolean;
  refParam: string;
}) {
  const [s, setS] = useState<Awaited<ReturnType<typeof getWaitlistStatus>>>(null);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!email) return;
    void getWaitlistStatus(email).then((res) => {
      if (!cancelled) setS(res);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!s) return null;

  const link = s.code && origin ? `${origin}/?${refParam}=${s.code}` : "";

  return (
    <div className="mx-6 mb-5 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4 text-center">
      <p className="text-sm text-muted">
        <Clock className="mr-1.5 inline h-3.5 w-3.5 text-accent-cyan" />
        {sv ? "Din plats i kön" : "Your place in line"}
      </p>
      <p className="mt-1 text-4xl font-bold tracking-tight text-white">
        #{s.position}
        <span className="ml-1.5 text-sm font-normal text-muted">
          {sv ? `av ${s.total}` : `of ${s.total}`}
        </span>
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        {sv ? "Ju fler du bjuder in, desto högre upp i kön." : "The more you invite, the higher you climb."}
        {s.referrals > 0 && (
          <span className="text-accent-green">
            {" "}
            {sv ? `${s.referrals} inbjudna hittills.` : `${s.referrals} invited so far.`}
          </span>
        )}
      </p>
      {link && (
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard.writeText(link).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            })
          }
          className="press mt-3 flex w-full items-center justify-center gap-2 truncate rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2.5 font-mono text-[11px] text-white transition-colors hover:border-accent-cyan/40"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 shrink-0 text-accent-green" />
              {sv ? "Kopierad" : "Copied"}
            </>
          ) : (
            <>
              <Link2 className="h-3.5 w-3.5 shrink-0 text-accent-cyan" />
              <span className="truncate">{link}</span>
              <Copy className="h-3.5 w-3.5 shrink-0 text-muted" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
