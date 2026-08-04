"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Check, Sparkles, Building2, User, Zap, Crown, Clock, Users } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Confetti from "@/components/ui/Confetti";
import { addWaitlistUser } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

export default function Waitlist() {
  const { language } = useLanguage();
  const [form, setForm] = useState({ email: "", company: "", type: "individual" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [progress, setProgress] = useState(84);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes("@")) return;
    setLoading(true);
    try {
      await addWaitlistUser(form);
      setLoading(false);
      setSubmitted(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
    } catch (err) {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <section id="waitlist" className="relative py-32 overflow-hidden">
      <Confetti active={confetti} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-purple/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-purple mb-4">
            {language === "sv" ? "Exklusiv åtkomst" : "Exclusive Access"}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {language === "sv" ? "Bli en del av " : "Join the "}<span className="text-gradient">{language === "sv" ? "framtiden" : "Future"}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {language === "sv" 
              ? "Var bland de första att uppleva BudAI. Vi öppnar snart upp för både privatpersoner och företag."
              : "Be among the first to experience BudAI. We are opening soon for both individuals and businesses."}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative p-8 md:p-12 rounded-3xl glass-strong overflow-hidden border border-white/[0.06]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent-cyan/8 to-accent-purple/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="relative z-10">
                  <form onSubmit={handleSubmit} className="space-y-6 mb-12">
                    <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto mb-8">
                      <button 
                        type="button"
                        onClick={() => setForm({...form, type: 'individual'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium ${form.type === 'individual' ? 'bg-accent-cyan text-black' : 'text-muted hover:text-white'}`}
                      >
                        <User className="w-4 h-4" />
                        {language === "sv" ? "Privat" : "Individual"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setForm({...form, type: 'business'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium ${form.type === 'business' ? 'bg-accent-purple text-white' : 'text-muted hover:text-white'}`}
                      >
                        <Building2 className="w-4 h-4" />
                        {language === "sv" ? "Företag" : "Business"}
                      </button>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input 
                          type="email" 
                          value={form.email} 
                          onChange={(e) => setForm({ ...form, email: e.target.value })} 
                          placeholder={language === "sv" ? "Din e-postadress" : "Your email address"} 
                          required 
                          className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors text-base" 
                        />
                      </div>
                      
                      {form.type === 'business' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="relative"
                        >
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input 
                            type="text" 
                            value={form.company} 
                            onChange={(e) => setForm({ ...form, company: e.target.value })} 
                            placeholder={language === "sv" ? "Företagsnamn" : "Company name"} 
                            required 
                            className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-accent-purple/40 transition-colors text-base" 
                          />
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg shadow-accent-cyan/20"
                      >
                        {loading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                          <>{language === "sv" ? "Gå med i väntelistan" : "Join Waitlist"} <ArrowRight className="w-5 h-5" /></>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Progress Bar Section */}
                  <div className="max-w-2xl mx-auto pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-muted uppercase tracking-widest">
                        {language === "sv" ? "Utvecklingsstatus" : "Development Status"}
                      </span>
                      <span className="text-xs font-mono text-accent-cyan">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-[length:200%_100%] animate-shimmer rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="text-[10px] font-mono text-muted/50 uppercase">{language === "sv" ? "Design" : "Design"}</div>
                      <div className="text-[10px] font-mono text-accent-purple uppercase">{language === "sv" ? "Kärnsystem" : "Core Systems"}</div>
                      <div className="text-[10px] font-mono text-muted/50 uppercase">{language === "sv" ? "Lansering" : "Launch"}</div>
                    </div>
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
                  <h3 className="text-3xl font-bold mb-3">{language === "sv" ? "Välkommen!" : "Welcome!"}</h3>
                  <p className="text-muted mb-6">{language === "sv" ? "Vi har lagt till din e-post på väntelistan." : "We've added your email to the waitlist."}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent-green">
                    <Sparkles className="w-4 h-4" />
                    {language === "sv" ? "Tidig åtkomst bekräftad" : "Early Access Confirmed"}
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
