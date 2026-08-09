"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Server, Activity, Shield, Database, Cpu, Network, CheckCircle2,
  AlertCircle, TrendingUp, Zap, BarChart3, Radio,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLang } from "@/components/ui/LanguageContext";

interface ServiceData {
  name: string;
  status: "operational" | "degraded" | "building";
  icon: React.ElementType;
  latency: number;
  requests: number;
}

const initialServices: ServiceData[] = [
  { name: "Core API", status: "operational", icon: Server, latency: 11, requests: 12489 },
  { name: "Neural Engine", status: "operational", icon: Cpu, latency: 7, requests: 8934 },
  { name: "Data Pipeline", status: "operational", icon: Database, latency: 22, requests: 23105 },
  { name: "Security Layer", status: "operational", icon: Shield, latency: 2, requests: 45200 },
  { name: "Network", status: "operational", icon: Network, latency: 4, requests: 18765 },
  { name: "Analytics", status: "building", icon: Activity, latency: 45, requests: 0 },
];

const metrics = [
  { label: "uptime", value: "99.97%", icon: CheckCircle2, change: "+0.02%" },
  { label: "response", value: "<45ms", icon: Activity, change: "-3ms" },
  { label: "dataCenters", value: "3", icon: Server, change: "Nordic" },
  { label: "security", value: "A+", icon: Shield, change: "Enterprise" },
];

// Reflects the real `value` from the parent's single update cycle, with a
// small fade/rise on change — it used to run its own separate 3s timer that
// ignored the actual data entirely, so this number ticked up independently
// and out of sync with the rest of the panel. One source of truth now.
function LiveCounter({ value }: { value: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span>{value.toLocaleString("en-US")}</span>;
  return (
    <motion.span key={value} initial={{ opacity: 0.4, y: -2 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="inline-block">
      {value.toLocaleString("en-US")}
    </motion.span>
  );
}

function AnimatedBar({ value, color, label, suffix }: { value: number; color: string; label: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted w-8 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/60 w-10 text-right">{suffix ?? `${value}%`}</span>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const colors = {
    operational: "bg-accent-green",
    degraded: "bg-yellow-500",
    building: "bg-accent-purple",
  };
  const labels = {
    operational: "Running",
    degraded: "Degraded",
    building: "In Development",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status as keyof typeof colors]} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[status as keyof typeof colors]}`} />
      </span>
      <span className="text-[10px] text-muted">{labels[status as keyof typeof labels]}</span>
    </div>
  );
}

// Continuous ECG-style live signal strip. Unlike the periodic (every 2.5s)
// state updates elsewhere on this section, this one animates constantly via
// a looping transform — it never sits still, which is what makes the panel
// read as "live" rather than just "updates sometimes".
function LiveSignal({ color = "#00ff9d" }: { color?: string }) {
  const beat = "0,20 8,20 13,20 16,4 19,36 22,20 27,20 40,20";
  const unit = beat
    .split(" ")
    .map((p) => {
      const [x, y] = p.split(",").map(Number);
      return `${x},${y}`;
    })
    .join(" ");
  const points = `${unit} ${unit
    .split(" ")
    .map((p) => {
      const [x, y] = p.split(",");
      return `${Number(x) + 40},${y}`;
    })
    .join(" ")}`;

  return (
    <div className="relative w-full h-6 overflow-hidden">
      <motion.svg
        viewBox="0 0 80 40"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 h-full"
        style={{ width: "400%" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <polyline
            key={i}
            points={points
              .split(" ")
              .map((p) => {
                const [x, y] = p.split(",");
                return `${Number(x) + i * 80},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        ))}
      </motion.svg>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12] via-transparent to-[#0a0a12] pointer-events-none" />
    </div>
  );
}

