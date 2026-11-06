"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { CHANGELOG } from "@/lib/changelog";
import { useLang } from "@/components/ui/LanguageContext";

/** The original quick peek remains available through ⌘K and #whats-new;
 * the full filterable release log lives at /changelog. */
export default function WhatsNew() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

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
    return () => {
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("budai:whats-new", show);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="v2-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div ref={panel} id="whats-new" className="v2-whats-new-panel" role="dialog" aria-modal="true" aria-labelledby="whats-new-title">
        <div className="v2-whats-new-heading"><div><p className="v2-kicker">STILLEDEV · BUDAI</p><h2 id="whats-new-title">{sv ? "Vad är nytt" : "What’s new"}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label={sv ? "Stäng" : "Close"}><X size={19} /></button></div>
        <div className="v2-whats-new-entries">
          {CHANGELOG.slice(0, 2).map((entry) => (
            <article key={entry.id}>
              <div><h3>{sv ? entry.titleSv : entry.title}</h3><span>{entry.date || (sv ? "Aktuell preview" : "Current preview")}</span></div>
              <ul>{(sv ? entry.itemsSv : entry.items).slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
        <Link href="/changelog" onClick={() => setOpen(false)} className="v2-text-link">{sv ? "Visa hela ändringsloggen" : "View the full changelog"}<ArrowUpRight size={14} /></Link>
      </div>
    </div>
  );
}
