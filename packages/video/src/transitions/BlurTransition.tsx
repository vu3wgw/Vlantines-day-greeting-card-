import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import type { TransitionProps } from "../timeline/types";

export const BlurTransition: React.FC<TransitionProps> = ({
  progress,
  direction,
  children,
}) => {
  let blur: number;
  let opacity: number;

  if (direction === "in") {
    // Blur in: start very blurry, become sharp
    blur = interpolate(progress, [0, 1], [20, 0], {
      easing: Easing.out(Easing.cubic),
    });
    opacity = interpolate(progress, [0, 0.6], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  } else {
    // Blur out: start sharp, become blurry
    blur = interpolate(progress, [0, 1], [0, 20], {
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.4, 1], [1, 0], {
      extrapolateLeft: "clamp",
      easing: Easing.in(Easing.cubic),
    });
  }

  return (
    <AbsoluteFill
      style={{
        filter: `blur(${blur}px)`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
