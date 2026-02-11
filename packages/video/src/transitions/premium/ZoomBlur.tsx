import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";

export interface ZoomBlurTransitionProps {
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  zoomScale?: number;
  maxBlur?: number;
  centerX?: number;
  centerY?: number;
}

/**
 * ZoomBlur Transition - Zoom into center with radial motion blur
 * Creates dramatic "diving in" effect
 */
export const ZoomBlurTransition: React.FC<ZoomBlurTransitionProps> = ({
  progress,
  direction,
  children,
  zoomScale = 1.5,
  maxBlur = 15,
  centerX = 50,
  centerY = 50,
}) => {
  // Calculate zoom and blur based on progress
  let scale: number;
  let blur: number;
  let opacity: number;

  if (direction === "in") {
    // Entering: Start zoomed and blurred, settle to normal
    scale = interpolate(progress, [0, 1], [zoomScale, 1], {
      easing: Easing.out(Easing.cubic),
    });
    blur = interpolate(progress, [0, 0.7, 1], [maxBlur, maxBlur * 0.3, 0], {
      easing: Easing.out(Easing.cubic),
    });
    opacity = interpolate(progress, [0, 0.3], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    // Exiting: Zoom in and blur out
    scale = interpolate(progress, [0, 1], [1, zoomScale], {
      easing: Easing.in(Easing.cubic),
    });
    blur = interpolate(progress, [0, 0.3, 1], [0, maxBlur * 0.3, maxBlur], {
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.7, 1], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: `${centerX}% ${centerY}%`,
        filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * ZoomPulse Transition - Zoom in then back out
 */
export const ZoomPulseTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  pulseScale?: number;
}> = ({
  progress,
  direction,
  children,
  pulseScale = 1.1,
}) => {
  let scale: number;
  let opacity: number;

  if (direction === "in") {
    // Enter with scale pulse
    scale = interpolate(progress, [0, 0.5, 1], [0.9, pulseScale, 1], {
      easing: Easing.out(Easing.back(1.5)),
    });
    opacity = interpolate(progress, [0, 0.3], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    // Exit with scale down
    scale = interpolate(progress, [0, 1], [1, 0.9], {
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.5, 1], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * RadialZoom Transition - Zoom with radial gradient mask
 */
export const RadialZoomTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
}> = ({
  progress,
  direction,
  children,
}) => {
  let scale: number;
  let maskSize: number;
  let opacity: number;

  if (direction === "in") {
    scale = interpolate(progress, [0, 1], [1.3, 1]);
    maskSize = interpolate(progress, [0, 1], [0, 150]);
    opacity = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  } else {
    scale = interpolate(progress, [0, 1], [1, 0.8]);
    maskSize = interpolate(progress, [0, 1], [150, 0]);
    opacity = interpolate(progress, [0.5, 1], [1, 0], { extrapolateLeft: "clamp" });
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
        maskImage: `radial-gradient(ellipse ${maskSize}% ${maskSize}% at center, black, transparent)`,
        WebkitMaskImage: `radial-gradient(ellipse ${maskSize}% ${maskSize}% at center, black, transparent)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
