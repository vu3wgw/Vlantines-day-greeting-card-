/**
 * CloudLayers - Multi-layer parallax cloud system
 * Creates depth perception with varying scroll speeds
 */

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { CloudSVG } from "../assets/svg/PlaceholderSVGs";

export interface CloudLayer {
  /** Depth from 0 (far) to 1 (near) */
  depth: number;
  /** Scroll speed multiplier */
  scrollSpeed: number;
  /** Layer opacity */
  opacity: number;
  /** Blur amount */
  blur: number;
  /** Cloud count in this layer */
  cloudCount: number;
}

export interface CloudLayersProps {
  /** Custom layer configuration (optional) */
  layers?: CloudLayer[];
  /** Global animation progress (0-1) */
  progress?: number;
  /** Color tint for clouds */
  tint?: string;
}

// Default layer configuration (4 layers for depth)
const DEFAULT_LAYERS: CloudLayer[] = [
  {
    depth: 0,
    scrollSpeed: 0.2,
    opacity: 0.3,
    blur: 8,
    cloudCount: 3,
  },
  {
    depth: 0.3,
    scrollSpeed: 0.5,
    opacity: 0.4,
    blur: 4,
    cloudCount: 4,
  },
  {
    depth: 0.6,
    scrollSpeed: 0.8,
    opacity: 0.6,
    blur: 2,
    cloudCount: 5,
  },
  {
    depth: 1,
    scrollSpeed: 1.2,
    opacity: 0.8,
    blur: 0,
    cloudCount: 6,
  },
];

/**
 * Main CloudLayers component
 */
export const CloudLayers: React.FC<CloudLayersProps> = ({
  layers = DEFAULT_LAYERS,
  progress,
  tint = "#ffffff",
}) => {
  const frame = useCurrentFrame();

  // Use frame-based progress if not provided
  const animationProgress = progress !== undefined ? progress : frame / 100;

  return (
    <AbsoluteFill>
      {layers.map((layer, index) => (
        <CloudLayerRenderer
          key={index}
          layer={layer}
          progress={animationProgress}
          tint={tint}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Individual cloud layer renderer
 */
interface CloudLayerRendererProps {
  layer: CloudLayer;
  progress: number;
  tint: string;
}

const CloudLayerRenderer: React.FC<CloudLayerRendererProps> = ({
  layer,
  progress,
  tint,
}) => {
  // Generate cloud positions (deterministic based on depth)
  const clouds = useMemo(() => {
    const seed = layer.depth * 1000;
    return Array.from({ length: layer.cloudCount }, (_, i) => ({
      id: `${layer.depth}-${i}`,
      x: (seed + i * 300) % 1400 - 200, // Spread across width
      y: ((seed + i * 200) % 800) + 100, // Vertical distribution
      size: 150 + ((seed + i * 50) % 100), // Varied sizes
      variant: ((i % 3) + 1) as 1 | 2 | 3, // Cloud shape variant
    }));
  }, [layer.depth, layer.cloudCount]);

  // Calculate scroll offset based on layer speed
  const scrollOffset = -(progress * layer.scrollSpeed * 2000);

  // Scale based on depth (closer = larger)
  const scale = 0.6 + layer.depth * 0.4;

  return (
    <AbsoluteFill
      style={{
        opacity: layer.opacity,
        filter: `blur(${layer.blur}px)`,
        transform: `scale(${scale})`,
      }}
    >
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          style={{
            position: "absolute",
            left: cloud.x + scrollOffset,
            top: cloud.y,
            transform: "translateX(-50%)",
          }}
        >
          <CloudSVG
            width={cloud.size}
            height={cloud.size * 0.5}
            variant={cloud.variant}
            style={{ filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.1))` }}
          />
        </div>
      ))}

      {/* Duplicate clouds for seamless loop */}
      {clouds.map((cloud) => (
        <div
          key={`${cloud.id}-dup`}
          style={{
            position: "absolute",
            left: cloud.x + scrollOffset + 2000,
            top: cloud.y,
            transform: "translateX(-50%)",
          }}
        >
          <CloudSVG
            width={cloud.size}
            height={cloud.size * 0.5}
            variant={cloud.variant}
            style={{ filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.1))` }}
          />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/**
 * Animated sky gradient background
 */
export const SkyGradient: React.FC<{ colorScheme?: "day" | "sunset" | "romantic" }> = ({
  colorScheme = "romantic",
}) => {
  const gradients = {
    day: ["#87CEEB", "#E0F6FF"],
    sunset: ["#FF6B9D", "#FFC371"],
    romantic: ["#ffd1dc", "#ffb3c6"],
  };

  const colors = gradients[colorScheme];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
      }}
    />
  );
};

/**
 * Hook for calculating parallax scroll amount
 */
export const useParallaxScroll = (
  frame: number,
  startFrame: number,
  endFrame: number,
  speedMultiplier: number = 1
): number => {
  return interpolate(
    frame,
    [startFrame, endFrame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  ) * speedMultiplier;
};
