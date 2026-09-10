"use client";

import { motion } from "framer-motion";
import { mockAnalytics } from "@/lib/data";

/**
 * Local sample bars for admin chrome only — not live product metrics.
 * Replace with real analytics when wired.
 */
export default function ActivityChart() {
  const maxVal = Math.max(...mockAnalytics.map((d) => d.visits), 1);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-white">Activity overview</h3>
          <p className="text-xs text-muted mt-0.5">
            Sample week bars for layout — not live traffic. Wire real analytics when ready.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted/70 px-2 py-1 rounded-md border border-white/10 bg-white/[0.03]">
          Mock sample
        </span>
      </div>

      <div className="flex items-end gap-2 sm:gap-3 h-48">
        {mockAnalytics.map((day, i) => {
          const h = Math.max(8, (day.visits / maxVal) * 100);
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-lg bg-gradient-to-t from-accent-cyan/50 to-accent-purple/40 border border-white/[0.06] border-b-0 relative group min-h-[8px]"
                title={`${day.visits} visits · ${day.signups} signups · ${day.playground_uses} playground`}
              >
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0c0c14] px-2 py-1 rounded text-[10px] whitespace-nowrap border border-white/10 pointer-events-none z-10">
                  {day.visits}v · {day.signups}s · {day.playground_uses}p
                </div>
              </motion.div>
              <span className="text-[10px] text-muted font-mono">{day.date}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent-cyan/50" /> Visits
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent-purple/50" /> Signups
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-accent-green/40" /> Playground
        </span>
      </div>
    </div>
  );
}
