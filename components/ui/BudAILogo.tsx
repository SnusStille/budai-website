"use client";
import { useId } from "react";
const sizes = { xs: 28, sm: 38, md: 48, lg: 76, xl: 120, hero: 220 };
/** Open B / branching code: a single recognizable silhouette, with a living cursor. */
export default function BudAILogo({
  size = "sm",
  className = "",
  animated = true,
  interactive = false,
  onClick,
  label = "BudAI",
  variant = "dark",
}: {
  size?: keyof typeof sizes;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  label?: string;
  variant?: "dark" | "light";
}) {
  const id = useId().replace(/:/g, "");
  const mark = (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="h-full w-full"
    >
      <defs>
        <linearGradient
          id={id}
          x1="12"
          y1="8"
          x2="52"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={variant === "light" ? "#087d8c" : "#bbfff4"} />
          <stop
            offset="1"
            stopColor={variant === "light" ? "#086a86" : "#46cbd5"}
          />
        </linearGradient>
      </defs>
      <path
        d="M23 10H37L50 21L37 32H25M37 32L51 43L37 54H23V40M14 18L5 27L14 36"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 10V24"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        className={animated ? "brand-cursor" : ""}
        cx="23"
        cy="32"
        r="3"
        fill={variant === "light" ? "#086a86" : "#e4fffb"}
      />
    </svg>
  );
  return interactive || onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`brand-mark inline-flex shrink-0 ${className}`}
      style={{ width: sizes[size], height: sizes[size] }}
    >
      {mark}
    </button>
  ) : (
    <span
      role="img"
      aria-label={label}
      className={`brand-mark inline-flex shrink-0 ${className}`}
      style={{ width: sizes[size], height: sizes[size] }}
    >
      {mark}
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
