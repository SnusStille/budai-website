"use client";

import { useId, type CSSProperties } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
type Variant = "dark" | "light" | "auto";

const SIZES: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 46,
  lg: 72,
  xl: 108,
  hero: 196,
};

/**
 * BudAI final mark — "Orbit"
 *
 * Timeless product icon:
 * - solid disc (app-icon ready)
 * - single luminous core
 * - one open orbital arc (unique silhouette, not a letter)
 * - no sparkles, no monogram, no stacked marks
 *
 * Designed to stay legible at 16px favicon and premium at hero scale.
 * Motion is optional 2D glow only.
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
  /** dark = default site; light = for light surfaces / print */
  variant?: Variant;
}) {
  const uid = useId().replace(/:/g, "");
  const px = SIZES[size];
  const isHero = size === "hero" || size === "xl";
  const light = variant === "light";
  const Tag = interactive || onClick ? "button" : "div";

  const discBg = light
    ? "radial-gradient(circle at 34% 28%, #ffffff 0%, #f1f5f9 48%, #e2e8f0 100%)"
    : "radial-gradient(circle at 34% 28%, #152036 0%, #0a101c 45%, #06070e 100%)";

  const discBorder = light ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.14)";

  const discShadow = light
    ? isHero
      ? "0 8px 32px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9)"
      : "0 2px 10px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.85)"
    : isHero
      ? "0 0 40px rgba(0,229,255,0.28), inset 0 1px 0 rgba(255,255,255,0.2)"
      : "0 0 14px rgba(0,229,255,0.18), inset 0 1px 0 rgba(255,255,255,0.16)";

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        interactive || onClick
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 rounded-full"
          : ""
      } ${className}`}
      style={{ width: px, height: px }}
    >
      {animated && !light && (
        <>
          <span
            aria-hidden
            className="absolute inset-[-24%] rounded-full pointer-events-none logo-glow-breathe"
            style={{
              background:
                "radial-gradient(circle, rgba(0,229,255,0.42) 0%, rgba(99,102,241,0.14) 48%, transparent 70%)",
              filter: `blur(${isHero ? 16 : 6}px)`,
              opacity: isHero ? 0.88 : 0.5,
            }}
          />
          {isHero && (
            <span
              aria-hidden
              className="absolute inset-[-6%] rounded-full pointer-events-none logo-pulse-ring border border-accent-cyan/20"
            />
          )}
        </>
      )}

      <span
        className={`relative z-[1] w-full h-full rounded-full overflow-hidden ${
          animated ? "logo-mark-breathe" : ""
        }`}
        style={
          {
            background: discBg,
            boxShadow: discShadow,
            border: discBorder,
          } as CSSProperties
        }
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={`or-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={light ? "#0891b2" : "#e8ffff"} />
              <stop offset="45%" stopColor={light ? "#06b6d4" : "#00e5ff"} />
              <stop offset="100%" stopColor={light ? "#6366f1" : "#818cf8"} />
            </linearGradient>
            <radialGradient id={`oc-${uid}`} cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor={light ? "#67e8f9" : "#a5f3fc"} />
              <stop offset="75%" stopColor={light ? "#22d3ee" : "#22d3ee"} />
              <stop offset="100%" stopColor={light ? "#4f46e5" : "#6366f1"} />
            </radialGradient>
            <radialGradient id={`ow-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity={light ? "0.18" : "0.28"} />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft wash */}
          <circle cx="32" cy="32" r="20" fill={`url(#ow-${uid})`} />

          {/* Open orbital arc — unique, readable at 16px */}
          <circle
            cx="32"
            cy="32"
            r="23"
            fill="none"
            stroke={`url(#or-${uid})`}
            strokeWidth={isHero ? 2.25 : 2}
            strokeLinecap="round"
            strokeDasharray="108 36"
            strokeDashoffset="12"
            opacity={light ? 0.95 : 0.92}
          />

          {/* Secondary hairline ring */}
          <circle
            cx="32"
            cy="32"
            r="23"
            fill="none"
            stroke={light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.12)"}
            strokeWidth="0.5"
          />

          {/* Core */}
          <circle cx="32" cy="32" r="9.5" fill={`url(#oc-${uid})`} />
          <circle
            cx="32"
            cy="32"
            r="9.5"
            fill="none"
            stroke={light ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.35)"}
            strokeWidth="0.6"
          />

          {/* Specular */}
          <circle cx="28.5" cy="28.5" r="2.4" fill="#fff" opacity={light ? 0.7 : 0.55} />

          {/* Orbit node — single accent bead on the arc (12 o'clock-ish) */}
          <circle cx="32" cy="9" r="2.4" fill={`url(#or-${uid})`} />
          <circle cx="32" cy="9" r="1.1" fill="#fff" opacity="0.9" />
        </svg>
      </span>
    </Tag>
  );
}

/** Wordmark lockup: symbol + BudAI text (navbar / footer) */
export function BudAIWordmark({
  size = "sm",
  className = "",
  animated = false,
}: {
  size?: Size;
  className?: string;
  animated?: boolean;
}) {
  const text =
    size === "xs" || size === "sm"
      ? "text-sm font-semibold tracking-tight"
      : size === "md"
        ? "text-base font-semibold tracking-tight"
        : "text-lg font-bold tracking-tight";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BudAILogo size={size} animated={animated} />
      <span className={`${text} text-white`}>
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
