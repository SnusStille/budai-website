"use client";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const SIZES: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 104,
  hero: 240,
};

/** Wordmark scale so “BudAI” fits cleanly inside the core */
const WORD: Record<Size, string> = {
  xs: "text-[6px] tracking-[0.04em]",
  sm: "text-[8px] tracking-[0.05em]",
  md: "text-[10px] tracking-[0.06em]",
  lg: "text-[13px] tracking-[0.07em]",
  xl: "text-base tracking-[0.08em]",
  hero: "text-2xl md:text-3xl tracking-[0.1em]",
};

/**
 * WOW-orb — one clean 3D glass sphere + BudAI wordmark.
 * Orbits only on hero/xl so chrome sizes stay sharp.
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
  const px = SIZES[size];
  const isHero = size === "hero";
  const showOrbits = isHero || size === "xl";
  const Tag = interactive || onClick ? "button" : "div";

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        interactive || onClick ? "cursor-pointer focus-visible:outline-none" : ""
      } ${className}`}
      style={{
        width: px,
        height: px,
        perspective: showOrbits ? "900px" : undefined,
      }}
    >
      {/* Ambient glow — single bloom */}
      <span
        aria-hidden
        className={`absolute inset-[-22%] rounded-full pointer-events-none ${
          animated && isHero ? "animate-glow-pulse" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,229,255,0.45) 0%, rgba(185,103,255,0.22) 45%, transparent 70%)",
          filter: `blur(${isHero ? 20 : 8}px)`,
          opacity: isHero ? 0.95 : 0.7,
        }}
      />

      {/* One pair of tilted orbit rings (hero/xl only) */}
      {showOrbits && animated && (
        <span aria-hidden className="absolute inset-0 pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
          <span
            className="absolute inset-[-10%] rounded-full core-spin-slow"
            style={{
              border: "1.5px solid rgba(0,229,255,0.42)",
              transform: "rotateX(70deg) rotateZ(-14deg)",
              boxShadow: "0 0 14px rgba(0,229,255,0.22)",
              animationDuration: "18s",
            }}
          />
          <span
            className="absolute inset-[-2%] rounded-full core-spin-slow-rev"
            style={{
              border: "1px dashed rgba(185,103,255,0.38)",
              transform: "rotateX(58deg) rotateZ(24deg)",
              animationDuration: "24s",
            }}
          />
          {/* Two beads only */}
          {[0, 1].map((i) => (
            <span
              key={i}
              className="absolute inset-[-10%] core-spin-slow"
              style={{
                animationDuration: `${14 + i * 5}s`,
                animationDelay: `${-i * 3}s`,
                transform: "rotateX(70deg) rotateZ(-14deg)",
              }}
            >
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: i === 0 ? "#00e5ff" : "#b967ff",
                  boxShadow: `0 0 12px ${i === 0 ? "#00e5ff" : "#b967ff"}`,
                }}
              />
            </span>
          ))}
        </span>
      )}

      {/* Single glass sphere */}
      <span
        className={`relative z-[2] w-full h-full rounded-full overflow-hidden ${
          animated && isHero ? "animate-orb-breathe" : ""
        }`}
        style={{
          background: `
            radial-gradient(circle at 32% 26%,
              rgba(255,255,255,0.88) 0%,
              rgba(180,240,255,0.5) 12%,
              rgba(0,229,255,0.45) 30%,
              rgba(185,103,255,0.55) 58%,
              rgba(14,10,30,0.97) 100%)
          `,
          boxShadow: isHero
            ? "0 0 50px rgba(0,229,255,0.4), 0 0 100px rgba(185,103,255,0.25), inset 0 -20px 32px rgba(0,0,0,0.45), inset 0 14px 24px rgba(255,255,255,0.35)"
            : "0 0 18px rgba(0,229,255,0.35), inset 0 -8px 14px rgba(0,0,0,0.4), inset 0 6px 12px rgba(255,255,255,0.3)",
          border: "1px solid rgba(255,255,255,0.35)",
        }}
      >
        {/* Wordmark — BudAI (no nested second sphere) */}
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold text-white select-none ${WORD[size]} ${
            animated && isHero ? "logo-core-pulse" : ""
          }`}
          style={{
            textShadow:
              "0 0 18px rgba(255,255,255,0.85), 0 0 36px rgba(0,229,255,0.7), 0 1px 2px rgba(0,0,0,0.45)",
          }}
        >
          <span>
            Bud<span className="text-white/95">AI</span>
          </span>
        </span>

        {/* Specular */}
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: "7%",
            left: "12%",
            width: "44%",
            height: "28%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 40%, transparent 70%)",
            filter: "blur(1.5px)",
            mixBlendMode: "screen",
          }}
        />
        <span
          aria-hidden
          className="absolute rounded-full bg-white/90 pointer-events-none"
          style={{
            top: "15%",
            left: "22%",
            width: isHero ? 8 : 4,
            height: isHero ? 5 : 2.5,
            filter: "blur(0.5px)",
          }}
        />

        {/* Bottom tint */}
        <span
          aria-hidden
          className="absolute inset-x-[14%] bottom-[6%] h-[22%] pointer-events-none rounded-[50%]"
          style={{
            background: "radial-gradient(ellipse, rgba(185,103,255,0.35), transparent 70%)",
            filter: "blur(4px)",
          }}
        />

        {/* Single glass rim */}
        <span
          aria-hidden
          className="absolute inset-[3%] rounded-full border border-white/20 pointer-events-none"
        />
      </span>

      {/* One pulse ring on hero only */}
      {isHero && animated && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full border border-accent-cyan/30 core-pulse-ring pointer-events-none z-[1]"
        />
      )}
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
