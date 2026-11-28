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
 * "Stille" in semibold, "dev" in regular, accent dot.
 * Optional `suffix` appends a word after the dot (e.g. "BudAI", "Labs").
 */
export default function StilledevWordmark({
  size = "md",
  className = "",
  variant = "dark",
  showTagline = false,
  suffix,
}: {
  size?: Size;
  className?: string;
  variant?: "dark" | "light";
  showTagline?: boolean;
  suffix?: string;
}) {
  const scales: Record<Size, number> = { xs: 13, sm: 15, md: 17, lg: 22, xl: 32 };
  const px = scales[size];
  const baseColor = variant === "light" ? "#0a0a0f" : "#ffffff";
  const dotColor = variant === "light" ? "#00b8d4" : "#00e5ff";
  const subColor = variant === "light" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.38)";
  const suffixColor = variant === "light" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";

  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize: px, color: baseColor, letterSpacing: "-0.035em", fontFamily: STILLEDEV_TYPE.family }}
      >
        Stille<span style={{ fontWeight: 400 }}>dev</span>
        <span style={{ color: dotColor, marginLeft: "1px" }}>.</span>
        {suffix && (
          <span style={{ color: suffixColor, fontWeight: 500, marginLeft: "2px", letterSpacing: "-0.02em" }}>
            {suffix}
          </span>
        )}
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
 * Stilledev.BudAI — BudAI product lockup.
 */
export function StilledevBudAIWordmark({
  size = "md",
  className = "",
  variant = "dark",
}: {
  size?: Size;
  className?: string;
  variant?: "dark" | "light";
}) {
  return <StilledevWordmark size={size} className={className} variant={variant} suffix="BudAI" />;
}

/**
 * Stilledev.Labs — Labs product lockup.
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
  return <StilledevWordmark size={size} className={className} variant={variant} suffix="Labs" />;
}
