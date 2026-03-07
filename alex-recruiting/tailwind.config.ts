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
    },
  },
  plugins: [],
};
export default config;
