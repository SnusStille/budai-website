"use client";

/**
 * Ring showing today's remaining messages. Uses the same "messages/day" unit as
 * lib/limits.ts — the developer preview has no credit system (audit point D2).
 */
export default function DailyUsageMeter({ rem, lim, sv, interactive = true, compact = false }: { rem: number; lim: number; sv: boolean; interactive?: boolean; compact?: boolean }) {
  if (!Number.isFinite(lim) || lim <= 0) return null;
  const pct = Math.max(0, Math.min(1, rem / lim));
  const C = 2 * Math.PI * 9;
  const tone = pct > 0.4 ? "#00e5ff" : pct > 0.15 ? "#fbbf24" : "#f87171";
  const contents = (
    <>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
        <circle cx="11" cy="11" r="9" fill="none" stroke={tone} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 11 11)" style={{ transition: "stroke-dasharray .5s ease" }} />
      </svg>
      <span>
        {rem}/{lim} {compact ? (sv ? "kvar idag" : "left today") : (sv ? "meddelanden kvar idag" : "messages left today")}
      </span>
    </>
  );
  const className = "group flex items-center gap-2 rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-muted";
  const label = sv ? "Dagens återstående meddelanden" : "Remaining messages today";
  if (!interactive) return <span className={className} aria-label={compact ? `${label}: ${rem}/${lim}` : label}>{contents}</span>;
  return <a href="#capabilities" aria-label={label} className={`${className} hover:text-white transition-colors`} title={sv ? "Se paketen för en högre dagsgräns" : "See plans for a higher daily limit"}>{contents}<span className="hidden text-accent-cyan group-hover:inline">{sv ? "Mer →" : "More →"}</span></a>;
}
