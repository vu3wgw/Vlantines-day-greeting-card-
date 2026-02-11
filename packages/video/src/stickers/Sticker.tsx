import React from "react";
import { Img, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { createSpring, SpringPreset, SPRING_PRESETS } from "../animation/springs";
import type { StickerPosition } from "./CollageLayouts";

export type EntryAnimation =
  | "flyIn"
  | "bounce"
  | "pop"
  | "spiral"
  | "float"
  | "drop"
  | "grow";

export type EntryDirection = "left" | "right" | "top" | "bottom" | "random";

export interface StickerProps {
  imageUrl: string;
  startPosition?: StickerPosition;
  endPosition: StickerPosition;
  entryAnimation?: EntryAnimation;
  entryDirection?: EntryDirection;
  springPreset?: SpringPreset;
  delay?: number;
  wiggle?: boolean;
  wiggleAmount?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  className?: string;
}

/**
 * Sticker - Animated cutout image with spring physics
 * Core component for Vox-style collage animations
 */
export const Sticker: React.FC<StickerProps> = ({
  imageUrl,
  startPosition,
  endPosition,
  entryAnimation = "flyIn",
  entryDirection = "random",
  springPreset = "bouncy",
  delay = 0,
  wiggle = true,
  wiggleAmount = 2,
  shadow = true,
  shadowColor = "rgba(0, 0, 0, 0.3)",
  shadowBlur = 30,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Calculate default start position based on direction
  const defaultStart = React.useMemo((): StickerPosition => {
    let x = 0;
    let y = 0;
    const offscreenDistance = 400;

    let actualDirection = entryDirection;
    if (entryDirection === "random") {
      const directions: EntryDirection[] = ["left", "right", "top", "bottom"];
      actualDirection = directions[Math.floor(Math.random() * 4)];
    }

    switch (actualDirection) {
      case "left":
        x = -width / 2 - offscreenDistance;
        y = endPosition.y;
        break;
      case "right":
        x = width / 2 + offscreenDistance;
        y = endPosition.y;
        break;
      case "top":
        x = endPosition.x;
        y = -height / 2 - offscreenDistance;
        break;
      case "bottom":
        x = endPosition.x;
        y = height / 2 + offscreenDistance;
        break;
    }

    return {
      x,
      y,
      rotation: endPosition.rotation + (Math.random() - 0.5) * 40,
      scale: entryAnimation === "pop" || entryAnimation === "grow" ? 0 : 0.3,
    };
  }, [entryDirection, endPosition, width, height, entryAnimation]);

  const start = startPosition || defaultStart;

  // Spring progress
  const progress = createSpring(frame, fps, springPreset, delay);

  // Calculate current values based on animation type
  let currentX = interpolate(progress, [0, 1], [start.x, endPosition.x]);
  let currentY = interpolate(progress, [0, 1], [start.y, endPosition.y]);
  let currentRotation = interpolate(progress, [0, 1], [start.rotation, endPosition.rotation]);
  let currentScale = interpolate(progress, [0, 1], [start.scale, endPosition.scale]);
  let currentOpacity = 1;

  // Animation-specific modifications
  switch (entryAnimation) {
    case "bounce":
      // Extra bounce on landing
      if (progress > 0.7 && progress < 1) {
        const bounceProgress = (progress - 0.7) / 0.3;
        currentScale = endPosition.scale * (1 + Math.sin(bounceProgress * Math.PI) * 0.15);
      }
      break;

    case "pop":
      // Scale from 0 with overshoot
      currentScale = interpolate(progress, [0, 0.5, 0.8, 1], [0, endPosition.scale * 1.2, endPosition.scale * 0.95, endPosition.scale]);
      currentX = endPosition.x;
      currentY = endPosition.y;
      currentOpacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
      break;

    case "spiral":
      // Spiral in with rotation
      const spiralAngle = (1 - progress) * 720; // 2 full rotations
      const spiralRadius = (1 - progress) * 300;
      currentX = endPosition.x + Math.cos((spiralAngle * Math.PI) / 180) * spiralRadius;
      currentY = endPosition.y + Math.sin((spiralAngle * Math.PI) / 180) * spiralRadius;
      currentRotation = endPosition.rotation + (1 - progress) * 360;
      break;

    case "float":
      // Gentle float in with no rotation change
      currentRotation = endPosition.rotation;
      currentOpacity = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
      break;

    case "drop":
      // Drop from above with slight bounce
      currentX = endPosition.x;
      currentY = interpolate(progress, [0, 0.7, 0.85, 1], [start.y, endPosition.y + 20, endPosition.y - 10, endPosition.y]);
      break;

    case "grow":
      // Grow from center
      currentX = endPosition.x;
      currentY = endPosition.y;
      currentScale = interpolate(progress, [0, 0.6, 0.8, 1], [0, endPosition.scale * 1.1, endPosition.scale * 0.95, endPosition.scale]);
      currentOpacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
      break;

    case "flyIn":
    default:
      // Default fly in - handled by base interpolation
      currentOpacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
      break;
  }

  // Add subtle wiggle after entry is complete
  if (wiggle && progress > 0.9) {
    const wigglePhase = (frame - delay) * 0.08;
    currentRotation += Math.sin(wigglePhase) * wiggleAmount;
    currentY += Math.sin(wigglePhase * 0.7) * wiggleAmount * 0.5;
  }

  const style: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `
      translate(-50%, -50%)
      translate(${currentX}px, ${currentY}px)
      rotate(${currentRotation}deg)
      scale(${currentScale})
    `,
    opacity: currentOpacity,
    filter: shadow ? `drop-shadow(0 ${shadowBlur / 3}px ${shadowBlur}px ${shadowColor})` : undefined,
    willChange: "transform, opacity",
  };

  return (
    <Img
      src={imageUrl}
      className={className}
      style={style}
    />
  );
};

/**
 * StickerFrame - Sticker with decorative frame
 */
export interface StickerFrameProps extends StickerProps {
  frameColor?: string;
  frameWidth?: number;
  framePadding?: number;
}

export const StickerFrame: React.FC<StickerFrameProps> = ({
  frameColor = "white",
  frameWidth = 8,
  framePadding = 12,
  ...stickerProps
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = createSpring(frame, fps, stickerProps.springPreset || "bouncy", stickerProps.delay || 0);

  // Calculate position
  const endPos = stickerProps.endPosition;
  const currentScale = interpolate(progress, [0, 1], [0.3, endPos.scale]);
  const currentOpacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // Simple frame container
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `
          translate(-50%, -50%)
          translate(${endPos.x}px, ${endPos.y}px)
          rotate(${endPos.rotation}deg)
          scale(${currentScale})
        `,
        opacity: currentOpacity,
        padding: framePadding,
        backgroundColor: frameColor,
        borderRadius: 4,
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      }}
    >
      <Img
        src={stickerProps.imageUrl}
        style={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );
};
