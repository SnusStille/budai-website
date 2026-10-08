"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  Building2,
  User,
  Gift,
  Zap,
  MessageCircle,
  Mail,
  Loader2,
  ShieldCheck,
  Share2,
  AlertCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser, getWaitlistCount, getWaitlistStatus } from "@/lib/data";
import WaitlistStatus from "@/components/sections/WaitlistStatus";
import { useLang } from "@/components/ui/LanguageContext";

const DISCOUNT_CODE = "BUDAI-EARLY-10";
const employeeRanges = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const interestsEn = ["Writing and documents", "Automation", "Data analysis", "Customer support", "Marketing content", "Problem solving", "Other"];
const interestsSv = ["Skrivande och dokument", "Automatisering", "Dataanalys", "Kundsupport", "Marknadsinnehåll", "Problemlösning", "Annat"];

const initialForm = { name: "", email: "", company: "", employees: "", interest: "" };
const field =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted/70 transition-all duration-200 focus:outline-none focus:border-accent-cyan/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-accent-cyan/30 [&>option]:bg-[#07070e]";
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [referral, setReferral] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [details, setDetails] = useState(false);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getWaitlistStatus>>>(null);

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

  const set =
    (k: keyof typeof initialForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      if (k === "email") setFieldError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = form.email.trim();
    if (!emailRe.test(email)) {
      setFieldError(
        sv
          ? "Ange en giltig e-postadress, t.ex. namn@foretag.se"
          : "Enter a valid email address, e.g. name@company.com"
      );
      return;
    }
    setFieldError(null);
    setLoading(true);
    setError(null);
    try {
      const company = accountType === "company";
      await addWaitlistUser({
        name: form.name.trim() || email.split("@")[0],
        email,
        interest: form.interest,
        account_type: accountType,
        company: company ? form.company : null,
        industry: null,
        employees: company ? form.employees : null,
        discount_code: DISCOUNT_CODE,
        notes: referral.trim() ? `referral:${referral.trim().slice(0, 64)}` : null,
        source: referral.trim() ? "referral" : "landing",
        priority: company ? 60 : 45,
        last_contacted_at: null,
        tags: company ? ["company"] : ["individual"],
      });
      setSubmitted(true);
      void getWaitlistStatus(email).then(setStatus);
      setConfetti(true);
      window.setTimeout(() => setConfetti(false), 4200);
      window.dispatchEvent(new CustomEvent("budai:toast", { detail: { icon: "trophy", title: sv ? "Du är med!" : "You're in!", body: `${DISCOUNT_CODE} · 10%` } }));
    } catch (err: unknown) {
      const msg = ((err as { message?: string })?.message || "").toLowerCase();
      setError(
        msg.includes("duplicate") || msg.includes("unique") || msg.includes("already")
          ? sv
            ? "Den e-postadressen finns redan på listan — du är redan med."
            : "That email is already on the waitlist — you're already in."
          : msg.includes("network") || msg.includes("fetch")
            ? sv
              ? "Nätverksfel. Kontrollera anslutningen och försök igen."
              : "Network error. Check your connection and try again."
            : sv
              ? "Kunde inte spara just nu. Försök igen om en stund."
              : "Could not save right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onDone();
      window.setTimeout(() => onDone(), 1800);
    } catch {
      window.dispatchEvent(
        new CustomEvent("budai:toast", {
          detail: {
            icon: "info",
            title: sv ? "Kunde inte kopiera" : "Copy failed",
            body: text,
          },
        })
      );
    }
  };

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const code = status?.code || referral.trim();
    return code ? `${window.location.origin}/?ref=${encodeURIComponent(code)}` : window.location.origin;
  }, [status, referral]);

  const share = async () => {
    if (!shareUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "BudAI",
          text: sv
            ? "Jag står på väntelistan till BudAI — AI-arbetsassistenten för Sverige. 10% early access."
            : "I'm on the BudAI waitlist — the AI work assistant for Sweden. 10% early access.",
          url: shareUrl,
        });
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    setShared(true);
    void copy(shareUrl, () => setShared((v) => !v));
  };

  const perks = [
    { i: Gift, t: sv ? "10 % rabatt vid lansering" : "10% off at launch" },
    { i: Zap, t: sv ? "Tidig tillgång till nya funktioner" : "Early access to new features" },
    { i: MessageCircle, t: sv ? "Din feedback styr vad som byggs" : "Your feedback steers what gets built" },
  ];
  const nextSteps = sv
    ? [
        ["Bekräftelse", "Du är inne — ingen betalning, inget kort."],
        ["Early access", "Vi släpper in i vågor och mejlar dig först."],
        ["10 % låst", `Koden ${DISCOUNT_CODE} knyts till din e-post.`],
      ]
    : [
        ["Confirmation", "You're in — no payment, no card."],
        ["Early access", "We open in waves and email you first."],
        ["10% locked", `Code ${DISCOUNT_CODE} is tied to your email.`],
      ];
  const tabs = [
    { id: "individual" as const, icon: User, label: sv ? "Privatperson" : "Individual" },
    { id: "company" as const, icon: Building2, label: sv ? "Företag" : "Company" },
  ];

  return (
    <section
      id="waitlist"
      aria-label={sv ? "Väntelista och tidig tillgång" : "Waitlist and early access"}
      className="relative section-hairline overflow-hidden py-24 md:py-32"
    >
      <Confetti active={confetti} />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[min(95vw,820px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent-cyan/[0.1] to-accent-purple/[0.12] blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <ScrollReveal>
          <span className="section-badge mb-5 text-accent-purple">
            <Sparkles className="h-3.5 w-3.5" />
            {sv ? "Tidig tillgång" : "Early access"}
          </span>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {sv ? "Var först i " : "Be first in "}
            <span className="text-gradient">{sv ? "kön." : "line."}</span>
          </h2>
          <p className="mx-auto max-w-md text-base text-muted sm:text-lg">
            {sv
              ? "Gratis under preview. Grundarmedlemmar låser 10 % rabatt när paketen lanseras."
              : "Free during the preview. Founding members lock 10% off when plans launch."}
          </p>

          {/* The reward, spelled out */}
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {perks.map((p) => (
              <span
                key={p.t}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/80 transition-colors hover:border-accent-cyan/25 hover:text-white"
              >
                <p.i className="h-3.5 w-3.5 text-accent-cyan" />
                {p.t}
              </span>
            ))}
          </div>

          {count !== null && count > 25 && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
              {sv ? `${count} står redan på listan` : `${count} already on the list`}
            </p>
          )}
        </ScrollReveal>

        {!submitted ? (
          <form onSubmit={handleSubmit} noValidate className="mx-auto mt-9 max-w-xl text-left">
            <div className="relative overflow-hidden rounded-2xl p-px shadow-[0_0_70px_-20px_rgba(124,92,255,0.6)] sm:rounded-full">
              <div aria-hidden className="bud-spin-conic absolute -inset-[60%]" />
              <div className="relative flex flex-col gap-2 rounded-[15px] bg-[#07070e] p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5 sm:pl-5">
                <label className="flex flex-1 items-center gap-3 px-3 py-2 sm:px-0 sm:py-0">
                  <Mail aria-hidden className="h-5 w-5 shrink-0 text-accent-cyan" />
                  <span className="sr-only">{sv ? "E-postadress" : "Email address"}</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                    inputMode="email"
                    enterKeyHint="send"
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? "waitlist-email-error" : undefined}
                    placeholder={sv ? "din@epost.se" : "you@email.com"}
                    className="w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-muted/60"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_36px_-6px_rgba(0,229,255,0.5)] disabled:cursor-wait disabled:opacity-70 sm:rounded-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {sv ? "Skickar…" : "Sending…"}
                    </>
                  ) : (
                    <>
                      {sv ? "Gå med" : "Join the waitlist"}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {fieldError && (
              <p
                id="waitlist-email-error"
                role="alert"
                className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-amber-300"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {fieldError}
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="mt-3 flex items-start justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/[0.08] px-3.5 py-2.5 text-left text-sm text-red-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {error}
                  <button
                    type="button"
                    onClick={() => {
                      const fake = { preventDefault: () => {} } as React.FormEvent;
                      void handleSubmit(fake);
                    }}
                    className="ml-2 font-semibold text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
                  >
                    {sv ? "Försök igen" : "Try again"}
                  </button>
                </span>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setDetails((d) => !d)}
                aria-expanded={details}
                className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-accent-cyan"
              >
                <span
                  className={`inline-block transition-transform duration-300 ${details ? "rotate-45" : ""}`}
                  aria-hidden
                >
                  +
                </span>
                {sv ? "Lägg till detaljer (valfritt)" : "Add details (optional)"}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {details && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                    <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1" role="tablist">
                      {tabs.map((tb) => (
                        <button
                          key={tb.id}
                          type="button"
                          role="tab"
                          aria-selected={accountType === tb.id}
                          onClick={() => setAccountType(tb.id)}
                          className={`press flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                            accountType === tb.id
                              ? "bg-accent-cyan/15 text-accent-cyan"
                              : "text-muted hover:text-white"
                          }`}
                        >
                          <tb.icon className="h-4 w-4" />
                          {tb.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className={field}
                        placeholder={sv ? "Namn" : "Name"}
                        value={form.name}
                        onChange={set("name")}
                        autoComplete="name"
                      />
                      <select
                        className={field}
                        value={form.interest}
                        onChange={set("interest")}
                        aria-label={sv ? "Användningsområde" : "Use case"}
                      >
                        <option value="" disabled>
                          {sv ? "Vad ska du använda det till?" : "What will you use it for?"}
                        </option>
                        {(sv ? interestsSv : interestsEn).map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                    {accountType === "company" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          className={field}
                          placeholder={sv ? "Företag" : "Company"}
                          value={form.company}
                          onChange={set("company")}
                          autoComplete="organization"
                        />
                        <select
                          className={field}
                          value={form.employees}
                          onChange={set("employees")}
                          aria-label={sv ? "Teamstorlek" : "Team size"}
                        >
                          <option value="" disabled>
                            {sv ? "Teamstorlek" : "Team size"}
                          </option>
                          {employeeRanges.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {showCode ? (
                      <input
                        className={field}
                        placeholder={sv ? "Inbjudningskod" : "Invite code"}
                        value={referral}
                        onChange={(e) => setReferral(e.target.value)}
                        aria-label={sv ? "Inbjudningskod" : "Invite code"}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCode(true)}
                        className="link-underline text-xs text-muted transition-colors hover:text-accent-cyan"
                      >
                        {sv ? "Har du en inbjudningskod?" : "Have an invite code?"}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted/70">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-green/80" />
                {sv ? "Ingen spam" : "No spam"}
              </span>
              <span className="text-muted/45">·</span>
              <span>{sv ? "Ingen betalning krävs" : "No payment needed"}</span>
              <span className="text-muted/45">·</span>
              <span>{sv ? "Avregistrera när som helst" : "Unsubscribe anytime"}</span>
            </p>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-9 max-w-lg overflow-hidden rounded-3xl border border-white/[0.1] bg-[#07070e]/90 text-left shadow-[0_0_90px_-24px_rgba(124,92,255,0.7)]"
          >
            <div className="relative border-b border-white/[0.06] px-6 py-6 text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.18),transparent_70%)]"
              />
              <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent-green/40 bg-accent-green/10">
                <span aria-hidden className="absolute inset-0 rounded-full border border-accent-green/30 logo-pulse-ring" />
                <Check className="h-7 w-7 text-accent-green" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {sv ? "Du är med!" : "You're in!"}
              </h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                {sv
                  ? "Vi har lagt till dig på väntelistan och mejlar dig när det är din tur."
                  : "We added you to the waitlist and will email you when it's your turn."}
              </p>
            </div>

            <WaitlistStatus email={form.email} sv={sv} refParam="ref" />

            <div className="px-6 pb-6 pt-1">
              <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-cyan/80">
                      <Lock className="h-3 w-3" />
                      {sv ? "Din early-access-kod" : "Your early-access code"}
                    </p>
                    <p className="truncate font-mono text-lg font-semibold tracking-wide text-white">
                      {DISCOUNT_CODE}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copy(DISCOUNT_CODE, () => setCopied((c) => !c))}
                    className="press inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white transition-colors hover:border-accent-cyan/40 hover:bg-accent-cyan/10"
                    aria-label={sv ? "Kopiera koden" : "Copy the code"}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-accent-green" />
                        {sv ? "Kopierad" : "Copied"}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        {sv ? "Kopiera" : "Copy"}
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  {sv
                    ? "10 % rabatt låses vid lansering och gäller founding members. Koden är knuten till din e-post."
                    : "10% is locked for launch and applies to founding members. The code is tied to your email."}
                </p>
              </div>

              <ol className="mt-5 space-y-3">
                {nextSteps.map(([title, desc], i) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] font-mono text-[11px] text-accent-cyan">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">{title}</span>
                      <span className="block text-[12px] leading-relaxed text-muted">{desc}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void share()}
                  className="press inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:border-accent-cyan/40 hover:bg-accent-cyan/10"
                >
                  {shared ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Share2 className="h-3.5 w-3.5" />}
                  {shared
                    ? sv
                      ? "Länk kopierad"
                      : "Link copied"
                    : sv
                      ? "Bjud in en kollega"
                      : "Invite a colleague"}
                </button>
                <a
                  href="#playground"
                  className="press inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
                >
                  {sv ? "Prova Playground nu" : "Try the Playground now"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
