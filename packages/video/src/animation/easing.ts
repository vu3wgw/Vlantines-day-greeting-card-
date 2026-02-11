import { Easing } from "remotion";

/**
 * Custom Easing Functions
 * Premium easing curves for smooth, professional animations
 */

// Standard easing functions re-exported for convenience
export const ease = {
  // Linear
  linear: Easing.linear,

  // Quad
  inQuad: Easing.in(Easing.quad),
  outQuad: Easing.out(Easing.quad),
  inOutQuad: Easing.inOut(Easing.quad),

  // Cubic
  inCubic: Easing.in(Easing.cubic),
  outCubic: Easing.out(Easing.cubic),
  inOutCubic: Easing.inOut(Easing.cubic),

  // Quart
  inQuart: Easing.in(Easing.poly(4)),
  outQuart: Easing.out(Easing.poly(4)),
  inOutQuart: Easing.inOut(Easing.poly(4)),

  // Quint
  inQuint: Easing.in(Easing.poly(5)),
  outQuint: Easing.out(Easing.poly(5)),
  inOutQuint: Easing.inOut(Easing.poly(5)),

  // Expo
  inExpo: Easing.in(Easing.exp),
  outExpo: Easing.out(Easing.exp),
  inOutExpo: Easing.inOut(Easing.exp),

  // Circ
  inCirc: Easing.in(Easing.circle),
  outCirc: Easing.out(Easing.circle),
  inOutCirc: Easing.inOut(Easing.circle),

  // Back (overshoot)
  inBack: Easing.in(Easing.back(1.7)),
  outBack: Easing.out(Easing.back(1.7)),
  inOutBack: Easing.inOut(Easing.back(1.7)),

  // Strong back (more overshoot)
  inBackStrong: Easing.in(Easing.back(2.5)),
  outBackStrong: Easing.out(Easing.back(2.5)),
  inOutBackStrong: Easing.inOut(Easing.back(2.5)),

  // Elastic
  inElastic: Easing.in(Easing.elastic(1)),
  outElastic: Easing.out(Easing.elastic(1)),
  inOutElastic: Easing.inOut(Easing.elastic(1)),

  // Bounce
  inBounce: Easing.in(Easing.bounce),
  outBounce: Easing.out(Easing.bounce),
  inOutBounce: Easing.inOut(Easing.bounce),

  // Sin
  inSin: Easing.in(Easing.sin),
  outSin: Easing.out(Easing.sin),
  inOutSin: Easing.inOut(Easing.sin),
} as const;

export type EasingName = keyof typeof ease;

/**
 * Custom bezier curves for premium animations
 * These match common motion design curves
 */
export const bezier = {
  // Apple-style ease
  apple: Easing.bezier(0.25, 0.1, 0.25, 1),

  // Material Design standard
  materialStandard: Easing.bezier(0.4, 0.0, 0.2, 1),
  materialDecelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  materialAccelerate: Easing.bezier(0.4, 0.0, 1, 1),

  // Smooth and elegant
  smooth: Easing.bezier(0.45, 0, 0.55, 1),
  smoother: Easing.bezier(0.33, 0, 0.2, 1),

  // Snappy
  snappy: Easing.bezier(0.68, -0.55, 0.27, 1.55),
  snappier: Easing.bezier(0.68, -0.6, 0.32, 1.6),

  // Dramatic
  dramatic: Easing.bezier(0.7, 0, 0.3, 1),

  // Soft
  soft: Easing.bezier(0.25, 0.46, 0.45, 0.94),

  // Romantic (custom for love story)
  romantic: Easing.bezier(0.23, 1, 0.32, 1),
  romanticIn: Easing.bezier(0.55, 0.055, 0.675, 0.19),
  romanticOut: Easing.bezier(0.215, 0.61, 0.355, 1),
} as const;

export type BezierName = keyof typeof bezier;

/**
 * Get easing function by name
 */
export function getEasing(name: EasingName): (t: number) => number {
  return ease[name];
}

/**
 * Get bezier function by name
 */
export function getBezier(name: BezierName): (t: number) => number {
  return bezier[name];
}

/**
 * Combination easings for complex animations
 */
export const combo = {
  /**
   * Slow start, then accelerate and overshoot slightly
   */
  anticipate: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  /**
   * Quick start with subtle bounce at end
   */
  settleIn: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  /**
   * Smooth with slight wobble at end (like a heart settling)
   */
  heartBeat: (t: number): number => {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    const s = p / 4;
    return Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
  },

  /**
   * Breathe in and out (for pulsing animations)
   */
  breathe: (t: number): number => {
    return 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
  },

  /**
   * Wave motion (for floating elements)
   */
  wave: (t: number, frequency: number = 1): number => {
    return Math.sin(t * Math.PI * 2 * frequency);
  },
} as const;

/**
 * Apply easing to a progress value (0-1)
 */
export function applyEasing(
  progress: number,
  easingFn: (t: number) => number
): number {
  // Clamp progress to 0-1
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return easingFn(clampedProgress);
}

/**
 * Create a stepped easing (for staccato/frame-by-frame feel)
 */
export function stepped(steps: number): (t: number) => number {
  return (t: number) => Math.floor(t * steps) / steps;
}

/**
 * Create an easing that holds at a value for a portion of the animation
 */
export function withHold(
  easingFn: (t: number) => number,
  holdStart: number,
  holdEnd: number
): (t: number) => number {
  return (t: number) => {
    if (t < holdStart) {
      // Before hold - scale t to 0-holdStart
      return easingFn(t / holdStart);
    } else if (t > holdEnd) {
      // After hold - already at 1
      return 1;
    } else {
      // During hold - maintain the value at holdStart
      return easingFn(1);
    }
  };
}
