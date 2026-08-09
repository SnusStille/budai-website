"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Mail, ArrowRight, Check, Sparkles, Users, Clock, Crown, Zap, Building2, User, Briefcase, AlertTriangle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import MarkerUnderline from "@/components/ui/MarkerUnderline";
import Magnetic from "@/components/ui/Magnetic";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";

const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Media", "Energy", "Logistics", "Construction", "Other"];
const employeeRanges = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const interests = ["Automation", "Data Analysis", "Customer Support", "Marketing Content", "Document Generation", "Workflow Optimization", "Problem Solving", "Other"];

const initialForm = { name: "", email: "", company: "", industry: "", employees: "", interest: "" };

export default function Waitlist() {
  const { t, lang } = useLang();
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [count, setCount] = useState(127);
  const [error, setError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3)), 8000);
    return () => clearInterval(interval);
  }, []);

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
        // Company-only fields simply don't exist for an individual signup —
        // sent as null rather than forced/fake values.
        company: accountType === "company" ? form.company : null,
        industry: accountType === "company" ? form.industry : null,
        employees: accountType === "company" ? form.employees : null,
      });
      setSubmitted(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
    } catch (err: any) {
      // Previously an unhandled rejection here (e.g. a Supabase RLS/network
      // error) left the button stuck on its loading spinner forever with no
      // feedback. The most common real cause: the live Supabase table's
      // columns don't match what the app sends (e.g. missing "account_type",
      // or "company"/"industry"/"employees" still set NOT NULL) — that
      // happens if supabase/schema.sql hasn't been (re-)run against the
      // actual project yet. Surface Supabase's own message when we have one
      // so that's diagnosable from the browser console without guessing.
      console.error("Waitlist submit error:", err);
      const detail = err?.message || err?.error_description || err?.details;
      setErrorDetail(typeof detail === "string" ? detail : null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="relative py-32 overflow-hidden">
      <Confetti active={confetti} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-purple/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4">{t.waitlist.badge}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            {t.waitlist.title} <span className="relative inline-block">{t.waitlist.titleHighlight}<MarkerUnderline color="#b967ff" /></span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{t.waitlist.subtitle}</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative p-8 md:p-12 rounded-3xl glass-strong overflow-hidden border border-white/[0.06]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/8 to-accent-purple/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-accent-green/8 to-accent-cyan/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="relative z-10">
                  {/* Individual / Company toggle — everyone starts as an individual signup,
                      the company-only fields only appear once that's explicitly chosen. */}
                  <LayoutGroup id="account-type">
                    <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
                      {(["individual", "company"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAccountType(opt)}
                          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            accountType === opt ? "text-white" : "text-muted hover:text-white transition-colors"
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
                            {opt === "individual" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            {opt === "individual" ? t.waitlist.individualTab : t.waitlist.companyTab}
                          </span>
                        </button>
                      ))}
                    </div>

                    <motion.form layout onSubmit={handleSubmit} className="space-y-4 mb-8" transition={{ layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}>
                      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.waitlist.namePlaceholder} required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm" />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t.waitlist.emailPlaceholder} required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm" />
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
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder={t.waitlist.companyPlaceholder} required={accountType === "company"} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm" />
                              </motion.div>
                              <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="relative"
                              >
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required={accountType === "company"} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm appearance-none">
                                  <option value="" disabled className="bg-surface">{t.waitlist.industryPlaceholder}</option>
                                  {industries.map((i) => <option key={i} value={i} className="bg-surface">{i}</option>)}
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
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <select value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} required={accountType === "company"} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm appearance-none">
                                  <option value="" disabled className="bg-surface">{t.waitlist.employeesPlaceholder}</option>
                                  {employeeRanges.map((e) => <option key={e} value={e} className="bg-surface">{e}</option>)}
                                </select>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>

                        <motion.div layout className={`relative ${accountType === "individual" ? "md:col-span-2" : ""}`}>
                          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm appearance-none">
                            <option value="" disabled className="bg-surface">{t.waitlist.interestPlaceholder}</option>
                            {interests.map((i) => <option key={i} value={i} className="bg-surface">{i}</option>)}
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
                                {errorDetail && <p className="text-red-400/50 text-xs mt-1 font-mono">{errorDetail}</p>}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Magnetic strength={0.15} className="block w-full md:inline-block md:w-auto">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                          {loading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                          ) : (
                            <>{t.waitlist.submit} <ArrowRight className="w-5 h-5" /></>
                          )}
                        </button>
                      </Magnetic>
                    </motion.form>
                  </LayoutGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Users, label: t.waitlist.statWaiting, value: `${count}+`, color: "text-accent-cyan" },
                      { icon: Crown, label: t.waitlist.statSpots, value: "500", color: "text-accent-purple" },
                      { icon: Clock, label: t.waitlist.statLaunch, value: "Q2 2026", color: "text-accent-green" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">{s.value}</div>
                          <div className="text-xs text-muted">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted/50">
                    <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-accent-cyan" /> {t.waitlist.prioritySupport}</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-accent-purple" /> {t.waitlist.exclusiveFeatures}</span>
                    <span className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-accent-green" /> {t.waitlist.foundingStatus}</span>
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
                    {t.waitlist.successPre} <span className="text-accent-cyan font-medium">{form.email}</span> {t.waitlist.successPost}
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
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-green"
                  >
                    <Crown className="w-4 h-4" />
                    {t.waitlist.foundingActive}
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
