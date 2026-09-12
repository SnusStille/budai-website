"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Shield, X, Zap, Server, ArrowRight, Tag, Info } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Hero logo stage — single BudAILogo, soft ambient motion only.
 * Click → Neural Core sheet (honest preview info).
 */
export default function AICore({ isMobile = false }: { isMobile?: boolean }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const rows = [
    { icon: Server, label: lang === "sv" ? "Fokus" : "Focus", value: lang === "sv" ? "Sverige · Norden" : "Sweden · Nordics" },
    { icon: Cpu, label: lang === "sv" ? "Motor" : "Engine", value: "BudAI Core v0.93" },
    { icon: Activity, label: lang === "sv" ? "Demo" : "Demo", value: lang === "sv" ? "Live Playground" : "Live Playground" },
    { icon: Zap, label: lang === "sv" ? "Läge" : "Mode", value: lang === "sv" ? "Developer Preview" : "Developer Preview" },
    { icon: Shield, label: lang === "sv" ? "Integritet" : "Privacy", value: lang === "sv" ? "GDPR-minded · TLS" : "GDPR-minded · TLS" },
    {
      icon: Tag,
      label: "Early access",
      value: "BUDAI-EARLY-10 · 10%",
    },
  ];

  const dim = isMobile ? 160 : 212;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.78 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mb-2 sm:mb-3 flex flex-col items-center"
        style={{ width: dim + 28, height: dim + 32 }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none opacity-45 logo-ambient-spin"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(0,229,255,0.1) 18%, transparent 38%, rgba(185,103,255,0.09) 58%, transparent 78%, rgba(0,255,157,0.06) 90%, transparent 100%)",
            filter: "blur(10px)",
          }}
        />

        <div className="relative z-10 mt-1 transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]">
          <BudAILogo
            size="hero"
            animated={!isMobile}
            interactive
            onClick={() => setOpen(true)}
            label={lang === "sv" ? "Öppna neural core" : "Open neural core"}
          />
        </div>

        <p className="mt-3 text-[10px] sm:text-[11px] text-muted/55 font-mono tracking-wide">
          {lang === "sv" ? "tryck · produktinfo" : "tap · product info"}
        </p>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Neural core"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-white/[0.1] bg-[#0a0a12]/97 shadow-[0_0_80px_rgba(0,229,255,0.1)] overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/55 to-transparent" />

              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <BudAILogo size="md" animated={false} />
                  <div>
                    <div className="text-sm font-semibold text-white">Neural Core</div>
                    <div className="text-[11px] text-muted font-mono flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                      </span>
                      {lang === "sv" ? "Preview · v0.93" : "Preview · v0.93"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/5"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-accent-cyan/15 bg-accent-cyan/[0.04] px-3 py-2">
                <Info className="w-3.5 h-3.5 text-accent-cyan shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted leading-relaxed">
                  {lang === "sv"
                    ? "Översikt för utvecklarförhandsvisningen — inte live produktionsmetrik. Testa den riktiga motorn i Playground."
                    : "Developer preview overview — not live production metrics. Try the real engine in Playground."}
                </p>
              </div>

              <div className="px-3 pb-3 space-y-0.5">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <r.icon className="w-3.5 h-3.5 text-accent-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted/70">{r.label}</div>
                      <div className="text-sm text-white/90 font-medium truncate">{r.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
                <a
                  href="#playground"
                  onClick={() => setOpen(false)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-center text-sm font-medium py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                >
                  Playground
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#waitlist"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm font-medium py-2.5 rounded-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.04]"
                >
                  {lang === "sv" ? "Väntelista" : "Waitlist"}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
