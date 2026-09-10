"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Shield, X, Zap, Server, ArrowRight, Tag } from "lucide-react";
import BudAILogo from "@/components/ui/BudAILogo";
import { useLang } from "@/components/ui/LanguageContext";

/**
 * Hero logo stage — single BudAILogo, soft ambient motion only.
 * Click → professional Neural Core sheet.
 */
export default function AICore({ isMobile = false }: { isMobile?: boolean }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [latency, setLatency] = useState(11);
  const [load, setLoad] = useState(42);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setLatency((v) => Math.max(7, Math.min(16, +(v + (Math.random() - 0.5) * 1.2).toFixed(1))));
      setLoad((v) => Math.max(30, Math.min(70, Math.round(v + (Math.random() - 0.5) * 3))));
    }, 1800);
    return () => clearInterval(id);
  }, [open]);

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
    { icon: Server, label: "Region", value: "se-sto-1 · Nordic" },
    { icon: Cpu, label: lang === "sv" ? "Motor" : "Engine", value: "BudAI Core v0.93" },
    { icon: Activity, label: "Latency", value: `${Math.round(latency)} ms avg` },
    { icon: Zap, label: lang === "sv" ? "Last" : "Load", value: `${load}% · healthy` },
    { icon: Shield, label: lang === "sv" ? "Säkerhet" : "Security", value: "A+ · TLS 1.3 · GDPR" },
    {
      icon: Tag,
      label: lang === "sv" ? "Early access" : "Early access",
      value: "BUDAI-EARLY-10 · 10%",
    },
  ];

  const dim = isMobile ? 152 : 196;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.78 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mb-9 sm:mb-11 flex flex-col items-center"
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
          {lang === "sv" ? "tryck · systemstatus" : "tap · system status"}
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
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-70" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                      </span>
                      {lang === "sv" ? "Operativ · v0.93" : "Operational · v0.93"}
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

              <p className="px-5 text-xs text-muted leading-relaxed mb-2">
                {lang === "sv"
                  ? "Live-översikt av BudAI i Nordic-klustret — samma signaler som systemstatus."
                  : "Live overview of BudAI in the Nordic cluster — same signals as system status."}
              </p>

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
                    <span className="text-[10px] text-accent-green font-mono">OK</span>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
                <a
                  href="#status"
                  onClick={() => setOpen(false)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-center text-sm font-medium py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white"
                >
                  {lang === "sv" ? "Systemstatus" : "System status"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#playground"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm font-medium py-2.5 rounded-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.04]"
                >
                  Playground
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
