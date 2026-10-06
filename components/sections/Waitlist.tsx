"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Check, Copy, Building2, User, Gift, Zap, MessageCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser, getWaitlistCount } from "@/lib/data";
import WaitlistStatus from "@/components/sections/WaitlistStatus";
import { useLang } from "@/components/ui/LanguageContext";

const employeeRanges = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const interestsEn = ["Writing and documents", "Automation", "Data analysis", "Customer support", "Marketing content", "Problem solving", "Other"];
const interestsSv = ["Skrivande och dokument", "Automatisering", "Dataanalys", "Kundsupport", "Marknadsinnehåll", "Problemlösning", "Annat"];

const initialForm = { name: "", email: "", company: "", employees: "", interest: "" };
const field =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted/70 transition-colors focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 [&>option]:bg-[#0b0b14]";

export default function Waitlist() {
  const { lang } = useLang();
  const sv = lang === "sv";
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState("");
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("ref");
      if (q) {
        setReferral(q.slice(0, 64));
        setShowCode(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getWaitlistCount()
      .then((n) => !cancelled && setCount(n))
      .catch(() => !cancelled && setCount(null));
    return () => {
      cancelled = true;
    };
  }, [submitted]);

  const set = (k: keyof typeof initialForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes("@")) return;
    setLoading(true);
    setError(null);
    try {
      const company = accountType === "company";
      await addWaitlistUser({
        name: form.name,
        email: form.email,
        interest: form.interest,
        account_type: accountType,
        company: company ? form.company : null,
        industry: null,
        employees: company ? form.employees : null,
        discount_code: "BUDAI-EARLY-10",
        notes: referral.trim() ? `referral:${referral.trim().slice(0, 64)}` : null,
        source: referral.trim() ? "referral" : "landing",
        priority: company ? 60 : 45,
        last_contacted_at: null,
        tags: company ? ["company"] : ["individual"],
      });
      setSubmitted(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
    } catch (err: unknown) {
      const msg = ((err as { message?: string })?.message || "").toLowerCase();
      setError(
        msg.includes("duplicate") || msg.includes("unique") || msg.includes("already")
          ? sv ? "Den e-postadressen finns redan på listan." : "That email is already on the waitlist."
          : msg.includes("network") || msg.includes("fetch")
            ? sv ? "Nätverksfel. Kontrollera anslutningen och försök igen." : "Network error. Check your connection and try again."
            : sv ? "Kunde inte spara just nu. Försök igen om en stund." : "Could not save right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText("BUDAI-EARLY-10");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const perks = [
    { i: Gift, t: sv ? "10 % rabatt för grundare" : "10% off for founding members" },
    { i: Zap, t: sv ? "Tidig tillgång" : "Early access to features" },
    { i: MessageCircle, t: sv ? "Din feedback styr" : "Your feedback steers" },
  ];
  const tabs = [
    { id: "individual" as const, icon: User, label: sv ? "Privatperson" : "Individual" },
    { id: "company" as const, icon: Building2, label: sv ? "Företag" : "Company" },
  ];

  return (
    <section id="waitlist" className="relative section-hairline py-20 md:py-24 overflow-hidden">
      <Confetti active={confetti} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-purple/[0.07] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-xl px-4 sm:px-6">
        <ScrollReveal className="mb-8 text-center">
          <span className="section-badge mb-4 text-accent-purple">{sv ? "Tidig tillgång" : "Early access"}</span>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {sv ? "Få tidig tillgång till " : "Get early access to "}
            <span className="text-gradient">BudAI</span>
          </h2>
          <p className="text-sm text-muted sm:text-base">
            {sv ? "Gratis under preview. Grundare låser 10 % rabatt när paketen lanseras." : "Free during the preview. Founding members lock 10% off when plans launch."}
          </p>
          {count !== null && count > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
              {sv ? `${count} står redan på listan` : `${count} already on the list`}
            </p>
          )}
        </ScrollReveal>

        <div className="relative overflow-hidden rounded-2xl p-px shadow-[0_0_70px_-25px_rgba(124,92,255,0.55)]">
          <div aria-hidden className="bud-spin-conic absolute -inset-[60%]" />
          <div className="relative rounded-[15px] bg-[#05050b]/95 p-5 backdrop-blur-xl sm:p-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist">
                  {tabs.map((tb) => (
                    <button
                      key={tb.id}
                      type="button"
                      role="tab"
                      aria-selected={accountType === tb.id}
                      onClick={() => setAccountType(tb.id)}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                        accountType === tb.id ? "bg-accent-cyan/15 text-accent-cyan" : "text-muted hover:text-white"
                      }`}
                    >
                      <tb.icon className="h-4 w-4" />
                      {tb.label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input required className={field} placeholder={sv ? "Namn" : "Name"} value={form.name} onChange={set("name")} autoComplete="name" />
                  <input required type="email" className={field} placeholder={sv ? "E-post" : "Email"} value={form.email} onChange={set("email")} autoComplete="email" />
                </div>

                {accountType === "company" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required className={field} placeholder={sv ? "Företag" : "Company"} value={form.company} onChange={set("company")} autoComplete="organization" />
                    <select className={field} value={form.employees} onChange={set("employees")} aria-label={sv ? "Teamstorlek" : "Team size"}>
                      <option value="" disabled>{sv ? "Teamstorlek" : "Team size"}</option>
                      {employeeRanges.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}

                <select className={field} value={form.interest} onChange={set("interest")} aria-label={sv ? "Vad vill du använda BudAI till?" : "What will you use BudAI for?"}>
                  <option value="" disabled>{sv ? "Vad vill du använda BudAI till?" : "What will you use BudAI for?"}</option>
                  {(sv ? interestsSv : interestsEn).map((i) => <option key={i} value={i}>{i}</option>)}
                </select>

                {showCode ? (
                  <input className={field} placeholder={sv ? "Inbjudningskod" : "Invite code"} value={referral} onChange={(e) => setReferral(e.target.value)} />
                ) : (
                  <button type="button" onClick={() => setShowCode(true)} className="text-xs text-muted hover:text-accent-cyan transition-colors">
                    {sv ? "Har du en inbjudningskod?" : "Have an invite code?"}
                  </button>
                )}

                {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-accent-cyan py-3 text-sm font-semibold text-[#020205] transition-all hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? (sv ? "Skickar…" : "Sending…") : sv ? "Gå med i väntelistan" : "Join the waitlist"}
                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
                <p className="text-center text-[11px] text-muted/70">{sv ? "Ingen spam. Ingen betalning krävs." : "No spam. No payment needed."}</p>
              </form>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10">
                  <Check className="h-6 w-6 text-accent-green" />
                </div>
                <h3 className="mb-1 text-xl font-semibold text-white">{sv ? "Du är med!" : "You're in!"}</h3>
                <p className="mb-5 text-sm text-muted">{sv ? "Vi hör av oss när det är din tur." : "We'll be in touch when it's your turn."}</p>
                <WaitlistStatus email={form.email} sv={sv} refParam="ref" />
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-xs text-white transition-colors hover:border-accent-cyan/40"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
                  BUDAI-EARLY-10
                </button>
              </div>
            )}
          </div>
        </div>

        <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted">
          {perks.map((p) => (
            <li key={p.t} className="flex items-center gap-1.5">
              <p.i className="h-3.5 w-3.5 text-accent-cyan" />
              {p.t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
