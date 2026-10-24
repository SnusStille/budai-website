"use client";

/** Small ring showing today's remaining credits. Links to the plans. */
export default function CreditsMeter({ rem, lim, sv }: { rem: number; lim: number; sv: boolean }) {
  if (!Number.isFinite(lim) || lim <= 0) return null;
  const pct = Math.max(0, Math.min(1, rem / lim));
  const C = 2 * Math.PI * 9;
  const tone = pct > 0.4 ? "#00e5ff" : pct > 0.15 ? "#fbbf24" : "#f87171";
  return (
    <a href="#capabilities" className="group flex items-center gap-2 rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-muted hover:text-white transition-colors" title={sv ? "Se paketen för fler credits" : "See plans for more credits"}>
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
        <circle cx="11" cy="11" r="9" fill="none" stroke={tone} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 11 11)" style={{ transition: "stroke-dasharray .5s ease" }} />
      </svg>
      <span>
        {rem}/{lim} {sv ? "credits kvar" : "credits left"}
      </span>
      <span className="hidden text-accent-cyan group-hover:inline">{sv ? "Mer →" : "More →"}</span>
    </a>
  );
}
