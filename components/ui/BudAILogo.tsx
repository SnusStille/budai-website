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
 * FINAL BudAI mark — "Orbit Core"
 * A single circular intelligence node: soft outer orbit, dual counter-rotating
 * arcs, luminous core. Reads at 16px favicon and at hero scale.
 * No letters. No squircles. Pure orbital geometry.
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
  const isHero = size === "hero";
  const Tag = interactive || onClick ? "button" : "div";

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        interactive || onClick ? "cursor-pointer focus-visible:outline-none" : ""
      } ${className}`}
      style={{ width: px, height: px }}
    >
      {animated && (
        <span
          aria-hidden
          className="absolute inset-[-28%] rounded-full pointer-events-none logo-glow-breathe"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(0,229,255,0.55) 0%, rgba(185,103,255,0.2) 45%, transparent 72%)",
            filter: `blur(${isHero ? 22 : 9}px)`,
            opacity: isHero ? 0.9 : 0.55,
          }}
        />
      )}

      <span
        className={`relative z-[1] w-full h-full rounded-full overflow-hidden ${
          animated && isHero ? "logo-mark-breathe" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #152033 0%, #060912 58%, #0a0614 100%)",
          boxShadow: isHero
            ? "0 0 36px rgba(0,229,255,0.4), inset 0 1px 0 rgba(255,255,255,0.32)"
            : "0 0 14px rgba(0,229,255,0.28), inset 0 1px 0 rgba(255,255,255,0.28)",
          border: "1px solid rgba(255,255,255,0.22)",
        }}
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={`og-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8ffff" />
              <stop offset="45%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#b967ff" />
            </linearGradient>
            <linearGradient id={`og2-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b967ff" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
            <radialGradient id={`oc-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.85" />
            </radialGradient>
          </defs>

          {/* Soft outer guide ring */}
          <circle
            cx="32"
            cy="32"
            r="27"
            fill="none"
            stroke={`url(#og-${uid})`}
            strokeWidth="0.8"
            opacity="0.25"
          />

          {/* Primary orbit arc — clockwise */}
          <g
            className={animated ? "logo-orbit-2d" : undefined}
            style={
              animated
                ? ({
                    transformOrigin: "32px 32px",
                    animationDuration: isHero ? "14s" : "22s",
                  } as CSSProperties)
                : undefined
            }
          >
            <path
              d="M32 6.5 A25.5 25.5 0 0 1 55.5 32"
              fill="none"
              stroke={`url(#og-${uid})`}
              strokeWidth="2.6"
              strokeLinecap="round"
              opacity="0.95"
            />
            <path
              d="M32 57.5 A25.5 25.5 0 0 1 8.5 32"
              fill="none"
              stroke={`url(#og-${uid})`}
              strokeWidth="2.6"
              strokeLinecap="round"
              opacity="0.55"
            />
            {/* Orbit dots */}
            <circle cx="32" cy="6.5" r="2.2" fill="#fff" opacity="0.95" />
            <circle cx="55.5" cy="32" r="1.6" fill="#00e5ff" opacity="0.9" />
          </g>

          {/* Counter orbit — reverse */}
          <g
            className={animated ? "logo-orbit-2d" : undefined}
            style={
              animated
                ? ({
                    transformOrigin: "32px 32px",
                    animationDuration: isHero ? "20s" : "32s",
                    animationDirection: "reverse",
                  } as CSSProperties)
                : undefined
            }
          >
            <path
              d="M10 18 A22 22 0 0 1 54 18"
              fill="none"
              stroke={`url(#og2-${uid})`}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.5"
            />
            <circle cx="10" cy="18" r="1.4" fill="#b967ff" opacity="0.85" />
          </g>

          {/* Mid ring */}
          <circle
            cx="32"
            cy="32"
            r="13.5"
            fill="none"
            stroke={`url(#og-${uid})`}
            strokeWidth="1"
            opacity="0.35"
          />

          {/* Core */}
          <circle
            cx="32"
            cy="32"
            r="8"
            fill={`url(#oc-${uid})`}
            className={animated ? "logo-core-pulse" : undefined}
            style={{ transformOrigin: "32px 32px" }}
          />
          <circle cx="32" cy="32" r="3.2" fill="#fff" opacity="0.95" />
          <circle cx="29.5" cy="29.5" r="1.1" fill="#fff" opacity="0.7" />
        </svg>

        <span
          aria-hidden
          className="absolute top-[14%] left-[18%] w-[38%] h-[20%] rounded-full bg-white/22 blur-[2.5px] pointer-events-none"
        />
      </span>
    </Tag>
  );
}

/** Stilledev geometric S */
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
          <linearGradient id={`s-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#b967ff" />
          </linearGradient>
        </defs>
        <circle
          cx="16"
          cy="16"
          r="14.5"
          stroke={`url(#s-${uid})`}
          strokeWidth="1.5"
          fill="rgba(0,229,255,0.06)"
        />
        <path
          d="M21.5 11.2c-.6-1.8-2.2-2.9-4.4-2.9-2.8 0-4.6 1.5-4.6 3.5 0 1.9 1.3 2.9 4.2 3.5l1.4.3c2.1.5 3.1 1.2 3.1 2.6 0 1.6-1.5 2.7-3.7 2.7-2.1 0-3.6-1-4.3-2.7"
          stroke={`url(#s-${uid})`}
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
