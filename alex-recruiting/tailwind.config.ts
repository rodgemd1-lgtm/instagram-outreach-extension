import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "pirate-red": {
          DEFAULT: "#CC0022",
          dark: "#990019",
          light: "#E6003D",
        },
        "pirate-black": {
          DEFAULT: "#111111",
          deep: "#0A0A0A",
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
      },
      animation: {
        "jersey-pulse": "jersey-pulse 3s ease-in-out infinite",
        "scroll-left": "scroll-left 30s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
