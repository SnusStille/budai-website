"use client";

import { useId, type CSSProperties } from "react";

/* ────────────────────────────────────────────────────────────────
   BudAI · "Lattice" — the mark
   ────────────────────────────────────────────────────────────────
   A node lattice: six spokes firing outward from a bright core, a
   ring of twelve satellites, and three orbital shells turning in real
   3D around it with a light sheen sweeping the glass. Chosen in the
   Logo Lab (see /logo) and now the mark everywhere — navbar, footer,
   favicon, OG card, loading screens. Built from CSS transforms +
   inline SVG so it stays vector-crisp from 16px favicon to a hero
   stage, with zero external assets and zero layout shift.

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

/* lattice geometry in the 64×64 viewBox — one source of truth for every size */
const LATTICE_SPOKES: [number, number][] = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI / 3) * i;
  return [
    Number((32 + 18 * Math.cos(angle)).toFixed(2)),
    Number((32 + 18 * Math.sin(angle)).toFixed(2)),
  ];
});

const LATTICE_OUTER: [number, number][] = Array.from({ length: 12 }, (_, i) => {
  const angle = (Math.PI / 6) * i;
  return [
    Number((32 + 27 * Math.cos(angle)).toFixed(2)),
    Number((32 + 27 * Math.sin(angle)).toFixed(2)),
  ];
});

