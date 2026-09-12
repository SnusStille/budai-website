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
 * BudAI mark — "Nodal Live"
 * Alive product icon: rotating arc, pulsing core, orbiting signal bead.
 * Readable at 16px, dramatic at hero. Motion is CSS-only 2D.
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
      {/* Outer glow field */}
      {motion && !light && (
        <>
          <span
            aria-hidden
            className="absolute inset-[-32%] rounded-full pointer-events-none logo-glow-breathe"
            style={{
              background:
                "radial-gradient(circle, rgba(0,229,255,0.55) 0%, rgba(124,58,237,0.22) 40%, transparent 68%)",
              filter: `blur(${isHero ? 22 : isTiny ? 5 : 10}px)`,
              opacity: isHero ? 1 : 0.7,
            }}
          />
          <span
            aria-hidden
            className="absolute inset-[-14%] rounded-full pointer-events-none border border-accent-cyan/25 logo-pulse-ring"
          />
          {isHero && (
            <span
              aria-hidden
              className="absolute inset-[-22%] rounded-full pointer-events-none border border-dashed border-accent-purple/20 logo-ambient-spin"
            />
          )}
        </>
      )}

      <span
        className={`relative z-[1] w-full h-full rounded-full overflow-hidden ${
          motion ? "logo-mark-breathe" : ""
        } ${interactive || onClick ? "transition-transform duration-300 group-hover/logo:scale-105 group-active/logo:scale-95" : ""}`}
        style={
          {
            background: light
              ? "radial-gradient(circle at 30% 26%, #fff 0%, #f1f5f9 50%, #e2e8f0 100%)"
              : "radial-gradient(circle at 30% 26%, #1e3a5f 0%, #0c1424 48%, #05070e 100%)",
            border: light
              ? "1px solid rgba(15,23,42,0.12)"
              : "1px solid rgba(255,255,255,0.16)",
            boxShadow: light
              ? "0 4px 20px rgba(15,23,42,0.12), inset 0 1px 0 #fff"
              : isHero
                ? "0 0 60px rgba(0,229,255,0.35), 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.25)"
                : "0 0 20px rgba(0,229,255,0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
          } as CSSProperties
        }
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={`lv-r-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={light ? "#0e7490" : "#e8ffff"} />
              <stop offset="45%" stopColor={light ? "#06b6d4" : "#22d3ee"} />
              <stop offset="100%" stopColor={light ? "#6366f1" : "#a78bfa"} />
            </linearGradient>
            <radialGradient id={`lv-c-${uid}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#ecfeff" />
              <stop offset="55%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#6366f1" />
            </radialGradient>
            <linearGradient id={`lv-a-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.35" />
            </linearGradient>
            <filter id={`lv-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Soft wash */}
          <circle
            cx="32"
            cy="32"
            r="22"
            fill={light ? "rgba(6,182,212,0.08)" : "rgba(0,229,255,0.12)"}
          />

          {/* Rotating dashed outer ring */}
          <g
            className={motion ? "logo-ambient-spin" : undefined}
            style={motion ? ({ transformOrigin: "32px 32px", animationDuration: "10s" } as CSSProperties) : undefined}
          >
            <circle
              cx="32"
              cy="32"
              r="25"
              fill="none"
              stroke={`url(#lv-r-${uid})`}
              strokeWidth="1.4"
              strokeDasharray="4 6"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>

          {/* Solid brand ring */}
          <circle
            cx="32"
            cy="32"
            r="21.5"
            fill="none"
            stroke={`url(#lv-r-${uid})`}
            strokeWidth={isHero ? 2 : 1.7}
            opacity="0.95"
          />

          {/* Dialogue arcs — slow counter-rotate */}
          <g
            className={motion ? "logo-orbit-2d" : undefined}
            style={
              motion
                ? ({
                    transformOrigin: "32px 32px",
                    animationDuration: isHero ? "10s" : "14s",
                    animationDirection: "reverse",
                  } as CSSProperties)
                : undefined
            }
          >
            <path
              d="M17 32c0-8.2 6.8-14.8 15-14.8"
              fill="none"
              stroke={`url(#lv-a-${uid})`}
              strokeWidth="2.4"
              strokeLinecap="round"
              filter={motion ? `url(#lv-glow-${uid})` : undefined}
            />
            <path
              d="M47 32c0 8.2-6.8 14.8-15 14.8"
              fill="none"
              stroke={`url(#lv-a-${uid})`}
              strokeWidth="2.4"
              strokeLinecap="round"
              filter={motion ? `url(#lv-glow-${uid})` : undefined}
            />
          </g>

          {/* Orbiting signal bead */}
          <g
            className={motion ? "logo-orbit-2d" : undefined}
            style={
              motion
                ? ({ transformOrigin: "32px 32px", animationDuration: isHero ? "4.5s" : "6s" } as CSSProperties)
                : undefined
            }
          >
            <circle cx="32" cy="7.5" r="3" fill={`url(#lv-r-${uid})`} filter={motion ? `url(#lv-glow-${uid})` : undefined} />
            <circle cx="32" cy="7.5" r="1.35" fill="#fff" />
          </g>

          {/* Core — pulse */}
          <circle
            cx="32"
            cy="32"
            r="9"
            fill={`url(#lv-c-${uid})`}
            className={motion ? "logo-core-pulse" : undefined}
            style={motion ? ({ transformOrigin: "32px 32px" } as CSSProperties) : undefined}
          />
          <circle
            cx="32"
            cy="32"
            r="9"
            fill="none"
            stroke="#fff"
            strokeWidth="0.7"
            opacity="0.4"
          />
          <circle cx="28.8" cy="28.8" r="2.6" fill="#fff" opacity={light ? 0.8 : 0.6} />

          {/* Secondary micro nodes */}
          <circle cx="48" cy="40" r="1.4" fill="#a5f3fc" opacity="0.7" className={motion ? "logo-float-mote" : undefined} />
          <circle cx="16" cy="38" r="1.15" fill="#c4b5fd" opacity="0.65" className={motion ? "logo-float-mote" : undefined} style={motion ? { animationDelay: "1.2s" } as CSSProperties : undefined} />
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
        <circle cx="16" cy="16" r="14.5" stroke={`url(#sm-${uid})`} strokeWidth="1.5" fill="rgba(0,229,255,0.06)" />
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
