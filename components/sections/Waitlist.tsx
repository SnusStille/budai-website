"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Briefcase,
  Building2,
  Check,
  Copy,
  Crown,
  Link2,
  Mail,
  Sparkles,
  Tag,
  User,
  Users,
  Zap,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Magnetic from "@/components/ui/Magnetic";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser, getWaitlistCount, isWaitlistBackendReady } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";

const INDUSTRIES_EN = [
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Manufacturing",
  "Education",
  "Media",
  "Energy",
  "Logistics",
  "Construction",
  "Other",
];
const INDUSTRIES_SV = [
  "Teknik",
  "Finans",
  "Vård & hälsa",
  "Detaljhandel",
  "Tillverkning",
  "Utbildning",
  "Media",
  "Energi",
  "Logistik",
  "Bygg",
  "Annat",
];
const EMPLOYEE_RANGES = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const INTERESTS_EN = [
  "Automation",
  "Data analysis",
  "Customer support",
  "Marketing content",
  "Document generation",
  "Workflow optimization",
  "Problem solving",
  "Other",
];
const INTERESTS_SV = [
  "Automatisering",
  "Dataanalys",
  "Kundsupport",
  "Marknadsinnehåll",
  "Dokumentgenerering",
  "Arbetsflöden",
  "Problemlösning",
  "Annat",
];

const DISCOUNT_CODE = "BUDAI-EARLY-10";

const initialForm = {
  name: "",
  email: "",
  company: "",
  industry: "",
  employees: "",
  interest: "",
};

/**
 * Waitlist — the one conversion on the page.
 *
 * Layout: value and process on the left, the form on the right (stacked on
 * mobile). Writes to the existing Supabase `waitlist_users` table with the
 * same payload as before — nothing about the backend changed.
 */
