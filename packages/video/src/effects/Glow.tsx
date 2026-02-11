import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export interface GlowProps {
  color?: string;
  intensity?: number;
  size?: number;
  animated?: boolean;
  pulseFrames?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Glow - Add soft glow effect to children
 * Perfect for highlighting important elements
 */
export const Glow: React.FC<GlowProps> = ({
  color = "rgba(255, 150, 180, 0.6)",
  intensity = 1,
  size = 30,
  animated = false,
  pulseFrames = 60,
  children,
  className,
}) => {
  const frame = useCurrentFrame();

  // Pulsing effect if animated
  let currentIntensity = intensity;
  let currentSize = size;

  if (animated) {
    const pulseProgress = (frame % pulseFrames) / pulseFrames;
    const pulseValue = Math.sin(pulseProgress * Math.PI * 2) * 0.3 + 0.7;
    currentIntensity = intensity * pulseValue;
    currentSize = size * (0.8 + pulseValue * 0.4);
  }

  const glowStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 ${currentSize * currentIntensity}px ${color})`,
  };

  return (
    <div className={className} style={glowStyle}>
      {children}
    </div>
  );
};

/**
 * PulsingGlow - Continuously pulsing glow effect
 */
export const PulsingGlow: React.FC<Omit<GlowProps, "animated">> = (props) => {
  return <Glow {...props} animated={true} />;
};

/**
 * GlowBackground - Full-screen glow/radial gradient background
 */
export interface GlowBackgroundProps {
  color?: string;
  centerX?: number;
  centerY?: number;
  size?: number;
  animated?: boolean;
  className?: string;
}

export const GlowBackground: React.FC<GlowBackgroundProps> = ({
  color = "rgba(255, 100, 130, 0.3)",
  centerX = 50,
  centerY = 50,
  size = 50,
  animated = false,
  className,
}) => {
  const frame = useCurrentFrame();

  let currentSize = size;
  let opacity = 1;

  if (animated) {
    const breathe = Math.sin(frame * 0.03) * 0.15 + 0.85;
    currentSize = size * breathe;
    opacity = 0.7 + breathe * 0.3;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse ${currentSize}% ${currentSize}% at ${centerX}% ${centerY}%, ${color}, transparent)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * MultiGlow - Multiple glow points for dreamy effect
 */
export interface MultiGlowProps {
  glows: Array<{
    color: string;
    x: number;
    y: number;
    size: number;
  }>;
  animated?: boolean;
  className?: string;
}

export const MultiGlow: React.FC<MultiGlowProps> = ({
  glows,
  animated = false,
  className,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {glows.map((glow, index) => {
        let size = glow.size;
        let opacity = 0.6;

        if (animated) {
          const offset = index * 20;
          const breathe = Math.sin((frame + offset) * 0.025) * 0.2 + 0.8;
          size = glow.size * breathe;
          opacity = 0.4 + breathe * 0.4;
        }

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${glow.x}%`,
              top: `${glow.y}%`,
              width: `${size}%`,
              height: `${size}%`,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${glow.color}, transparent 70%)`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * LightRays - Subtle light ray effect
 */
export interface LightRaysProps {
  color?: string;
  rayCount?: number;
  animated?: boolean;
  className?: string;
}

export const LightRays: React.FC<LightRaysProps> = ({
  color = "rgba(255, 200, 210, 0.15)",
  rayCount = 6,
  animated = false,
  className,
}) => {
  const frame = useCurrentFrame();

  const rays = Array.from({ length: rayCount }, (_, i) => {
    const baseAngle = (i / rayCount) * 360;
    const angle = animated ? baseAngle + frame * 0.1 : baseAngle;

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "200%",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          opacity: 0.5,
        }}
      />
    );
  });

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
      {rays}
    </div>
  );
};
