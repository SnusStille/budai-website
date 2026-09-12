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
  Copy,
  Shield,
  Gift,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Magnetic from "@/components/ui/Magnetic";
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
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState("");

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("ref");
      if (q) setReferral(q.slice(0, 64));
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
      const refNote = referral.trim()
        ? `referral:${referral.trim().slice(0, 64)}`
        : null;
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
      console.error("Waitlist submit error:", err);
      const anyErr = err as { message?: string; code?: string; status?: number };
      const msg = (anyErr?.message || "").toLowerCase();
      // Human copy only — never dump PostgREST / schema noise
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
    "w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] text-sm transition-shadow";

  return (
    <section id="waitlist" className="relative section-hairline py-24 md:py-32 overflow-hidden">
      <Confetti active={confetti} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-purple/[0.07] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-accent-cyan/[0.05] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10 md:mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="section-badge text-accent-purple">{t.waitlist.badge}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide bg-accent-green/[0.08] text-accent-green/90 border border-accent-green/20">
              <Gift className="w-3 h-3" />
              {t.waitlist.discountBadge}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-white">
            {t.waitlist.title}{" "}
            <span className="text-gradient">{t.waitlist.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {t.waitlist.subtitle}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6 items-start">
          {/* Perks column */}
          <ScrollReveal className="lg:col-span-2 order-2 lg:order-1">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4 h-full">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-accent-purple" />
                {lang === "sv" ? "Founding-förmåner" : "Founding benefits"}
              </h3>
              <ul className="space-y-3">
                {[
                  {
                    icon: Tag,
                    title: lang === "sv" ? "10% early-access" : "10% early-access",
                    body:
                      lang === "sv"
                        ? "Kod BUDAI-EARLY-10 låses vid anmälan."
                        : "Code BUDAI-EARLY-10 locks on signup.",
                    color: "text-accent-green",
                  },
                  {
                    icon: Zap,
                    title: t.waitlist.prioritySupport,
                    body:
                      lang === "sv"
                        ? "Direktlinje till teamet under preview."
                        : "Direct line to the team during preview.",
                    color: "text-accent-cyan",
                  },
                  {
                    icon: Sparkles,
                    title: t.waitlist.exclusiveFeatures,
                    body:
                      lang === "sv"
                        ? "Tidig tillgång till nya förmågor."
                        : "Early access to new capabilities.",
                    color: "text-accent-purple",
                  },
                  {
                    icon: Shield,
                    title: lang === "sv" ? "Nordic-first" : "Nordic-first",
                    body:
                      lang === "sv"
                        ? "GDPR-tänk och svensk supportton."
                        : "GDPR-minded with Swedish support tone.",
                    color: "text-accent-pink",
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-3 p-3 rounded-xl border border-white/[0.05] bg-black/20"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-xs text-muted mt-0.5 leading-relaxed">{item.body}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  {
                    icon: Users,
                    label: t.waitlist.statWaiting,
                    value: count === null ? "—" : `${count}`,
                  },
                  {
                    icon: Crown,
                    label: t.waitlist.statSpots,
                    value: lang === "sv" ? "Vågor" : "Waves",
                  },
                  {
                    icon: Clock,
                    label: t.waitlist.statLaunch,
                    value: "2026",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-center"
                  >
                    <s.icon className="w-3.5 h-3.5 text-accent-cyan mx-auto mb-1" />
                    <div className="text-sm font-bold text-white tabular-nums">{s.value}</div>
                    <div className="text-[9px] text-muted leading-tight mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Form column */}
          <ScrollReveal className="lg:col-span-3 order-1 lg:order-2">
            <div className="relative p-6 sm:p-8 md:p-10 rounded-3xl border border-white/[0.1] bg-[#0a0a12]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(185,103,255,0.08)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent" />
              <div className="absolute -top-24 -right-20 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-16 w-56 h-56 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="relative z-10"
                  >
                    <p className="text-[11px] text-muted/70 mb-4 leading-relaxed" data-pricing-soon-note>
                      {lang === "sv"
                        ? "Prissättning meddelas före full lansering. Early access låser 10 % (BUDAI-EARLY-10)."
                        : "Pricing will be announced before full launch. Early access locks 10% (BUDAI-EARLY-10)."}
                    </p>
                    <LayoutGroup id="account-type">
                      <div className="inline-flex p-1 rounded-xl bg-black/30 border border-white/[0.06] mb-6">
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
                        className="space-y-3.5 mb-2"
                        transition={{ layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
                      >
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
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
                                    {(lang === "sv" ? industriesSv : industriesEn).map((ind) => (
                                      <option key={ind} value={ind} className="bg-surface">
                                        {ind}
                                      </option>
                                    ))}
                                  </select>
                                </motion.div>
                                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative md:col-span-2">
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
                              {(lang === "sv" ? interestsSv : interestsEn).map((i) => (
                                <option key={i} value={i} className="bg-surface">
                                  {i}
                                </option>
                              ))}
                            </select>
                          </motion.div>

                          {/* Optional referral */}
                          <motion.div layout className="relative md:col-span-2">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            <input
                              type="text"
                              value={referral}
                              onChange={(e) => setReferral(e.target.value)}
                              placeholder={
                                lang === "sv"
                                  ? "Referenskod (valfritt)"
                                  : "Referral code (optional)"
                              }
                              className={inputClass}
                              maxLength={64}
                            />
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

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                          <Magnetic strength={0.12} className="block w-full sm:w-auto">
                            <button
                              type="submit"
                              disabled={loading}
                              className="btn-primary w-full sm:w-auto !px-8 !py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {loading ? (
                                <span className="flex items-center gap-2">
                                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  {lang === "sv" ? "Skickar…" : "Submitting…"}
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  {t.waitlist.submit} <ArrowRight className="w-5 h-5" />
                                </span>
                              )}
                            </button>
                          </Magnetic>
                          <p className="text-[11px] text-muted/55 leading-relaxed max-w-xs">
                            {t.waitlist.discountHint}
                          </p>
                        </div>
                      </motion.form>
                    </LayoutGroup>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 text-center py-8 sm:py-10"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -16 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.08 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-green to-accent-cyan flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(0,255,157,0.35)]"
                    >
                      <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </motion.div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
                      {t.waitlist.successTitle}
                    </h3>
                    <p className="text-muted mb-2">
                      {t.waitlist.successPre}{" "}
                      <span className="text-accent-cyan font-medium">{form.email}</span>{" "}
                      {t.waitlist.successPost}
                    </p>
                    <p className="text-sm text-muted/55 mb-6">{t.waitlist.successNote}</p>

                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-green border border-accent-green/20">
                        <Crown className="w-4 h-4" />
                        {t.waitlist.foundingActive}
                      </div>
                      <p className="text-[11px] text-muted/55 max-w-xs">
                        {lang === "sv"
                          ? "Tips: dela stilledev.se/?ref=din-kod — referral sparas i din anmälan."
                          : "Tip: share stilledev.se/?ref=your-code — referrals are saved with your signup."}
                      </p>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="px-5 py-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/25 hover:border-accent-cyan/40 transition-colors text-center group"
                      >
                        <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
                          {t.waitlist.discountCodeLabel}
                        </div>
                        <div className="font-mono text-sm text-accent-cyan tracking-wide flex items-center gap-2 justify-center">
                          BUDAI-EARLY-10
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-accent-green" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                          )}
                        </div>
                        <div className="text-[11px] text-muted mt-1">10% · early access</div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
