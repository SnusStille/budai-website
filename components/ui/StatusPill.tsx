"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

/** Real health check: pings /api/health and shows the round-trip time. */
export default function StatusPill() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [s, setS] = useState<{ ok: boolean; ms: number } | null>(null);

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      const t0 = performance.now();
      try {
        const r = await fetch("/api/health", { cache: "no-store" });
        if (alive) setS({ ok: r.ok, ms: Math.round(performance.now() - t0) });
      } catch {
        if (alive) setS({ ok: false, ms: 0 });
      }
    };
    void ping();
    const id = window.setInterval(() => {
      if (!document.hidden) void ping();
    }, 60000);
    const onVisible = () => {
      if (!document.hidden) void ping();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!s) return null;
  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/70"
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.ok ? "bg-accent-green" : "bg-red-400"}`} />
      {s.ok ? (sv ? "Alla system fungerar" : "All systems operational") : sv ? "Störning" : "Degraded"}
      {s.ok && <span className="font-mono text-white/45">{s.ms} ms</span>}
    </span>
  );
}