export default function Waitlist() {
  const { t, lang } = useLang();
  const sv = lang === "sv";

  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [referral, setReferral] = useState("");
  const [showReferral, setShowReferral] = useState(false);

  /* Referral from ?ref= — kept, it is stored with the signup */
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("ref");
      if (q) {
        setReferral(q.slice(0, 64));
        setShowReferral(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* Real counter — only fetched when the waitlist is backed by Supabase */
  useEffect(() => {
    if (!isWaitlistBackendReady()) {
      setCount(null);
      return;
    }
    let cancelled = false;
    getWaitlistCount()
      .then((n) => {
        if (!cancelled) setCount(typeof n === "number" ? n : null);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [submitted]);

  const emailLooksValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLooksValid(form.email)) {
      setError(true);
      setErrorDetail(t.waitlist.emailInvalid);
      return;
    }
    setLoading(true);
    setError(false);
    setErrorDetail(null);
    try {
      const refNote = referral.trim() ? `referral:${referral.trim().slice(0, 64)}` : null;
      await addWaitlistUser({
        name: form.name.trim(),
        email: form.email.trim(),
        // `interest` is required by the schema — fall back to the honest "Other"
        interest: form.interest || (sv ? "Annat" : "Other"),
        account_type: accountType,
        company: accountType === "company" ? form.company.trim() || null : null,
        industry: accountType === "company" ? form.industry || null : null,
        employees: accountType === "company" ? form.employees || null : null,
        discount_code: DISCOUNT_CODE,
        notes: refNote,
        source: referral.trim() ? "referral" : "landing",
        priority: accountType === "company" ? 60 : 45,
        last_contacted_at: null,
        tags: accountType === "company" ? ["company"] : ["individual"],
      });
      setSubmitted(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
    } catch (err: unknown) {
      console.error("Waitlist submit error:", err);
      const anyErr = err as { message?: string; code?: string; status?: number };
      const msg = (anyErr?.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already")) {
        setErrorDetail(
          sv ? "Den e-postadressen finns redan på listan." : "That email is already on the waitlist."
        );
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setErrorDetail(
          sv
            ? "Nätverksfel — kontrollera anslutningen och försök igen."
            : "Network error — check your connection and try again."
        );
      } else {
        setErrorDetail(
          sv ? "Kunde inte spara just nu. Försök igen om en stund." : "Could not save right now. Please try again in a moment."
        );
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const inviteLink = () => {
    const slug = form.email.split("@")[0]?.replace(/[^a-z0-9._-]/gi, "").slice(0, 24) || "budai";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://stilledev.se";
    return `${origin}/?ref=${slug}`;
  };

  const copy = async (what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(what === "code" ? DISCOUNT_CODE : inviteLink());
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const inputClass = "field pl-11";
  const selectClass = `${inputClass} appearance-none pr-9`;

  const interests = sv ? INTERESTS_SV : INTERESTS_EN;

  const steps = [
    { n: "01", title: t.waitlist.step1Title, body: t.waitlist.step1Body },
    { n: "02", title: t.waitlist.step2Title, body: t.waitlist.step2Body },
    { n: "03", title: t.waitlist.step3Title, body: t.waitlist.step3Body },
  ];

  const benefits = [
    { icon: Tag, title: t.waitlist.benefit1Title, body: t.waitlist.benefit1Body, color: "text-accent-green" },
    { icon: Zap, title: t.waitlist.benefit2Title, body: t.waitlist.benefit2Body, color: "text-accent-cyan" },
    { icon: Sparkles, title: t.waitlist.benefit3Title, body: t.waitlist.benefit3Body, color: "text-accent-purple" },
  ];

  return (
    <section id="waitlist" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-24 md:py-32">
      <Confetti active={confetti} />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora opacity-45" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-shell px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* ── Left: the pitch ─────────────────────────────────── */}
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="eyebrow">
                <span className="fig !border-transparent !bg-transparent !px-0">04</span>
                {t.waitlist.badge}
              </p>
              <h2 className="t-h1 t-balance mt-5 text-white">
                {t.waitlist.title} <span className="text-gradient">{t.waitlist.titleHighlight}</span>
              </h2>
              <p className="t-lead mt-5 max-w-lg">{t.waitlist.subtitle}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="chip !border-accent-green/25 !bg-accent-green/[0.07] !text-accent-green/90">
                  <Tag className="h-3 w-3" />
                  {t.waitlist.discountBadge}
                </span>
                {count !== null && count > 0 && (
                  <span className="chip">
                    <Users className="h-3.5 w-3.5 text-accent-cyan" />
                    <span className="font-semibold tabular-nums text-white/90">{count}</span>
                    {t.waitlist.statWaiting}
                  </span>
                )}
              </div>
            </ScrollReveal>

            {/* How it works */}
            <ScrollReveal className="mt-12">
              <p className="eyebrow mb-6">{t.waitlist.stepsTitle}</p>
              <ol className="relative space-y-7">
                {steps.map((s, i) => (
                  <li key={s.n} className="relative flex gap-4">
                    <span className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-background font-mono text-[10.5px] text-white/70">
                      {s.n}
                    </span>
                    <div className="pt-0.5">
                      <h3 className="text-[14.5px] font-semibold tracking-tight text-white">{s.title}</h3>
                      <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted">{s.body}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[15px] top-9 h-[calc(100%-4px)] w-px bg-gradient-to-b from-white/12 to-transparent"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            {/* Benefits */}
            <ScrollReveal className="mt-12 grid gap-px overflow-hidden rounded-[var(--r-md)] border border-white/[0.07] bg-white/[0.05] sm:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="bg-background/85 p-4">
                  <b.icon className={`h-4 w-4 ${b.color}`} />
                  <div className="mt-3 text-[13px] font-semibold text-white">{b.title}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{b.body}</p>
                </div>
              ))}
            </ScrollReveal>
          </div>

          {/* ── Right: the form ─────────────────────────────────── */}
          <div className="lg:col-span-7">
            <ScrollReveal>
              <div className="card relative overflow-hidden p-5 sm:p-7 md:p-8">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent"
                />

                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="t-h4 text-white">{t.waitlist.formTitle}</h3>
                    <p className="mt-1 text-[12.5px] text-muted/75">{t.waitlist.formNote}</p>
                  </div>
                  <span className="preview-tag hidden sm:inline-flex">{t.nav.preview}</span>
                </div>

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <LayoutGroup id="account-type">
                        <div className="mb-6 inline-flex rounded-[var(--r-sm)] border border-white/[0.08] bg-black/25 p-1">
                          {(["individual", "company"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAccountType(opt)}
                              className={`relative flex items-center gap-2 rounded-[7px] px-4 py-2 text-[13px] font-medium transition-colors ${
                                accountType === opt ? "text-[#04121a]" : "text-muted hover:text-white"
                              }`}
                            >
                              {accountType === opt && (
                                <motion.span
                                  layoutId="account-type-pill"
                                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.7 }}
                                  className="absolute inset-0 rounded-[7px] bg-gradient-to-r from-accent-cyan to-[#7dd3fc]"
                                />
                              )}
                              <span className="relative flex items-center gap-2">
                                {opt === "individual" ? <User className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                                {opt === "individual" ? t.waitlist.individualTab : t.waitlist.companyTab}
                              </span>
                            </button>
                          ))}
                        </div>

                        <motion.form layout onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="relative">
                              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                              <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder={t.waitlist.namePlaceholder}
                                required
                                autoComplete="name"
                                className={inputClass}
                              />
                            </div>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                              <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder={t.waitlist.emailPlaceholder}
                                required
                                autoComplete="email"
                                className={`${inputClass} ${error && errorDetail === t.waitlist.emailInvalid ? "field-error" : ""}`}
                              />
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {accountType === "company" && (
                              <motion.div
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <div className="relative sm:col-span-2">
                                    <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                    <input
                                      type="text"
                                      value={form.company}
                                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                                      placeholder={t.waitlist.companyPlaceholder}
                                      required={accountType === "company"}
                                      autoComplete="organization"
                                      className={inputClass}
                                    />
                                  </div>
                                  <div className="relative">
                                    <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                    <select
                                      value={form.industry}
                                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                      className={selectClass}
                                      aria-label={t.waitlist.industryPlaceholder}
                                    >
                                      <option value="">{t.waitlist.industryPlaceholder}</option>
                                      {(sv ? INDUSTRIES_SV : INDUSTRIES_EN).map((ind) => (
                                        <option key={ind} value={ind}>
                                          {ind}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="relative">
                                    <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                    <select
                                      value={form.employees}
                                      onChange={(e) => setForm({ ...form, employees: e.target.value })}
                                      className={selectClass}
                                      aria-label={t.waitlist.employeesPlaceholder}
                                    >
                                      <option value="">{t.waitlist.employeesPlaceholder}</option>
                                      {EMPLOYEE_RANGES.map((r) => (
                                        <option key={r} value={r}>
                                          {r}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Interest — one tap, optional, keeps signup data useful */}
                          <div>
                            <div className="mb-2 flex items-baseline gap-2">
                              <span className="text-[12.5px] font-medium text-white/80">{t.waitlist.interestLabel}</span>
                              <span className="text-[11px] text-muted/55">({t.waitlist.interestOptional})</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {interests.map((i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setForm({ ...form, interest: form.interest === i ? "" : i })}
                                  aria-pressed={form.interest === i}
                                  className={`chip !py-1.5 !text-[12px] ${form.interest === i ? "chip-active" : "chip-hover"}`}
                                >
                                  {i}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Referral — collapsed by default */}
                          <AnimatePresence initial={false}>
                            {showReferral ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="relative">
                                  <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                  <input
                                    type="text"
                                    value={referral}
                                    onChange={(e) => setReferral(e.target.value)}
                                    placeholder={t.waitlist.referralPlaceholder}
                                    className={inputClass}
                                    maxLength={64}
                                  />
                                </div>
                              </motion.div>
                            ) : (
                              <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                type="button"
                                onClick={() => setShowReferral(true)}
                                className="text-[12px] text-muted/70 underline decoration-white/15 underline-offset-4 transition-colors hover:text-accent-cyan"
                              >
                                {t.waitlist.referralToggle}
                              </motion.button>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, y: -6, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div
                                  role="alert"
                                  className="flex items-start gap-3 rounded-[var(--r-sm)] border border-red-500/25 bg-red-500/[0.07] px-4 py-3"
                                >
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                  <div>
                                    <p className="text-[13px] text-red-200">{errorDetail || t.waitlist.errorMsg}</p>
                                    {errorDetail && errorDetail !== t.waitlist.emailInvalid && (
                                      <p className="mt-0.5 text-[11.5px] text-red-300/70">{t.waitlist.errorMsg}</p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                            <Magnetic strength={0.12} className="block w-full sm:w-auto">
                              <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full !px-7 !py-3.5 text-[14.5px] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                              >
                                {loading ? (
                                  <span className="flex items-center gap-2">
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black/70" />
                                    {t.waitlist.submitting}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    {t.waitlist.submit} <ArrowRight className="h-4 w-4" />
                                  </span>
                                )}
                              </button>
                            </Magnetic>
                            <p className="max-w-xs text-[11.5px] leading-relaxed text-muted/60">{t.waitlist.trustLine}</p>
                          </div>
                        </motion.form>
                      </LayoutGroup>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="py-2"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -14 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.06 }}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-green to-accent-cyan shadow-[0_0_40px_rgba(0,255,157,0.28)]"
                        >
                          <Check className="h-6 w-6 text-[#04121a]" strokeWidth={3} />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-white sm:text-2xl">{t.waitlist.successTitle}</h3>
                          <p className="mt-1 text-[13.5px] text-muted">
                            {t.waitlist.successPre}{" "}
                            <span className="font-medium text-accent-cyan">{form.email}</span> {t.waitlist.successPost}
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 rounded-[var(--r-sm)] border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[12.5px] leading-relaxed text-muted">
                        {t.waitlist.successNote}
                      </p>

                      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => copy("code")}
                          className="group rounded-[var(--r-md)] border border-accent-cyan/25 bg-accent-cyan/[0.05] px-5 py-3.5 text-left transition-colors hover:border-accent-cyan/45"
                        >
                          <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{t.waitlist.discountCodeLabel}</div>
                          <div className="mt-1 flex items-center gap-2 font-mono text-[14px] tracking-wide text-accent-cyan">
                            {DISCOUNT_CODE}
                            {copied === "code" ? (
                              <Check className="h-3.5 w-3.5 text-accent-green" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => copy("link")}
                          className="group flex items-center justify-between gap-3 rounded-[var(--r-md)] border border-white/[0.09] px-5 py-3.5 text-left transition-colors hover:border-white/20"
                        >
                          <span className="text-[12.5px] text-muted">
                            {copied === "link"
                              ? sv
                                ? "Länk kopierad"
                                : "Link copied"
                              : sv
                                ? "Kopiera din inbjudningslänk"
                                : "Copy your invite link"}
                          </span>
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-muted transition-colors group-hover:text-white" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-accent-green/25 bg-accent-green/[0.08] px-3.5 py-1.5 text-[12px] text-accent-green">
                          <Crown className="h-3.5 w-3.5" />
                          {t.waitlist.foundingActive}
                        </span>
                        <span className="text-[11.5px] text-muted/55">{t.waitlist.shareHint}</span>
                      </div>

                      <a
                        href="#playground"
                        className="btn-ghost mt-6 w-full !py-3 text-[13.5px] sm:w-auto"
                      >
                        <ArrowUp className="h-3.5 w-3.5 text-accent-cyan" />
                        {t.waitlist.tryPlayground}
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>

            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-muted/55 sm:text-left">
              {t.waitlist.discountHint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
