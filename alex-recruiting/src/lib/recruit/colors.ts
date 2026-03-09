/**
 * Pewaukee Pirates Color System
 * Centralized color constants for the recruit page.
 */

export const PIRATE_COLORS = {
  red: "#CC0022",
  redDark: "#990019",
  redLight: "#E6003D",
  black: "#111111",
  blackDeep: "#0A0A0A",
} as const;

/** Tailwind-compatible gradient stops */
export const PIRATE_GRADIENTS = {
  /** Primary text gradient: red to lighter red */
  textPrimary: "from-red-500 to-rose-400",
  /** Button gradient */
  button: "from-red-600 to-red-500",
  buttonHover: "from-red-500 to-rose-500",
  /** Ambient glow */
  glow: "from-red-600/5 to-rose-600/5",
  /** Section divider */
  divider: "from-transparent via-red-500/20 to-transparent",
  /** Scroll progress bar */
  progress: "from-red-600 via-red-500 to-rose-500",
} as const;

/** Friday Night Lights — warm cinematic palette */
export const FNL_COLORS = {
  black: "#0A0A0A",
  blackWarm: "#0D0B08",
  gold: "#D4A853",
  goldBright: "#E8C068",
  crimson: "#C0392B",
  crimsonDark: "#A33225",
  warmWhite: "#F5F0E6",
  warmGray: "#8B8172",
  warmGrayDark: "#5A5247",
} as const;

export const FNL_GRADIENTS = {
  button: "from-[#C0392B] to-[#A33225]",
  buttonHover: "from-[#D4432F] to-[#C0392B]",
  textAccent: "from-[#D4A853] to-[#E8C068]",
  divider: "from-transparent via-[#D4A853]/20 to-transparent",
  progress: "from-[#D4A853] via-[#E8C068] to-[#C0392B]",
  lightLeak: "from-[#D4A853]/12 via-transparent to-transparent",
  vignette: "radial-gradient(ellipse at center, transparent 50%, rgba(10,10,10,0.6) 100%)",
} as const;
