import React from "react";

/**
 * Typography Styles for Valentine's Video
 * Premium, romantic font configurations
 */

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: string;
  lineHeight: number;
  color: string;
  textShadow?: string;
}

// Primary serif font for romantic, elegant text
export const FONT_SERIF = "'Playfair Display', 'Georgia', serif";

// Secondary sans-serif font for clean, modern text
export const FONT_SANS = "'Inter', 'Helvetica', sans-serif";

// Script/cursive font for signature-style text
export const FONT_SCRIPT = "'Dancing Script', 'Brush Script MT', cursive";

/**
 * Predefined text styles
 */
export const TEXT_STYLES = {
  // Main title - large, dramatic
  title: {
    fontFamily: FONT_SERIF,
    fontSize: 72,
    fontWeight: 700,
    letterSpacing: "0.02em",
    lineHeight: 1.1,
    color: "white",
    textShadow: "0 4px 30px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)",
  },

  // Subtitle - smaller, elegant
  subtitle: {
    fontFamily: FONT_SERIF,
    fontSize: 36,
    fontWeight: 500,
    letterSpacing: "0.05em",
    lineHeight: 1.3,
    color: "rgba(255, 230, 235, 0.95)",
    textShadow: "0 2px 15px rgba(0,0,0,0.4)",
  },

  // Couple name - special treatment
  coupleName: {
    fontFamily: FONT_SERIF,
    fontSize: 56,
    fontWeight: 600,
    letterSpacing: "0.03em",
    lineHeight: 1.2,
    color: "white",
    textShadow: "0 0 40px rgba(255, 150, 180, 0.5), 0 4px 20px rgba(0,0,0,0.4)",
  },

  // Caption - for photo descriptions
  caption: {
    fontFamily: FONT_SERIF,
    fontSize: 40,
    fontWeight: 500,
    letterSpacing: "0.01em",
    lineHeight: 1.45,
    color: "white",
    textShadow: "2px 2px 15px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)",
  },

  // Date - small, subtle
  date: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: 500,
    letterSpacing: "0.1em",
    lineHeight: 1,
    color: "rgba(255, 255, 255, 0.9)",
    textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
  },

  // Chapter title - for section breaks (if used)
  chapter: {
    fontFamily: FONT_SANS,
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: "0.2em",
    lineHeight: 1,
    color: "rgba(255, 200, 210, 0.9)",
    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },

  // Script/signature style
  signature: {
    fontFamily: FONT_SCRIPT,
    fontSize: 48,
    fontWeight: 400,
    letterSpacing: "0.02em",
    lineHeight: 1.3,
    color: "rgba(255, 220, 230, 1)",
    textShadow: "0 2px 15px rgba(0,0,0,0.3)",
  },

  // Emotional quote
  quote: {
    fontFamily: FONT_SERIF,
    fontSize: 32,
    fontWeight: 400,
    letterSpacing: "0.02em",
    lineHeight: 1.6,
    color: "rgba(255, 240, 245, 0.95)",
    textShadow: "0 2px 20px rgba(0,0,0,0.4)",
  },

  // Small detail text
  detail: {
    fontFamily: FONT_SANS,
    fontSize: 16,
    fontWeight: 400,
    letterSpacing: "0.05em",
    lineHeight: 1.5,
    color: "rgba(255, 255, 255, 0.7)",
    textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
  },
} as const;

export type TextStyleName = keyof typeof TEXT_STYLES;

/**
 * Get text style by name
 */
export function getTextStyle(name: TextStyleName): TextStyle {
  return TEXT_STYLES[name];
}

/**
 * Convert text style to React CSSProperties
 */
export function textStyleToCSS(style: TextStyle): React.CSSProperties {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    color: style.color,
    textShadow: style.textShadow,
  };
}

/**
 * Color palette for text
 */
export const TEXT_COLORS = {
  white: "white",
  warmWhite: "rgba(255, 250, 245, 1)",
  pinkWhite: "rgba(255, 240, 245, 1)",
  softPink: "rgba(255, 200, 210, 0.95)",
  pink: "rgba(255, 150, 180, 1)",
  rose: "rgba(255, 100, 130, 1)",
  gold: "rgba(255, 215, 180, 1)",
  cream: "rgba(255, 245, 230, 1)",
} as const;

/**
 * Text shadow presets
 */
export const TEXT_SHADOWS = {
  none: "none",
  subtle: "1px 1px 3px rgba(0,0,0,0.3)",
  medium: "2px 2px 10px rgba(0,0,0,0.5)",
  strong: "2px 2px 15px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)",
  glow: "0 0 20px rgba(255, 150, 180, 0.5), 0 2px 10px rgba(0,0,0,0.3)",
  pinkGlow: "0 0 30px rgba(255, 100, 130, 0.6), 0 4px 20px rgba(0,0,0,0.4)",
} as const;
