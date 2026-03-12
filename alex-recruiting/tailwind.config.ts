import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        jetbrains: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "pirate-red": {
          DEFAULT: "#ff000c",
          dark: "#cc000a",
          light: "#ff3340",
        },
        "pirate-black": {
          DEFAULT: "#111111",
          deep: "#000000",
        },
        dash: {
          bg: "#000000",
          // New semantic surface scale
          "surface-1": "#080808",
          "surface-2": "#121212",
          "surface-3": "#1A1A1A",
          // Backward compat aliases
          surface: "#080808",
          "surface-raised": "#121212",
          // Border scale
          border: {
            subtle: "#0A0A0A",
            DEFAULT: "#1F1F1F",
            strong: "#2A2A2A",
          },
          "border-subtle": "#0A0A0A",
          // Accent scale
          accent: {
            DEFAULT: "#ff000c",
            hover: "#e6000b",
            subtle: "#1a0001",
          },
          "accent-hover": "#e6000b",
          // Gold scale
          gold: {
            DEFAULT: "#D4A853",
            subtle: "#1a1508",
          },
          // Semantic status colors
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#DC2626",
          info: "#3B82F6",
          // Text scale
          text: {
            primary: "#FFFFFF",
            secondary: "#A1A1AA",
            muted: "#71717A",
            disabled: "#3F3F46",
          },
          // Backward compat aliases for text
          "text-secondary": "#A1A1AA",
          muted: "#71717A",
        },
      },
      fontSize: {
        "dash-xs": ["0.6875rem", { lineHeight: "1rem" }],
        "dash-sm": ["0.8125rem", { lineHeight: "1.25rem" }],
        "dash-base": ["0.9375rem", { lineHeight: "1.5rem" }],
        "dash-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "dash-xl": ["1.375rem", { lineHeight: "1.75rem" }],
        "dash-2xl": ["1.75rem", { lineHeight: "2.25rem" }],
        "dash-3xl": ["2.1875rem", { lineHeight: "2.5rem" }],
        "dash-display": ["3rem", { lineHeight: "1" }],
      },
      keyframes: {
        "jersey-pulse": {
          "0%, 100%": {
            opacity: "0.15",
            transform: "translate(-50%, -50%) scale(1)",
          },
          "50%": {
            opacity: "0.35",
            transform: "translate(-50%, -50%) scale(1.05)",
          },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scroll-ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "jersey-pulse": "jersey-pulse 3s ease-in-out infinite",
        "scroll-left": "scroll-left 30s linear infinite",
        "scroll-ticker": "scroll-ticker 25s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
