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
    const id = window.setInterval(ping, 60000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  if (!s) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/70">
      <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? "bg-accent-green" : "bg-red-400"}`} />
      {s.ok ? (sv ? "Alla system fungerar" : "All systems operational") : sv ? "Störning" : "Degraded"}
      {s.ok && <span className="font-mono text-white/40">{s.ms} ms</span>}
    </span>
  );
}
