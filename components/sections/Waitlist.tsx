"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Mail,
  ArrowRight,
  Check,
  Sparkles,
  Users,
  Clock,
  Crown,
  Zap,
  Building2,
  User,
  Briefcase,
  AlertTriangle,
  Tag,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Magnetic from "@/components/ui/Magnetic";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser, getWaitlistCount } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";

const industries = [
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
const employeeRanges = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const interests = [
  "Automation",
  "Data Analysis",
  "Customer Support",
  "Marketing Content",
  "Document Generation",
  "Workflow Optimization",
  "Problem Solving",
  "Other",
];

const initialForm = {
  name: "",
  email: "",
  company: "",
  industry: "",
  employees: "",
  interest: "",
};

export default function Waitlist() {
  const { t, lang } = useLang();
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Real count from Supabase (or mock). No fake inflation.
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
      await addWaitlistUser({
        name: form.name,
        email: form.email,
        interest: form.interest,
        account_type: accountType,
        company: accountType === "company" ? form.company : null,
        industry: accountType === "company" ? form.industry : null,
        employees: accountType === "company" ? form.employees : null,
        discount_code: "BUDAI-EARLY-10",
        notes: null,
        source: "landing",
      });
      setSubmitted(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
    } catch (err: unknown) {
      console.error("Waitlist submit error:", err);
      const anyErr = err as { message?: string; error_description?: string; details?: string };
      const detail = anyErr?.message || anyErr?.error_description || anyErr?.details;
      setErrorDetail(typeof detail === "string" ? detail : null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none input-premium text-sm";

  return (
    <section id="waitlist" className="relative py-28 md:py-32 overflow-hidden">
      <Confetti active={confetti} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-purple/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="section-badge text-accent-purple">{t.waitlist.badge}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-accent-green/10 text-accent-green border border-accent-green/25">
              <Crown className="w-3 h-3" />
              {t.waitlist.discountBadge}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            {t.waitlist.title}{" "}
            <span className="text-gradient">{t.waitlist.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{t.waitlist.subtitle}</p>
          <p className="mt-3 text-sm text-accent-cyan/80 max-w-xl mx-auto">
            {t.waitlist.discountHint}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative p-7 md:p-12 rounded-3xl glass-strong panel-premium overflow-hidden border border-white/[0.08] shadow-[0_0_100px_rgba(185,103,255,0.08)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-accent-green/10 to-accent-cyan/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent" />

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative z-10"
                >
                  <LayoutGroup id="account-type">
                    <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
                      {(["individual", "company"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAccountType(opt)}
                          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            accountType === opt
                              ? "text-white"
                              : "text-muted hover:text-white transition-colors"
                          }`}
                        >
                          {accountType === opt && (
                            <motion.span
                              layoutId="account-type-pill"
                              transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.7 }}
                              className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple"
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

                    <motion.form
                      layout
                      onSubmit={handleSubmit}
                      className="space-y-4 mb-8"
                      transition={{ layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
                    >
                      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
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
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
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
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="relative"
                              >
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
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
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="relative"
                              >
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                <select
                                  value={form.industry}
                                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                  required={accountType === "company"}
                                  className={`${inputClass} appearance-none`}
                                >
                                  <option value="" disabled className="bg-surface">
                                    {t.waitlist.industryPlaceholder}
                                  </option>
                                  {industries.map((i) => (
                                    <option key={i} value={i} className="bg-surface">
                                      {i}
                                    </option>
                                  ))}
                                </select>
                              </motion.div>
                              <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="relative md:col-span-2"
                              >
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                <select
                                  value={form.employees}
                                  onChange={(e) => setForm({ ...form, employees: e.target.value })}
                                  required={accountType === "company"}
                                  className={`${inputClass} appearance-none`}
                                >
                                  <option value="" disabled className="bg-surface">
                                    {t.waitlist.employeesPlaceholder}
                                  </option>
                                  {employeeRanges.map((e) => (
                                    <option key={e} value={e} className="bg-surface">
                                      {e}
                                    </option>
                                  ))}
                                </select>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>

                        <motion.div
                          layout
                          className={`relative ${accountType === "individual" ? "md:col-span-2" : ""}`}
                        >
                          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                          <select
                            value={form.interest}
                            onChange={(e) => setForm({ ...form, interest: e.target.value })}
                            required
                            className={`${inputClass} appearance-none`}
                          >
                            <option value="" disabled className="bg-surface">
                              {t.waitlist.interestPlaceholder}
                            </option>
                            {interests.map((i) => (
                              <option key={i} value={i} className="bg-surface">
                                {i}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      </motion.div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/[0.07] border border-red-500/20">
                              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-red-300">{t.waitlist.errorMsg}</p>
                                {errorDetail && (
                                  <p className="text-red-400/50 text-xs mt-1 font-mono">{errorDetail}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Magnetic strength={0.15} className="block w-full md:inline-block md:w-auto">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary w-full md:w-auto !px-8 !py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              {lang === "sv" ? "Skickar…" : "Submitting…"}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {t.waitlist.submit} <ArrowRight className="w-5 h-5" />
                            </span>
                          )}
                        </button>
                      </Magnetic>
                    </motion.form>
                  </LayoutGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        icon: Users,
                        label: t.waitlist.statWaiting,
                        value: count === null ? "—" : `${count}+`,
                        color: "text-accent-cyan",
                      },
                      {
                        icon: Crown,
                        label: t.waitlist.statSpots,
                        value: "500",
                        color: "text-accent-purple",
                      },
                      {
                        icon: Clock,
                        label: t.waitlist.statLaunch,
                        value: "Q2 2026",
                        color: "text-accent-green",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white tabular-nums">{s.value}</div>
                          <div className="text-xs text-muted">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted/50">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-accent-green" /> {t.waitlist.discountBadge}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-accent-cyan" /> {t.waitlist.prioritySupport}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-accent-purple" /> {t.waitlist.exclusiveFeatures}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Crown className="w-3 h-3 text-accent-green" /> {t.waitlist.foundingStatus}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(0,255,157,0.35)]"
                  >
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="text-3xl font-bold mb-3 text-white"
                  >
                    {t.waitlist.successTitle}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="text-muted mb-2"
                  >
                    {t.waitlist.successPre}{" "}
                    <span className="text-accent-cyan font-medium">{form.email}</span>{" "}
                    {t.waitlist.successPost}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    className="text-sm text-muted/50"
                  >
                    {t.waitlist.successNote}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.4 }}
                    className="mt-6 flex flex-col items-center gap-3"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-green border border-accent-green/20">
                      <Crown className="w-4 h-4" />
                      {t.waitlist.foundingActive}
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
                        {t.waitlist.discountCodeLabel}
                      </div>
                      <div className="font-mono text-sm text-accent-cyan tracking-wide">
                        BUDAI-EARLY-10
                      </div>
                      <div className="text-[11px] text-muted mt-1">10% · early access</div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
