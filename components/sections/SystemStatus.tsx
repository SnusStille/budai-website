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
  status: "operational" | "building";
  icon: React.ElementType;
  latency: number;
  uptime: string;
  accent: string;
}

const initialServices: ServiceData[] = [
  { name: "Core API", status: "operational", icon: Server, latency: 11, uptime: "99.99%", accent: "text-accent-cyan" },
  { name: "Neural Engine", status: "operational", icon: Cpu, latency: 7, uptime: "99.98%", accent: "text-accent-purple" },
  { name: "Data Pipeline", status: "operational", icon: Database, latency: 22, uptime: "99.95%", accent: "text-accent-green" },
  { name: "Security Layer", status: "operational", icon: Shield, latency: 2, uptime: "100%", accent: "text-accent-pink" },
  { name: "Network", status: "operational", icon: Network, latency: 4, uptime: "99.97%", accent: "text-accent-cyan" },
  { name: "Analytics", status: "building", icon: Activity, latency: 45, uptime: "—", accent: "text-accent-purple" },
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
  const progress = 93;

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
    <section id="status" className="relative py-20 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,600px)] h-[min(90vw,600px)] bg-accent-cyan/[0.035] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-10 sm:mb-14">
          <span className="section-badge text-accent-green mb-4">{t.status.badge}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
            {t.status.title} <span className="text-gradient-cyan">{t.status.titleHighlight}</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl mx-auto px-1">{t.status.subtitle}</p>
        </ScrollReveal>

        {/* Hero strip */}
        <ScrollReveal>
          <div className="mb-5 sm:mb-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-accent-green animate-pulse" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-white">{t.status.serviceHealth}</div>
                <div className="text-[11px] sm:text-xs text-muted font-mono">nordic-cluster · se-sto-1 · TLS 1.3</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-accent-green font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                </span>
                {t.status.allOperational}
              </span>
              <span className="text-muted hidden xs:inline sm:inline">CPU {Math.round(cpu)}%</span>
              <span className="text-muted">RAM {Math.round(ram)}%</span>
              <span className="text-accent-cyan">v0.93 · {progress}%</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Service cards — mobile friendly grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.name} delay={Math.min(i * 0.03, 0.18)}>
              <div className="group h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 hover:border-accent-cyan/20 hover:bg-white/[0.035] transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-white/10 transition-colors">
                      <s.icon className={`w-4 h-4 ${s.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{s.name}</div>
                      {s.status === "operational" ? (
                        <span className="text-[11px] text-accent-green inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Running
                        </span>
                      ) : (
                        <span className="text-[11px] text-accent-purple inline-flex items-center gap-1">
                          <Zap className="w-3 h-3 animate-pulse" /> Building
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.05]">
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Latency</div>
                    <div className="text-sm font-mono text-white tabular-nums">{Math.round(s.latency)}ms</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted uppercase tracking-wide">Uptime</div>
                    <div className="text-sm font-mono text-muted tabular-nums">{s.uptime}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Progress bar */}
        <ScrollReveal>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 sm:px-5 py-3.5 mb-5 sm:mb-6 flex items-center gap-3 sm:gap-4">
            <span className="text-[11px] sm:text-xs text-muted shrink-0">{t.status.coreSystems}</span>
            <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-green relative"
                style={{ width: `${progress}%` }}
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"
                  style={{ backgroundSize: "200% 100%" }}
                />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-mono text-accent-cyan tabular-nums shrink-0">{progress}%</span>
          </div>
        </ScrollReveal>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((m, i) => (
            <ScrollReveal key={m.label} delay={i * 0.04}>
              <div className="group h-full">
                <SpotlightCard className="h-full">
                  <div className="p-4 sm:p-5 text-center">
                    <div className={`mx-auto mb-2.5 sm:mb-3 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${m.ring} p-[1px]`}>
                      <div className="w-full h-full rounded-xl bg-[#0a0a12] flex items-center justify-center">
                        <m.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${m.accent}`} />
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums tracking-tight">
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
