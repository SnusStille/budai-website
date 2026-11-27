"use client";

import { STILLEDEV_PRIMARY_PATH, STILLEDEV_CELL_PATH, STILLEDEV_BRAND } from "@/lib/stilledev-brand";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
const SIZES: Record<Size, number> = { xs: 20, sm: 28, md: 36, lg: 48, xl: 72 };

/**
 * Stilledev Sigil — the primary brand mark.
 *
 * A minimalist geometric "S" formed by two precision strokes that converge
 * at a faceted luminous cell in the center. No generic AI symbology — just
 * sharp lines, intentional negative space, and a quiet signal of craft.
 */
export default function StilledevLogo({
  size = "sm",
  className = "",
  animated = false,
  variant = "dark",
}: {
  size?: Size;
  className?: string;
  animated?: boolean;
  variant?: "dark" | "light";
}) {
  const px = SIZES[size];
  const color = variant === "light" ? "#0a0a0f" : "#e8eaed";
  const accent = variant === "light" ? "#0088aa" : STILLEDEV_BRAND.primary;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Soft glow behind mark */}
        <defs>
          <radialGradient id="stilledev-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="17" cy="16" r="14" fill="url(#stilledev-glow)" />

        {/* Main S-stroke — upper arc */}
        <path
          d="M7 10C7 7.8 8.8 6 11 6H21C23.2 6 25 7.8 25 10V12.5C25 13.9 23.9 15 22.5 15.3L13 17.7C11.4 18.1 10.3 19.4 10.3 21V22C10.3 24.2 8.5 26 6.3 26"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
          className={animated ? "stilledev-stroke-upper" : ""}
        />

        {/* Convergence cell */}
        <path
          d={STILLEDEV_CELL_PATH}
          fill={accent}
          opacity="0.85"
          className={animated ? "stilledev-cell" : ""}
        />

        {/* Lower arc — subtle connection */}
        <path
          d="M25 22C25 24.2 23.2 26 21 26H11"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
          className={animated ? "stilledev-stroke-lower" : ""}
        />
      </svg>
    </span>
  );
}

/**
 * Oliver Stille wordmark — typographic signature lockup.
 * Used when the brand appears as a personal name.
 */
export function OliverStilleWordmark({
  size = "md",
  className = "",
  variant = "dark",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "dark" | "light";
}) {
  const color = variant === "light" ? "#0a0a0f" : "#ffffff";
  const mutedColor = variant === "light" ? "#555555" : "rgba(255,255,255,0.45)";
  const fontScale = size === "sm" ? 13 : size === "lg" ? 18 : 15;

  return (
    <span className={`inline-flex items-baseline gap-2.5 ${className}`}>
      <StilledevLogo size={size === "sm" ? "xs" : size === "lg" ? "md" : "sm"} variant={variant} />
      <span className="flex flex-col leading-none" style={{ color }}>
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: fontScale, letterSpacing: "-0.02em" }}
        >
          Oliver<span className="text-accent-cyan">.</span>Stille
        </span>
        {size !== "sm" && (
          <span
            className="mt-1 font-mono text-[9px] uppercase"
            style={{ color: mutedColor, letterSpacing: "0.16em" }}
          >
            INDEPENDENT · STOCKHOLM
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Stilledev Labs wordmark — used in the Labs chat interface.
 */
export function StilledevLabsWordmark({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const color = variant === "light" ? "#0a0a0f" : "#ffffff";
  const subColor = variant === "light" ? "#555" : "rgba(255,255,255,0.38)";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <StilledevLogo size="sm" variant={variant} />
      <span className="flex flex-col leading-none">
        <span
          className="text-[14px] font-semibold"
          style={{ color, letterSpacing: "-0.01em" }}
        >
          Stilledev<span className="text-accent-cyan">.</span>Labs
        </span>
        <span
          className="mt-1 font-mono text-[9px] uppercase"
          style={{ color: subColor, letterSpacing: "0.14em" }}
        >
          Project Intelligence
        </span>
      </span>
    </span>
  );
}
