"use client";

import { useId } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const SIZES: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 46,
  lg: 72,
  xl: 110,
  hero: 212,
};

/**
 * BudAI mark — circular Neural Orb.
 * Perfect circle glass · triple orbits · luminous core · 2D motion only.
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
  const showDetail = size !== "xs";
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
      {/* Soft circular bloom */}
      <span
        aria-hidden
        className={`absolute inset-[-30%] rounded-full pointer-events-none ${
          animated ? "logo-glow-breathe" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,229,255,0.6) 0%, rgba(185,103,255,0.35) 38%, transparent 70%)",
          filter: `blur(${isHero ? 24 : 10}px)`,
          opacity: isHero ? 1 : 0.72,
        }}
      />

      {/* Pulse rings — perfect circles */}
      {isHero && animated && (
        <>
          <span
            aria-hidden
            className="absolute inset-[-6%] rounded-full border border-accent-cyan/35 pointer-events-none logo-pulse-ring"
          />
          <span
            aria-hidden
            className="absolute inset-[-6%] rounded-full border border-accent-purple/25 pointer-events-none logo-pulse-ring"
            style={{ animationDelay: "1s" }}
          />
        </>
      )}

      {/* THE ORB — 100% circle */}
      <span
        className={`relative z-[1] w-full h-full overflow-hidden rounded-full ${
          animated && isHero ? "logo-mark-breathe" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.42) 0%, rgba(0,229,255,0.22) 22%, rgba(8,10,24,0.98) 58%, rgba(185,103,255,0.28) 100%)",
          boxShadow: isHero
            ? "0 0 56px rgba(0,229,255,0.58), 0 0 110px rgba(185,103,255,0.3), inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -20px 40px rgba(0,0,0,0.5)"
            : "0 0 24px rgba(0,229,255,0.45), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -10px 20px rgba(0,0,0,0.45)",
          border: "1.5px solid rgba(255,255,255,0.4)",
        }}
      >
        {/* Inner depth disc */}
        <span
          aria-hidden
          className="absolute inset-[7%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.14) 0%, rgba(0,229,255,0.08) 35%, rgba(4,5,14,0.95) 75%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        />

        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <linearGradient id={`lg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="32%" stopColor="#00e5ff" />
              <stop offset="68%" stopColor="#b967ff" />
              <stop offset="100%" stopColor="#00ff9d" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={`lg2-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff9d" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
            <radialGradient id={`core-${uid}`} cx="50%" cy="48%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#00e5ff" />
              <stop offset="70%" stopColor="#b967ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#060814" stopOpacity="0" />
            </radialGradient>
            <filter id={`f-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Guide ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={`url(#lg-${uid})`}
            strokeWidth="0.55"
            opacity="0.22"
          />

          {/* Triple orbital ellipses */}
          {showDetail && (
            <g
              fill="none"
              stroke={`url(#lg-${uid})`}
              strokeWidth={isHero ? 1.4 : 1.2}
              opacity="0.78"
              filter={`url(#f-${uid})`}
            >
              <ellipse cx="50" cy="50" rx="32" ry="11">
                {animated && isHero && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="26s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
              <ellipse cx="50" cy="50" rx="32" ry="11" transform="rotate(60 50 50)">
                {animated && isHero && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="60 50 50"
                    to="420 50 50"
                    dur="32s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
              <ellipse cx="50" cy="50" rx="32" ry="11" transform="rotate(-60 50 50)">
                {animated && isHero && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="-60 50 50"
                    to="300 50 50"
                    dur="38s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
            </g>
          )}

          {/* Orbit nodes */}
          {showDetail && (
            <g filter={`url(#f-${uid})`}>
              <circle cx="82" cy="50" r="3" fill={`url(#lg-${uid})`} />
              <circle cx="18" cy="50" r="3" fill={`url(#lg2-${uid})`} />
              <circle cx="66" cy="22" r="2.5" fill={`url(#lg-${uid})`} />
              <circle cx="34" cy="78" r="2.5" fill={`url(#lg2-${uid})`} />
              <circle cx="66" cy="78" r="2.5" fill={`url(#lg-${uid})`} />
              <circle cx="34" cy="22" r="2.5" fill={`url(#lg2-${uid})`} />
            </g>
          )}

          {/* Subtle spokes */}
          {showDetail && (
            <g stroke={`url(#lg-${uid})`} strokeWidth="0.85" opacity="0.28" strokeLinecap="round">
              <line x1="50" y1="50" x2="82" y2="50" />
              <line x1="50" y1="50" x2="18" y2="50" />
              <line x1="50" y1="50" x2="66" y2="22" />
              <line x1="50" y1="50" x2="34" y2="78" />
            </g>
          )}

          {/* Core */}
          <circle cx="50" cy="50" r={isHero ? 15 : 13} fill={`url(#core-${uid})`} filter={`url(#f-${uid})`}>
            {animated && (
              <animate
                attributeName="r"
                values={isHero ? "14;16.2;14" : "12;13.8;12"}
                dur="2.7s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="50" cy="50" r="6.8" fill="#ffffff" opacity="0.96" />
          <circle cx="50" cy="50" r="3" fill={`url(#lg2-${uid})`} />

          {/* Sparks */}
          {isHero && animated && (
            <>
              <circle r="2.4" fill="#fff" filter={`url(#f-${uid})`}>
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M82,50 A32,11 0 1,1 18,50 A32,11 0 1,1 82,50"
                />
              </circle>
              <circle r="1.9" fill="#00ff9d" filter={`url(#f-${uid})`}>
                <animateMotion
                  dur="5.2s"
                  repeatCount="indefinite"
                  path="M66,22 A32,11 60 1,1 34,78 A32,11 60 1,1 66,22"
                />
              </circle>
              <circle r="1.7" fill="#b967ff" filter={`url(#f-${uid})`}>
                <animateMotion
                  dur="6.4s"
                  repeatCount="indefinite"
                  path="M34,22 A32,11 -60 1,0 66,78 A32,11 -60 1,0 34,22"
                />
              </circle>
            </>
          )}
        </svg>

        {/* Specular + rim */}
        <span
          aria-hidden
          className="absolute top-[9%] left-[14%] w-[46%] h-[28%] rounded-full bg-white/45 blur-[5px] pointer-events-none"
        />
        <span
          aria-hidden
          className="absolute inset-[4%] rounded-full border border-white/18 pointer-events-none"
        />
        <span
          aria-hidden
          className="absolute bottom-[6%] inset-x-[12%] h-[28%] rounded-[50%] bg-black/35 blur-[8px] pointer-events-none"
        />
      </span>

      {/* Outer free dots */}
      {isHero &&
        animated &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="absolute inset-[-14%] pointer-events-none logo-orbit-2d"
            style={{
              animationDuration: `${12 + i * 3.5}s`,
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
                boxShadow: `0 0 14px ${["#00e5ff", "#b967ff", "#00ff9d"][i]}`,
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
