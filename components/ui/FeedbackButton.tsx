"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import FeedbackForm from "@/components/site/FeedbackForm";

export default function FeedbackButton() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("budai:feedback", show);
    return () => window.removeEventListener("budai:feedback", show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select") ?? []);
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

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="v2-feedback-fab" aria-label={sv ? "Skicka feedback" : "Send feedback"}>
        <MessageSquare size={15} /><span>Feedback</span>
      </button>
      {open && (
        <div className="v2-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div ref={dialog} className="v2-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
            <div className="v2-feedback-modal-heading"><div><p className="v2-kicker">STILLEDEV · BUDAI</p><h2 id="feedback-modal-title">{sv ? "Din feedback styr vad som blir bättre." : "Your feedback shapes what gets better."}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label={sv ? "Stäng" : "Close"}><X size={19} /></button></div>
            <FeedbackForm compact />
          </div>
        </div>
      )}
    </>
  );
}
