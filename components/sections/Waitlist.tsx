"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Check, Sparkles, Users, Clock, Crown, Zap, Building2, User, Briefcase, AlertCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser } from "@/lib/data";
import { useLang } from "@/components/ui/LanguageContext";

const industries = [
  "Technology", "Finance", "Healthcare", "Retail", "Manufacturing",
  "Education", "Media", "Energy", "Logistics", "Construction", "Other"
];
const employeeRanges = ["1-10", "10-50", "50-200", "200-1000", "1000+"];
const interests = [
  "Automation", "Data Analysis", "Customer Support", "Marketing Content",
  "Document Generation", "Workflow Optimization", "Problem Solving", "Other"
];

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
}

export default function Waitlist() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    employees: "",
    interest: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [count, setCount] = useState(127);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3)), 8000);
    return () => clearInterval(interval);
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim() || form.name.length < 2) {
      newErrors.name = lang === "sv" ? "Namn krävs" : "Name is required";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = lang === "sv" ? "Ogiltig e-postadress" : "Invalid email address";
    }
    if (!form.company.trim()) {
      newErrors.company = lang === "sv" ? "Företag krävs" : "Company is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await addWaitlistUser(form);
      setSubmitted(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
    } catch (err) {
      console.error("Waitlist submit error:", err);
      setSubmitError(
        lang === "sv"
          ? "Något gick fel. Försök igen senare eller kontakta oss."
          : "Something went wrong. Please try again later or contact us."
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Users, label: lang === "sv" ? "Företag i kö" : "Companies Waiting", value: `${count}+`, color: "text-accent-cyan" },
    { icon: Crown, label: lang === "sv" ? "Grundarplatser" : "Founding Spots", value: "500", color: "text-accent-purple" },
    { icon: Clock, label: lang === "sv" ? "Förväntad lansering" : "Expected Launch", value: "Q2 2026", color: "text-accent-green" },
  ];

  const features = [
    lang === "sv" ? "Prioriterad support" : "Priority Support",
    lang === "sv" ? "Exklusiva funktioner" : "Exclusive Features",
    lang === "sv" ? "Grundarstatus" : "Founding Status",
  ];

  return (
    <section id="waitlist" className="relative py-32 overflow-hidden">
      {confetti && <Confetti />}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent-purple/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4"
            whileHover={{ scale: 1.05 }}
          >
            {lang === "sv" ? "Exklusiv Åtkomst" : "Exclusive Access"}
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {lang === "sv" ? "Gå Med i " : "Join the "}
            <span className="text-gradient">{lang === "sv" ? "Väntelistan" : "Waitlist"}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {lang === "sv"
              ? "Bli en av de första svenska företagen att uppleva BudAI. Tidiga användare får livstidsprioriterad support, exklusiva funktioner och grundarstatus."
              : "Be among the first Swedish companies to experience BudAI. Early adopters receive lifetime priority support, exclusive features, and founding company status."}
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Stats */}
          <div className="lg:col-span-2 space-y-6">
            {stats.map((s) => (
              <div key={s.label} className="glass-strong rounded-2xl p-6 border border-white/[0.06]">
                <div className="flex items-center gap-4 mb-2">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                  <span className="text-3xl font-bold">{s.value}</span>
                </div>
                <p className="text-sm text-muted">{s.label}</p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-muted">
                  <Zap className="w-3 h-3 text-accent-cyan" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="glass-strong rounded-2xl p-6 sm:p-8 border border-white/[0.06] space-y-4"
                  noValidate
                >
                  {submitError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.waitlist.name} *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent-cyan/30 transition-colors ${
                            errors.name ? "border-red-500/50" : "border-white/[0.06]"
                          }`}
                          placeholder="Anna Lindqvist"
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.waitlist.email} *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent-cyan/30 transition-colors ${
                            errors.email ? "border-red-500/50" : "border-white/[0.06]"
                          }`}
                          placeholder="anna@foretag.se"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      {t.waitlist.company} *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent-cyan/30 transition-colors ${
                          errors.company ? "border-red-500/50" : "border-white/[0.06]"
                        }`}
                        placeholder="Företag AB"
                      />
                    </div>
                    {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company}</p>}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.waitlist.industry}
                      </label>
                      <select
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-cyan/30 transition-colors appearance-none"
                      >
                        <option value="">{lang === "sv" ? "Välj..." : "Select..."}</option>
                        {industries.map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.waitlist.employees}
                      </label>
                      <select
                        value={form.employees}
                        onChange={(e) => setForm({ ...form, employees: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-cyan/30 transition-colors appearance-none"
                      >
                        <option value="">{lang === "sv" ? "Välj..." : "Select..."}</option>
                        {employeeRanges.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted mb-1.5">
                        {t.waitlist.interest}
                      </label>
                      <select
                        value={form.interest}
                        onChange={(e) => setForm({ ...form, interest: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-accent-cyan/30 transition-colors appearance-none"
                      >
                        <option value="">{lang === "sv" ? "Välj..." : "Select..."}</option>
                        {interests.map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,229,255,0.15)] hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] transition-shadow flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t.waitlist.submit}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-muted/60 text-center">
                    {lang === "sv"
                      ? "Genom att gå med godkänner du att vi kontaktar dig angående BudAI."
                      : "By joining, you agree to be contacted about BudAI."}
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-strong rounded-2xl p-8 sm:p-12 border border-white/[0.06] text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-accent-green/10 border border-accent-green/20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-accent-green" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t.waitlist.success}</h3>
                  <p className="text-muted mb-6">{t.waitlist.successMsg}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    {lang === "sv" ? "Grundarföretag: AKTIV" : "Founding Company: ACTIVE"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}