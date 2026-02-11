import React from "react";
import { useCurrentFrame, useVideoConfig, random, interpolate } from "remotion";

interface BokehCircle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  blur: number;
  speed: number;
  phase: number;
}

export interface BokehBackgroundProps {
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  blur?: number;
  opacity?: number;
  animated?: boolean;
  parallaxSpeed?: number;
  seed?: string | number;
  className?: string;
}

/**
 * BokehBackground - Blurred light circles for dreamy depth effect
 * Simulates out-of-focus lights in photography
 */
export const BokehBackground: React.FC<BokehBackgroundProps> = ({
  count = 15,
  colors = [
    "rgba(255, 150, 180, 0.4)",
    "rgba(255, 200, 220, 0.35)",
    "rgba(255, 180, 200, 0.3)",
    "rgba(255, 220, 230, 0.25)",
    "rgba(255, 100, 130, 0.2)",
  ],
  minSize = 50,
  maxSize = 200,
  blur = 20,
  opacity = 0.6,
  animated = true,
  parallaxSpeed = 0.3,
  seed = "bokeh",
  className,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Generate bokeh circles
  const circles: BokehCircle[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seedKey = `${seed}-${i}`;
      return {
        id: i,
        x: random(seedKey + "-x") * width * 1.2 - width * 0.1,
        y: random(seedKey + "-y") * height * 1.2 - height * 0.1,
        size: minSize + random(seedKey + "-size") * (maxSize - minSize),
        color: colors[Math.floor(random(seedKey + "-color") * colors.length)],
        opacity: 0.2 + random(seedKey + "-opacity") * 0.5,
        blur: blur * (0.5 + random(seedKey + "-blur") * 0.5),
        speed: 0.5 + random(seedKey + "-speed") * 1,
        phase: random(seedKey + "-phase") * Math.PI * 2,
      };
    });
  }, [seed, count, width, height, minSize, maxSize, colors, blur]);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {circles.map((circle) => {
        // Animation: gentle floating + parallax
        let currentX = circle.x;
        let currentY = circle.y;
        let currentOpacity = circle.opacity * opacity;

        if (animated) {
          // Gentle floating motion
          const floatX = Math.sin(frame * 0.01 * circle.speed + circle.phase) * 20;
          const floatY = Math.cos(frame * 0.008 * circle.speed + circle.phase) * 15;

          // Parallax based on frame progress
          const parallaxOffset = (frame / durationInFrames) * 100 * parallaxSpeed;

          currentX = circle.x + floatX;
          currentY = circle.y + floatY - parallaxOffset;

          // Subtle opacity pulse
          const pulse = Math.sin(frame * 0.02 + circle.phase) * 0.15 + 0.85;
          currentOpacity = circle.opacity * opacity * pulse;
        }

        return (
          <div
            key={circle.id}
            style={{
              position: "absolute",
              left: currentX,
              top: currentY,
              width: circle.size,
              height: circle.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${circle.color} 0%, transparent 70%)`,
              filter: `blur(${circle.blur}px)`,
              opacity: currentOpacity,
              transform: "translate(-50%, -50%)",
              willChange: animated ? "transform, opacity" : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * LensFlare - Light leak/lens flare effect
 */
export interface LensFlareProps {
  position?: { x: number; y: number };
  color?: string;
  intensity?: number;
  animated?: boolean;
  className?: string;
}

export const LensFlare: React.FC<LensFlareProps> = ({
  position = { x: 20, y: 30 },
  color = "rgba(255, 200, 180, 0.4)",
  intensity = 1,
  animated = true,
  className,
}) => {
  const frame = useCurrentFrame();

  let currentIntensity = intensity;
  if (animated) {
    const flicker = Math.sin(frame * 0.05) * 0.2 + 0.8;
    currentIntensity = intensity * flicker;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Main flare */}
      <div
        style={{
          position: "absolute",
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: "40%",
          height: "40%",
          background: `radial-gradient(ellipse, ${color} 0%, transparent 70%)`,
          opacity: currentIntensity * 0.6,
          transform: "translate(-50%, -50%)",
          filter: "blur(30px)",
        }}
      />

      {/* Secondary flares */}
      <div
        style={{
          position: "absolute",
          left: `${100 - position.x}%`,
          top: `${100 - position.y}%`,
          width: "20%",
          height: "20%",
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: currentIntensity * 0.3,
          transform: "translate(-50%, -50%)",
          filter: "blur(20px)",
        }}
      />

      {/* Light streak */}
      <div
        style={{
          position: "absolute",
          left: "0",
          top: `${position.y}%`,
          width: "100%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: currentIntensity * 0.4,
          filter: "blur(2px)",
        }}
      />
    </div>
  );
};

/**
 * DreamyBackground - Combination of bokeh + gradient for maximum dreamy effect
 */
export interface DreamyBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  bokehCount?: number;
  className?: string;
}

export const DreamyBackground: React.FC<DreamyBackgroundProps> = ({
  primaryColor = "#1a0a0f",
  secondaryColor = "#2d1a24",
  bokehCount = 12,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)`,
        }}
      />

      {/* Bokeh layer */}
      <BokehBackground count={bokehCount} animated parallaxSpeed={0.2} />

      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255, 100, 130, 0.1) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};
