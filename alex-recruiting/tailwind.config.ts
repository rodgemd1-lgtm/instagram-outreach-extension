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
          surface: "#0A0A0A",
          "surface-raised": "#111111",
          border: "#1A1A1A",
          "border-subtle": "#111111",
          text: "#FFFFFF",
          "text-secondary": "#999999",
          muted: "#666666",
          accent: "#ff000c",
          "accent-hover": "#cc000a",
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
