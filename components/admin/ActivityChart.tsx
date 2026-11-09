"use client";
import { motion } from "framer-motion";
export type SeriesPoint={label:string;views:number;signups:number};
/** Real series only. Empty state explains consent-gated collection instead of inventing bars. */
export default function ActivityChart({data=[]}:{data?:SeriesPoint[]}){
  const max=Math.max(...data.map(d=>Math.max(d.views,d.signups)),1);
  return (<div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-white">Traffic &amp; signups</h3><p className="mt-0.5 text-xs text-muted">Real recorded page views (consent-gated) and waitlist signups.</p></div></div>
    {data.length===0||data.every(d=>d.views===0&&d.signups===0)?<p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-muted">No data recorded in this period yet. Nothing is simulated — bars appear when real visits/signups are recorded.</p>:
    <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Traffic and signups chart">{data.map((d,i)=>(<div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2"><div className="flex h-32 w-full items-end justify-center gap-1"><motion.div initial={{height:0}} animate={{height:`${Math.max(4,(d.views/max)*100)}%`}} className="w-1/2 min-h-[4px] rounded-t bg-gradient-to-t from-accent-cyan/50 to-accent-cyan" title={`${d.views} views`}/><motion.div initial={{height:0}} animate={{height:`${Math.max(4,(d.signups/max)*100)}%`}} className="w-1/2 min-h-[4px] rounded-t bg-accent-purple" title={`${d.signups} signups`}/></div><span className="max-w-full truncate text-[9px] font-mono text-muted">{d.label}</span></div>))}</div>}
    <div className="mt-4 flex gap-4 text-[11px] text-muted"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-accent-cyan"/>Views</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-accent-purple"/>Signups</span></div>
  </div>);
}
