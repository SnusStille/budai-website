"use client";

import { useId, type CSSProperties } from "react";

/* ────────────────────────────────────────────────────────────────
   BudAI · "B-mark" — the mark
   ────────────────────────────────────────────────────────────────
   One letterform, built from a stem and two arcs, with the light of
   the product running through it: the upper bowl is cyan, the lower
   violet, and a single node rides a thin orbit around the counter —
   the AI signal. Nothing else. It reads at 16px, it reads at 260px,
   and it works in one flat colour. Chosen in the Logo Lab (see
   /logo); the Lattice and the other challengers stay there.
   Built from inline SVG + CSS so it stays vector-crisp from favicon
   to hero stage, with zero external assets and zero layout shift.

   Motion is throttled by a single variable (--logo-tempo) so the
   mark can idle, think, or flare without re-rendering a frame of JS.
   ──────────────────────────────────────────────────────────────── */

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
export type LogoVariant = "dark" | "light" | "mono";
export type LogoMotion = "idle" | "thinking" | "alert";

const SIZES: Record<LogoSize, number> = {
  xs: 26,
  sm: 40,
  md: 56,
  lg: 88,
  xl: 140,
  hero: 260,
};

/* the two bowls of the mark, in the 64×64 viewBox — one source of truth */
const B_STEM_X = 21;
const B_TOP = 13;
const B_BOTTOM = 51;
const B_JOIN = 32;
const B_UPPER_R = 11.5;
const B_LOWER_R = 11.5;

type LogoProps = {
  size?: LogoSize;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  label?: string;
  variant?: LogoVariant;
  motion?: LogoMotion;
};

