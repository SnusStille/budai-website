"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useLang } from "@/components/ui/LanguageContext";

interface ServiceData {
  name: string;
  status: "operational" | "degraded" | "building";
  icon: React.ElementType;
  latency: number;
  uptime: string;
}

const initialServices: ServiceData[] = [
  { name: "Core API", status: "operational", icon: Server, latency: 11, uptime: "99.99%" },
  { name: "Neural Engine", status: "operational", icon: Cpu, latency: 7, uptime: "99.98%" },
  { name: "Data Pipeline", status: "operational", icon: Database, latency: 22, uptime: "99.95%" },
  { name: "Security Layer", status: "operational", icon: Shield, latency: 2, uptime: "100%" },
  { name: "Network", status: "operational", icon: Network, latency: 4, uptime: "99.97%" },
  { name: "Analytics", status: "building", icon: Activity, latency: 45, uptime: "—" },
];

const metrics = [
  { label: "uptime", value: "99.97%", icon: CheckCircle2, change: "+0.02%", accent: "text-accent-green", ring: "from-accent-green to-accent-cyan" },
  { label: "response", value: "<45ms", icon: Activity, change: "-3ms", accent: "text-accent-cyan", ring: "from-accent-cyan to-accent-blue" },
  { label: "dataCenters", value: "3", icon: Server, change: "Nordic", accent: "text-accent-purple", ring: "from-accent-purple to-accent-pink" },
  { label: "security", value: "A+", icon: Shield, change: "Enterprise", accent: "text-accent-pink", ring: "from-accent-pink to-accent-purple" },
];

export default function SystemStatus() {
  const { t, lang } = useLang();
  const [services, setServices] = useState(initialServices);
  const [cpu, setCpu] = useState(42);
  const [ram, setRam] = useState(68);
  const [progress] = useState(92);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu((p) => Math.max(28, Math.min(78, p + (Math.random() - 0.5) * 5)));
      setRam((p) => Math.max(52, Math.min(78, p + (Math.random() - 0.5) * 2.5)));
      setServices((prev) =>
        prev.map((s) =>
          s.status === "operational"
            ? { ...s, latency: Math.max(1, Math.round((s.latency + (Math.random() - 0.5) * 1.2) * 10) / 10) }
            : s
        )
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="status" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/[0.035] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-12 md:mb-14">
          <span className="section-badge text-accent-green mb-4">{t.status.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {t.status.title} <span className="text-gradient-cyan">{t.status.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto">{t.status.subtitle}</p>
        </ScrollReveal>

        {/* Clean command strip */}
        <ScrollReveal>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 sm:px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green" />
              </span>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-accent-cyan" />
                  {t.status.serviceHealth}
                </div>
                <div className="text-[11px] text-muted font-mono">
                  nordic-cluster · se-sto-1 · TLS 1.3
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-muted">
              <span className="text-accent-green font-medium">{t.status.allOperational}</span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="hidden sm:inline">CPU {Math.round(cpu)}%</span>
              <span className="hidden sm:inline">RAM {Math.round(ram)}%</span>
              <span className="text-accent-cyan">v0.92 · {progress}%</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Compact service rows — clean, high density */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#08080f]/80 overflow-hidden mb-6 backdrop-blur-sm relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent" />
          <div className="hidden sm:grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr] gap-2 px-5 py-2.5 border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-muted/70 font-medium">
            <span>{lang === "sv" ? "Tjänst" : "Service"}</span>
            <span>{lang === "sv" ? "Status" : "Status"}</span>
            <span>Latency</span>
            <span className="text-right">Uptime</span>
          </div>
          {services.map((s, i) => (
            <ScrollReveal key={s.name} delay={Math.min(i * 0.03, 0.15)}>
              <div
                className={`grid grid-cols-1 sm:grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr] gap-2 sm:gap-2 items-center px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors group ${
                  i % 2 === 0 ? "bg-white/[0.01]" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-accent-cyan/25 transition-colors">
                    <s.icon
                      className={`w-4 h-4 ${
                        s.status === "operational" ? "text-accent-cyan" : "text-accent-purple"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-white truncate">{s.name}</span>
                </div>
                <div>
                  {s.status === "operational" ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-accent-green">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Running
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-accent-purple">
                      <Zap className="w-3.5 h-3.5 animate-pulse" /> Building
                    </span>
                  )}
                </div>
                <div className="text-sm font-mono text-white/90 tabular-nums">
                  {Math.round(s.latency)}
                  <span className="text-muted text-xs ml-0.5">ms</span>
                </div>
                <div className="text-sm font-mono text-right text-muted tabular-nums sm:text-right">
                  {s.uptime}
                </div>
              </div>
            </ScrollReveal>
          ))}

          {/* Slim progress footer */}
          <div className="px-5 py-3.5 bg-white/[0.02] flex items-center gap-4">
            <span className="text-[11px] text-muted shrink-0">{t.status.coreSystems}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-green relative"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
              </div>
            </div>
            <span className="text-xs font-mono text-accent-cyan tabular-nums">{progress}%</span>
          </div>
        </div>

        {/* 4 metric cards under — Spotlight like Capabilities */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.04}>
              <div className="group h-full">
                <SpotlightCard className="h-full">
                  <div className="p-5 text-center relative">
                    <div className={`mx-auto mb-3 w-11 h-11 rounded-xl bg-gradient-to-br ${m.ring} p-[1px]`}>
                      <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                        <m.icon className={`w-5 h-5 ${m.accent}`} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
                      {m.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted uppercase tracking-wider mt-1.5">
                      {t.status[m.label as keyof typeof t.status] || m.label}
                    </div>
                    <div className="text-[11px] text-accent-green mt-2 inline-flex items-center gap-0.5">
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
