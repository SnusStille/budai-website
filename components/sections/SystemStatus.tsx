"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Server, Activity, Shield, Database, Cpu, Network, CheckCircle2,
  AlertCircle, TrendingUp, Zap, Thermometer, BarChart3, Radio,
  Wifi, Waves, Flame
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

// Fixed: use en-US locale to prevent hydration mismatch
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

function AnimatedBar({ value, color, label }: { value: number; color: string; label: string }) {
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
      <span className="text-[10px] font-mono text-white/60 w-8 text-right">{value}%</span>
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

// Simple SVG sparkline
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

// Live pulsing dot field - lightweight visual effect
// Dots are generated once via lazy useState init, not on every render —
// this section's parent re-renders every 2.5s (live metrics), and without
// this the whole field used to jump to new random positions each tick.
function PulseField() {
  const [dots] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute w-1 h-1 rounded-full bg-accent-cyan/20"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function SystemStatus() {
  const { t } = useLang();
  const [services, setServices] = useState(initialServices);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [ramUsage, setRamUsage] = useState(68);
  const [temp, setTemp] = useState(42);
  const [latencyData] = useState([12, 11, 13, 10, 11, 12, 11, 10, 12, 11]);
  const [throughputData] = useState([2800, 2850, 2820, 2900, 2847, 2860, 2830, 2880, 2850, 2840]);
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
              <PulseField />
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

              {/* Mini sparklines */}
              <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted uppercase tracking-wider">Avg Latency</span>
                    <span className="text-[10px] text-accent-green">↓</span>
                  </div>
                  <MiniSpark data={latencyData} color="#00e5ff" />
                  <div className="mt-1 text-xs font-mono text-accent-cyan">{Math.round(latencyData[latencyData.length - 1])}ms</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted uppercase tracking-wider">Throughput</span>
                    <span className="text-[10px] text-accent-green">↑</span>
                  </div>
                  <MiniSpark data={throughputData} color="#00ff9d" />
                  <div className="mt-1 text-xs font-mono text-accent-green">{Math.round(throughputData[throughputData.length - 1]).toLocaleString("en-US")} req/s</div>
                </div>
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

              {/* System Resources */}
              <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-accent-cyan" />
                  <span className="text-sm font-medium">System Resources</span>
                </div>
                <div className="space-y-2">
                  <AnimatedBar value={Math.round(cpuUsage)} color="#00e5ff" label="CPU" />
                  <AnimatedBar value={Math.round(ramUsage)} color="#b967ff" label="RAM" />
                </div>
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-accent-pink" />
                    <span className="text-sm font-medium">Core Temp</span>
                  </div>
                  <span className="text-sm font-mono text-accent-pink">{Math.round(temp)}°C</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-pink"
                    animate={{ width: `${(temp / 60) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
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