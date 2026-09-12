"use client";

import {
  Server,
  Activity,
  Shield,
  Database,
  Cpu,
  Network,
  CheckCircle2,
  Zap,
  Radio,
  TrendingUp,
  Info,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useLang } from "@/components/ui/LanguageContext";

interface ServiceData {
  name: string;
  nameSv: string;
  status: "operational" | "building";
  icon: React.ElementType;
  note: string;
  noteSv: string;
  accent: string;
}

const services: ServiceData[] = [
  {
    name: "Playground API",
    nameSv: "Playground API",
    status: "operational",
    icon: Server,
    note: "Live demo route",
    noteSv: "Live demo-route",
    accent: "text-accent-cyan",
  },
  {
    name: "Waitlist",
    nameSv: "Väntelista",
    status: "operational",
    icon: Database,
    note: "Supabase-backed",
    noteSv: "Supabase-kopplad",
    accent: "text-accent-green",
  },
  {
    name: "Inference path",
    nameSv: "Inferensväg",
    status: "operational",
    icon: Cpu,
    note: "Claude-powered preview",
    noteSv: "Claude-driven preview",
    accent: "text-accent-purple",
  },
  {
    name: "Security baseline",
    nameSv: "Säkerhetsbas",
    status: "operational",
    icon: Shield,
    note: "TLS · GDPR-minded",
    noteSv: "TLS · GDPR-tänk",
    accent: "text-accent-pink",
  },
  {
    name: "Admin ops",
    nameSv: "Admin-ops",
    status: "operational",
    icon: Network,
    note: "Stille-only gate",
    noteSv: "Endast Stille",
    accent: "text-accent-cyan",
  },
  {
    name: "Analytics",
    nameSv: "Analys",
    status: "building",
    icon: Activity,
    note: "Expanding post-preview",
    noteSv: "Byggs ut efter preview",
    accent: "text-accent-purple",
  },
];

const metrics = [
  {
    label: "uptime",
    value: "Preview",
    icon: CheckCircle2,
    change: "v0.93",
    accent: "text-accent-green",
    ring: "from-accent-green to-accent-cyan",
  },
  {
    label: "response",
    value: "Live demo",
    icon: Activity,
    change: "Playground",
    accent: "text-accent-cyan",
    ring: "from-accent-cyan to-accent-blue",
  },
  {
    label: "dataCenters",
    value: "Nordic",
    icon: Server,
    change: "First",
    accent: "text-accent-purple",
    ring: "from-accent-purple to-accent-pink",
  },
  {
    label: "security",
    value: "GDPR",
    icon: Shield,
    change: "Target A+",
    accent: "text-accent-pink",
    ring: "from-accent-pink to-accent-purple",
  },
];

export default function SystemStatus() {
  const { t, lang } = useLang();
  const progress = 93;

  return (
    <section id="status" className="relative section-hairline py-20 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,600px)] h-[min(90vw,600px)] bg-accent-cyan/[0.035] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-10 sm:mb-14">
          <span className="section-badge text-accent-green mb-4">{t.status.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
            {t.status.title} <span className="text-gradient-cyan">{t.status.titleHighlight}</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl mx-auto px-1">
            {t.status.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mb-5 sm:mb-6 rounded-2xl border border-accent-cyan/15 bg-accent-cyan/[0.03] p-3.5 sm:p-4 flex items-start gap-3 text-left">
            <Info className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {lang === "sv"
                ? "Detta är preview-status för utvecklarförhandsvisningen — inte ett live produktions-dashboard. Mätetal nedan är mål och byggstatus."
                : "This is preview status for the developer preview — not a live production dashboard. Metrics below are targets and build status."}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mb-5 sm:mb-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-white">
                  {t.status.serviceHealth}
                </div>
                <div className="text-[11px] sm:text-xs text-muted font-mono">
                  preview · stilledev · v0.93
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-accent-green font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                </span>
                {t.status.allOperational}
              </span>
              <span className="text-accent-cyan">
                {progress}% {lang === "sv" ? "mot launch" : "to launch"}
              </span>
              <span className="text-muted/50 hidden sm:inline">
                · {lang === "sv" ? "agenter & prissättning senare" : "agents & pricing later"}
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.name} delay={Math.min(i * 0.03, 0.18)}>
              <div className="group h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 hover:border-accent-cyan/20 hover:bg-white/[0.035] transition-all duration-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <s.icon className={`w-4 h-4 ${s.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {lang === "sv" ? s.nameSv : s.name}
                      </div>
                      {s.status === "operational" ? (
                        <span className="text-[11px] text-accent-green inline-flex items-center gap-1">
                          <span className="relative flex h-1.5 w-1.5 mr-0.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-40 animate-ping" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
                          </span>
                          {lang === "sv" ? "Aktiv" : "Active"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-accent-purple inline-flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {lang === "sv" ? "Byggs" : "Building"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.05] text-xs text-muted">
                  {lang === "sv" ? s.noteSv : s.note}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 sm:px-5 py-3.5 mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4">
            <span className="text-[11px] sm:text-xs text-muted shrink-0">{t.status.coreSystems}</span>
            <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-green relative"
                style={{ width: `${progress}%` }}
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  style={{ backgroundSize: "200% 100%" }}
                />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-mono text-accent-cyan tabular-nums shrink-0">
              {progress}%
            </span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.04}>
              <div className="group h-full">
                <SpotlightCard className="h-full">
                  <div className="p-4 sm:p-5 text-center">
                    <div
                      className={`mx-auto mb-2.5 sm:mb-3 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${m.ring} p-[1px]`}
                    >
                      <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                        <m.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${m.accent}`} />
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                      {m.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted uppercase tracking-wider mt-1">
                      {t.status[m.label as keyof typeof t.status] || m.label}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-accent-green mt-1.5 inline-flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {m.change}
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
