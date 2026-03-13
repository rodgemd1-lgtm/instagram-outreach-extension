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
          bg: "#FAFAFA",
          // Semantic surface scale
          "surface-1": "#FFFFFF",
          "surface-2": "#FAFAFA",
          "surface-3": "#F5F5F4",
          // Backward compat aliases
          surface: "#FFFFFF",
          "surface-raised": "#FFFFFF",
          // Border scale
          border: {
            subtle: "#F3F4F6",
            DEFAULT: "#E5E7EB",
            strong: "#D1D5DB",
          },
          "border-subtle": "#F3F4F6",
          // Accent scale
          accent: {
            DEFAULT: "#0F1720",
            hover: "#1F2937",
            subtle: "#F3F4F6",
          },
          "accent-hover": "#1F2937",
          // Gold scale
          gold: {
            DEFAULT: "#D4A853",
            subtle: "#FEF9EF",
          },
          // Semantic status colors
          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#DC2626",
          info: "#2563EB",
          // Text scale
          text: {
            primary: "#0F1720",
            secondary: "#6B7280",
            muted: "#9CA3AF",
            disabled: "#D1D5DB",
          },
          // Backward compat aliases for text
          "text-secondary": "#6B7280",
          muted: "#9CA3AF",
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
