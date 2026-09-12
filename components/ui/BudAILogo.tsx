"use client";

import { useId, type CSSProperties } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
type Variant = "dark" | "light";

const SIZES: Record<Size, number> = {
  xs: 28,
  sm: 38,
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
  const isHero = size === "hero" || size === "xl";
  const isTiny = size === "xs" || size === "sm";
  const light = variant === "light";
  const motion = animated;
  const Tag = interactive || onClick ? "button" : "div";

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center shrink-0 group/logo ${
        interactive || onClick
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 rounded-full"
          : ""
      } ${className}`}
      style={{ width: px, height: px }}
    >
      {/* Ambient field — only when motion + dark */}
      {motion && !light && (
        <>
          <span
            aria-hidden
            className="absolute inset-[-36%] rounded-full pointer-events-none logo-glow-breathe"
            style={{
              background:
                "radial-gradient(circle, rgba(0,229,255,0.5) 0%, rgba(124,58,237,0.18) 42%, transparent 70%)",
              filter: `blur(${isHero ? 24 : isTiny ? 6 : 12}px)`,
              opacity: isHero ? 0.95 : 0.65,
            }}
          />
          <span
            aria-hidden
            className="absolute inset-[-16%] rounded-full pointer-events-none border border-accent-cyan/30 logo-pulse-ring"
          />
          {isHero && (
            <span
              aria-hidden
              className="absolute inset-[-26%] rounded-full pointer-events-none border border-dashed border-accent-purple/25 logo-ambient-spin"
            />
          )}
        </>
      )}

      <span
        className={`relative z-[1] w-full h-full rounded-full overflow-hidden ${
          motion ? "logo-mark-breathe" : ""
        } ${
          interactive || onClick
            ? "transition-transform duration-300 group-hover/logo:scale-[1.06] group-active/logo:scale-95"
            : ""
        }`}
        style={
          {
            background: light
              ? "radial-gradient(circle at 32% 28%, #ffffff 0%, #f1f5f9 48%, #e2e8f0 100%)"
              : "radial-gradient(circle at 32% 28%, #1a3358 0%, #0a1220 46%, #03050a 100%)",
            border: light
              ? "1px solid rgba(15,23,42,0.12)"
              : "1px solid rgba(255,255,255,0.18)",
            boxShadow: light
              ? "0 4px 20px rgba(15,23,42,0.12), inset 0 1px 0 #fff"
              : isHero
                ? "0 0 70px rgba(0,229,255,0.38), 0 0 2px rgba(255,255,255,0.35), inset 0 1px 0 rgba(255,255,255,0.28)"
                : "0 0 22px rgba(0,229,255,0.3), inset 0 1px 0 rgba(255,255,255,0.22)",
          } as CSSProperties
        }
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={`sc-ring-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={light ? "#0891b2" : "#f0fdff"} />
              <stop offset="40%" stopColor={light ? "#06b6d4" : "#22d3ee"} />
              <stop offset="100%" stopColor={light ? "#7c3aed" : "#a78bfa"} />
            </linearGradient>
            <linearGradient id={`sc-arc-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id={`sc-core-${uid}`} cx="34%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="22%" stopColor="#ecfeff" />
              <stop offset="55%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#6366f1" />
            </radialGradient>
            <radialGradient id={`sc-wash-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={light ? "rgba(6,182,212,0.14)" : "rgba(0,229,255,0.2)"} />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <filter id={`sc-glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Soft inner wash */}
          <circle cx="32" cy="32" r="23" fill={`url(#sc-wash-${uid})`} />

          {/* Track ring (static precision) */}
          <circle
            cx="32"
            cy="32"
            r="24.2"
            fill="none"
            stroke={light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.07)"}
            strokeWidth="0.8"
          />

          {/* Rotating dashed telemetry ring */}
          <g
            className={motion ? "logo-ambient-spin" : undefined}
            style={
              motion
                ? ({ transformOrigin: "32px 32px", animationDuration: isHero ? "14s" : "11s" } as CSSProperties)
                : undefined
            }
          >
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke={`url(#sc-ring-${uid})`}
              strokeWidth="1.35"
              strokeDasharray="2.2 5.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* Primary brand ring */}
          <circle
            cx="32"
            cy="32"
            r="21.2"
            fill="none"
            stroke={`url(#sc-ring-${uid})`}
            strokeWidth={isHero ? 2.15 : 1.85}
            opacity="0.98"
          />

          {/* Counter-rotating dialogue arc (single clean sweep) */}
          <g
            className={motion ? "logo-orbit-2d" : undefined}
            style={
              motion
                ? ({
                    transformOrigin: "32px 32px",
                    animationDuration: isHero ? "11s" : "15s",
                    animationDirection: "reverse",
                  } as CSSProperties)
                : undefined
            }
          >
            <path
              d="M18.5 32 A13.5 13.5 0 0 1 45.5 32"
              fill="none"
              stroke={`url(#sc-arc-${uid})`}
              strokeWidth="2.6"
              strokeLinecap="round"
              filter={motion ? `url(#sc-glow-${uid})` : undefined}
            />
            {/* subtle second arc opposite */}
            <path
              d="M45.5 32 A13.5 13.5 0 0 1 18.5 32"
              fill="none"
              stroke={light ? "rgba(99,102,241,0.35)" : "rgba(167,139,250,0.45)"}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="3 10"
              opacity="0.85"
            />
          </g>

          {/* Orbiting live signal bead */}
          <g
            className={motion ? "logo-orbit-2d" : undefined}
            style={
              motion
                ? ({
                    transformOrigin: "32px 32px",
                    animationDuration: isHero ? "4.2s" : "5.8s",
                  } as CSSProperties)
                : undefined
            }
          >
            <circle
              cx="32"
              cy="6.8"
              r="3.35"
              fill={`url(#sc-ring-${uid})`}
              filter={motion ? `url(#sc-glow-${uid})` : undefined}
            />
            <circle cx="32" cy="6.8" r="1.45" fill="#fff" />
            {/* faint trail */}
            <circle cx="32" cy="6.8" r="5.2" fill="none" stroke="#22d3ee" strokeWidth="0.6" opacity="0.35" />
          </g>

          {/* Core — the product heart */}
          <circle
            cx="32"
            cy="32"
            r="10"
            fill={`url(#sc-core-${uid})`}
            className={motion ? "logo-core-pulse" : undefined}
            style={motion ? ({ transformOrigin: "32px 32px" } as CSSProperties) : undefined}
            filter={motion ? `url(#sc-glow-${uid})` : undefined}
          />
          <circle cx="32" cy="32" r="10" fill="none" stroke="#fff" strokeWidth="0.75" opacity="0.42" />
          {/* Specular highlight */}
          <circle cx="28.2" cy="28.4" r="2.9" fill="#fff" opacity={light ? 0.85 : 0.62} />
          {/* Inner focus dot */}
          <circle cx="33.6" cy="34.2" r="1.15" fill="#0e7490" opacity="0.35" />

          {/* Three micro-nodes — constellation, not clutter */}
          <circle
            cx="47.5"
            cy="38.5"
            r="1.45"
            fill="#a5f3fc"
            opacity="0.8"
            className={motion ? "logo-float-mote" : undefined}
          />
          <circle
            cx="16.2"
            cy="36.8"
            r="1.2"
            fill="#c4b5fd"
            opacity="0.72"
            className={motion ? "logo-float-mote" : undefined}
            style={motion ? ({ animationDelay: "0.9s" } as CSSProperties) : undefined}
          />
          <circle
            cx="38.5"
            cy="17.5"
            r="1.05"
            fill="#e0f2fe"
            opacity="0.65"
            className={motion ? "logo-float-mote" : undefined}
            style={motion ? ({ animationDelay: "1.7s" } as CSSProperties) : undefined}
          />
        </svg>
      </span>
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
