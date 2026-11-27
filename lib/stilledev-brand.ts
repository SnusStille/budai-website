/**
 * Stilledev — Visual Identity System
 *
 * The Stilledev mark is an original geometric construct:
 * A sharp, asymmetric "S" monogram built from two converging precision strokes
 * that meet at a luminous center cell. It evokes precision engineering,
 * Scandinavian minimalism, and technical craft — never generic AI tropes.
 *
 * Oliver Stille wordmark uses refined typography (Plus Jakarta Sans)
 * with tracked capitals for the surname, signaling a personal tech brand.
 */

// The "Convergence" mark — two angled strokes meeting at a faceted cell
// Hand-tuned SVG path for the Stilledev S-monogram
export const STILLEDEV_MARK_PATH =
  "M8 6.5L22 6.5C24 6.5 25.5 8 25.5 10V12.5C25.5 14 24.5 15.3 23 15.7L13 18.5C11.5 18.9 10.5 20.3 10.5 22V24.5C10.5 26 9 27.5 7 27.5L7 27.5";

// Simpler, cleaner variant — a precision corner/cut mark
export const STILLEDEV_SIGIL_PATH =
  "M6 4H18L26 12V22C26 24.2 24.2 26 22 26H6C3.8 26 2 24.2 2 22V8C2 5.8 3.8 4 6 4Z";

// Ultra-minimal mark: single continuous line forming an abstract S
// This is the primary mark — clean, memorable, timeless
export const STILLEDEV_PRIMARY_PATH =
  "M5 10C5 7.2 7.2 5 10 5H22C24.8 5 27 7.2 27 10V13C27 14.7 25.7 16 24 16H11C9.3 16 8 17.3 8 19V22C8 24.8 10.2 27 13 27H25";

// Inner accent — the "luminous cell" at the convergence point
export const STILLEDEV_CELL_PATH =
  "M15 14L17 12.5L19 14V16L17 17.5L15 16Z";

/** Brand color palette */
export const STILLEDEV_BRAND = {
  ink: "#0a0a0f",
  surface: "#0f0f17",
  paper: "#ffffff",
  text: "#e8eaed",
  muted: "#8892a0",
  primary: "#00e5ff",     // cyan accent — shared with BudAI ecosystem
  secondary: "#7c5cff",   // purple accent
  subtle: "rgba(0, 229, 255, 0.08)",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.1)",
} as const;

/** Typographic wordmark settings */
export const STILLEDEV_TYPE = {
  family: "var(--font-jakarta), -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "var(--font-jetbrains), ui-monospace, SFMono-Regular, monospace",
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  tracking: { tight: "-0.03em", normal: "0", wide: "0.04em", wider: "0.08em", widest: "0.14em" },
} as const;
