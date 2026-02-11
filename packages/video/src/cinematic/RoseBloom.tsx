/**
 * RoseBloom - Animated rose blooming from arrow impact
 * Staggered bloom animation with spring physics
 */

import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { RoseSVG } from "../assets/svg/PlaceholderSVGs";

export interface RoseBloomProps {
  /** Center position of bloom */
  centerX?: number;
  centerY?: number;
  /** Number of roses to bloom */
  roseCount?: number;
  /** Start frame for bloom animation */
  startFrame?: number;
  /** Color of roses */
  color?: string;
}

interface RoseInstance {
  id: number;
  delay: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

/**
 * Main rose bloom effect
 */
export const RoseBloom: React.FC<RoseBloomProps> = ({
  centerX = 540,
  centerY = 960,
  roseCount = 5,
  startFrame = 0,
  color = "#d81b60",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate rose positions in a circular pattern
  const roses = useMemo<RoseInstance[]>(() => {
    const baseRoses: RoseInstance[] = [
      // Center rose (arrow shaft)
      { id: 0, delay: 0, x: 0, y: 0, scale: 1.5, rotation: 0 },
    ];

    // Surrounding roses in a circle
    const angleStep = (Math.PI * 2) / (roseCount - 1);
    for (let i = 1; i < roseCount; i++) {
      const angle = angleStep * (i - 1);
      const radius = 80 + Math.random() * 40;
      baseRoses.push({
        id: i,
        delay: i * 8, // Stagger by 8 frames
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        scale: 1 + Math.random() * 0.4,
        rotation: Math.random() * 360,
      });
    }

    return baseRoses;
  }, [roseCount]);

  const relativeFrame = frame - startFrame;

  return (
    <AbsoluteFill>
      {roses.map((rose) => (
        <BloomingRose
          key={rose.id}
          rose={rose}
          centerX={centerX}
          centerY={centerY}
          currentFrame={relativeFrame}
          fps={fps}
          color={color}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Individual blooming rose
 */
interface BloomingRoseProps {
  rose: RoseInstance;
  centerX: number;
  centerY: number;
  currentFrame: number;
  fps: number;
  color: string;
}

const BloomingRose: React.FC<BloomingRoseProps> = ({
  rose,
  centerX,
  centerY,
  currentFrame,
  fps,
  color,
}) => {
  // Bloom animation with bouncy spring
  const bloomProgress = spring({
    frame: Math.max(0, currentFrame - rose.delay),
    fps,
    config: {
      damping: 15,
      stiffness: 100,
      mass: 1,
    },
  });

  // Scale from 0 to full size
  const scale = interpolate(bloomProgress, [0, 1], [0, rose.scale * 1.2]);

  // Rotation during bloom
  const rotation = interpolate(bloomProgress, [0, 1], [0, rose.rotation]);

  // Position expands outward
  const x = centerX + rose.x * bloomProgress;
  const y = centerY + rose.y * bloomProgress;

  // Fade in
  const opacity = interpolate(bloomProgress, [0, 0.3, 1], [0, 1, 1]);

  // Don't render if not started yet
  if (currentFrame < rose.delay) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `
          translate(-50%, -50%)
          scale(${scale})
          rotate(${rotation}deg)
        `,
        opacity,
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
      }}
    >
      <RoseSVG width={100} height={100} color={color} bloomStage="full" />
    </div>
  );
};

/**
 * Morphing rose (bud → half → full bloom)
 */
export const MorphingRose: React.FC<{
  x: number;
  y: number;
  startFrame: number;
  color?: string;
}> = ({ x, y, startFrame, color = "#d81b60" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;

  // Bloom stage progression
  const bloomProgress = interpolate(relativeFrame, [0, 30, 60], [0, 1, 2], {
    extrapolateRight: "clamp",
  });

  let bloomStage: "bud" | "half" | "full" = "bud";
  if (bloomProgress >= 1.5) {
    bloomStage = "full";
  } else if (bloomProgress >= 0.5) {
    bloomStage = "half";
  }

  const scale = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 20 },
  });

  if (relativeFrame < 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      <RoseSVG width={120} height={120} color={color} bloomStage={bloomStage} />
    </div>
  );
};

/**
 * Radial burst pattern of roses
 */
export const RoseRadialBurst: React.FC<{
  centerX: number;
  centerY: number;
  count: number;
  startFrame: number;
  color?: string;
}> = ({ centerX, centerY, count, startFrame, color = "#d81b60" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;

  const progress = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 200 },
  });

  const roses = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count;
      return {
        id: i,
        angle,
        distance: 150 + Math.random() * 100,
      };
    });
  }, [count]);

  if (relativeFrame < 0) return null;

  return (
    <AbsoluteFill>
      {roses.map((rose) => {
        const x = centerX + Math.cos(rose.angle) * rose.distance * progress;
        const y = centerY + Math.sin(rose.angle) * rose.distance * progress;

        return (
          <div
            key={rose.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              opacity: interpolate(progress, [0, 0.3, 1], [0, 1, 0.8]),
            }}
          >
            <RoseSVG width={60} height={60} color={color} bloomStage="full" />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
