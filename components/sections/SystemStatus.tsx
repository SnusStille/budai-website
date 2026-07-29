"use client";

import { motion } from "framer-motion";
import { Server, Activity, Shield, Database, Cpu, Network, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const services = [
  { name: "Core API", status: "operational", icon: Server, latency: "11ms" },
  { name: "Neural Engine", status: "operational", icon: Cpu, latency: "7ms" },
  { name: "Data Pipeline", status: "operational", icon: Database, latency: "22ms" },
  { name: "Security Layer", status: "operational", icon: Shield, latency: "2ms" },
  { name: "Network", status: "operational", icon: Network, latency: "4ms" },
  { name: "Analytics", status: "building", icon: Activity, latency: "—" },
];

const metrics = [
  { label: "Uptime", value: "99.97%", icon: CheckCircle2, change: "+0.02%" },
  { label: "Response", value: "<45ms", icon: Activity, change: "-3ms" },
  { label: "Data Centers", value: "3", icon: Server, change: "Nordic" },
  { label: "Security", value: "A+", icon: Shield, change: "Enterprise" },
];

export default function SystemStatus() {
  return (
    <section id="status" className="relative py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-accent-green mb-4">System Status</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Intelligence <span className="text-gradient-cyan">Infrastructure</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">Real-time overview of BudAI's development infrastructure and service health.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScrollReveal className="lg:col-span-2">
            <div className="p-6 rounded-2xl glass-strong border border-white/[0.06] h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent-cyan" />
                  Service Health
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
                  </span>
                  <span className="text-accent-green font-medium">All Systems Operational</span>
                </div>
              </div>

              <div className="space-y-2">
                {services.map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.status === "operational" ? "bg-accent-green/10" : "bg-yellow-500/10"}`}>
                        <s.icon className={`w-4 h-4 ${s.status === "operational" ? "text-accent-green" : "text-yellow-500"}`} />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">{s.name}</div>
                        <div className="text-xs text-muted">{s.status === "operational" ? "Running" : "In Development"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted">{s.latency}</span>
                      {s.status === "operational" ? (
                        <CheckCircle2 className="w-4 h-4 text-accent-green" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="p-6 rounded-2xl glass-strong border border-white/[0.06] h-full">
              <h3 className="text-lg font-semibold mb-6">Platform Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-white/[0.015] text-center group hover:bg-white/[0.03] transition-colors"
                  >
                    <m.icon className="w-5 h-5 text-accent-cyan mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{m.value}</div>
                    <div className="text-xs text-muted">{m.label}</div>
                    <div className="text-[10px] text-accent-green mt-1 flex items-center justify-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {m.change}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-accent-cyan/8 to-accent-purple/8 border border-accent-cyan/15">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-accent-cyan" />
                  <span className="text-sm font-medium">Development Progress</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "68%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Core Systems</span>
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
