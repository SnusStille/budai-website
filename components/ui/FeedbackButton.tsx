"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bug, Check, Lightbulb, MessageSquare, Send, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

const KINDS = [
  { id: "idea", en: "Idea", sv: "Idé", icon: Lightbulb },
  { id: "bug", en: "Something broke", sv: "Något gick fel", icon: Bug },
  { id: "other", en: "Other", sv: "Annat", icon: MessageSquare },
] as const;

type FeedbackState = "idle" | "sending" | "done" | "error";

export default function FeedbackButton() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("idea");
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<FeedbackState>("idle");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      setState("idle");
    };
    window.addEventListener("budai:feedback", show);
    return () => window.removeEventListener("budai:feedback", show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    const main = document.getElementById("main");
    const wasInert = main?.inert ?? false;
    if (main) main.inert = true;
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), textarea, a[href]") ?? []);
    requestAnimationFrame(() => (focusable()[0] ?? dialogRef.current)?.focus({ preventScroll: true }));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (main) main.inert = wasInert;
      requestAnimationFrame(() => previousFocus?.isConnected && previousFocus.focus({ preventScroll: true }));
    };
  }, [open]);

  const show = () => {
    setState("idle");
    setOpen(true);
  };

  const send = async () => {
    if (msg.trim().length < 3) return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message: msg, page: window.location.pathname + window.location.hash }),
      });
      if (!res.ok) throw new Error("feedback_submission_failed");
      setState("done");
      setMsg("");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-label={sv ? "Skicka feedback om BudAI" : "Send BudAI feedback"}
        className="feedback-launcher fixed bottom-5 right-16 z-40 hidden min-h-11 items-center gap-2.5 rounded-full border border-white/10 bg-[#07111a]/90 px-4 text-sm font-medium text-white/85 shadow-lg backdrop-blur-xl transition-all hover:border-accent-cyan/35 hover:bg-[#0b1923] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 md:flex"
      >
        <span className="feedback-launcher-icon"><MessageSquare className="h-4 w-4" aria-hidden="true" /></span>
        <span>Feedback</span>
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[140] flex items-end justify-center bg-[#02060b]/70 p-3 backdrop-blur-md sm:items-center sm:p-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? .08 : .18 }}
              onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}
            >
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-title"
                tabIndex={-1}
                className="feedback-dialog relative w-full max-w-lg overflow-hidden rounded-[22px] border border-white/10 bg-[#08111a] text-white shadow-[0_32px_100px_rgba(0,0,0,.62)]"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: .985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : 12, scale: .99 }}
                transition={{ duration: reducedMotion ? .08 : .22, ease: [.2, .8, .2, 1] }}
              >
                <div className="feedback-dialog-glow" aria-hidden="true" />
                <div className="relative p-5 sm:p-7">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="feedback-kicker"><span />BUDAI / {sv ? "DIN RÖST" : "YOUR VOICE"}</p>
                      <h2 id="feedback-title" className="mt-2 text-2xl font-semibold tracking-[-.035em] sm:text-[28px]">
                        {state === "done" ? (sv ? "Tack för att du hjälper till." : "Thanks for helping us improve.") : (sv ? "Vad kan bli bättre?" : "What could be better?")}
                      </h2>
                      {state !== "done" && <p className="mt-2 max-w-md text-sm leading-relaxed text-[#9fb2be]">{sv ? "En idé, något som skaver eller en detalj vi missat — din feedback hjälper oss att prioritera." : "An idea, a rough edge, or a detail we missed — your feedback helps us prioritize."}</p>}
                    </div>
                    <button type="button" onClick={() => setOpen(false)} aria-label={sv ? "Stäng feedback" : "Close feedback"} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/65 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {state === "done" ? (
                    <div className="feedback-success" role="status" aria-live="polite">
                      <span><Check className="h-5 w-5" aria-hidden="true" /></span>
                      <div><b>{sv ? "Feedback mottagen" : "Feedback received"}</b><p>{sv ? "Tack — vi har sparat din feedback tillsammans med sidans namn." : "Thanks — your feedback was saved with the page name."}</p></div>
                    </div>
                  ) : (
                    <>
                      <fieldset className="min-w-0">
                        <legend className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-[#9fb2be]">{sv ? "Vad gäller det?" : "What is it about?"}</legend>
                        <div className="grid grid-cols-3 gap-2">
                          {KINDS.map(({ id, en, sv: labelSv, icon: Icon }) => (
                            <button key={id} type="button" onClick={() => setKind(id)} aria-pressed={kind === id} className={`feedback-kind ${kind === id ? "is-selected" : ""}`}>
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              <span>{sv ? labelSv : en}</span>
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      <label className="mt-5 block">
                        <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[.12em] text-[#9fb2be]">
                          <span>{sv ? "Berätta lite mer" : "Tell us a little more"}</span>
                          <span className="font-mono text-[10px] normal-case tracking-normal text-[#6f8490]">{msg.length} / 2000</span>
                        </span>
                        <textarea
                          value={msg}
                          onChange={event => setMsg(event.target.value)}
                          rows={5}
                          maxLength={2000}
                          placeholder={sv ? "Vad märkte du? Vad hade gjort skillnad?" : "What did you notice? What would have helped?"}
                          className="feedback-message w-full resize-y rounded-xl border border-white/10 bg-[#050b11]/85 p-4 text-sm leading-relaxed text-white outline-none placeholder:text-[#657985] focus:border-[#6dd5e2]/55 focus:ring-2 focus:ring-[#6dd5e2]/10"
                        />
                      </label>
                      <div className="mt-3 flex min-h-8 items-center justify-between gap-3">
                        {state === "error" ? <p role="alert" className="text-xs text-rose-300">{sv ? "Kunde inte skicka. Försök igen om en stund." : "Could not send. Please try again."}</p> : <p className="text-xs text-[#738894]">{sv ? "Inget konto eller e-post behövs." : "No account or email needed."}</p>}
                        <button type="button" onClick={send} disabled={state === "sending" || msg.trim().length < 3} className="feedback-submit">
                          {state === "sending" ? (sv ? "Skickar…" : "Sending…") : sv ? "Skicka feedback" : "Send feedback"}
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </>
                  )}
                  <p className="mt-5 border-t border-white/[.07] pt-4 text-[10px] leading-relaxed text-[#6f8490]">{sv ? "Vi samlar inte in din e-post här. Meddelandet skickas med sidans sökväg för sammanhang." : "We do not collect your email here. Your message includes the page path for context."}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>, document.body
      )}
    </>
  );
}
