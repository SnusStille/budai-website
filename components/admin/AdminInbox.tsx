"use client";

import { useEffect, useState } from "react";

type Status = Record<string, boolean | string | number | null>;
type Item = { id: string; kind: string; message: string; page: string | null; created_at: string };

const CHECKS: [string, string, string][] = [
  ["adminPassword", "Admin password", "Set ADMIN_PASSWORD in .env.local"],
  ["supabaseUrl", "Supabase URL", "NEXT_PUBLIC_SUPABASE_URL"],
  ["supabaseAnon", "Supabase anon key", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  ["serviceRole", "Service role key", "SUPABASE_SERVICE_ROLE_KEY (waitlist admin, sharing, feedback)"],
  ["anthropic", "Anthropic key", "ANTHROPIC_API_KEY (the Playground needs it)"],
];

export default function AdminInbox() {
  const [st, setSt] = useState<Status | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const key = sessionStorage.getItem("budai_admin_key") || "";
    const h = { "x-admin-key": key };
    fetch("/api/admin/status", { headers: h, cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then(setSt).catch(() => setSt(null));
    fetch("/api/admin/feedback", { headers: h, cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed");
        setItems(j.items);
      })
      .catch((e: Error) => setErr(e.message));
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Environment check</h2>
        {!st ? (
          <p className="text-xs text-muted">Loading…</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {CHECKS.map(([k, label, hint]) => (
              <li key={k} className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${st[k] ? "bg-accent-green" : "bg-red-400"}`} />
                <span className="text-white/85">
                  {label}
                  {!st[k] && <span className="block text-xs text-muted">{hint}</span>}
                </span>
              </li>
            ))}
            {st.adminPasswordLegacyName && <li className="text-xs text-amber-300/80">Tip: rename NEXT_PUBLIC_ADMIN_PASSWORD to ADMIN_PASSWORD so it never reaches the browser.</li>}
            {st.model && <li className="font-mono text-xs text-muted">model: {String(st.model)}</li>}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-white">
          Feedback inbox
          {st && typeof st.feedbackCount === "number" && <span className="font-mono text-xs text-muted">{st.feedbackCount} total</span>}
        </h2>
        {err ? (
          <p className="text-xs text-amber-300/80">{err}</p>
        ) : !items ? (
          <p className="text-xs text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted">No feedback yet.</p>
        ) : (
          <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((f) => (
              <li key={f.id} className="text-sm">
                <p className="mb-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-accent-cyan">{f.kind}</span>
                  {new Date(f.created_at).toLocaleString()}
                </p>
                <p className="whitespace-pre-wrap text-white/85">{f.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
