"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";

const KINDS = [
  { id: "idea", en: "Idea", sv: "Idé" },
  { id: "bug", en: "Bug", sv: "Bugg" },
  { id: "other", en: "Other", sv: "Annat" },
];

export default function FeedbackButton() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("idea");
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX = 2000;

  // Focus the message field as soon as the dialog opens.
  useEffect(() => {
    if (open && state !== "done") textareaRef.current?.focus();
  }, [open, state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const send = async () => {
    if (msg.trim().length < 3 || state === "sending") return;
    setState("sending");
    setErrorText("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message: msg, page: window.location.pathname + window.location.hash }),
      });
      if (res.status === 429) {
        setErrorText(sv ? "Du har skickat många meddelanden just nu. Försök igen om en stund." : "You've sent a lot of messages just now. Try again in a while.");
        setState("error");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      setMsg("");
    } catch {
      setErrorText(sv ? "Kunde inte skicka. Kontrollera anslutningen och försök igen." : "Could not send. Check your connection and try again.");
      setState("error");
    }
  };

  // Cmd/Ctrl + Enter sends from the textarea — the way people expect a feedback box to work.
  const onTextKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setState("idle");
        }}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 z-40 hidden items-center gap-2 rounded-full border border-white/10 bg-[#07070e]/80 px-4 py-2.5 text-xs font-medium text-white/80 shadow-lg backdrop-blur-xl transition-colors hover:border-accent-cyan/40 hover:text-white md:flex"
      >
        <MessageSquare className="h-4 w-4 text-accent-cyan" />
        Feedback
      </button>
      {open && (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={sv ? "Skicka feedback" : "Send feedback"}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#07070e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{sv ? "Din feedback styr BudAI" : "Your feedback steers BudAI"}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={sv ? "Stäng" : "Close"} className="text-white/60 transition-colors hover:text-white"><X aria-hidden className="h-5 w-5" /></button>
            </div>
            {state === "done" ? (
              <p className="py-6 text-center text-sm text-accent-green">{sv ? "Tack! Jag läser allt." : "Thanks! I read everything."}</p>
            ) : (
              <>
                <div className="mb-3 flex gap-2">
                  {KINDS.map((k) => (
                    <button key={k.id} type="button" onClick={() => setKind(k.id)} aria-pressed={kind === k.id} className={`rounded-full border px-3 py-1 text-xs ${kind === k.id ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan" : "border-white/10 text-muted"}`}>
                      {sv ? k.sv : k.en}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={onTextKey}
                  rows={4}
                  maxLength={MAX}
                  aria-label={sv ? "Ditt meddelande" : "Your message"}
                  placeholder={sv ? "Vad saknas, vad är trasigt, vad kan bli bättre?" : "What's missing, what's broken, what could be better?"}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none transition-colors placeholder:text-muted/60 focus:border-accent-cyan/40"
                />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted/70">
                  <span>{sv ? "⌘/Ctrl + Enter skickar" : "⌘/Ctrl + Enter to send"}</span>
                  <span className={msg.length > MAX * 0.85 ? "text-accent-cyan" : undefined} aria-live="polite">
                    {msg.length}/{MAX}
                  </span>
                </div>
                {state === "error" && (
                  <p role="alert" className="mt-2 text-xs text-red-300">
                    {errorText}
                  </p>
                )}
                <button
                  type="button"
                  onClick={send}
                  disabled={state === "sending" || msg.trim().length < 3}
                  aria-busy={state === "sending"}
                  className="mt-3 w-full rounded-xl bg-accent-cyan py-2.5 text-sm font-semibold text-[#020205] disabled:opacity-40"
                >
                  {state === "sending" ? (sv ? "Skickar…" : "Sending…") : sv ? "Skicka" : "Send"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
