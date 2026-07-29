"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

const logs = [
  "[08:00:01] System check: OK",
  "[08:00:02] Neural engine: ONLINE",
  "[08:00:03] Database connection: ESTABLISHED",
  "[08:00:04] API latency: 11ms",
  "[08:00:05] New signup: anna@techcorp.se",
  "[08:00:12] AI playground request processed",
  "[08:00:15] Model inference: 45ms",
  "[08:00:18] Cache refreshed",
  "[08:00:22] Security scan: PASSED",
  "[08:00:25] Background job completed",
  "[08:00:30] Health check: ALL GREEN",
  "[08:00:35] New signup: marcus@finova.se",
  "[08:00:40] Email notification sent",
  "[08:00:45] Analytics updated",
  "[08:00:50] Backup completed",
];

export default function SystemTerminal() {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setVisibleLogs((prev) => [...prev, logs[i]]);
        i++;
      } else {
        i = 0;
        setVisibleLogs([]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleLogs]);

  return (
    <div className="rounded-2xl glass-strong border border-white/[0.06] overflow-hidden h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.015]">
        <Terminal className="w-4 h-4 text-accent-green" />
        <span className="text-sm font-mono text-muted">system.log</span>
      </div>
      <div ref={scrollRef} className="p-4 h-[400px] overflow-y-auto font-mono text-xs space-y-1">
        {visibleLogs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={log.includes("signup") ? "text-accent-cyan" : log.includes("PASSED") || log.includes("GREEN") ? "text-accent-green" : "text-muted"}
          >
            {log}
          </motion.div>
        ))}
        <div className="flex items-center gap-1 text-accent-green animate-pulse">
          <span className="w-2 h-4 bg-accent-green" />
        </div>
      </div>
    </div>
  );
}
