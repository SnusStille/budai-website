"use client";

import { ArrowRight, Bug, Check, Lightbulb, MessageSquarePlus, Send } from "lucide-react";
import { useId, useState } from "react";
import { useLang } from "@/components/ui/LanguageContext";

type Kind = "idea" | "bug" | "feature";

export default function FeedbackForm({ compact = false }: { compact?: boolean }) {
  const { lang } = useLang();
  const sv = lang === "sv";
  const id = useId();
  const [kind, setKind] = useState<Kind>("idea");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const kinds = [
    { id: "idea" as const, icon: MessageSquarePlus, en: "Suggestion", sv: "Förslag" },
    { id: "bug" as const, icon: Bug, en: "Bug report", sv: "Buggrapport" },
    { id: "feature" as const, icon: Lightbulb, en: "Feature request", sv: "Funktionsönskemål" },
  ];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim().length < 3 || state === "sending") return;
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message: message.trim(), page: window.location.pathname + window.location.hash }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(response.status === 429 ? (sv ? "För många inskick. Försök igen senare." : "Too many submissions. Please try again later.") : data.error || (sv ? "Kunde inte skicka just nu." : "Could not send right now."));
      }
      setState("done");
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (sv ? "Nätverksfel. Försök igen." : "Network error. Please try again."));
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="v2-feedback-success" role="status" aria-live="polite">
        <span><Check size={22} /></span>
        <h2>{sv ? "Tack för din feedback." : "Thank you for the feedback."}</h2>
        <p>{sv ? "Den har skickats till Stilledevs befintliga feedbackinkorg. Din input hjälper till att prioritera vad som byggs och förbättras." : "It has been sent to Stilledev’s existing feedback inbox. Your input helps prioritize what gets built and improved."}</p>
        <button type="button" className="v2-button v2-button-secondary" onClick={() => { setState("idle"); setKind("idea"); }}>{sv ? "Skicka en till" : "Send another"}<ArrowRight size={14} /></button>
      </div>
    );
  }

  const emailFallback = `mailto:Stilleinc@hotmail.com?subject=${encodeURIComponent(`BudAI ${kind} feedback`)}&body=${encodeURIComponent(message)}`;

  return (
    <form className={`v2-feedback-form ${compact ? "is-compact" : ""}`} onSubmit={submit} aria-busy={state === "sending"}>
      <fieldset>
        <legend>{sv ? "Vad vill du dela?" : "What would you like to share?"}</legend>
        <div className="v2-feedback-kinds">
          {kinds.map((item) => <button key={item.id} type="button" onClick={() => setKind(item.id)} aria-pressed={kind === item.id} className={kind === item.id ? "is-active" : ""}><item.icon size={15} />{sv ? item.sv : item.en}</button>)}
        </div>
      </fieldset>
      <label htmlFor={id}>{sv ? "Beskriv problemet, förslaget eller arbetsflödet" : "Describe the problem, suggestion or workflow"}</label>
      <textarea
        id={id}
        value={message}
        onChange={(event) => { setMessage(event.target.value); if (state === "error") setState("idle"); }}
        rows={compact ? 4 : 7}
        minLength={3}
        maxLength={2000}
        required
        placeholder={sv ? "Var konkret. Vad försökte du göra, vad hände, eller vad skulle göra BudAI mer användbart?" : "Be specific. What were you trying to do, what happened, or what would make BudAI more useful?"}
      />
      <div className="v2-feedback-meta"><span>{message.length} / 2000</span><span>{sv ? "Inga kontaktuppgifter krävs" : "No contact details required"}</span></div>
      {state === "error" && <div className="v2-feedback-error" role="alert"><p>{error}</p><a href={emailFallback}>{sv ? "Använd e-post istället" : "Use email instead"}<ArrowRight size={12} /></a></div>}
      <button type="submit" className="v2-button v2-button-primary" disabled={state === "sending" || message.trim().length < 3}>{state === "sending" ? (sv ? "Skickar…" : "Sending…") : (sv ? "Skicka feedback" : "Send feedback")}<Send size={14} /></button>
      <p className="v2-feedback-note">{sv ? "Ditt meddelande, kategorin och aktuell sida lagras så att Stilledev kan granska feedbacken. Dela inte lösenord, nycklar eller känsliga uppgifter. Du kan också" : "Your message, category and current page are stored so Stilledev can review the feedback. Do not share passwords, keys or sensitive information. You can also"} <a href={emailFallback}>{sv ? "mejla direkt" : "email directly"}</a>.</p>
    </form>
  );
}
