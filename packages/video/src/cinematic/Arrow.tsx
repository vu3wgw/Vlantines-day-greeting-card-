/**
 * Arrow - Animated arrow component with path following
 * Follows trajectory with automatic rotation and speed remapping
 */

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { moveAlongLine, createArrowPath, type Point } from "./ArrowPath";
import { remapSpeed } from "./remapSpeed";
import { ArrowSVG } from "../assets/svg/PlaceholderSVGs";

export interface ArrowProps {
  /** Starting position (Cupid) */
  startPosition: Point;
  /** Ending position (Target) */
  endPosition: Point;
  /** Arc height */
  arcHeight?: number;
  /** Start frame for arrow animation */
  startFrame?: number;
  /** Duration of arrow flight */
  durationInFrames: number;
  /** Speed function for remapping */
  speedFn?: (frame: number) => number;
  /** Arrow color */
  color?: string;
}

export const Arrow: React.FC<ArrowProps> = ({
  startPosition,
  endPosition,
  arcHeight = 300,
  startFrame = 0,
  durationInFrames,
  speedFn,
  color = "#d81b60",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate arrow path
  const arrowPath = useMemo(
    () =>
      createArrowPath({
        start: startPosition,
        end: endPosition,
        arcHeight,
      }),
    [startPosition, endPosition, arcHeight]
  );

  // Calculate progress along path
  const relativeFrame = frame - startFrame;

  // Apply speed remapping if provided
  const effectiveFrame = speedFn
    ? remapSpeed(relativeFrame, speedFn)
    : relativeFrame;

  // Progress from 0 to 1
  const progress = interpolate(
    effectiveFrame,
    [0, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Get position and rotation along path
  const { offset, angleInDegrees } = moveAlongLine(arrowPath, progress);

  // Motion blur effect based on speed
  const speedProgress = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.5]);
  const motionBlur = speedProgress * 3;

  // Trail effect
  const showTrail = progress > 0.1 && progress < 0.95;
  const trailOpacity = interpolate(progress, [0.1, 0.3, 0.8, 0.95], [0, 0.6, 0.6, 0]);

  // Only render if within animation window
  if (relativeFrame < 0 || relativeFrame > durationInFrames) {
    return null;
  }

  return (
    <AbsoluteFill>
      {/* Arrow trail */}
      {showTrail && (
        <div
          style={{
            position: "absolute",
            left: offset.x,
            top: offset.y,
            transform: `
              translate(-50%, -50%)
              rotate(${angleInDegrees}deg)
              translateX(-30px)
            `,
            opacity: trailOpacity,
            filter: "blur(4px)",
          }}
        >
          <ArrowSVG width={150} height={38} color={color} />
        </div>
      )}

      {/* Main arrow */}
      <div
        style={{
          position: "absolute",
          left: offset.x,
          top: offset.y,
          transform: `
            translate(-50%, -50%)
            rotate(${angleInDegrees}deg)
          `,
          filter: `blur(${motionBlur}px)`,
        }}
      >
        <ArrowSVG width={200} height={50} color={color} />
      </div>

      {/* Speed lines for dramatic effect */}
      {speedProgress > 0.3 && (
        <SpeedLines
          position={offset}
          angle={angleInDegrees}
          intensity={speedProgress}
          color={color}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * Speed lines for dramatic flight effect
 */
interface SpeedLinesProps {
  position: Point;
  angle: number;
  intensity: number;
  color: string;
}

const SpeedLines: React.FC<SpeedLinesProps> = ({
  position,
  angle,
  intensity,
  color,
}) => {
  const lines = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      offsetY: (i - 2) * 15,
      length: 60 + Math.random() * 40,
      opacity: 0.2 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <>
      {lines.map((line) => (
        <div
          key={line.id}
          style={{
            position: "absolute",
            left: position.x,
            top: position.y + line.offsetY,
            width: line.length * intensity,
            height: 2,
            backgroundColor: color,
            opacity: line.opacity * intensity,
            transform: `
              translate(-100%, -50%)
              rotate(${angle}deg)
            `,
          }}
        />
      ))}
    </>
  );
};

/**
 * Hook to get current arrow position for camera tracking
 */
export const useArrowPosition = (
  arrowPath: string,
  frame: number,
  startFrame: number,
  durationInFrames: number,
  speedFn?: (frame: number) => number
): Point => {
  const relativeFrame = frame - startFrame;
  const effectiveFrame = speedFn
    ? remapSpeed(relativeFrame, speedFn)
    : relativeFrame;

  const progress = interpolate(
    effectiveFrame,
    [0, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const { offset } = moveAlongLine(arrowPath, progress);
  return offset;
};
