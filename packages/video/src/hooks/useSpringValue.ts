import { useCurrentFrame, useVideoConfig } from "remotion";
import { createSpring, staggeredSpring, springBetween, SpringPreset } from "../animation/springs";

/**
 * Hook for creating spring-based animation values
 */
export function useSpringValue(
  preset: SpringPreset = "smooth",
  delay: number = 0
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return createSpring(frame, fps, preset, delay);
}

/**
 * Hook for creating spring value between two numbers
 */
export function useSpringBetween(
  start: number,
  end: number,
  preset: SpringPreset = "smooth",
  delay: number = 0
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return springBetween(frame, fps, preset, start, end, delay);
}

/**
 * Hook for creating staggered spring values
 */
export function useStaggeredSpring(
  index: number,
  preset: SpringPreset = "bouncy",
  staggerFrames: number = 3
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return staggeredSpring(frame, fps, preset, index, staggerFrames);
}

/**
 * Hook for entrance animation with spring
 */
export function useSpringEntrance(
  preset: SpringPreset = "smooth",
  delay: number = 0
): {
  opacity: number;
  scale: number;
  translateY: number;
} {
  const progress = useSpringValue(preset, delay);

  return {
    opacity: Math.min(1, progress * 1.5), // Fade in faster than position
    scale: 0.8 + 0.2 * progress, // Scale from 0.8 to 1
    translateY: (1 - progress) * 30, // Slide up 30px
  };
}

/**
 * Hook for fly-in animation with spring
 */
export function useSpringFlyIn(
  direction: "left" | "right" | "top" | "bottom" = "bottom",
  preset: SpringPreset = "bouncy",
  delay: number = 0,
  distance: number = 100
): {
  opacity: number;
  translateX: number;
  translateY: number;
} {
  const progress = useSpringValue(preset, delay);

  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case "left":
      translateX = (1 - progress) * -distance;
      break;
    case "right":
      translateX = (1 - progress) * distance;
      break;
    case "top":
      translateY = (1 - progress) * -distance;
      break;
    case "bottom":
      translateY = (1 - progress) * distance;
      break;
  }

  return {
    opacity: Math.min(1, progress * 2),
    translateX,
    translateY,
  };
}

/**
 * Hook for scale-pop animation with spring
 */
export function useSpringPop(
  preset: SpringPreset = "bouncy",
  delay: number = 0,
  fromScale: number = 0
): {
  opacity: number;
  scale: number;
} {
  const progress = useSpringValue(preset, delay);

  return {
    opacity: Math.min(1, progress * 3),
    scale: fromScale + (1 - fromScale) * progress,
  };
}