const LATTICE_LINKS: [number, number, number, number][] = LATTICE_OUTER.map(([ox, oy], i) => {
  const [ix, iy] = LATTICE_SPOKES[i % 6];
  return [ox, oy, ix, iy];
});

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

      {/* 3D orbital field */}
      {rich && (
        <span className="budai-scene" aria-hidden>
          <span className="budai-orbit budai-orbit--a">
            <span className="budai-bead budai-bead--a" />
          </span>
          <span className="budai-orbit budai-orbit--b">
            <span className="budai-bead budai-bead--b" />
          </span>
          <span className="budai-orbit budai-orbit--c">
            <span className="budai-bead budai-bead--c" />
          </span>
          <span className="budai-axis" />
        </span>
      )}

      {/* the mark — a live lattice: six spokes, an outer ring of nodes, one bright core */}
      <svg viewBox="0 0 64 64" className="budai-gem" fill="none" aria-hidden>
        <defs>
          <linearGradient id={`bud-frame-${uid}`} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={light ? "#0e7490" : "#d9fffa"} />
            <stop offset="38%" stopColor={light ? "#0891b2" : "#87e9df"} />
            <stop offset="100%" stopColor={light ? "#4338ca" : "#b9a8f6"} />
          </linearGradient>
          <linearGradient id={`bud-edge-${uid}`} x1="12" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={light ? "#7c3aed" : "#b9a8f6"} stopOpacity="0.15" />
            <stop offset="52%" stopColor={light ? "#0891b2" : "#87e9df"} stopOpacity="0.95" />
            <stop offset="100%" stopColor={light ? "#38bdf8" : "#c9f9ff"} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={`bud-glass-${uid}`} x1="18" y1="10" x2="46" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={light ? "#ffffff" : "#9ff3ea"} stopOpacity={light ? 0.9 : 0.18} />
            <stop offset="46%" stopColor={light ? "#e0f2fe" : "#0d1a2b"} stopOpacity={light ? 0.75 : 0.85} />
            <stop offset="100%" stopColor={light ? "#eef2ff" : "#070c16"} stopOpacity={light ? 0.85 : 0.95} />
          </linearGradient>
          <linearGradient id={`bud-depth-${uid}`} x1="20" y1="14" x2="46" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={light ? "#94a3b8" : "#16233a"} />
            <stop offset="100%" stopColor={light ? "#64748b" : "#080c14"} />
          </linearGradient>
          <radialGradient id={`bud-core-${uid}`} cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="26%" stopColor={light ? "#7dd3fc" : "#e8fffd"} />
            <stop offset="62%" stopColor={light ? "#0ea5e9" : "#87e9df"} />
            <stop offset="100%" stopColor={light ? "#4338ca" : "#7c6bf0"} />
          </radialGradient>
          <radialGradient id={`bud-iris-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="72%" stopColor="#87e9df" stopOpacity="0" />
            <stop offset="100%" stopColor="#87e9df" stopOpacity="0.55" />
          </radialGradient>
          <filter id={`bud-glow-${uid}`} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="1.7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`bud-soft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
        </defs>

        {/* extruded volume — a back plate gives the mark real thickness */}
        {rich && (
          <g className="budai-depth">
            <circle cx="34" cy="32" r="27" fill={`url(#bud-depth-${uid})`} opacity={light ? 0.28 : 0.5} />
            <circle cx="32.8" cy="32" r="27" fill={`url(#bud-depth-${uid})`} opacity={light ? 0.45 : 0.85} />
          </g>
        )}

        {/* outer ring of nodes — the lattice reaches wider than the spokes */}
        {!tiny && (
          <circle
            className="budai-lat-ring"
            cx="32"
            cy="32"
            r="27"
            stroke={light ? "rgba(15,23,42,0.18)" : "rgba(255,255,255,0.16)"}
            strokeWidth="0.9"
            style={{ transformOrigin: "32px 32px" }}
          />
        )}

        {/* links from the outer ring in to the six inner nodes */}
        {!tiny && (
          <g className="budai-lat-links" stroke={`url(#bud-edge-${uid})`} strokeWidth="0.7" opacity="0.55">
            {LATTICE_LINKS.map(([ox, oy, ix, iy], index) => (
              <line key={`l-${index}`} x1={ox} y1={oy} x2={ix} y2={iy} />
            ))}
          </g>
        )}

        {/* six spokes — the signal travelling out from the core */}
        <g className="budai-lat-spokes">
          {LATTICE_SPOKES.map(([x, y], index) => (
            <line
              key={`s-${index}`}
              className={animated ? "budai-lat-spoke" : undefined}
              x1="32"
              y1="32"
              x2={x}
              y2={y}
              stroke={`url(#bud-edge-${uid})`}
              strokeWidth={rich ? 1.35 : 1.6}
              strokeLinecap="round"
              style={{ animationDelay: `${(index * 0.16).toFixed(2)}s` }}
            />
          ))}
        </g>

        {/* the six heart nodes */}
        <g filter={rich ? `url(#bud-glow-${uid})` : undefined}>
          {LATTICE_SPOKES.map(([x, y], index) => (
            <circle
              key={`n-${index}`}
              className={animated ? "budai-lat-node" : undefined}
              cx={x}
              cy={y}
              r={rich ? 2.5 : 2.2}
              fill={index % 2 ? `url(#bud-frame-${uid})` : `url(#bud-core-${uid})`}
              style={{ animationDelay: `${(index * 0.22).toFixed(2)}s` }}
            />
          ))}
        </g>

        {/* outer satellites, held back so the core stays the hero */}
        {!tiny && (
          <g className="budai-lat-outer" fill="#ffffff" opacity={light ? 0.5 : 0.6}>
            {LATTICE_OUTER.map(([x, y], index) => (
              <circle
                key={`o-${index}`}
                className={animated ? "budai-lat-sat" : undefined}
                cx={x}
                cy={y}
                r="1.35"
                style={{ animationDelay: `${(index * 0.13).toFixed(2)}s` }}
              />
            ))}
          </g>
        )}

        {/* iris halo behind the core */}
        {!tiny && <circle cx="32" cy="32" r="13.4" fill={`url(#bud-iris-${uid})`} className="budai-iris" />}

        {/* the core */}
        <circle
          className={animated ? "budai-core" : undefined}
          cx="32"
          cy="32"
          r={tiny ? 4.6 : 5.1}
          fill={`url(#bud-core-${uid})`}
          filter={rich ? `url(#bud-glow-${uid})` : undefined}
          style={{ transformOrigin: "32px 32px" }}
        />
        <circle cx="32" cy="32" r={tiny ? 4.6 : 5.1} stroke="#ffffff" strokeOpacity={light ? 0.5 : 0.4} strokeWidth="0.7" />
        {/* specular */}
        <circle cx={30} cy={30.2} r={rich ? 1.7 : 1.4} fill="#ffffff" opacity={light ? 0.9 : 0.68} />

        {/* scanner arc — only in the full scene */}
        {rich && (
          <g className="budai-scanner" style={{ transformOrigin: "32px 32px" }}>
            <path
              d="M32 16.6 A15.4 15.4 0 0 1 47.4 32"
              stroke={`url(#bud-edge-${uid})`}
              strokeWidth="1.5"
              strokeLinecap="round"
              filter={`url(#bud-glow-${uid})`}
            />
          </g>
        )}

        {/* ambient occlusion under the lattice */}
        {rich && (
          <ellipse
            className="budai-ao"
            cx="32"
            cy="55.5"
            rx="14"
            ry="3.2"
            fill={light ? "rgba(15,23,42,0.14)" : "rgba(0,0,0,0.5)"}
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
