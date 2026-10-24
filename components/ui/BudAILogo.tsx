"use client";

import { useId } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
type Variant = "dark" | "light";

const SIZES: Record<Size, number> = { xs: 28, sm: 42, md: 48, lg: 76, xl: 120, hero: 220 };

/**
 * BudAI's signal mark: one quiet orbit, one connected core. The previous mark
 * animated multiple SVG filters, gradients and paths simultaneously; this
 * version keeps one light rotating orbit and one soft pulse (CSS only).
 */
export default function BudAILogo({
  size = "sm",
  className = "",
  animated = true,
  interactive = false,
  onClick,
  label = "BudAI",
  variant = "dark",
  mode = "idle",
}: {
  mode?: "idle" | "thinking";
  size?: Size;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  label?: string;
  variant?: Variant;
}) {
  const uid = useId().replace(/:/g, "");
  const gradient = `bud-signal-${uid}`;
  const Tag = interactive || onClick ? "button" : "span";
  const cyan = variant === "light" ? "#0891b2" : "#00e5ff";

  return (
    <Tag
      {...(Tag === "button" ? { type: "button" as const } : {})}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex shrink-0 items-center justify-center ${
        interactive || onClick
          ? "cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          : ""
      } ${className}`}
      style={{ width: SIZES[size], height: SIZES[size] }}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={`h-full w-full overflow-visible ${animated ? "bud-signal-mark" : ""} ${mode === "thinking" ? "bud-signal-thinking" : ""}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradient} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor={cyan} />
            <stop offset="1" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="12.6" stroke={`url(#${gradient})`} strokeWidth="0.85" opacity="0.28" />
        <g className={animated ? "bud-signal-orbit" : undefined}>
          <circle cx="16" cy="3.4" r="1.1" fill={cyan} />
          <path d="M16 3.4a12.6 12.6 0 0 1 8.9 3.7" stroke={`url(#${gradient})`} strokeWidth="1.15" strokeLinecap="round" opacity="0.8" />
        </g>
        <path d="M8.5 16h4M19.5 16h4M12.5 12l3.5 4 3.5-4M12.5 20l3.5-4 3.5 4" stroke={`url(#${gradient})`} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
        <circle cx="16" cy="16" r="3.2" fill={`url(#${gradient})`} className={animated ? "bud-signal-core" : undefined} />
        <circle cx="16" cy="16" r="1.15" fill="white" opacity="0.92" />
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
  const textSize = size === "xs" || size === "sm"
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

export function StilledevMark({ size = 20, className = "" }: { size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 32 32" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id={`sm-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14.5" stroke={`url(#sm-${uid})`} strokeWidth="1.5" fill="rgba(0,229,255,0.06)" />
        <path d="M21.5 11.2c-.6-1.8-2.2-2.9-4.4-2.9-2.8 0-4.6 1.5-4.6 3.5 0 1.9 1.3 2.9 4.2 3.5l1.4.3c2.1.5 3.1 1.2 3.1 2.6 0 1.6-1.5 2.7-3.7 2.7-2.1 0-3.6-1-4.3-2.7" stroke={`url(#sm-${uid})`} strokeWidth="2.2" strokeLinecap="round" />
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
    <a href="https://discord.com/users/353944097301594123" target="_blank" rel="noopener noreferrer" className={`group relative inline-flex items-center gap-1.5 font-medium text-accent-cyan transition-colors duration-300 hover:text-white ${className}`}>
      {showMark && <StilledevMark size={16} />}
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent-cyan transition-all duration-300 group-hover:w-full" />
      </span>
    </a>
  );
}
