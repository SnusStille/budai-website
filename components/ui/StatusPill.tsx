"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

type ServiceCheck = { ok: boolean; ms: number };

/** Links to the detailed page; this check proves only that /api/health responds. */
export default function StatusPill() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [status, setStatus] = useState<ServiceCheck | null>(null);

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      const started = performance.now();
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const body = await response.json().catch(() => null) as { ok?: boolean } | null;
        if (alive) setStatus({ ok: response.ok && body?.ok === true, ms: Math.round(performance.now() - started) });
      } catch {
        if (alive) setStatus({ ok: false, ms: 0 });
      }
    };
    void ping();
    const id = window.setInterval(ping, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const label = status === null
    ? sv ? "Status · kontrollerar" : "Status · checking"
    : status.ok
      ? sv ? "Webbrutten svarar" : "Web route responding"
      : sv ? "Webbrutten kan inte nås" : "Web route unreachable";

  return (
    <Link
      href="/status"
      aria-label={`${sv ? "Öppna systemstatus" : "Open system status"}. ${label}${status?.ok ? `, ${status.ms} ms` : ""}`}
      title={sv ? "Öppna BudAI-status" : "Open BudAI status"}
      className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/70 transition-colors hover:border-accent-cyan/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/70"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === null ? "bg-white/35" : status.ok ? "bg-emerald-300" : "bg-red-400"}`} aria-hidden="true" />
      <span>{label}</span>
      {status?.ok && <span className="font-mono text-white/40">{status.ms} ms</span>}
      <ArrowUpRight className="h-3 w-3 text-white/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
