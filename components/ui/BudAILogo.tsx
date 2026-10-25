"use client";

import { useEffect, useId, useRef } from "react";
import Wordmark from "./BudAIWordmark";
import { BUDAI_BRAND, BUDAI_MARK_PATH, BUDAI_SIGNAL_PATHS } from "@/lib/brand";

import { observeMark } from "@/lib/experience/mark-motion";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
const SIZES: Record<Size, number> = { xs: 28, sm: 42, md: 48, lg: 76, xl: 120, hero: 220 };

/** Confluence: two continuous ribbons and one shared intelligence cell. */
export default function BudAILogo({ size = "sm", className = "", animated = true, interactive = false, onClick, label = "BudAI", variant = "dark", mode = "idle" }: {
  size?: Size;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  label?: string;
  variant?: "dark" | "light";
  mode?: "idle" | "thinking";
}) {
  const ref = useRef<HTMLButtonElement & HTMLSpanElement>(null);
  useEffect(() => animated && ref.current ? observeMark(ref.current) : undefined, [animated]);
  const Tag = interactive || onClick ? "button" : "span";
  const px = SIZES[size];
  return (
    <Tag ref={ref} type={Tag === "button" ? "button" : undefined} role={Tag === "span" ? "img" : undefined} onClick={onClick} aria-label={label}
      data-budai-mark="confluence" data-mode={mode} data-variant={variant} data-animated={animated}
      className={`budai-mark relative inline-flex shrink-0 items-center justify-center ${animated ? "budai-mark-living" : ""} ${Tag === "button" ? "rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan" : ""} ${className}`}
      style={{ width: px, height: px, color: variant === "light" ? BUDAI_BRAND.ink : BUDAI_BRAND.light }}>
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-full w-full" aria-hidden="true">
        <path data-mark-body d={BUDAI_MARK_PATH} fillRule="nonzero" />
        {animated && <g className="confluence-signal" fill="none" stroke="currentColor" strokeWidth=".95" strokeLinecap="round">
          {BUDAI_SIGNAL_PATHS.map((path,i)=><path key={path} d={path} pathLength="100" className={`confluence-trace confluence-trace-${i}`} />)}
          <path className="confluence-cell" d="M14.2 15L16 14L17.8 15V17L16 18L14.2 17Z" fill="currentColor" stroke="none" />
        </g>}
      </svg>
    </Tag>
  );
}

/** Compatibility lockup for existing consumers of the original named export. */
export function BudAIWordmark({ size = "sm", className = "", animated = true, variant = "dark" }: { size?: Size; className?: string; animated?: boolean; variant?: "dark" | "light" }) {
  return <span className={`inline-flex items-center gap-2.5 ${className}`}><BudAILogo size={size} animated={animated} variant={variant} /><Wordmark className={`${size === "xs" || size === "sm" ? "text-[15px]" : size === "md" ? "text-base" : "text-xl"} ${variant === "light" ? "text-slate-900" : "text-white"}`} /></span>;
}

// The Stilledev identity and attribution below are deliberately unchanged.
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
