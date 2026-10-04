"use client";

import { useId } from "react";

/**
 * BudAI · "Signal B"
 *
 * One unbroken line: it rises from a base node, folds into the two bowls of a B,
 * and opens at the top like a bud breaking — the mark is BudAI growing in public.
 * Nodes at every turn are the network; the light that travels the line is the AI at work.
 *
 * Concept notes (kept deliberately, so the mark is never redrawn by accident):
 *  - reads as a B down to 16px (favicon) — straight stem, two distinct bowls
 *  - one continuous stroke: a single line, like one continuous conversation
 *  - open ends + nodes: "still growing", never a closed, finished shape
 *  - animates with stroke-dashoffset + transform only (cheap, GPU friendly)
 */

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
export type LogoVariant = "dark" | "light" | "mono";
export type LogoMotion = "idle" | "thinking" | "alert" | "static";

const SIZES: Record<LogoSize, number> = {
  xs: 18,
  sm: 26,
  md: 40,
  lg: 64,
  xl: 108,
  hero: 180,
};

/** The mark itself: one path, four nodes. Everything else is presentation. */
const SIGNAL_PATH =
  "M16 40 V10 C23.2 8 29 11.2 29.8 16.4 C30.6 21.6 26.4 24.6 20 25 C28.2 25.4 33 29 33 33.8 C33 38 28 40.2 22.4 40";

const NODES: Array<[number, number]> = [
  [16, 10],
  [20, 25],
  [22.4, 40],
  [16, 40],
];

const PALETTE: Record<LogoVariant, { a: string; b: string; c: string; node: string }> = {
  dark: { a: "#22d3ee", b: "#818cf8", c: "#f0abfc", node: "#e0e7ff" },
  light: { a: "#0891b2", b: "#6d28d9", c: "#c026d3", node: "#4c1d95" },
  mono: { a: "currentColor", b: "currentColor", c: "currentColor", node: "currentColor" },
};

interface BudAILogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  /** `thinking` speeds up the light and the nodes — used while BudAI generates. */
  motion?: LogoMotion;
  /** CSS entrance: the line draws itself, then the nodes light up. */
  boot?: boolean;
  interactive?: boolean;
  /** Kept for API compatibility: `animated` = motion on/off. */
  animated?: boolean;
  className?: string;
  title?: string;
}

export default function BudAILogo({
  size = "md",
  variant = "dark",
  motion = "idle",
  boot = false,
  interactive = false,
  animated = true,
  className = "",
  title,
}: BudAILogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `budai-grad-${uid}`;
  const glowId = `budai-glow-${uid}`;
  const px = SIZES[size];
  const palette = PALETTE[variant];
  const effectiveMotion = animated ? motion : "static";

  return (
    <span
      className={`budai-logo budai-logo--${variant} ${interactive ? "budai-logo--interactive" : ""} ${
        boot ? "budai-logo--boot" : ""
      } ${className}`}
      data-motion={effectiveMotion}
      data-size={size}
      style={{ ["--budai-size" as string]: `${px}px` }}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <svg viewBox="0 0 48 48" width={px} height={px} className="budai-logo-svg" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="6" y1="44" x2="42" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={palette.a} />
            <stop offset="52%" stopColor={palette.b} />
            <stop offset="100%" stopColor={palette.c} />
          </linearGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
            </feMerge>
          </filter>
        </defs>

        {/* soft aura behind the mark — breathes, never moves */}
        <path
          d={SIGNAL_PATH}
          stroke={`url(#${gradId})`}
          strokeWidth="4.4"
          strokeLinecap="round"
          opacity="0.22"
          filter={`url(#${glowId})`}
          className="budai-logo-aura"
        />

        {/* the line itself */}
        <path
          d={SIGNAL_PATH}
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="budai-logo-line"
        />

        {/* the light that travels the line while BudAI works */}
        <path
          d={SIGNAL_PATH}
          stroke={palette.node}
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="budai-logo-scan"
          pathLength={100}
        />

        {/* nodes: the network at every turn */}
        <g className="budai-logo-nodes">
          {NODES.map(([cx, cy], i) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={i === 0 ? 2.1 : 1.75}
              fill={palette.node}
              className="budai-logo-node"
              style={{ animationDelay: `${i * 0.32}s` }}
            />
          ))}
        </g>
      </svg>
      <span className="budai-logo-ring" aria-hidden />
    </span>
  );
}

/** Mark + wordmark, for places that can afford the full lockup. */
export function BudAIWordmark({
  size = "md",
  variant = "dark",
  motion = "idle",
  animated = true,
  interactive = false,
  className = "",
}: Omit<BudAILogoProps, "title">) {
  return (
    <span className={`budai-lockup ${className}`}>
      <BudAILogo
        size={size}
        variant={variant}
        motion={motion}
        animated={animated}
        interactive={interactive}
        title="BudAI"
      />
      <span className="budai-wordmark">
        Bud<span className="budai-wordmark-accent">AI</span>
      </span>
    </span>
  );
}

/** Stilledev's own quiet mark — a monogram, intentionally smaller in voice than BudAI. */
export function StilledevMark({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      role="img"
      aria-label="Stilledev"
    >
      <rect x="3" y="3" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
      <path d="M9 8.5h6M12 8.5V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
