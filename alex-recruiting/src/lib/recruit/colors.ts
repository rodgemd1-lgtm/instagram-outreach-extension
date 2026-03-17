/**
 * Pewaukee Pirates Color System
 * Centralized color constants for the recruit page.
 */

export const PIRATE_COLORS = {
  red: "#ff000c",
  redDark: "#cc000a",
  redLight: "#ff3340",
  black: "#111111",
  blackDeep: "#000000",
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

/** Pewaukee interview palette — red, black, white only */
export const INTERVIEW_COLORS = {
  black: "#000000",
  cardBg: "#111111",
  red: "#ff000c",
  redDark: "#cc000a",
  white: "#FFFFFF",
  muted: "#9CA3AF",
} as const;
