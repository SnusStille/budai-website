"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Check, Sparkles, Users, Clock, Crown, Zap, Building2, User, Briefcase } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import MarkerUnderline from "@/components/ui/MarkerUnderline";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser } from "@/lib/data";

const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Media", "Energy", "Logistics", "Construction", "Other"];
const employeeRanges = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const interests = ["Automation", "Data Analysis", "Customer Support", "Marketing Content", "Document Generation", "Workflow Optimization", "Problem Solving", "Other"];

const initialForm = { name: "", email: "", company: "", industry: "", employees: "", interest: "" };

export default function Waitlist() {
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
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4">Exclusive Access</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white">
            Join the <span className="relative inline-block">Founding Members<MarkerUnderline color="#b967ff" /></span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Be among the first — companies and individuals alike — to experience BudAI. Early adopters receive lifetime priority support, exclusive features, and founding member status.
          </p>
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
                  <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
                    {(["individual", "company"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAccountType(opt)}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          accountType === opt ? "text-white" : "text-muted hover:text-white"
                        }`}
                      >
                        {accountType === opt && (
                          <motion.span
                            layoutId="account-type-pill"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple"
                          />
                        )}
                        <span className="relative flex items-center gap-2">
                          {opt === "individual" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                          {opt === "individual" ? "Individual" : "Company"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm" />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm" />
                      </div>

                      <AnimatePresence>
                        {accountType === "company" && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="relative overflow-hidden"
                            >
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" required={accountType === "company"} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm" />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="relative overflow-hidden"
                            >
                              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                              <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required={accountType === "company"} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm appearance-none">
                                <option value="" disabled className="bg-surface">Select industry</option>
                                {industries.map((i) => <option key={i} value={i} className="bg-surface">{i}</option>)}
                              </select>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="relative overflow-hidden md:col-span-2"
                            >
                              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                              <select value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} required={accountType === "company"} className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm appearance-none">
                                <option value="" disabled className="bg-surface">Number of employees</option>
                                {employeeRanges.map((e) => <option key={e} value={e} className="bg-surface">{e}</option>)}
                              </select>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>

                      <div className={`relative ${accountType === "individual" ? "md:col-span-2" : ""}`}>
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} required className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-sm appearance-none">
                          <option value="" disabled className="bg-surface">What do you need AI for?</option>
                          {interests.map((i) => <option key={i} value={i} className="bg-surface">{i}</option>)}
                        </select>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-400">
                        Something went wrong on our end — please try again in a moment.
                        {errorDetail && <span className="block text-red-400/60 text-xs mt-1 font-mono">{errorDetail}</span>}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <>Request Access <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Users, label: "On the Waitlist", value: `${count}+`, color: "text-accent-cyan" },
                      { icon: Crown, label: "Founding Spots", value: "500", color: "text-accent-purple" },
                      { icon: Clock, label: "Expected Launch", value: "Q2 2026", color: "text-accent-green" },
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
                    <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-accent-cyan" /> Priority Support</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-accent-purple" /> Exclusive Features</span>
                    <span className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-accent-green" /> Founding Status</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,255,157,0.3)]"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-3">Welcome to the future.</h3>
                  <p className="text-muted mb-2">We have added <span className="text-accent-cyan font-medium">{form.email}</span> to the waitlist.</p>
                  <p className="text-sm text-muted/50">You will be among the first to experience BudAI. We will be in touch soon.</p>
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-green">
                    <Crown className="w-4 h-4" />
                    Founding Member Status: ACTIVE
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
