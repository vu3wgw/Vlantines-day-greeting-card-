import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import type { TransitionProps } from "../timeline/types";

type WipeDirection = "horizontal" | "vertical";

interface WipeTransitionProps extends TransitionProps {
  wipeDirection: WipeDirection;
}

export const WipeTransition: React.FC<WipeTransitionProps> = ({
  progress,
  direction,
  wipeDirection,
  children,
}) => {
  // Calculate clip path for wipe effect
  let clipPath: string;

  if (wipeDirection === "horizontal") {
    if (direction === "in") {
      // Wipe in from left to right
      const x = interpolate(progress, [0, 1], [0, 100], {
        easing: Easing.inOut(Easing.cubic),
      });
      clipPath = `inset(0 ${100 - x}% 0 0)`;
    } else {
      // Wipe out from left to right
      const x = interpolate(progress, [0, 1], [0, 100], {
        easing: Easing.inOut(Easing.cubic),
      });
      clipPath = `inset(0 0 0 ${x}%)`;
    }
  } else {
    // Vertical
    if (direction === "in") {
      // Wipe in from top to bottom
      const y = interpolate(progress, [0, 1], [0, 100], {
        easing: Easing.inOut(Easing.cubic),
      });
      clipPath = `inset(0 0 ${100 - y}% 0)`;
    } else {
      // Wipe out from top to bottom
      const y = interpolate(progress, [0, 1], [0, 100], {
        easing: Easing.inOut(Easing.cubic),
      });
      clipPath = `inset(${y}% 0 0 0)`;
    }
  }

  return (
    <AbsoluteFill
      style={{
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Export convenience components
export const WipeHorizontal: React.FC<TransitionProps> = (props) => (
  <WipeTransition {...props} wipeDirection="horizontal" />
);

export const WipeVertical: React.FC<TransitionProps> = (props) => (
  <WipeTransition {...props} wipeDirection="vertical" />
);
