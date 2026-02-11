import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export interface GradientBackgroundProps {
  colors: string[];
  direction?: "diagonal" | "vertical" | "horizontal" | "radial";
  animationSpeed?: number;
  animationType?: "shift" | "pulse" | "none";
}

/**
 * GradientBackground - Animated gradient backgrounds
 * Supports various gradient directions and animation types
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors,
  direction = "diagonal",
  animationSpeed = 0.5,
  animationType = "shift",
}) => {
  const frame = useCurrentFrame();

  // Animation phase
  const phase = animationType !== "none"
    ? (frame * animationSpeed * 0.01) % 1
    : 0;

  // Calculate gradient based on direction
  let gradient: string;
  const colorStops = colors.join(", ");

  switch (direction) {
    case "vertical":
      gradient = `linear-gradient(180deg, ${colorStops})`;
      break;
    case "horizontal":
      gradient = `linear-gradient(90deg, ${colorStops})`;
      break;
    case "radial":
      gradient = `radial-gradient(ellipse at center, ${colorStops})`;
      break;
    case "diagonal":
    default:
      gradient = `linear-gradient(135deg, ${colorStops})`;
      break;
  }

  // Animation transforms
  let transform = "";
  let opacity = 1;

  if (animationType === "shift") {
    const offset = Math.sin(phase * Math.PI * 2) * 50;
    transform = `translateX(${offset}px) translateY(${offset * 0.5}px)`;
  } else if (animationType === "pulse") {
    opacity = 0.7 + Math.sin(phase * Math.PI * 2) * 0.3;
  }

  return (
    <AbsoluteFill>
      {/* Base layer */}
      <div
        style={{
          position: "absolute",
          inset: -50,
          background: gradient,
          transform,
          opacity,
        }}
      />

      {/* Secondary gradient for depth */}
      {colors.length >= 2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 30% 20%, ${colors[0]}22 0%, transparent 50%)`,
            opacity: animationType === "pulse"
              ? 0.5 + Math.sin((phase + 0.5) * Math.PI * 2) * 0.3
              : 0.6,
          }}
        />
      )}

      {/* Third layer accent */}
      {colors.length >= 3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 70% 80%, ${colors[2]}22 0%, transparent 50%)`,
            opacity: animationType === "pulse"
              ? 0.4 + Math.cos(phase * Math.PI * 2) * 0.2
              : 0.5,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * WarmGradient - Pre-configured warm romantic gradient
 */
export const WarmGradient: React.FC<{ animationSpeed?: number }> = ({
  animationSpeed = 0.3,
}) => {
  return (
    <GradientBackground
      colors={["#fff5f8", "#ffe4ec", "#ffc4d6"]}
      direction="diagonal"
      animationSpeed={animationSpeed}
      animationType="shift"
    />
  );
};

/**
 * SunsetGradient - Warm sunset colors
 */
export const SunsetGradient: React.FC<{ animationSpeed?: number }> = ({
  animationSpeed = 0.4,
}) => {
  return (
    <GradientBackground
      colors={["#fff0f0", "#ffe0c0", "#ffd0d0"]}
      direction="diagonal"
      animationSpeed={animationSpeed}
      animationType="pulse"
    />
  );
};

/**
 * DreamyGradient - Soft pastel colors
 */
export const DreamyGradient: React.FC<{ animationSpeed?: number }> = ({
  animationSpeed = 0.2,
}) => {
  return (
    <GradientBackground
      colors={["#f8f0ff", "#ffe8f8", "#f0f8ff"]}
      direction="radial"
      animationSpeed={animationSpeed}
      animationType="pulse"
    />
  );
};

/**
 * HeartGradient - Pink/red romantic gradient
 */
export const HeartGradient: React.FC<{ animationSpeed?: number }> = ({
  animationSpeed = 0.5,
}) => {
  return (
    <GradientBackground
      colors={["#ff6b9d", "#ff9eb5", "#ffc4d6"]}
      direction="radial"
      animationSpeed={animationSpeed}
      animationType="shift"
    />
  );
};
