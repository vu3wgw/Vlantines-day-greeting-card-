/**
 * CameraRig - Multi-camera perspective system
 * Orchestrates dynamic camera switching for cinematic storytelling
 */

import React from "react";
import { AbsoluteFill, Series, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Point } from "./ArrowPath";

export type CameraType = "chase" | "birds-eye" | "side-profile" | "orbit" | "static";

export interface CameraView {
  type: CameraType;
  durationInFrames: number;
  /** Negative offset creates smooth transition overlap */
  transitionOffset?: number;
}

export interface CameraRigProps {
  /** Sequence of camera views */
  views: CameraView[];
  /** Arrow position for camera tracking */
  arrowPosition: Point;
  /** Children to render with camera transformations */
  children: React.ReactNode;
}

/**
 * Main camera orchestrator using Series with negative offsets
 */
export const CameraRig: React.FC<CameraRigProps> = ({
  views,
  arrowPosition,
  children,
}) => {
  return (
    <AbsoluteFill>
      <Series>
        {views.map((view, index) => (
          <Series.Sequence
            key={`${view.type}-${index}`}
            durationInFrames={view.durationInFrames}
            offset={view.transitionOffset || 0}
          >
            <CameraView
              type={view.type}
              arrowPosition={arrowPosition}
            >
              {children}
            </CameraView>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

/**
 * Individual camera view component
 */
interface CameraViewProps {
  type: CameraType;
  arrowPosition: Point;
  children: React.ReactNode;
}

const CameraView: React.FC<CameraViewProps> = ({
  type,
  arrowPosition,
  children,
}) => {
  switch (type) {
    case "chase":
      return <ChaseCam arrowPosition={arrowPosition}>{children}</ChaseCam>;
    case "birds-eye":
      return <BirdsEyeCam arrowPosition={arrowPosition}>{children}</BirdsEyeCam>;
    case "side-profile":
      return <SideProfileCam arrowPosition={arrowPosition}>{children}</SideProfileCam>;
    case "orbit":
      return <OrbitCam arrowPosition={arrowPosition}>{children}</OrbitCam>;
    case "static":
    default:
      return <AbsoluteFill>{children}</AbsoluteFill>;
  }
};

/**
 * Chase Camera - Follow arrow from behind
 */
export const ChaseCam: React.FC<{ arrowPosition: Point; children: React.ReactNode }> = ({
  arrowPosition,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth camera follow with slight lag
  const cameraX = interpolate(frame, [0, 30], [0, -arrowPosition.x + 540], {
    extrapolateRight: "clamp",
  });

  const cameraY = interpolate(frame, [0, 30], [0, -arrowPosition.y + 960], {
    extrapolateRight: "clamp",
  });

  // Subtle zoom in as arrow accelerates
  const zoom = interpolate(frame, [0, 60], [1, 1.2], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `
          translate(${cameraX}px, ${cameraY}px)
          scale(${zoom})
        `,
        transformOrigin: "center center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Bird's Eye View - Top-down perspective
 */
export const BirdsEyeCam: React.FC<{ arrowPosition: Point; children: React.ReactNode }> = ({
  arrowPosition,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transition to top-down view
  const rotateX = interpolate(frame, [0, 40], [0, 75], {
    extrapolateRight: "clamp",
  });

  // Follow arrow horizontally
  const translateX = interpolate(frame, [40, 120], [0, -arrowPosition.x + 540], {
    extrapolateRight: "clamp",
  });

  // Zoom out for wider view
  const scale = interpolate(frame, [0, 40], [1, 0.8], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `
          perspective(1200px)
          rotateX(${rotateX}deg)
          translateX(${translateX}px)
          scale(${scale})
        `,
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Side Profile Camera - Cinematic arc view
 */
export const SideProfileCam: React.FC<{ arrowPosition: Point; children: React.ReactNode }> = ({
  arrowPosition,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transition to side view
  const rotateY = interpolate(frame, [0, 40], [0, 25], {
    extrapolateRight: "clamp",
  });

  // Pan with arrow
  const translateX = interpolate(frame, [40, 120], [0, -arrowPosition.x + 400], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [40, 120], [0, -arrowPosition.y + 960], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `
          perspective(1500px)
          rotateY(${rotateY}deg)
          translate(${translateX}px, ${translateY}px)
        `,
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Orbit Camera - Circular camera movement around target
 */
export const OrbitCam: React.FC<{ arrowPosition: Point; children: React.ReactNode }> = ({
  arrowPosition,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 180-degree orbit
  const angle = interpolate(frame, [0, 90], [0, Math.PI], {
    extrapolateRight: "clamp",
  });

  const radius = 500;
  const cameraX = Math.cos(angle) * radius;
  const cameraZ = Math.sin(angle) * radius;

  // Zoom in on target
  const zoom = interpolate(frame, [0, 30], [1, 1.5], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `
          perspective(1200px)
          rotateY(${angle}rad)
          translateZ(${cameraZ}px)
          scale(${zoom})
        `,
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Camera transition helper - smooth interpolation between views
 */
export const createCameraTransition = (
  fromType: CameraType,
  toType: CameraType,
  progress: number
): React.CSSProperties => {
  // Smooth easing for transitions
  const eased = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  return {
    opacity: interpolate(eased, [0, 0.2, 0.8, 1], [1, 0.8, 0.8, 1]),
    filter: `blur(${interpolate(eased, [0, 0.5, 1], [0, 2, 0])}px)`,
  };
};
