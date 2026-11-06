"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { CHANGELOG } from "@/lib/changelog";
import { useLang } from "@/components/ui/LanguageContext";

export default function WhatsNew() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    const hash = () => {
      if (window.location.hash === "#whats-new") {
        history.replaceState(null, "", window.location.pathname);
        setOpen(true);
      }
    };
    hash();
    window.addEventListener("hashchange", hash);
    window.addEventListener("budai:whats-new", show);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("budai:whats-new", show);
      window.removeEventListener("keydown", esc);
    };
  }, []);

  if (!open) return null;
  return (
    <div id="whats-new" className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)} role="dialog" aria-label="What's new">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#07070e] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{sv ? "Vad är nytt" : "What's new"}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-ds-muted hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-6">
          {CHANGELOG.map((e) => (
            <div key={e.id}>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-accent-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                {sv ? e.titleSv : e.title} <span className="font-mono text-[11px] text-muted/60">{e.date || (sv ? "Nu" : "Current")}</span>
              </p>
              <ul className="space-y-1.5 pl-3.5 text-sm text-white/80">
                {(sv ? e.itemsSv : e.items).map((it) => <li key={it}>· {it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <Link
          href="/changelog"
          onClick={() => setOpen(false)}
          className="mt-6 inline-flex items-center gap-1 text-xs text-accent-cyan hover:text-white transition-colors"
        >
          {sv ? "Visa hela ändringsloggen" : "View the full changelog"}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
