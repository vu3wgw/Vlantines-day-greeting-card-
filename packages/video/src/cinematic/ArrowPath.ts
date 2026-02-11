/**
 * ArrowPath - Generates the arrow's flight trajectory
 * Creates bezier curves for realistic arrow arc physics
 */

import { makePath } from "@remotion/paths";

export interface Point {
  x: number;
  y: number;
}

export interface ArrowPathConfig {
  /** Cupid's position (arrow launch point) */
  start: Point;
  /** Target position (arrow destination) */
  end: Point;
  /** Arc height - higher values = more pronounced arc */
  arcHeight?: number;
  /** Number of milestones to position along path */
  milestoneCount?: number;
}

/**
 * Creates a bezier curve path for the arrow's flight
 * Models realistic arrow physics with gravity arc
 */
export const createArrowPath = ({
  start,
  end,
  arcHeight = 300,
  milestoneCount = 5,
}: ArrowPathConfig): string => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Calculate arc peak (arrow goes up then down)
  const peakY = Math.min(start.y, end.y) - arcHeight;

  // Create smooth bezier curve with two control points
  const control1 = {
    x: start.x + (midX - start.x) * 0.4,
    y: peakY,
  };

  const control2 = {
    x: end.x - (end.x - midX) * 0.4,
    y: peakY + arcHeight * 0.3,
  };

  // Build SVG path
  const path = `M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`;

  return path;
};

/**
 * Generates evenly spaced milestone positions along the arrow path
 */
export const getMilestonePositions = (
  milestoneCount: number
): number[] => {
  if (milestoneCount <= 1) return [0.5];

  const positions: number[] = [];
  const spacing = 1 / (milestoneCount + 1);

  for (let i = 1; i <= milestoneCount; i++) {
    positions.push(spacing * i);
  }

  return positions;
};

/**
 * Calculates a point's position along a path at given progress (0-1)
 * Uses @remotion/paths utilities
 */
export const getPointAtProgress = (
  path: string,
  progress: number
): { x: number; y: number } => {
  // Create a temporary SVG path element to use path calculations
  if (typeof document === "undefined") {
    // Server-side: return approximate position
    return { x: 0, y: 0 };
  }

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("d", path);

  const pathLength = pathElement.getTotalLength();
  const point = pathElement.getPointAtLength(pathLength * progress);

  return { x: point.x, y: point.y };
};

/**
 * Calculates the angle (in degrees) of the path at given progress
 * Used to rotate the arrow to match the trajectory
 */
export const getAngleAtProgress = (
  path: string,
  progress: number,
  sampleDistance = 0.01
): number => {
  if (typeof document === "undefined") {
    return 0;
  }

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("d", path);

  const pathLength = pathElement.getTotalLength();

  // Sample two points to calculate tangent
  const point1 = pathElement.getPointAtLength(
    Math.max(0, pathLength * progress - sampleDistance * pathLength)
  );
  const point2 = pathElement.getPointAtLength(
    Math.min(pathLength, pathLength * progress + sampleDistance * pathLength)
  );

  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  // Convert to degrees
  const angleRadians = Math.atan2(dy, dx);
  const angleDegrees = (angleRadians * 180) / Math.PI;

  return angleDegrees;
};

/**
 * moveAlongLine - Positions an element along a path with automatic rotation
 * Inspired by GitHub Unwrapped's path following system
 */
export const moveAlongLine = (
  path: string,
  progress: number
): {
  offset: Point;
  angleInDegrees: number;
} => {
  const offset = getPointAtProgress(path, progress);
  const angleInDegrees = getAngleAtProgress(path, progress);

  return { offset, angleInDegrees };
};

/**
 * Pre-calculated arrow trajectory for standard 1080x1920 vertical video
 */
export const STANDARD_ARROW_PATH = createArrowPath({
  start: { x: 200, y: 1600 }, // Bottom left (Cupid position)
  end: { x: 880, y: 1600 }, // Bottom right (Target position)
  arcHeight: 400,
  milestoneCount: 5,
});
