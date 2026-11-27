"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { useLang } from "@/components/ui/LanguageContext";
import { trackBusinessEvent } from "@/lib/analytics/events";

const field = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30";
const subjects = [
  ["General enquiry", "Allmän förfrågan"], ["BudAI access", "Åtkomst till BudAI"],
  ["AI development project", "AI-utvecklingsprojekt"], ["Automation", "Automatisering"],
  ["Partnership", "Samarbete"], ["Support", "Support"], ["Other", "Annat"],
] as const;

type FormState = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "General enquiry", message: "", consent: false, website: "" });
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const set = (key: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    setForm((current) => ({ ...current, [key]: target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; dev?: boolean; stored?: boolean };
      if (response.ok && result.dev && result.stored !== true) {
        setError(sv ? "Det lokala testläget sparar inte förfrågningar, så meddelandet skickades inte." : "The local preview cannot store enquiries, so this message was not sent.");
        setState("error");
        return;
      }
      if (response.ok) {
        trackBusinessEvent("contact_form_submitted");
        setState("sent");
        return;
      }
      setError(response.status === 429
        ? (sv ? "För många försök. Prova igen senare." : "Too many submissions. Please try again later.")
        : result.error === "not_configured"
          ? (sv ? "Formuläret är tillfälligt otillgängligt." : "The form is temporarily unavailable.")
          : (sv ? "Formuläret kunde inte skickas. Försök igen." : "The form could not be submitted. Please try again."));
      setState("error");
    } catch {
      setError(sv ? "Nätverksfel. Försök igen." : "Network error. Please try again.");
      setState("error");
    }
  };

  if (state === "sent") return (
    <div className="rounded-2xl border border-accent-green/25 bg-accent-green/10 p-6 text-center" role="status" aria-live="polite">
      <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-accent-green" />
      <h2 className="font-semibold">{sv ? "Meddelande mottaget" : "Message received"}</h2>
      <p className="mt-1 text-sm text-muted">{sv ? "Tack — din förfrågan har sparats så att vi kan följa upp den." : "Thanks — your enquiry has been saved so we can follow up."}</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv ? "Namn" : "Name"} *</span><input required maxLength={120} className={field} value={form.name} onChange={set("name")} autoComplete="name" placeholder={sv ? "Ditt namn" : "Your name"} /></label>
        <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv ? "E-post" : "Email"} *</span><input required type="email" maxLength={254} className={field} value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@company.se" /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv ? "Företag" : "Company"}</span><input maxLength={160} className={field} value={form.company} onChange={set("company")} autoComplete="organization" placeholder={sv ? "Valfritt" : "Optional"} /></label>
        <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv ? "Ämne" : "Subject"}</span><select className={field} value={form.subject} onChange={set("subject")}>{subjects.map(([value, svLabel]) => <option key={value} value={value}>{sv ? svLabel : value}</option>)}</select></label>
      </div>
      <label className="block text-sm"><span className="mb-1.5 block text-white/80">{sv ? "Meddelande" : "Message"} *</span><textarea required rows={6} maxLength={5000} className={field} value={form.message} onChange={set("message")} placeholder={sv ? "Hur kan vi hjälpa dig?" : "How can we help?"} /></label>
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" value={form.website} onChange={set("website")} />
      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted"><input required type="checkbox" checked={form.consent} onChange={set("consent")} className="mt-0.5 accent-[#00e5ff]" />{sv ? "Jag godkänner att Stilledev behandlar mina kontaktuppgifter och mitt meddelande för att besvara förfrågan, enligt integritetspolicyn. *" : "I agree that Stilledev may process my contact details and message to answer this enquiry, as described in the privacy policy. *"}</label>
      {error && <div className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200" role="alert">{error}</div>}
      <button type="submit" disabled={state === "sending"} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" />{state === "sending" ? (sv ? "Skickar…" : "Sending…") : (sv ? "Skicka meddelande" : "Send message")}</button>
    </form>
  );
}
