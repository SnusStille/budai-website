import type { Config } from "tailwindcss";

/**
 * BudAI / Stilledev design tokens.
 *
 * Raw values live in app/globals.css (:root) so CSS and Tailwind stay in sync.
 * Motion (logo, playground, ambient) also lives in globals.css so it can be
 * disabled in one place for prefers-reduced-motion.
 *
 * Nothing here overrides a Tailwind default — every addition is a new name,
 * so existing utilities (text-sm, rounded-lg, shadow-lg…) keep working.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020205",
        surface: "#08080f",
        "surface-elevated": "#0f0f1a",
        panel: "#0b0b14",
        accent: {
          cyan: "#00e5ff",
          green: "#00ff9d",
          purple: "#b967ff",
          pink: "#ff6b9d",
          blue: "#4facfe",
          yellow: "#ffd700",
        },
        muted: "#8892a0",
        hair: "rgba(255,255,255,0.07)",
        "hair-strong": "rgba(255,255,255,0.13)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        display: ["var(--fs-display)", { lineHeight: "0.98", letterSpacing: "-0.045em", fontWeight: "800" }],
        h1: ["var(--fs-h1)", { lineHeight: "1.02", letterSpacing: "-0.04em", fontWeight: "700" }],
        h2: ["var(--fs-h2)", { lineHeight: "1.06", letterSpacing: "-0.035em", fontWeight: "700" }],
        h3: ["var(--fs-h3)", { lineHeight: "1.18", letterSpacing: "-0.028em", fontWeight: "650" }],
        h4: ["var(--fs-h4)", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "600" }],
        lead: ["var(--fs-lead)", { lineHeight: "1.62" }],
        micro: ["var(--fs-micro)", { lineHeight: "1.5" }],
        mono: ["var(--fs-mono)", { lineHeight: "1.4", letterSpacing: "0.14em" }],
      },
      maxWidth: {
        shell: "var(--shell)",
        measure: "var(--measure)",
      },
      borderRadius: {
        card: "var(--r-lg)",
        panel: "var(--r-xl)",
        shell: "var(--r-2xl)",
      },
      boxShadow: {
        card: "var(--shadow-2)",
        lift: "var(--shadow-3)",
        pop: "var(--shadow-pop)",
        inset: "var(--inner-highlight)",
      },
      transitionTimingFunction: {
        expo: "var(--ease-out-expo)",
        quart: "var(--ease-out-quart)",
        spring: "var(--ease-spring)",
        inout: "var(--ease-in-out)",
      },
      transitionDuration: {
        250: "250ms",
        400: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
