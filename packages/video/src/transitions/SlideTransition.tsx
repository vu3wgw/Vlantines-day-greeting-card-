import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import type { TransitionProps } from "../timeline/types";

type SlideDirection = "left" | "right" | "up" | "down";

interface SlideTransitionProps extends TransitionProps {
  slideDirection: SlideDirection;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  progress,
  direction,
  slideDirection,
  children,
}) => {
  // Calculate transform values based on slide direction
  let translateX = 0;
  let translateY = 0;

  const slideAmount = 100; // percentage

  if (direction === "in") {
    // Slide in from off-screen
    switch (slideDirection) {
      case "left":
        translateX = interpolate(progress, [0, 1], [slideAmount, 0], {
          easing: Easing.out(Easing.cubic),
        });
        break;
      case "right":
        translateX = interpolate(progress, [0, 1], [-slideAmount, 0], {
          easing: Easing.out(Easing.cubic),
        });
        break;
      case "up":
        translateY = interpolate(progress, [0, 1], [slideAmount, 0], {
          easing: Easing.out(Easing.cubic),
        });
        break;
      case "down":
        translateY = interpolate(progress, [0, 1], [-slideAmount, 0], {
          easing: Easing.out(Easing.cubic),
        });
        break;
    }
  } else {
    // Slide out to off-screen
    switch (slideDirection) {
      case "left":
        translateX = interpolate(progress, [0, 1], [0, -slideAmount], {
          easing: Easing.in(Easing.cubic),
        });
        break;
      case "right":
        translateX = interpolate(progress, [0, 1], [0, slideAmount], {
          easing: Easing.in(Easing.cubic),
        });
        break;
      case "up":
        translateY = interpolate(progress, [0, 1], [0, -slideAmount], {
          easing: Easing.in(Easing.cubic),
        });
        break;
      case "down":
        translateY = interpolate(progress, [0, 1], [0, slideAmount], {
          easing: Easing.in(Easing.cubic),
        });
        break;
    }
  }

  const opacity = direction === "in"
    ? interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" })
    : interpolate(progress, [0.7, 1], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${translateX}%, ${translateY}%)`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Export convenience components
export const SlideLeft: React.FC<TransitionProps> = (props) => (
  <SlideTransition {...props} slideDirection="left" />
);

export const SlideRight: React.FC<TransitionProps> = (props) => (
  <SlideTransition {...props} slideDirection="right" />
);

export const SlideUp: React.FC<TransitionProps> = (props) => (
  <SlideTransition {...props} slideDirection="up" />
);

export const SlideDown: React.FC<TransitionProps> = (props) => (
  <SlideTransition {...props} slideDirection="down" />
);
