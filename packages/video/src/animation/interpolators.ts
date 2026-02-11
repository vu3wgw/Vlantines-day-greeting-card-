import { interpolate, Easing } from "remotion";

/**
 * Advanced Interpolation Helpers
 * For complex, premium animations
 */

/**
 * Interpolate with automatic clamping
 */
export function clampedInterpolate(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number]
): number {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Interpolate with easing function
 */
export function easedInterpolate(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easingFn: (t: number) => number = Easing.out(Easing.cubic)
): number {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easingFn,
  });
}

/**
 * Interpolate opacity with standard fade timing
 * Fades in over first portion, holds, fades out at end
 */
export function fadeInOut(
  frame: number,
  durationFrames: number,
  fadeInFrames: number = 15,
  fadeOutFrames: number = 15
): number {
  const fadeInEnd = fadeInFrames;
  const fadeOutStart = durationFrames - fadeOutFrames;

  if (frame < fadeInEnd) {
    return interpolate(frame, [0, fadeInEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame > fadeOutStart) {
    return interpolate(frame, [fadeOutStart, durationFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return 1;
}

/**
 * Interpolate for entrance animation only (0 to 1)
 */
export function entrance(
  frame: number,
  startFrame: number,
  durationFrames: number,
  easingFn: (t: number) => number = Easing.out(Easing.cubic)
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easingFn,
    }
  );
}

/**
 * Interpolate for exit animation only (1 to 0)
 */
export function exit(
  frame: number,
  startFrame: number,
  durationFrames: number,
  easingFn: (t: number) => number = Easing.in(Easing.cubic)
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easingFn,
    }
  );
}

/**
 * Create a Y-axis slide-up entrance
 */
export function slideUpEntrance(
  frame: number,
  startFrame: number,
  durationFrames: number,
  distance: number = 50,
  easingFn: (t: number) => number = Easing.out(Easing.cubic)
): { translateY: number; opacity: number } {
  const progress = entrance(frame, startFrame, durationFrames, easingFn);
  return {
    translateY: interpolate(progress, [0, 1], [distance, 0]),
    opacity: progress,
  };
}

/**
 * Create a scale entrance animation
 */
export function scaleEntrance(
  frame: number,
  startFrame: number,
  durationFrames: number,
  fromScale: number = 0.8,
  easingFn: (t: number) => number = Easing.out(Easing.back(1.7))
): { scale: number; opacity: number } {
  const progress = entrance(frame, startFrame, durationFrames, easingFn);
  return {
    scale: interpolate(progress, [0, 1], [fromScale, 1]),
    opacity: interpolate(progress, [0, 0.3], [0, 1], {
      extrapolateRight: "clamp",
    }),
  };
}

/**
 * Create a fly-in animation from any direction
 */
export function flyIn(
  frame: number,
  startFrame: number,
  durationFrames: number,
  direction: "left" | "right" | "top" | "bottom",
  distance: number = 200,
  easingFn: (t: number) => number = Easing.out(Easing.cubic)
): { translateX: number; translateY: number; opacity: number } {
  const progress = entrance(frame, startFrame, durationFrames, easingFn);

  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case "left":
      translateX = interpolate(progress, [0, 1], [-distance, 0]);
      break;
    case "right":
      translateX = interpolate(progress, [0, 1], [distance, 0]);
      break;
    case "top":
      translateY = interpolate(progress, [0, 1], [-distance, 0]);
      break;
    case "bottom":
      translateY = interpolate(progress, [0, 1], [distance, 0]);
      break;
  }

  return {
    translateX,
    translateY,
    opacity: interpolate(progress, [0, 0.3], [0, 1], {
      extrapolateRight: "clamp",
    }),
  };
}

/**
 * Create a spiral-in animation (for playful elements)
 */
