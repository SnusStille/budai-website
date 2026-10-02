import type { Config } from "tailwindcss";

/**
 * BudAI / Stilledev design tokens.
 * Motion lives in globals.css (logo + playground) so it can be disabled
 * in one place for prefers-reduced-motion.
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
        accent: {
          cyan: "#00e5ff",
          green: "#00ff9d",
          purple: "#b967ff",
          pink: "#ff6b9d",
          blue: "#4facfe",
          yellow: "#ffd700",
        },
        muted: "#8892a0",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
