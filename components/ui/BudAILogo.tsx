"use client";

import { useId, type CSSProperties } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const SIZES: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 46,
  lg: 72,
  xl: 108,
  hero: 196,
};

/**
 * BudAI mark — "Lumen"
 *
 * Professional product icon (not a letter monogram):
 * dark disc · luminous core · three soft neural petals · thin brand ring.
 * Reads clean at 16px favicon and hero scale. Motion is 2D glow only.
 */
export default function BudAILogo({
  size = "sm",
  className = "",
  animated = true,
  interactive = false,
  onClick,
  label = "BudAI",
}: {
  size?: Size;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const px = SIZES[size];
  const isHero = size === "hero" || size === "xl";
  const Tag = interactive || onClick ? "button" : "div";

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
      {animated && (
        <>
          <span
            aria-hidden
            className="absolute inset-[-26%] rounded-full pointer-events-none logo-glow-breathe"
            style={{
              background:
                "radial-gradient(circle, rgba(0,229,255,0.45) 0%, rgba(139,92,246,0.18) 42%, transparent 68%)",
              filter: `blur(${isHero ? 18 : 7}px)`,
              opacity: isHero ? 0.9 : 0.55,
            }}
          />
          {isHero && (
            <span
              aria-hidden
              className="absolute inset-[-8%] rounded-full pointer-events-none logo-pulse-ring border border-accent-cyan/25"
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
            background:
              "radial-gradient(circle at 35% 28%, #152036 0%, #0a101c 42%, #06070e 72%, #05040c 100%)",
            boxShadow: isHero
              ? "0 0 40px rgba(0,229,255,0.28), 0 0 2px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.22)"
              : "0 0 14px rgba(0,229,255,0.18), inset 0 1px 0 rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.14)",
          } as CSSProperties
        }
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={`lg-ring-${uid}`} x1="8%" y1="0%" x2="92%" y2="100%">
              <stop offset="0%" stopColor="#f0ffff" />
              <stop offset="35%" stopColor="#00e5ff" />
              <stop offset="70%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id={`lg-petal-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#e8ffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#00e5ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
            </linearGradient>
            <radialGradient id={`lg-core-${uid}`} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#a5f3fc" />
              <stop offset="62%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#6366f1" />
            </radialGradient>
            <radialGradient id={`lg-soft-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </radialGradient>
            <filter id={`lg-blur-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
          </defs>

          {/* Soft inner wash */}
          <circle cx="32" cy="32" r="22" fill={`url(#lg-soft-${uid})`} />

          {/* Brand ring — slightly open gap at 7 o'clock for unique silhouette */}
          <circle
            cx="32"
            cy="32"
            r="26.5"
            fill="none"
            stroke={`url(#lg-ring-${uid})`}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="140 28"
            strokeDashoffset="18"
            opacity="0.9"
          />
          <circle
            cx="32"
            cy="32"
            r="26.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.4"
            opacity="0.18"
          />

          {/* Three neural petals (bud opening) — unique, not a letter */}
          <g
            className={animated && isHero ? "logo-orbit-2d" : undefined}
            style={
              animated && isHero
                ? ({
                    transformOrigin: "32px 32px",
                    animationDuration: "48s",
                  } as CSSProperties)
                : undefined
            }
          >
            {/* Petal 1 — top */}
            <path
              d="M32 14
                 C36.5 18.5 38 24 36.2 28.5
                 C34.8 31.2 33.2 32.4 32 32.8
                 C30.8 32.4 29.2 31.2 27.8 28.5
                 C26 24 27.5 18.5 32 14Z"
              fill={`url(#lg-petal-${uid})`}
              opacity="0.88"
            />
            {/* Petal 2 — lower left */}
            <path
              d="M32 32.8
                 C30.5 33.2 27.2 35.5 24.2 39.8
                 C20.8 44.6 20.5 49.2 23.2 51
                 C26.2 48.6 29.5 43.5 31.4 37.2
                 C31.8 35.5 32 34 32 32.8Z"
              fill={`url(#lg-petal-${uid})`}
              opacity="0.72"
              transform="rotate(0 32 32)"
            />
            {/* Petal 3 — lower right */}
            <path
              d="M32 32.8
                 C33.5 33.2 36.8 35.5 39.8 39.8
                 C43.2 44.6 43.5 49.2 40.8 51
                 C37.8 48.6 34.5 43.5 32.6 37.2
                 C32.2 35.5 32 34 32 32.8Z"
              fill={`url(#lg-petal-${uid})`}
              opacity="0.72"
            />
          </g>

          {/* Luminous core */}
          <circle
            cx="32"
            cy="31.5"
            r="7.2"
            fill={`url(#lg-core-${uid})`}
            filter={animated ? `url(#lg-blur-${uid})` : undefined}
            opacity="0.55"
          />
          <circle cx="32" cy="31.5" r="6.1" fill={`url(#lg-core-${uid})`} />
          <circle cx="32" cy="31.5" r="6.1" fill="none" stroke="#fff" strokeWidth="0.55" opacity="0.35" />

          {/* Specular highlight */}
          <circle cx="29.2" cy="28.6" r="2.1" fill="#fff" opacity="0.55" />
          <circle cx="34.6" cy="33.8" r="1.1" fill="#fff" opacity="0.2" />

          {/* Micro nodes — constellation, readable only at larger sizes but harmless small */}
          <circle cx="32" cy="11.5" r="1.35" fill="#fff" opacity="0.85" />
          <circle cx="48.5" cy="40.5" r="1.1" fill="#a5f3fc" opacity="0.7" />
          <circle cx="15.5" cy="40.5" r="1.1" fill="#c4b5fd" opacity="0.7" />
        </svg>
      </span>
    </Tag>
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