export function spiralIn(
  frame: number,
  startFrame: number,
  durationFrames: number,
  rotations: number = 1,
  startScale: number = 0,
  startDistance: number = 200,
  easingFn: (t: number) => number = Easing.out(Easing.cubic)
): { translateX: number; translateY: number; rotate: number; scale: number; opacity: number } {
  const progress = entrance(frame, startFrame, durationFrames, easingFn);
  const angle = progress * rotations * 360;
  const distance = interpolate(progress, [0, 1], [startDistance, 0]);

  return {
    translateX: Math.cos((angle * Math.PI) / 180) * distance,
    translateY: Math.sin((angle * Math.PI) / 180) * distance,
    rotate: interpolate(progress, [0, 1], [rotations * 360, 0]),
    scale: interpolate(progress, [0, 1], [startScale, 1]),
    opacity: interpolate(progress, [0, 0.2], [0, 1], {
      extrapolateRight: "clamp",
    }),
  };
}

/**
 * Create a parallax movement based on scroll/frame position
 */
export function parallax(
  frame: number,
  totalFrames: number,
  speed: number = 1,
  range: number = 100
): number {
  const progress = frame / totalFrames;
  return interpolate(progress, [0, 1], [-range * speed, range * speed]);
}

/**
 * Create continuous floating/bobbing animation
 */
export function float(
  frame: number,
  amplitude: number = 10,
  frequency: number = 0.05,
  phase: number = 0
): number {
  return Math.sin(frame * frequency + phase) * amplitude;
}

/**
 * Create a wiggle/shake animation
 */
export function wiggle(
  frame: number,
  amplitude: number = 5,
  frequency: number = 0.3,
  decay: number = 0.95
): number {
  const decayFactor = Math.pow(decay, frame * 0.1);
  return Math.sin(frame * frequency) * amplitude * decayFactor;
}

/**
 * Create a pulse/heartbeat animation
 */
export function pulse(
  frame: number,
  minScale: number = 1,
  maxScale: number = 1.1,
  periodFrames: number = 30
): number {
  const progress = (frame % periodFrames) / periodFrames;
  // Quick expand, slower contract
  if (progress < 0.3) {
    return interpolate(progress, [0, 0.3], [minScale, maxScale]);
  } else {
    return interpolate(progress, [0.3, 1], [maxScale, minScale]);
  }
}

/**
 * Create staggered delay for multiple elements
 */
export function staggerDelay(
  index: number,
  staggerFrames: number = 3,
  startFrame: number = 0
): number {
  return startFrame + index * staggerFrames;
}

/**
 * Interpolate between two colors
 */
export function colorInterpolate(
  progress: number,
  fromColor: string,
  toColor: string
): string {
  // Parse hex colors
  const parseHex = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  const [r1, g1, b1] = parseHex(fromColor);
  const [r2, g2, b2] = parseHex(toColor);

  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Create a sequence of timed events
 */
export interface SequenceEvent<T> {
  startFrame: number;
  endFrame: number;
  value: T;
}

export function sequenceValue<T>(
  frame: number,
  events: SequenceEvent<T>[],
  defaultValue: T
): T {
  for (const event of events) {
    if (frame >= event.startFrame && frame < event.endFrame) {
      return event.value;
    }
  }
  return defaultValue;
}

/**
 * Create transform string from animation values
 */
export function buildTransform(values: {
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
}): string {
  const transforms: string[] = [];

  if (values.translateX !== undefined || values.translateY !== undefined || values.translateZ !== undefined) {
    const x = values.translateX ?? 0;
    const y = values.translateY ?? 0;
    const z = values.translateZ;
    if (z !== undefined) {
      transforms.push(`translate3d(${x}px, ${y}px, ${z}px)`);
    } else {
      transforms.push(`translate(${x}px, ${y}px)`);
    }
  }

  if (values.rotateX !== undefined) transforms.push(`rotateX(${values.rotateX}deg)`);
  if (values.rotateY !== undefined) transforms.push(`rotateY(${values.rotateY}deg)`);
  if (values.rotateZ !== undefined) transforms.push(`rotateZ(${values.rotateZ}deg)`);
  if (values.rotate !== undefined) transforms.push(`rotate(${values.rotate}deg)`);

  if (values.scale !== undefined) {
    transforms.push(`scale(${values.scale})`);
  } else if (values.scaleX !== undefined || values.scaleY !== undefined) {
    transforms.push(`scale(${values.scaleX ?? 1}, ${values.scaleY ?? 1})`);
  }

  return transforms.join(" ");
}
