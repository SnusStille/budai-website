"use client";

import { useEffect, useState } from "react";

type R = { id: string; name: string; text: string };
const KEY = "budai_routines";
const SEED: R[] = [
  { id: "seed1", name: "Customer follow-up", text: "Write a short, friendly follow-up email to {{customer}} about {{topic}}." },
  { id: "seed2", name: "Weekly report", text: "Turn these notes into a clear weekly report for {{team}}:\n{{notes}}" },
];
const fieldsOf = (t: string) => Array.from(new Set(Array.from(t.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)).map((m) => m[1].trim())));

/** Reusable prompt templates with {{fields}}. Stored in this browser. */
export default function Routines({ input, sv, onRun }: { input: string; sv: boolean; onRun: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<R[]>([]);
  const [name, setName] = useState("");
  const [running, setRunning] = useState<R | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setList(raw ? (JSON.parse(raw) as R[]) : SEED);
    } catch {
      setList(SEED);
    }
  }, []);
  const persist = (l: R[]) => {
    setList(l);
    try {
      localStorage.setItem(KEY, JSON.stringify(l));
    } catch {
      /* ignore */
    }
  };

  const run = (r: R, v: Record<string, string>) => {
    onRun(r.text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, k: string) => v[k.trim()] || k.trim()));
    setRunning(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="rounded-full border border-white/[0.08] px-3 py-1 text-[11px] text-muted hover:text-white transition-colors">
        {sv ? "Rutiner" : "Routines"}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-30 mb-2 w-72 rounded-2xl border border-white/10 bg-[#07070e]/95 p-3 shadow-2xl backdrop-blur-xl">
          {running ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-white">{running.name}</p>
              {fieldsOf(running.text).map((f) => (
                <input key={f} placeholder={f} value={vals[f] || ""} onChange={(e) => setVals({ ...vals, [f]: e.target.value })} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-accent-cyan/40" />
              ))}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRunning(null)} className="px-2 py-1 text-xs text-muted hover:text-white">{sv ? "Tillbaka" : "Back"}</button>
                <button type="button" onClick={() => run(running, vals)} className="rounded-lg bg-accent-cyan px-3 py-1.5 text-xs font-semibold text-[#020205]">{sv ? "Kör" : "Run"}</button>
              </div>
            </div>
          ) : (
            <>
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {list.map((r) => (
                  <li key={r.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => (fieldsOf(r.text).length ? (setVals({}), setRunning(r)) : run(r, {}))}
                      className="flex-1 truncate rounded-lg px-2 py-1.5 text-left text-xs text-white/85 hover:bg-white/5"
                    >
                      {r.name} <span className="text-muted/60">· {fieldsOf(r.text).length} {sv ? "fält" : "fields"}</span>
                    </button>
                    <button type="button" aria-label="Delete" onClick={() => persist(list.filter((x) => x.id !== r.id))} className="px-1.5 text-xs text-muted/60 hover:text-white">×</button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="mb-2 text-[11px] text-muted">{sv ? "Spara det du skrivit som rutin. Använd {{fält}} för det som ska bytas." : "Save what you typed as a routine. Use {{field}} for the parts that change."}</p>
                <div className="flex gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={sv ? "Namn" : "Name"} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-accent-cyan/40" />
                  <button
                    type="button"
                    disabled={!name.trim() || !input.trim()}
                    onClick={() => {
                      persist([{ id: `r${Date.now()}`, name: name.trim().slice(0, 40), text: input.trim() }, ...list]);
                      setName("");
                    }}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white disabled:opacity-30"
                  >
                    {sv ? "Spara" : "Save"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
