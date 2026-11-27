/**
 * Stilledev — Typographic Identity
 *
 * The brand is the word itself. No symbol, no AI icon, no gear, no brain.
 * Just carefully set typography: tracked letterforms, considered weight,
 * precise spacing — the mark of a craft studio.
 */
import { STILLEDEV_TYPE } from "@/lib/stilledev-brand";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Stilledev wordmark — pure typography.
 * "Stille" in regular weight, "dev" in a lighter weight with an accent dot.
 */
export default function StilledevWordmark({
  size = "md",
  className = "",
  variant = "dark",
  showTagline = false,
}: {
  size?: Size;
  className?: string;
  variant?: "dark" | "light";
  showTagline?: boolean;
}) {
  const scales: Record<Size, number> = { xs: 13, sm: 15, md: 17, lg: 22, xl: 32 };
  const px = scales[size];
  const baseColor = variant === "light" ? "#0a0a0f" : "#ffffff";
  const dotColor = variant === "light" ? "#00b8d4" : "#00e5ff";
  const subColor = variant === "light" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.38)";

  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: px, color: baseColor, letterSpacing: "-0.035em", fontFamily: STILLEDEV_TYPE.family }}
      >
        Stille<span style={{ fontWeight: 400 }}>dev</span>
        <span style={{ color: dotColor, marginLeft: "1px" }}>.</span>
      </span>
      {showTagline && (
        <span
          className="mt-1 font-mono uppercase"
          style={{ fontSize: Math.max(8, px * 0.5), letterSpacing: "0.16em", color: subColor }}
        >
          Digital Development Studio
        </span>
      )}
    </span>
  );
}

/**
 * Stilledev.Labs lockup — wordmark with Labs descriptor.
 */
export function StilledevLabsWordmark({
  size = "md",
  className = "",
  variant = "dark",
}: {
  size?: Size;
  className?: string;
  variant?: "dark" | "light";
}) {
  const scales: Record<Size, number> = { xs: 12, sm: 14, md: 15, lg: 19, xl: 26 };
  const px = scales[size];
  const baseColor = variant === "light" ? "#0a0a0f" : "#ffffff";
  const subColor = variant === "light" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)";
  const accent = variant === "light" ? "#00b8d4" : "#00e5ff";

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span
        className="font-semibold tracking-tight leading-none"
        style={{ fontSize: px, color: baseColor, letterSpacing: "-0.035em", fontFamily: STILLEDEV_TYPE.family }}
      >
        Stille<span style={{ fontWeight: 400 }}>dev</span>
        <span style={{ color: accent }}>.</span>
        <span style={{ color: subColor, fontWeight: 400, marginLeft: "4px", fontSize: px * 0.78, letterSpacing: "0" }}>Labs</span>
      </span>
    </span>
  );
}
