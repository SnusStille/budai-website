"use client";

import { motion } from "framer-motion";
import { mockAnalytics } from "@/lib/data";

export default function ActivityChart() {
  const maxVal = Math.max(...mockAnalytics.map((d) => d.visits));

  return (
    <div className="rounded-2xl glass-strong border border-white/[0.06] p-6">
      <h3 className="text-lg font-semibold mb-6">Activity Overview</h3>
      <div className="flex items-end gap-4 h-48">
        {mockAnalytics.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ height: 0 }}
            animate={{ height: `${(day.visits / maxVal) * 100}%` }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full bg-gradient-to-t from-accent-cyan/40 to-accent-purple/40 rounded-t-lg relative group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-2 py-1 rounded text-xs whitespace-nowrap border border-white/10">
                {day.visits} visits, {day.signups} signups
              </div>
            </div>
            <span className="text-xs text-muted">{day.date}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent-cyan/40" /> Visits</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent-purple/40" /> Signups</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent-green/40" /> Playground</span>
      </div>
    </div>
  );
}
