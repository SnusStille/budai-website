"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Server, Activity, Shield, Database, Cpu, Network, CheckCircle2,
  TrendingUp, Zap, Thermometer, Radio
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

function LiveCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setDisplay((v) => v + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  if (!mounted) return <span>{value.toLocaleString("en-US")}</span>;
  return <span>{display.toLocaleString("en-US")}</span>;
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

function MiniSpark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-6">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SystemStatus() {
  const { t } = useLang();
  const [services, setServices] = useState(initialServices);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [ramUsage, setRamUsage] = useState(68);
  const [temp, setTemp] = useState(42);
  const [latencyData, setLatencyData] = useState([12, 11, 13, 10, 11, 12, 11, 10, 12, 11]);
  const [throughputData, setThroughputData] = useState([2800, 2850, 2820, 2900, 2847, 2860, 2830, 2880, 2850, 2840]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(30, Math.min(85, prev + (Math.random() - 0.5) * 8)));
      setRamUsage((prev) => Math.max(55, Math.min(80, prev + (Math.random() - 0.5) * 4)));
      setTemp((prev) => Math.max(38, Math.min(52, prev + (Math.random() - 0.5) * 3)));
      setLatencyData((prev) => {
        const next = Math.max(4, prev[prev.length - 1] + (Math.random() - 0.5) * 3);
        return [...prev.slice(1), next];
      });
      setThroughputData((prev) => {
        const next = Math.max(2000, prev[prev.length - 1] + (Math.random() - 0.5) * 140);
        return [...prev.slice(1), next];
      });
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

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">
            {t.status.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t.status.title} <span className="text-gradient-cyan">{t.status.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{t.status.subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Status Panel - CLEANER */}
          <ScrollReveal className="lg:col-span-2">
            <div className="p-6 rounded-2xl glass-strong border border-white/[0.06] relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                    <Radio className="w-5 h-5 text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{t.status.serviceHealth}</h3>
                    <p className="text-xs text-accent-green">{t.status.allOperational}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                  </span>
                  Live
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((service) => (
                  <motion.div
                    key={service.name}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                          <service.icon className="w-4 h-4 text-white/70" />
                        </div>
                        <span className="text-sm font-medium text-white/90">{service.name}</span>
                      </div>
                      <StatusIndicator status={service.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{service.latency.toFixed(0)}ms</span>
                      <span><LiveCounter value={service.requests} /> req</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Metrics - SIMPLER */}
          <ScrollReveal>
            <div className="p-6 rounded-2xl glass-strong border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-4">{t.status.platformMetrics}</h3>
              <div className="space-y-4">
                {metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <m.icon className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <div className="text-xs text-muted">{t.status[m.label as keyof typeof t.status]}</div>
                        <div className="text-lg font-bold text-white">{m.value}</div>
                      </div>
                    </div>
                    <span className="text-xs text-accent-green bg-accent-green/10 px-2 py-1 rounded-full">{m.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Live Charts - CLEANER */}
          <ScrollReveal>
            <div className="p-6 rounded-2xl glass-strong border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white mb-4">{t.status.developmentProgress}</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" /> CPU
                    </span>
                    <span className="text-xs font-mono text-white">{cpuUsage.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple"
                      animate={{ width: `${cpuUsage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> RAM
                    </span>
                    <span className="text-xs font-mono text-white">{ramUsage.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-pink"
                      animate={{ width: `${ramUsage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted flex items-center gap-2">
                      <Thermometer className="w-3.5 h-3.5" /> Temp
                    </span>
                    <span className="text-xs font-mono text-white">{temp.toFixed(0)}°C</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-cyan"
                      animate={{ width: `${(temp / 80) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">Latency</span>
                  <TrendingUp className="w-3 h-3 text-accent-green" />
                </div>
                <MiniSpark data={latencyData} color="#00e5ff" />
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">Throughput</span>
                  <TrendingUp className="w-3 h-3 text-accent-purple" />
                </div>
                <MiniSpark data={throughputData} color="#b967ff" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}