export default function SystemStatus() {
  const { t } = useLang();
  const [services, setServices] = useState(initialServices);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [ramUsage, setRamUsage] = useState(68);
  const [temp, setTemp] = useState(42);
  const [activeService, setActiveService] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(30, Math.min(85, prev + (Math.random() - 0.5) * 8)));
      setRamUsage((prev) => Math.max(55, Math.min(80, prev + (Math.random() - 0.5) * 4)));
      setTemp((prev) => Math.max(38, Math.min(52, prev + (Math.random() - 0.5) * 3)));
      setServices((prev) =>
        prev.map((s) =>
          s.status === "operational"
            ? {
                ...s,
                latency: Math.max(1, s.latency + (Math.random() - 0.5) * 2),
                requests: s.requests + Math.floor(Math.random() * 3),
              }
            : s
        )
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="status" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/3 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">
            {t.status.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t.status.title} <span className="text-gradient-cyan">{t.status.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{t.status.subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Panel */}
          <ScrollReveal className="lg:col-span-2">
            <div className="p-6 rounded-2xl glass-strong border border-white/[0.06] h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent animate-scan" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Radio className="w-5 h-5 text-accent-cyan animate-pulse" />
                  {t.status.serviceHealth}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green" />
                  </span>
                  <span className="text-accent-green font-medium">{t.status.allOperational}</span>
                </div>
              </div>

              <LiveSignal color="#00ff9d" />

              <div className="space-y-2 relative z-10">
                {services.map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onMouseEnter={() => setActiveService(s.name)}
                    onMouseLeave={() => setActiveService(null)}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-default border ${
                      activeService === s.name
                        ? "bg-white/[0.06] border-accent-cyan/20 shadow-[0_0_20px_rgba(0,229,255,0.08)]"
                        : "bg-white/[0.015] border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={activeService === s.name ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          s.status === "operational"
                            ? "bg-accent-green/10"
                            : s.status === "degraded"
                            ? "bg-yellow-500/10"
                            : "bg-accent-purple/10"
                        }`}
                      >
                        <s.icon className={`w-4 h-4 ${
                          s.status === "operational" ? "text-accent-green" : s.status === "degraded" ? "text-yellow-500" : "text-accent-purple"
                        }`} />
                      </motion.div>
                      <div>
                        <div className="font-medium text-sm text-white">{s.name}</div>
                        <StatusIndicator status={s.status} />
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <div className="text-[10px] text-muted">Latency</div>
                        <motion.div
                          key={Math.round(s.latency)}
                          initial={{ opacity: 0.5, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-mono text-white"
                        >
                          {Math.round(s.latency)}ms
                        </motion.div>
                      </div>
                      <div className="hidden md:block text-right">
                        <div className="text-[10px] text-muted">Req/s</div>
                        <div className="text-xs font-mono text-accent-cyan">
                          <LiveCounter value={s.requests} />
                        </div>
                      </div>
                      {s.status === "operational" ? (
                        <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0" />
                      ) : s.status === "degraded" ? (
                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                      ) : (
                        <Zap className="w-5 h-5 text-accent-purple shrink-0 animate-pulse" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Side Panel */}
          <ScrollReveal delay={0.2}>
            <div className="p-6 rounded-2xl glass-strong border border-white/[0.06] h-full flex flex-col gap-4">
              <h3 className="text-lg font-semibold">{t.status.platformMetrics}</h3>

              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="p-4 rounded-xl bg-white/[0.015] text-center group hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.06] cursor-default"
                  >
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <m.icon className="w-5 h-5 text-accent-cyan mx-auto mb-2" />
                    </motion.div>
                    <div className="text-2xl font-bold text-white">{m.value}</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">{t.status[m.label as keyof typeof t.status] || m.label}</div>
                    <div className="text-[10px] text-accent-green mt-1 flex items-center justify-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {m.change}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* System Resources — CPU, RAM, and core temp together in one
                  card instead of two, so the sidebar reads as one coherent
                  "machine health" block rather than a stack of separate tiles. */}
              <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-accent-cyan" />
                  <span className="text-sm font-medium">System Resources</span>
                </div>
                <div className="space-y-2.5">
                  <AnimatedBar value={Math.round(cpuUsage)} color="#00e5ff" label="CPU" />
                  <AnimatedBar value={Math.round(ramUsage)} color="#b967ff" label="RAM" />
                  <AnimatedBar value={Math.round((temp / 60) * 100)} color="#ff6b9d" label="Temp" suffix={`${Math.round(temp)}°C`} />
                </div>
              </div>

              {/* Development Progress */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent-cyan/8 to-accent-purple/8 border border-accent-cyan/15">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-accent-cyan" />
                  <span className="text-sm font-medium">{t.status.developmentProgress}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "68%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-muted">{t.status.coreSystems}</span>
                  <span className="text-accent-cyan font-medium">68%</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}