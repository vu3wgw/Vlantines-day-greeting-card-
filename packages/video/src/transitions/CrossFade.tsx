import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import type { TransitionProps } from "../timeline/types";

export const CrossFade: React.FC<TransitionProps> = ({
  progress,
  direction,
  children,
}) => {
  // For "in" direction: fade from 0 to 1
  // For "out" direction: fade from 1 to 0
  const opacity =
    direction === "in"
      ? interpolate(progress, [0, 1], [0, 1], {
          easing: Easing.out(Easing.cubic),
        })
      : interpolate(progress, [0, 1], [1, 0], {
          easing: Easing.in(Easing.cubic),
        });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
