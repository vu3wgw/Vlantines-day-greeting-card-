import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

/**
 * Vignette - Edge darkening effect for cinematic look
 */
export interface VignetteProps {
  intensity?: number;
  size?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}

export const Vignette: React.FC<VignetteProps> = ({
  intensity = 0.5,
  size = 50,
  color = "rgba(0, 0, 0, 1)",
  animated = false,
  className,
}) => {
  const frame = useCurrentFrame();

  let currentIntensity = intensity;
  if (animated) {
    const breathe = Math.sin(frame * 0.02) * 0.1 + 0.9;
    currentIntensity = intensity * breathe;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse ${size}% ${size}% at center, transparent, ${color.replace("1)", `${currentIntensity})`)})`,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * DepthBlur - Fake depth of field effect
 * Blurs edges to focus attention on center
 */
export interface DepthBlurProps {
  blur?: number;
  focusSize?: number;
  focusX?: number;
  focusY?: number;
  children: React.ReactNode;
  className?: string;
}

export const DepthBlur: React.FC<DepthBlurProps> = ({
  blur = 5,
  focusSize = 60,
  focusX = 50,
  focusY = 50,
  children,
  className,
}) => {
  // Note: True depth blur requires SVG filter or multiple layers
  // This is a simplified version using mask + blur
  return (
    <div
      className={className}
      style={{
        position: "relative",
      }}
    >
      {/* Main content */}
      {children}

      {/* Blur overlay on edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: `radial-gradient(ellipse ${focusSize}% ${focusSize}% at ${focusX}% ${focusY}%, transparent 30%, black 100%)`,
          WebkitMaskImage: `radial-gradient(ellipse ${focusSize}% ${focusSize}% at ${focusX}% ${focusY}%, transparent 30%, black 100%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

/**
 * FilmGrain - Subtle grain texture overlay
 */
export interface FilmGrainProps {
  intensity?: number;
  animated?: boolean;
  className?: string;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({
  intensity = 0.05,
  animated = true,
  className,
}) => {
  const frame = useCurrentFrame();

  // Create noise pattern using SVG filter
  const noiseId = `noise-${Math.floor(animated ? frame % 3 : 0)}`;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: intensity,
        mixBlendMode: "overlay",
      }}
    >
      <svg width="100%" height="100%" style={{ position: "absolute" }}>
        <defs>
          <filter id={noiseId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={animated ? 0.6 + (frame % 3) * 0.1 : 0.65}
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
      </svg>
    </div>
  );
};

/**
 * ColorOverlay - Tint the scene with a color
 */
export interface ColorOverlayProps {
  color?: string;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  animated?: boolean;
  className?: string;
}

export const ColorOverlay: React.FC<ColorOverlayProps> = ({
  color = "rgba(255, 200, 210, 1)",
  opacity = 0.1,
  blendMode = "multiply",
  animated = false,
  className,
}) => {
  const frame = useCurrentFrame();

  let currentOpacity = opacity;
  if (animated) {
    const breathe = Math.sin(frame * 0.015) * 0.3 + 0.7;
    currentOpacity = opacity * breathe;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: color,
        opacity: currentOpacity,
        mixBlendMode: blendMode,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * GradientOverlay - Gradient color overlay
 */
export interface GradientOverlayProps {
  direction?: "top" | "bottom" | "left" | "right" | "radial";
  colors?: string[];
  opacity?: number;
  className?: string;
}

export const GradientOverlay: React.FC<GradientOverlayProps> = ({
  direction = "bottom",
  colors = ["transparent", "rgba(0, 0, 0, 0.7)"],
  opacity = 1,
  className,
}) => {
  let gradient = "";

  switch (direction) {
    case "top":
      gradient = `linear-gradient(to top, ${colors.join(", ")})`;
      break;
    case "bottom":
      gradient = `linear-gradient(to bottom, ${colors.join(", ")})`;
      break;
    case "left":
      gradient = `linear-gradient(to left, ${colors.join(", ")})`;
      break;
    case "right":
      gradient = `linear-gradient(to right, ${colors.join(", ")})`;
      break;
    case "radial":
      gradient = `radial-gradient(ellipse at center, ${colors.join(", ")})`;
      break;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: gradient,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * CinematicBars - Letterbox/cinematic bars
 */
export interface CinematicBarsProps {
  ratio?: number; // Height as percentage (e.g., 10 = 10% top and bottom)
  color?: string;
  animated?: boolean;
  animationFrames?: number;
  className?: string;
}

export const CinematicBars: React.FC<CinematicBarsProps> = ({
  ratio = 10,
  color = "black",
  animated = false,
  animationFrames = 30,
  className,
}) => {
  const frame = useCurrentFrame();

  let currentRatio = ratio;
  if (animated) {
    currentRatio = interpolate(frame, [0, animationFrames], [0, ratio], {
      extrapolateRight: "clamp",
    });
  }

  return (
    <>
      <div
        className={className}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${currentRatio}%`,
          backgroundColor: color,
          zIndex: 100,
        }}
      />
      <div
        className={className}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${currentRatio}%`,
          backgroundColor: color,
          zIndex: 100,
        }}
      />
    </>
  );
};
