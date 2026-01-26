import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import type { TransitionProps } from "../timeline/types";

export const ZoomTransition: React.FC<TransitionProps> = ({
  progress,
  direction,
  children,
}) => {
  let scale: number;
  let opacity: number;

  if (direction === "in") {
    // Zoom in from small to normal
    scale = interpolate(progress, [0, 1], [0.6, 1], {
      easing: Easing.out(Easing.back(1.1)),
    });
    opacity = interpolate(progress, [0, 0.5], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  } else {
    // Zoom out from normal to large (creating a push effect)
    scale = interpolate(progress, [0, 1], [1, 1.3], {
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.5, 1], [1, 0], {
      extrapolateLeft: "clamp",
      easing: Easing.in(Easing.cubic),
    });
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: "center center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
