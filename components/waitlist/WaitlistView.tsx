"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  Check,
  Sparkles,
  Users,
  Crown,
  Zap,
  Building2,
  User,
  Briefcase,
  AlertTriangle,
  Tag,
  Copy,
  Shield,
  Gift,
} from "lucide-react";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import CookieConsent from "@/components/ui/CookieConsent";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser, getWaitlistCount } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";

const industriesEn = [
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
const industriesSv = [
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
const employeeRanges = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const interestsEn = [
  "Automation",
  "Data analysis",
  "Customer support",
  "Marketing content",
  "Document generation",
  "Workflow optimization",
  "Problem solving",
  "Other",
];
const interestsSv = [
  "Automatisering",
  "Dataanalys",
  "Kundsupport",
  "Marknadsinnehåll",
  "Dokumentgenerering",
  "Arbetsflöden",
  "Problemlösning",
  "Annat",
];

const initialForm = {
  name: "",
  email: "",
  company: "",
  industry: "",
  employees: "",
  interest: "",
};

export default function WaitlistView() {
  const { t, lang } = useLang();
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState("");

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("ref");
      if (q) {
        setReferral(q.slice(0, 64));
        return;
      }
      const stored = sessionStorage.getItem("budai-ref");
      if (stored) setReferral(stored.slice(0, 64));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getWaitlistCount()
      .then((n) => {
        if (!cancelled) setCount(n);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes("@")) return;
    setLoading(true);
    setError(false);
    setErrorDetail(null);
    try {
      const refNote = referral.trim() ? `referral:${referral.trim().slice(0, 64)}` : null;
      await addWaitlistUser({
        name: form.name,
        email: form.email,
        interest: form.interest,
        account_type: accountType,
        company: accountType === "company" ? form.company : null,
        industry: accountType === "company" ? form.industry : null,
        employees: accountType === "company" ? form.employees : null,
        discount_code: "BUDAI-EARLY-10",
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
      const anyErr = err as { message?: string };
      const msg = (anyErr?.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already")) {
        setErrorDetail(
          lang === "sv"
            ? "Den e-postadressen finns redan på listan."
            : "That email is already on the waitlist."
        );
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setErrorDetail(
          lang === "sv"
            ? "Nätverksfel — kontrollera anslutningen och försök igen."
            : "Network error — check your connection and try again."
        );
      } else {
        setErrorDetail(
          lang === "sv"
            ? "Kunde inte spara just nu. Försök igen om en stund."
            : "Could not save right now. Please try again in a moment."
        );
      }
      setError(true);
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

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-white/35 focus:outline-none focus:border-accent-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] text-sm transition-shadow";

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-background text-white">
      <Confetti active={confetti} />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-[10%] left-[-10%] w-[50vw] max-w-[520px] h-[50vw] rounded-full bg-accent-cyan/[0.05] blur-[120px]" />
        <div className="absolute bottom-[0%] right-[-5%] w-[40vw] max-w-[420px] h-[40vw] rounded-full bg-violet-500/[0.06] blur-[110px]" />
      </div>
      <SiteNav />

      <main className="relative z-10 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] text-white/50 mb-4">
                  <span className="px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03]">
                    {t.waitlist.badge}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.04em] text-white leading-[1.12]">
                  {t.waitlist.title}
                </h1>
                <p className="mt-4 text-[15px] text-white/50 leading-relaxed">{t.waitlist.subtitle}</p>
              </div>

              <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-6 overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />
                <div className="flex items-center gap-2 text-accent-cyan mb-2">
                  <Gift className="w-4 h-4" />
                  <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Founding
                  </span>
                </div>
                <div className="text-[3.25rem] sm:text-6xl font-bold tracking-[-0.04em] text-white leading-none">
                  10%
                </div>
                <div className="mt-2 text-sm font-medium text-white/75 tracking-[0.12em] uppercase">
                  {lang === "sv" ? "Rabatt vid lansering" : "Off at launch"}
                </div>
                <p className="mt-3 text-[13px] text-white/45 leading-relaxed">{t.waitlist.offerBody}</p>
                <button
                  type="button"
                  onClick={copyCode}
                  className="mt-5 w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-black/30 border border-white/[0.08] hover:border-white/16 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-white/35">
                      {t.waitlist.discountCodeLabel}
                    </div>
                    <div className="font-mono text-sm text-accent-cyan tracking-wide">BUDAI-EARLY-10</div>
                  </div>
                  {copied ? (
                    <Check className="w-4 h-4 text-accent-green" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/40" />
                  )}
                </button>
              </div>

              <ul className="space-y-2.5">
                {[
                  {
                    icon: Zap,
                    title: t.waitlist.prioritySupport,
                    body:
                      lang === "sv"
                        ? "Direktlinje till teamet under preview."
                        : "Direct line to the team during preview.",
                  },
                  {
                    icon: Sparkles,
                    title: t.waitlist.exclusiveFeatures,
                    body:
                      lang === "sv"
                        ? "Tidig tillgång till nya förmågor."
                        : "Early access to new capabilities.",
                  },
                  {
                    icon: Shield,
                    title: lang === "sv" ? "Nordic-first" : "Nordic-first",
                    body:
                      lang === "sv"
                        ? "GDPR-tänk och svensk supportton."
                        : "GDPR-minded with Swedish support tone.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3 p-3 rounded-xl border border-white/[0.06]">
                    <item.icon className="w-4 h-4 text-accent-cyan mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-xs text-white/40 mt-0.5">{item.body}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 text-center">
                <div className="flex-1 rounded-xl border border-white/[0.06] p-3">
                  <Users className="w-3.5 h-3.5 text-white/35 mx-auto mb-1" />
                  <div className="text-sm font-semibold tabular-nums">{count === null ? "—" : count}</div>
                  <div className="text-[10px] text-white/35">{t.waitlist.statWaiting}</div>
                </div>
                <div className="flex-1 rounded-xl border border-white/[0.06] p-3">
                  <Crown className="w-3.5 h-3.5 text-white/35 mx-auto mb-1" />
                  <div className="text-sm font-semibold">{lang === "sv" ? "Vågor" : "Waves"}</div>
                  <div className="text-[10px] text-white/35">{t.waitlist.statSpots}</div>
                </div>
                <div className="flex-1 rounded-xl border border-white/[0.06] p-3">
                  <div className="text-sm font-semibold mt-0.5 mb-1.5">2026</div>
                  <div className="text-[10px] text-white/35">{t.waitlist.statLaunch}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-white/[0.1] bg-[#0c0c12]/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-[12px] text-white/40 mb-5 leading-relaxed">
                        {lang === "sv"
                          ? "Prissättning meddelas före full lansering. Early access låser 10 % (BUDAI-EARLY-10)."
                          : "Pricing will be announced before full launch. Early access locks 10% (BUDAI-EARLY-10)."}
                      </p>
                      <LayoutGroup id="account-type">
                        <div className="inline-flex p-1 rounded-full bg-black/30 border border-white/[0.07] mb-6">
                          {(["individual", "company"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAccountType(opt)}
                              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                                accountType === opt ? "text-zinc-950" : "text-white/45 hover:text-white"
                              }`}
                            >
                              {accountType === opt && (
                                <motion.span
                                  layoutId="account-type-pill"
                                  className="absolute inset-0 rounded-full bg-white"
                                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                />
                              )}
                              <span className="relative flex items-center gap-2">
                                {opt === "individual" ? (
                                  <User className="w-4 h-4" />
                                ) : (
                                  <Building2 className="w-4 h-4" />
                                )}
                                {opt === "individual"
                                  ? t.waitlist.individualTab
                                  : t.waitlist.companyTab}
                              </span>
                            </button>
                          ))}
                        </div>

                        <motion.form layout onSubmit={handleSubmit} className="space-y-3.5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
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
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                              <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder={t.waitlist.emailPlaceholder}
                                required
                                autoComplete="email"
                                className={inputClass}
                              />
                            </div>

                            <AnimatePresence initial={false}>
                              {accountType === "company" && (
                                <>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative"
                                  >
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    <input
                                      type="text"
                                      value={form.company}
                                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                                      placeholder={t.waitlist.companyPlaceholder}
                                      required={accountType === "company"}
                                      autoComplete="organization"
                                      className={inputClass}
                                    />
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative"
                                  >
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    <select
                                      value={form.industry}
                                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                      required={accountType === "company"}
                                      className={`${inputClass} appearance-none`}
                                    >
                                      <option value="" disabled>
                                        {t.waitlist.industryPlaceholder}
                                      </option>
                                      {(lang === "sv" ? industriesSv : industriesEn).map((ind) => (
                                        <option key={ind} value={ind}>
                                          {ind}
                                        </option>
                                      ))}
                                    </select>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative md:col-span-2"
                                  >
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    <select
                                      value={form.employees}
                                      onChange={(e) => setForm({ ...form, employees: e.target.value })}
                                      required={accountType === "company"}
                                      className={`${inputClass} appearance-none`}
                                    >
                                      <option value="" disabled>
                                        {t.waitlist.employeesPlaceholder}
                                      </option>
                                      {employeeRanges.map((e) => (
                                        <option key={e} value={e}>
                                          {e}
                                        </option>
                                      ))}
                                    </select>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>

                            <div
                              className={`relative ${accountType === "individual" ? "md:col-span-2" : ""}`}
                            >
                              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                              <select
                                value={form.interest}
                                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                                required
                                className={`${inputClass} appearance-none`}
                              >
                                <option value="" disabled>
                                  {t.waitlist.interestPlaceholder}
                                </option>
                                {(lang === "sv" ? interestsSv : interestsEn).map((i) => (
                                  <option key={i} value={i}>
                                    {i}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="relative md:col-span-2">
                              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                              <input
                                type="text"
                                value={referral}
                                onChange={(e) => setReferral(e.target.value)}
                                placeholder={t.waitlist.referralPlaceholder}
                                className={inputClass}
                                maxLength={64}
                              />
                            </div>
                          </div>

                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/[0.07] border border-red-500/20"
                              >
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm text-red-300">{t.waitlist.errorMsg}</p>
                                  {errorDetail && (
                                    <p className="text-red-400/70 text-xs mt-1">{errorDetail}</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                            <button
                              type="submit"
                              disabled={loading}
                              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              {loading ? (
                                lang === "sv" ? "Skickar…" : "Submitting…"
                              ) : (
                                <>
                                  {t.waitlist.submit}
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                            <p className="text-[11px] text-white/35 leading-relaxed max-w-xs">
                              {t.waitlist.discountHint}
                            </p>
                          </div>
                        </motion.form>
                      </LayoutGroup>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8" strokeWidth={2.5} />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t.waitlist.successTitle}</h2>
                      <p className="text-white/50 mb-2">
                        {t.waitlist.successPre}{" "}
                        <span className="text-white font-medium">{form.email}</span>{" "}
                        {t.waitlist.successPost}
                      </p>
                      <p className="text-sm text-white/35 mb-8">{t.waitlist.successNote}</p>
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/12 text-sm text-white/80">
                          <Crown className="w-4 h-4 text-accent-cyan" />
                          {t.waitlist.foundingActive}
                        </div>
                        <button
                          type="button"
                          onClick={copyCode}
                          className="px-5 py-3 rounded-2xl border border-white/12 hover:border-white/25 transition-colors"
                        >
                          <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1">
                            {t.waitlist.discountCodeLabel}
                          </div>
                          <div className="font-mono text-sm text-accent-cyan tracking-wide flex items-center gap-2 justify-center">
                            BUDAI-EARLY-10
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                          </div>
                        </button>
                        <Link
                          href="/playground"
                          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100"
                        >
                          {lang === "sv" ? "Testa BudAI" : "Try BudAI"}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
