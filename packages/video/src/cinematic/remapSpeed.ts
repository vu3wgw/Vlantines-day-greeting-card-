/**
 * remapSpeed - Exponential speed remapping utility
 * Inspired by GitHub Unwrapped for creating dynamic acceleration/deceleration effects
 *
 * @param frame - Current frame number
 * @param speed - Function that returns speed multiplier for each frame
 * @returns Remapped frame number with speed adjustments applied
 */
export const remapSpeed = (
  frame: number,
  speed: (frame: number) => number
): number => {
  let framesPassed = 0;

  for (let i = 0; i <= frame; i++) {
    framesPassed += speed(i);
  }

  return framesPassed;
};

/**
 * Common speed functions for different animation effects
 */
export const speedFunctions = {
  /**
   * Launch acceleration - slow start, fast end
   * Perfect for arrow launch sequence
   */
  launch: (frame: number, startFrame: number, endFrame: number) => {
    if (frame < startFrame) return 0;
    if (frame > endFrame) return 1;

    const progress = (frame - startFrame) / (endFrame - startFrame);
    // Exponential ease-out
    return 0.1 + progress * progress * 2.9;
  },

  /**
   * Cruise speed - consistent motion
   * For the journey through milestones
   */
  cruise: (frame: number) => 1,

  /**
   * Deceleration - fast to slow
   * For approaching the target
   */
  deceleration: (frame: number, startFrame: number, endFrame: number) => {
    if (frame < startFrame) return 1;
    if (frame > endFrame) return 0.1;

    const progress = (frame - startFrame) / (endFrame - startFrame);
    // Inverse exponential
    return 1 - progress * progress * 0.9;
  },

  /**
   * Impact slow-motion - dramatic slowdown
   * For the arrow piercing moment
   */
  slowMotion: (frame: number, impactFrame: number, windowSize: number) => {
    const distance = Math.abs(frame - impactFrame);

    if (distance > windowSize) return 1;

    // Slow down to 0.3x speed at impact
    const slowdownFactor = 1 - (1 - distance / windowSize) * 0.7;
    return slowdownFactor;
  },
};

/**
 * Combine multiple speed functions with frame ranges
 */
export const createSpeedSequence = (
  sequences: Array<{
    startFrame: number;
    endFrame: number;
    speedFn: (frame: number) => number;
  }>
) => {
  return (frame: number): number => {
    for (const seq of sequences) {
      if (frame >= seq.startFrame && frame <= seq.endFrame) {
        return seq.speedFn(frame);
      }
    }
    return 1; // Default speed
  };
};