export default function BudAILogo({
  size = "sm",
  className = "",
  animated = true,
  interactive = false,
  onClick,
  label = "BudAI",
  variant = "dark",
  motion = "idle",
}: LogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const px = SIZES[size];
  const rich = px >= 52; // full 3D scene only where it can breathe
  const tiny = px <= 30; // favicon-grade: strip to the essentials
  const light = variant === "light";
  const mono = variant === "mono";
  const clickable = interactive || Boolean(onClick);
  const Tag = clickable ? "button" : "div";

  const tempo = !animated ? 0 : motion === "thinking" ? 2.6 : motion === "alert" ? 4 : 1;

  return (
    <Tag
      {...(clickable ? { type: "button" as const, onClick } : {})}
      aria-label={clickable ? label : undefined}
      aria-hidden={clickable ? undefined : true}
      data-motion={animated ? motion : "static"}
      data-boot={animated && rich ? "on" : "off"}
      className={`budai-logo ${rich ? "budai-logo--rich" : ""} ${
        tiny ? "budai-logo--tiny" : ""
      } ${light ? "budai-logo--light" : ""} ${mono ? "budai-logo--mono" : ""} ${
        clickable ? "budai-logo--interactive" : ""
      } ${className}`}
      style={
        {
          "--logo-size": `${px}px`,
          "--logo-tempo": tempo,
        } as CSSProperties
      }
    >
      {/* ambient bloom */}
      {!mono && <span className="budai-halo" aria-hidden />}

      {/* the mark — one B, two arcs, one node in orbit */}
      <svg viewBox="0 0 64 64" className="budai-gem" fill="none" aria-hidden>
        <defs>
          <linearGradient id={`bud-frame-${uid}`} x1="14" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={light ? "#0e7490" : "#8ef0e2"} />
            <stop offset="46%" stopColor={light ? "#0d9488" : "#3ee0cd"} />
            <stop offset="100%" stopColor={light ? "#4338ca" : "#9a86ff"} />
          </linearGradient>
          <linearGradient id={`bud-stem-${uid}`} x1="21" y1="13" x2="21" y2="51" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={light ? "#0f172a" : "#ffffff"} />
            <stop offset="55%" stopColor={light ? "#1e293b" : "#e8fffd"} />
            <stop offset="100%" stopColor={light ? "#312e81" : "#c9c2ff"} />
          </linearGradient>
          <radialGradient id={`bud-node-${uid}`} cx="40%" cy="36%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor={light ? "#22d3ee" : "#9df6ea"} />
            <stop offset="100%" stopColor={light ? "#0e7490" : "#3ee0cd"} />
          </radialGradient>
          <filter id={`bud-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`bud-soft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
        </defs>

        {/* orbit — slides in as the mark thinks, gone when it is tiny */}
        {!tiny && (
          <g className="budai-orbit-arc">
            <ellipse
              className={animated ? "budai-b-ring" : undefined}
              cx="33"
              cy="32"
              rx="26"
              ry="24"
              stroke={`url(#bud-frame-${uid})`}
              strokeWidth="0.7"
              strokeDasharray="34 118"
              opacity="0.5"
              style={{ transformOrigin: "33px 32px" }}
            />
            <circle
              className={animated ? "budai-b-node" : undefined}
              cx="59"
              cy="26"
              r={rich ? 3.1 : 2.6}
              fill={`url(#bud-node-${uid})`}
              filter={rich ? `url(#bud-glow-${uid})` : undefined}
            />
          </g>
        )}

        {/* the stem — the spine of the letter */}
        <path
          className={animated ? "budai-b-stem" : undefined}
          d={`M${B_STEM_X} ${B_TOP} V${B_BOTTOM}`}
          stroke={`url(#bud-stem-${uid})`}
          strokeWidth="6.2"
          strokeLinecap="round"
        />

        {/* upper bowl — cyan light */}
        <path
          className={animated ? "budai-b-bowl" : undefined}
          d={`M${B_STEM_X} ${B_TOP} H${B_STEM_X + 11.5} a${B_UPPER_R} ${B_UPPER_R} 0 0 1 0 ${B_UPPER_R * 2} H${B_STEM_X}`}
          stroke={`url(#bud-frame-${uid})`}
          strokeWidth="6.2"
          strokeLinecap="round"
        />

        {/* lower bowl — violet light */}
        <path
          className={animated ? "budai-b-bowl budai-b-bowl--lower" : undefined}
          d={`M${B_STEM_X} ${B_JOIN} H${B_STEM_X + 11.5} a${B_LOWER_R} ${B_LOWER_R} 0 0 1 0 ${B_LOWER_R * 2} H${B_STEM_X}`}
          stroke={`url(#bud-frame-${uid})`}
          strokeWidth="6.2"
          strokeLinecap="round"
          opacity="0.92"
        />

        {/* the core glint sits where the two bowls meet */}
        {!tiny && (
          <circle
            className={animated ? "budai-b-core" : undefined}
            cx={B_STEM_X + 12}
            cy={B_JOIN}
            r={rich ? 3.4 : 2.8}
            fill={`url(#bud-node-${uid})`}
            filter={rich ? `url(#bud-glow-${uid})` : undefined}
          />
        )}

        {/* ground shadow, only where there is room */}
        {rich && (
          <ellipse
            className="budai-ao"
            cx="30"
            cy="56.5"
            rx="14"
            ry="2.6"
            fill={light ? "rgba(15,23,42,0.14)" : "rgba(0,0,0,0.45)"}
            filter={`url(#bud-soft-${uid})`}
          />
        )}
      </svg>

      {/* glass sheen sweeping across the prism */}
      {rich && !mono && <span className="budai-sheen" aria-hidden />}

      {/* satellites in front of the glass for depth */}
      {rich && (
        <span className="budai-front" aria-hidden>
          <span className="budai-mote budai-mote--a" />
          <span className="budai-mote budai-mote--b" />
          <span className="budai-mote budai-mote--c" />
        </span>
      )}
    </Tag>
  );
}

/* ── Wordmark ─────────────────────────────────────────────── */

export function BudAIWordmark({
  size = "sm",
  className = "",
  animated = true,
  variant = "dark",
  motion = "idle",
  showBy = false,
}: {
  size?: LogoSize;
  className?: string;
  animated?: boolean;
  variant?: LogoVariant;
  motion?: LogoMotion;
  showBy?: boolean;
}) {
  const text =
    size === "xs" || size === "sm"
      ? "text-[16px]"
      : size === "md"
        ? "text-[19px]"
        : size === "lg"
          ? "text-2xl"
          : "text-3xl";
  return (
    <span className={`budai-wordmark inline-flex items-center gap-2.5 ${className}`}>
      <BudAILogo size={size} animated={animated} variant={variant} motion={motion} />
      <span className={`${text} font-extrabold leading-none tracking-[-0.03em] ${variant === "light" ? "text-slate-900" : "text-white"}`}>
        Bud
        <span className={`budai-wordmark-accent ${animated ? "" : "is-static"}`}>AI</span>
      </span>
      {showBy && (
        <span className="ml-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-white/35 sm:inline">
          by Stilledev
        </span>
      )}
    </span>
  );
}

/* ── Stilledev ────────────────────────────────────────────── */

export function StilledevMark({ size = 20, className = "" }: { size?: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id={`sm-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#87e9df" />
            <stop offset="100%" stopColor="#b9a8f6" />
          </linearGradient>
        </defs>
        <path d="M16 1.8 L28.3 8.9 V23.1 L16 30.2 L3.7 23.1 V8.9 Z" stroke={`url(#sm-${uid})`} strokeWidth="1.5" fill="rgba(135,233,223,0.07)" strokeLinejoin="round" />
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
