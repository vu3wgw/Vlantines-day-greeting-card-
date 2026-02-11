import { spring, SpringConfig } from "remotion";

/**
 * Spring Physics Presets
 * Each preset creates a different "feel" for animations
 */
export const SPRING_PRESETS = {
  // Bouncy, playful - for stickers flying in, playful elements
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.5,
  },

  // Extra bouncy - for celebration moments
  superBouncy: {
    damping: 8,
    stiffness: 120,
    mass: 0.4,
  },

  // Smooth, elegant - for text reveals, sophisticated animations
  smooth: {
    damping: 20,
    stiffness: 80,
    mass: 1,
  },

  // Snappy, quick - for UI elements, quick responses
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 0.3,
  },

  // Gentle, slow - for backgrounds, subtle movements
  gentle: {
    damping: 25,
    stiffness: 40,
    mass: 1.5,
  },

  // Wobbly - for hearts, playful decorations
  wobbly: {
    damping: 8,
    stiffness: 150,
    mass: 0.4,
  },

  // Heavy, dramatic - for impactful moments
  dramatic: {
    damping: 12,
    stiffness: 60,
    mass: 2,
  },

  // Light, floaty - for particles, floating elements
  floaty: {
    damping: 30,
    stiffness: 30,
    mass: 0.8,
  },
} as const;

export type SpringPreset = keyof typeof SPRING_PRESETS;

/**
 * Get spring config by preset name
 */
export function getSpringConfig(preset: SpringPreset): SpringConfig {
  return SPRING_PRESETS[preset];
}

/**
 * Create a spring animation value
 * @param frame - Current frame
 * @param fps - Frames per second
 * @param preset - Spring preset name
 * @param delay - Delay in frames before animation starts
 * @returns Spring value from 0 to 1 (may overshoot with bouncy presets)
 */
export function createSpring(
  frame: number,
  fps: number,
  preset: SpringPreset,
  delay: number = 0
): number {
  return spring({
    frame: frame - delay,
    fps,
    config: SPRING_PRESETS[preset],
  });
}

/**
 * Create a spring animation with custom config
 */
export function createCustomSpring(
  frame: number,
  fps: number,
  config: SpringConfig,
  delay: number = 0
): number {
  return spring({
    frame: frame - delay,
    fps,
    config,
  });
}

/**
 * Create a spring that goes from 0 to target value
 */
export function springTo(
  frame: number,
  fps: number,
  preset: SpringPreset,
  target: number,
  delay: number = 0
): number {
  return createSpring(frame, fps, preset, delay) * target;
}

/**
 * Create a spring that goes from start to end value
 */
export function springBetween(
  frame: number,
  fps: number,
  preset: SpringPreset,
  start: number,
  end: number,
  delay: number = 0
): number {
  const progress = createSpring(frame, fps, preset, delay);
  return start + (end - start) * progress;
}

/**
 * Create a staggered spring for multiple elements
 * Returns spring value for a specific index with automatic stagger delay
 */
export function staggeredSpring(
  frame: number,
  fps: number,
  preset: SpringPreset,
  index: number,
  staggerFrames: number = 3
): number {
  const delay = index * staggerFrames;
  return createSpring(frame, fps, preset, delay);
}

/**
 * Create a spring that bounces back (in then out)
 * Useful for attention-grabbing animations
 */
export function springPulse(
  frame: number,
  fps: number,
  preset: SpringPreset,
  durationFrames: number,
  delay: number = 0
): number {
  const adjustedFrame = frame - delay;
  if (adjustedFrame < 0) return 0;

  const midPoint = durationFrames / 2;

  if (adjustedFrame < midPoint) {
    // Animate in
    return spring({
      frame: adjustedFrame,
      fps,
      config: SPRING_PRESETS[preset],
    });
  } else {
    // Animate out (reverse)
    const outFrame = adjustedFrame - midPoint;
    const outProgress = spring({
      frame: outFrame,
      fps,
      config: SPRING_PRESETS[preset],
    });
    return 1 - outProgress;
  }
}

/**
 * Combine multiple springs for complex animations
 * Useful for entrance + settle animations
 */
export function chainedSpring(
  frame: number,
  fps: number,
  stages: Array<{
    preset: SpringPreset;
    durationFrames: number;
    fromValue: number;
    toValue: number;
  }>
): number {
  let currentFrame = frame;
  let value = stages[0]?.fromValue ?? 0;

  for (const stage of stages) {
    if (currentFrame <= 0) break;

    const progress = spring({
      frame: Math.min(currentFrame, stage.durationFrames),
      fps,
      config: SPRING_PRESETS[stage.preset],
    });

    value = stage.fromValue + (stage.toValue - stage.fromValue) * progress;
    currentFrame -= stage.durationFrames;
  }

  return value;
}
