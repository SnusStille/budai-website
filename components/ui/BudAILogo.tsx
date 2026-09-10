"use client";

import { useId } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const SIZES: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 64,
  xl: 100,
  hero: 200,
};

/**
 * BudAI mark — crystalline neural core.
 * One glass tile + living graph (nodes, links, pulse). No letters / monograms / 3D.
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
      {/* Aura */}
      <span
        aria-hidden
        className={`absolute inset-[-20%] rounded-full pointer-events-none ${
          animated ? "logo-glow-breathe" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 42% 38%, rgba(0,229,255,0.5) 0%, rgba(185,103,255,0.28) 40%, transparent 68%)",
          filter: `blur(${isHero ? 18 : 8}px)`,
          opacity: isHero ? 1 : 0.55,
        }}
      />

      {isHero && animated && (
        <span
          aria-hidden
          className="absolute inset-[-6%] rounded-full pointer-events-none logo-orbit-2d border border-white/[0.07]"
          style={{ animationDuration: "32s", borderStyle: "dashed" }}
        />
      )}

      {/* Crystal tile */}
      <span
        className={`relative z-[1] w-full h-full overflow-hidden ${
          animated && isHero ? "logo-mark-breathe" : ""
        }`}
        style={{
          borderRadius: "28%",
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.28) 0%, rgba(0,229,255,0.16) 22%, rgba(10,10,24,0.98) 52%, rgba(185,103,255,0.22) 100%)",
          boxShadow: isHero
            ? "0 0 44px rgba(0,229,255,0.48), 0 0 90px rgba(185,103,255,0.22), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -14px 30px rgba(0,0,0,0.5)"
            : "0 0 18px rgba(0,229,255,0.35), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -8px 16px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.34)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-[8%] rounded-[24%]"
          style={{
            background:
              "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.22) 0%, rgba(0,229,255,0.12) 28%, rgba(6,6,18,0.95) 72%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />

        <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={`lg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#b967ff" />
            </linearGradient>
            <linearGradient id={`lg2-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.55" />
            </linearGradient>
            <filter id={`lf-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.15" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={`core-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="45%" stopColor="#00e5ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#b967ff" stopOpacity="0.35" />
            </radialGradient>
          </defs>

          {/* Hex ring */}
          <polygon
            points="40,12 62,25 62,51 40,64 18,51 18,25"
            fill="none"
            stroke={`url(#lg-${uid})`}
            strokeWidth="1.1"
            opacity="0.35"
          />

          {/* Links */}
          <g
            stroke={`url(#lg-${uid})`}
            strokeWidth="1.55"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
            filter={`url(#lf-${uid})`}
          >
            <line x1="40" y1="40" x2="40" y2="18" />
            <line x1="40" y1="40" x2="58" y2="28" />
            <line x1="40" y1="40" x2="60" y2="48" />
            <line x1="40" y1="40" x2="40" y2="62" />
            <line x1="40" y1="40" x2="20" y2="48" />
            <line x1="40" y1="40" x2="22" y2="28" />
            {/* outer ring links */}
            <line x1="40" y1="18" x2="58" y2="28" opacity="0.55" />
            <line x1="58" y1="28" x2="60" y2="48" opacity="0.55" />
            <line x1="60" y1="48" x2="40" y2="62" opacity="0.55" />
            <line x1="40" y1="62" x2="20" y2="48" opacity="0.55" />
            <line x1="20" y1="48" x2="22" y2="28" opacity="0.55" />
            <line x1="22" y1="28" x2="40" y2="18" opacity="0.55" />
          </g>

          {/* Peripheral nodes */}
          <g filter={`url(#lf-${uid})`}>
            <circle cx="40" cy="18" r="3.2" fill={`url(#lg-${uid})`} />
            <circle cx="58" cy="28" r="2.8" fill={`url(#lg2-${uid})`} />
            <circle cx="60" cy="48" r="2.8" fill={`url(#lg-${uid})`} />
            <circle cx="40" cy="62" r="3" fill={`url(#lg2-${uid})`} />
            <circle cx="20" cy="48" r="2.8" fill={`url(#lg-${uid})`} />
            <circle cx="22" cy="28" r="2.8" fill={`url(#lg2-${uid})`} />
          </g>

          {/* Core */}
          <circle cx="40" cy="40" r="7.2" fill={`url(#core-${uid})`} filter={`url(#lf-${uid})`}>
            {animated && (
              <animate attributeName="r" values="6.6;7.8;6.6" dur="2.8s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="40" cy="40" r="3.2" fill="#ffffff" opacity="0.95" />

          {/* Signal */}
          {isHero && animated && (
            <circle r="2" fill="#fff" filter={`url(#lf-${uid})`}>
              <animateMotion
                dur="4.8s"
                repeatCount="indefinite"
                path="M40,18 L58,28 L60,48 L40,62 L20,48 L22,28 Z"
              />
            </circle>
          )}
        </svg>

        <span
          aria-hidden
          className="absolute top-[9%] left-[12%] w-[46%] h-[26%] rounded-full bg-white/40 blur-[5px] pointer-events-none"
        />
        <span
          aria-hidden
          className="absolute inset-[6%] rounded-[24%] border border-white/14 pointer-events-none"
        />
        <span
          aria-hidden
          className="absolute bottom-0 inset-x-0 h-[38%] bg-gradient-to-t from-black/45 to-transparent pointer-events-none"
        />
      </span>

      {/* Orbit dots */}
      {isHero &&
        animated &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="absolute inset-[-9%] pointer-events-none logo-orbit-2d"
            style={{
              animationDuration: `${12 + i * 4}s`,
              animationDelay: `${-i * 2}s`,
              animationDirection: i === 1 ? "reverse" : "normal",
            }}
          >
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
              style={{
                width: i === 0 ? 5 : 3.5,
                height: i === 0 ? 5 : 3.5,
                background: ["#00e5ff", "#b967ff", "#00ff9d"][i],
                boxShadow: `0 0 12px ${["#00e5ff", "#b967ff", "#00ff9d"][i]}`,
              }}
            />
          </span>
        ))}
    </Tag>
  );
}

export function StilledevLink({
  className = "",
  children = "Stilledev",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href="https://discord.com/users/353944097301594123"
      target="_blank"
      rel="noopener noreferrer"
      className={`relative text-accent-cyan font-medium hover:text-white transition-colors duration-300 group ${className}`}
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent-cyan group-hover:w-full transition-all duration-300" />
    </a>
  );
}
