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
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sc: {
          bg: "#0a0a0a",
          surface: "#141414",
          "surface-glass": "rgba(26, 19, 19, 0.6)",
          primary: "#C5050C",
          "primary-dark": "#7A0307",
          "primary-glow": "rgba(197, 5, 12, 0.3)",
          "accent-cyan": "#00f2ff",
          "accent-green": "#0bda7d",
          "accent-gold": "#ffd700",
          text: "#f1f5f9",
          "text-muted": "#94a3b8",
          "text-dim": "#64748b",
          border: "rgba(197, 5, 12, 0.1)",
          "border-strong": "rgba(197, 5, 12, 0.3)",
          success: "#22c55e",
          warning: "#eab308",
          danger: "#ef4444",
          info: "#3b82f6",
        },
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(197,5,12,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(197,5,12,0.7)" },
        },
        scanline: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(4px)" },
        },
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        "ticker-scroll": "ticker-scroll 20s linear infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
