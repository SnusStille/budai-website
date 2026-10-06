"use client";

import { useId } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
type Variant = "dark" | "light";

const SIZES: Record<Size, number> = {
  xs: 28,
  sm: 42,
  md: 48,
  lg: 76,
  xl: 120,
  hero: 220,
};

/**
 * BudAI mark — final lockup: "Signal Core"
 *
 * One circle. One living core. One orbiting signal.
 * Premium AI-infrastructure identity — motion only (2D CSS), no 3D, no letter monogram.
 * Designed to read at 16px favicon and own a hero stage.
 */
export default function BudAILogo({
  size = "sm",
  className = "",
  animated = true,
  interactive = false,
  onClick,
  label = "BudAI",
  variant = "dark",
}: {
  size?: Size;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  label?: string;
  variant?: Variant;
}) {
  const uid = useId().replace(/:/g, "");
  const px = SIZES[size];
  const Tag = interactive || onClick ? "button" : "div";
  const g = `bud-${uid}`;
  const gl = `${g}-gl`;
  const tl = `${g}-tl`;
  const fill = `url(#${g})`;
  const a = animated;
  const cyan = variant === "light" ? "#0891b2" : "#00e5ff";
  const L = "M10 9.5 3.5 16 10 22.5";
  const R = "M22 9.5l6.5 6.5-6.5 6.5";

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        interactive || onClick
          ? "cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          : ""
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={g} x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor={cyan} />
            <stop offset="1" stopColor="#7c5cff" />
          </linearGradient>
          <linearGradient id={tl} x1="16" y1="0" x2="22" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor={cyan} />
            <stop offset="1" stopColor={cyan} stopOpacity="0" />
          </linearGradient>
          <filter id={gl} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* outer HUD ring + compass ticks */}
        <circle cx="16" cy="16" r="13" stroke={fill} strokeWidth="1" strokeLinecap="round" strokeDasharray={a ? "18 5 7 5 3 5" : undefined} opacity={a ? 0.5 : 0.22} className={a ? "bud-orbit-rev" : undefined} />
        <path d="M16 0.6v1.8M31.4 16h-1.8M16 31.4v-1.8M0.6 16h1.8" stroke={cyan} strokeWidth="0.8" strokeLinecap="round" opacity="0.55" />

        {/* code brackets + AI spark, softly glowing */}
        <g filter={a ? `url(#${gl})` : undefined}>
          <path className={a ? "bud-chev-l" : undefined} d={L} stroke={fill} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path className={a ? "bud-chev-r" : undefined} d={R} stroke={fill} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 10.6C16.7 13.9 18.1 15.3 21.4 16C18.1 16.7 16.7 18.1 16 21.4C15.3 18.1 13.9 16.7 10.6 16C13.9 15.3 15.3 13.9 16 10.6Z" fill={fill} className={a ? "bud-core" : undefined} />
        </g>

        {/* light running along the brackets */}
        {a && (
          <>
            <path d={L} pathLength="100" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" className="bud-run" />
            <path d={R} pathLength="100" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" className="bud-run" style={{ animationDelay: "1.7s" }} />
          </>
        )}

        {/* data flow, inner ring, neural nodes */}
        <path d="M9.6 16h3.4M19 16h3.4" stroke={cyan} strokeWidth="1" strokeLinecap="round" className={a ? "bud-flow" : undefined} opacity="0.85" />
        <circle cx="16" cy="16" r="7" stroke={fill} strokeWidth="0.9" strokeDasharray={a ? "1.5 3.5" : undefined} opacity={a ? 0.6 : 0.3} className={a ? "bud-orbit" : undefined} />
        <circle cx="16" cy="6.2" r="1" fill={cyan} className={a ? "bud-node" : undefined} />
        <circle cx="16" cy="25.8" r="1" fill="#7c5cff" className={a ? "bud-node" : undefined} style={{ animationDelay: "1.2s" }} />

        {/* comet: orbiting node with a fading tail */}
        {a && (
          <g className="bud-orbit-rev">
            <path d="M16 9A7 7 0 0 1 21.4 11.5" stroke={`url(#${tl})`} strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="16" cy="9" r="1.3" fill={cyan} />
          </g>
        )}
      </svg>
    </Tag>
  );
}

export function BudAIWordmark({
  size = "sm",
  className = "",
  animated = true,
  variant = "dark",
}: {
  size?: Size;
  className?: string;
  animated?: boolean;
  variant?: Variant;
}) {
  const textSize =
    size === "xs" || size === "sm"
      ? "text-[15px] font-bold tracking-tight"
      : size === "md"
        ? "text-base font-bold tracking-tight"
        : "text-xl font-bold tracking-tight";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BudAILogo size={size} animated={animated} variant={variant} />
      <span className={`${textSize} ${variant === "light" ? "text-slate-900" : "text-white"}`}>
        Bud<span className="text-accent-cyan">AI</span>
      </span>
    </span>
  );
}

export function StilledevMark({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id={`sm-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx="16"
          cy="16"
          r="14.5"
          stroke={`url(#sm-${uid})`}
          strokeWidth="1.5"
          fill="rgba(0,229,255,0.06)"
        />
        <path
          d="M21.5 11.2c-.6-1.8-2.2-2.9-4.4-2.9-2.8 0-4.6 1.5-4.6 3.5 0 1.9 1.3 2.9 4.2 3.5l1.4.3c2.1.5 3.1 1.2 3.1 2.6 0 1.6-1.5 2.7-3.7 2.7-2.1 0-3.6-1-4.3-2.7"
          stroke={`url(#sm-${uid})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

export function StilledevLink({
  className = "",
  children = "Stilledev",
  showMark = false,
}: {
  className?: string;
  children?: React.ReactNode;
  showMark?: boolean;
}) {
  return (
    <a
      href="https://discord.com/users/353944097301594123"
      target="_blank"
      rel="noopener noreferrer"
      className={`relative inline-flex items-center gap-1.5 text-accent-cyan font-medium hover:text-white transition-colors duration-300 group ${className}`}
    >
      {showMark && <StilledevMark size={16} />}
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent-cyan group-hover:w-full transition-all duration-300" />
      </span>
    </a>
  );
}
