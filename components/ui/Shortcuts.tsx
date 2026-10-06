"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

/** Press "/" to jump to the Playground input, "?" for this overview. */
export default function Shortcuts() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "Escape") return setOpen(false);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("playground")?.scrollIntoView({ behavior: "smooth" });
        window.setTimeout(() => document.querySelector<HTMLTextAreaElement>("#playground textarea")?.focus({ preventScroll: true }), 500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;
  const rows: [string, string][] = [
    ["⌘ / Ctrl + K", sv ? "Kommandopalett" : "Command palette"],
    ["/", sv ? "Gå till Playground och skriv" : "Jump to the Playground input"],
    ["Enter", sv ? "Skicka" : "Send"],
    ["Shift + Enter", sv ? "Ny rad" : "New line"],
    ["?", sv ? "Den här översikten" : "This overview"],
    ["Esc", sv ? "Stäng" : "Close"],
  ];
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)} role="dialog" aria-label="Keyboard shortcuts">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#07070e] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{sv ? "Tangentbordsgenvägar" : "Keyboard shortcuts"}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <ul className="space-y-2.5">
          {rows.map(([k, d]) => (
            <li key={k} className="flex items-center justify-between text-sm">
              <span className="text-white/80">{d}</span>
              <kbd className="rounded-md border border-white/15 bg-white/[0.05] px-2 py-0.5 font-mono text-xs text-accent-cyan">{k}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
