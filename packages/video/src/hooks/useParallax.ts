import { useCurrentFrame, useVideoConfig } from "remotion";
import { interpolate } from "remotion";

/**
 * Hook for creating parallax depth effects
 * Elements with lower depth values (closer to camera) move faster
 */
export function useParallax(
  depth: number = 1,
  range: number = 50
): {
  translateY: number;
  translateX: number;
  scale: number;
} {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress through the scene (0 to 1)
  const progress = frame / durationInFrames;

  // Speed multiplier based on depth (closer = faster)
  const speedMultiplier = 1 / depth;

  // Vertical parallax movement
  const translateY = interpolate(
    progress,
    [0, 1],
    [-range * speedMultiplier, range * speedMultiplier]
  );

  // Horizontal parallax (subtle)
  const translateX = interpolate(
    progress,
    [0, 1],
    [-range * 0.2 * speedMultiplier, range * 0.2 * speedMultiplier]
  );

  // Subtle scale change for depth
  const scale = interpolate(
    progress,
    [0, 1],
    [1 - 0.02 * speedMultiplier, 1 + 0.02 * speedMultiplier]
  );

  return { translateY, translateX, scale };
}

/**
 * Hook for multi-layer parallax backgrounds
 */
export function useParallaxLayers(layerCount: number = 4): Array<{
  depth: number;
  translateY: number;
  translateX: number;
  scale: number;
  blur: number;
  opacity: number;
}> {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;

  return Array.from({ length: layerCount }, (_, i) => {
    // Depth increases with layer index (layer 0 is closest, layer n is furthest)
    const depth = (i + 1) / layerCount;
    const speedMultiplier = 1 - depth * 0.8; // Further layers move slower

    const translateY = interpolate(
      progress,
      [0, 1],
      [-30 * speedMultiplier, 30 * speedMultiplier]
    );

    const translateX = interpolate(
      progress,
      [0, 1],
      [-10 * speedMultiplier, 10 * speedMultiplier]
    );

    // Further layers are slightly smaller
    const scale = 1 - depth * 0.1;

    // Further layers are more blurred (depth of field)
    const blur = depth * 8;

    // Further layers are more transparent
    const opacity = 1 - depth * 0.3;

    return {
      depth,
      translateY,
      translateX,
      scale,
      blur,
      opacity,
    };
  });
}

/**
 * Hook for Ken Burns style parallax (zoom + pan)
 */
export function useKenBurnsParallax(
  direction: "zoomIn" | "zoomOut" | "panLeft" | "panRight" | "panUp" | "panDown" = "zoomIn"
): {
  scale: number;
  translateX: number;
  translateY: number;
} {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case "zoomIn":
      scale = interpolate(progress, [0, 1], [1, 1.15]);
      break;
    case "zoomOut":
      scale = interpolate(progress, [0, 1], [1.15, 1]);
      break;
    case "panLeft":
      scale = 1.1;
      translateX = interpolate(progress, [0, 1], [3, -3]);
      break;
    case "panRight":
      scale = 1.1;
      translateX = interpolate(progress, [0, 1], [-3, 3]);
      break;
    case "panUp":
      scale = 1.1;
      translateY = interpolate(progress, [0, 1], [3, -3]);
      break;
    case "panDown":
      scale = 1.1;
      translateY = interpolate(progress, [0, 1], [-3, 3]);
      break;
  }

  return {
    scale,
    translateX,
    translateY,
  };
}
