/**
 * PetalScatter - Particle system for rose petals
 * Realistic physics with gravity and rotation
 */

import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, random } from "remotion";
import { RosePetalSVG } from "../assets/svg/PlaceholderSVGs";

export interface PetalScatterProps {
  /** Center position of scatter */
  centerX?: number;
  centerY?: number;
  /** Number of petals */
  petalCount?: number;
  /** Start frame */
  startFrame?: number;
  /** Gravity strength */
  gravity?: number;
  /** Color of petals */
  color?: string;
  /** Seed for deterministic randomness */
  seed?: string | number;
}

interface Petal {
  id: number;
  startX: number;
  startY: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  initialRotation: number;
  size: number;
  opacity: number;
}

/**
 * Main petal scatter effect
 */
export const PetalScatter: React.FC<PetalScatterProps> = ({
  centerX = 540,
  centerY = 960,
  petalCount = 50,
  startFrame = 0,
  gravity = 0.3,
  color = "#d81b60",
  seed = "petals",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate petals with deterministic randomness
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: petalCount }, (_, i) => {
      const seedValue = typeof seed === "string" ? seed : seed.toString();

      // Use Remotion's random for deterministic results
      const angle = random(`${seedValue}-angle-${i}`) * Math.PI * 2;
      const speed = 5 + random(`${seedValue}-speed-${i}`) * 10;

      return {
        id: i,
        startX: centerX,
        startY: centerY,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 5, // Initial upward burst
        rotationSpeed: (random(`${seedValue}-rot-${i}`) - 0.5) * 20,
        initialRotation: random(`${seedValue}-init-rot-${i}`) * 360,
        size: 25 + random(`${seedValue}-size-${i}`) * 20,
        opacity: 0.6 + random(`${seedValue}-opacity-${i}`) * 0.4,
      };
    });
  }, [petalCount, centerX, centerY, seed]);

  const relativeFrame = frame - startFrame;

  return (
    <AbsoluteFill>
      {petals.map((petal) => (
        <FallingPetal
          key={petal.id}
          petal={petal}
          currentFrame={relativeFrame}
          fps={fps}
          gravity={gravity}
          color={color}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Individual falling petal with physics
 */
interface FallingPetalProps {
  petal: Petal;
  currentFrame: number;
  fps: number;
  gravity: number;
  color: string;
}

const FallingPetal: React.FC<FallingPetalProps> = ({
  petal,
  currentFrame,
  fps,
  gravity,
  color,
}) => {
  // Don't render before start
  if (currentFrame < 0) {
    return null;
  }

  // Calculate position with physics
  const time = currentFrame / fps;

  // Horizontal position (constant velocity)
  const x = petal.startX + petal.velocityX * currentFrame;

  // Vertical position (gravity acceleration)
  const y = petal.startY +
    petal.velocityY * currentFrame +
    0.5 * gravity * currentFrame * currentFrame;

  // Rotation
  const rotation = petal.initialRotation + petal.rotationSpeed * currentFrame;

  // Fade out as petals fall
  const opacity = interpolate(
    currentFrame,
    [0, 30, 120, 150],
    [0, petal.opacity, petal.opacity, 0],
    { extrapolateRight: "clamp" }
  );

  // Gentle sway (sine wave)
  const swayX = Math.sin(currentFrame * 0.1) * 15;

  return (
    <div
      style={{
        position: "absolute",
        left: x + swayX,
        top: y,
        transform: `
          translate(-50%, -50%)
          rotate(${rotation}deg)
        `,
        opacity,
      }}
    >
      <RosePetalSVG
        width={petal.size}
        height={petal.size * 1.5}
        color={color}
      />
    </div>
  );
};

/**
 * Wind-blown petals (horizontal drift)
 */
export const WindBlownPetals: React.FC<{
  count: number;
  startFrame: number;
  direction?: "left" | "right";
  color?: string;
}> = ({ count, startFrame, direction = "right", color = "#d81b60" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;

  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      startY: random(`wind-y-${i}`) * 1920,
      speed: 2 + random(`wind-speed-${i}`) * 3,
      amplitude: 30 + random(`wind-amp-${i}`) * 50,
      frequency: 0.02 + random(`wind-freq-${i}`) * 0.03,
      size: 20 + random(`wind-size-${i}`) * 15,
      rotation: random(`wind-rot-${i}`) * 360,
    }));
  }, [count]);

  if (relativeFrame < 0) return null;

  const directionMultiplier = direction === "right" ? 1 : -1;

  return (
    <AbsoluteFill>
      {petals.map((petal) => {
        const x = directionMultiplier * petal.speed * relativeFrame;
        const y = petal.startY + Math.sin(relativeFrame * petal.frequency) * petal.amplitude;
        const rotation = petal.rotation + relativeFrame * 2;

        return (
          <div
            key={petal.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `rotate(${rotation}deg)`,
              opacity: 0.4,
            }}
          >
            <RosePetalSVG width={petal.size} height={petal.size * 1.5} color={color} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Petal explosion (outward burst)
 */
export const PetalExplosion: React.FC<{
  centerX: number;
  centerY: number;
  count: number;
  startFrame: number;
  power?: number;
  color?: string;
}> = ({ centerX, centerY, count, startFrame, power = 15, color = "#d81b60" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;

  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + random(`exp-offset-${i}`) * 0.5;
      const speed = power * (0.7 + random(`exp-power-${i}`) * 0.6);

      return {
        id: i,
        angle,
        speed,
        size: 25 + random(`exp-size-${i}`) * 20,
        rotation: random(`exp-rot-${i}`) * 360,
        rotSpeed: (random(`exp-rotspeed-${i}`) - 0.5) * 15,
      };
    });
  }, [count, power]);

  if (relativeFrame < 0) return null;

  return (
    <AbsoluteFill>
      {petals.map((petal) => {
        const distance = petal.speed * relativeFrame;
        const x = centerX + Math.cos(petal.angle) * distance;
        const y = centerY + Math.sin(petal.angle) * distance + 0.2 * relativeFrame * relativeFrame; // Gravity
        const rotation = petal.rotation + petal.rotSpeed * relativeFrame;
        const opacity = interpolate(relativeFrame, [0, 15, 60, 90], [0, 1, 0.8, 0], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={petal.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              opacity,
            }}
          >
            <RosePetalSVG width={petal.size} height={petal.size * 1.5} color={color} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
