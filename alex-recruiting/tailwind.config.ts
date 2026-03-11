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
          bg: "#0F1117",
          surface: "#1A1D27",
          "surface-raised": "#22252F",
          border: "#2A2D37",
          "border-subtle": "#1F2229",
          text: "#E4E4E7",
          "text-secondary": "#A1A1AA",
          muted: "#71717A",
          accent: "#3B82F6",
          "accent-hover": "#2563EB",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          gold: "#D4A853",
        },
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
