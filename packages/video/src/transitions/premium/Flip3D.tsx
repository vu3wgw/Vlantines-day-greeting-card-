import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";

export interface Flip3DTransitionProps {
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  flipDirection?: "horizontal" | "vertical" | "diagonal";
  perspective?: number;
}

/**
 * Flip3D Transition - 3D card flip with realistic depth
 * Creates a card-flip effect revealing new content
 */
export const Flip3DTransition: React.FC<Flip3DTransitionProps> = ({
  progress,
  direction,
  children,
  flipDirection = "horizontal",
  perspective = 1200,
}) => {
  let rotation: number;
  let opacity: number;
  let translateZ: number;

  if (direction === "in") {
    // Card flips in from behind (starts at 90deg, ends at 0)
    rotation = interpolate(progress, [0, 1], [-90, 0], {
      easing: Easing.out(Easing.cubic),
    });
    opacity = interpolate(progress, [0, 0.1, 0.5], [0, 0, 1], {
      extrapolateRight: "clamp",
    });
    translateZ = interpolate(progress, [0, 0.5, 1], [-100, -200, 0], {
      easing: Easing.out(Easing.cubic),
    });
  } else {
    // Card flips out (starts at 0, ends at 90deg)
    rotation = interpolate(progress, [0, 1], [0, 90], {
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.5, 0.9, 1], [1, 0, 0], {
      extrapolateLeft: "clamp",
    });
    translateZ = interpolate(progress, [0, 0.5, 1], [0, -200, -100], {
      easing: Easing.in(Easing.cubic),
    });
  }

  // Calculate rotation axis based on direction
  let transformStyle: string;
  switch (flipDirection) {
    case "vertical":
      transformStyle = `perspective(${perspective}px) rotateX(${rotation}deg) translateZ(${translateZ}px)`;
      break;
    case "diagonal":
      transformStyle = `perspective(${perspective}px) rotate3d(1, 1, 0, ${rotation}deg) translateZ(${translateZ}px)`;
      break;
    case "horizontal":
    default:
      transformStyle = `perspective(${perspective}px) rotateY(${rotation}deg) translateZ(${translateZ}px)`;
      break;
  }

  return (
    <AbsoluteFill
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <AbsoluteFill
        style={{
          transform: transformStyle,
          opacity,
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * CardStack Transition - Multiple cards flip in sequence
 */
export const CardStackTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  cardCount?: number;
}> = ({
  progress,
  direction,
  children,
  cardCount = 3,
}) => {
  // Generate card offsets
  const cards = Array.from({ length: cardCount }, (_, i) => ({
    zOffset: i * 20,
    rotationOffset: i * 3,
    delay: i * 0.1,
  }));

  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      {cards.map((card, index) => {
        const cardProgress = Math.max(0, Math.min(1,
          direction === "in"
            ? (progress - card.delay) / (1 - card.delay * cardCount)
            : (progress - card.delay) / (1 - card.delay * cardCount)
        ));

        let rotation: number;
        let opacity: number;
        let zTranslate: number;

        if (direction === "in") {
          rotation = interpolate(cardProgress, [0, 1], [-90, card.rotationOffset], {
            easing: Easing.out(Easing.cubic),
          });
          opacity = interpolate(cardProgress, [0, 0.3], [0, index === cardCount - 1 ? 1 : 0.3]);
          zTranslate = interpolate(cardProgress, [0, 1], [-200, -card.zOffset]);
        } else {
          rotation = interpolate(cardProgress, [0, 1], [card.rotationOffset, 90], {
            easing: Easing.in(Easing.cubic),
          });
          opacity = interpolate(cardProgress, [0.7, 1], [index === cardCount - 1 ? 1 : 0.3, 0]);
          zTranslate = interpolate(cardProgress, [0, 1], [-card.zOffset, -200]);
        }

        // Only render content on the last (top) card
        const isTopCard = index === cardCount - 1;

        return (
          <AbsoluteFill
            key={index}
            style={{
              transform: `rotateY(${rotation}deg) translateZ(${zTranslate}px)`,
              opacity,
              backfaceVisibility: "hidden",
              backgroundColor: isTopCard ? "transparent" : "#fff5f8",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            {isTopCard && children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * FoldReveal - Paper folding/unfolding effect
 */
export const FoldRevealTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  folds?: number;
}> = ({
  progress,
  direction,
  children,
  folds = 3,
}) => {
  // Create fold segments
  const segments = Array.from({ length: folds }, (_, i) => ({
    delay: i / folds * 0.5,
    isEven: i % 2 === 0,
  }));

  return (
    <AbsoluteFill style={{ perspective: 1500 }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {segments.map((segment, index) => {
          const segmentProgress = Math.max(0, Math.min(1,
            direction === "in"
              ? (progress - segment.delay) / (1 - segment.delay)
              : progress / (1 - segment.delay)
          ));

          let foldAngle: number;
          if (direction === "in") {
            foldAngle = interpolate(segmentProgress, [0, 1], [segment.isEven ? -90 : 90, 0], {
              easing: Easing.out(Easing.cubic),
            });
          } else {
            foldAngle = interpolate(segmentProgress, [0, 1], [0, segment.isEven ? -90 : 90], {
              easing: Easing.in(Easing.cubic),
            });
          }

          const segmentWidth = 100 / folds;

          return (
            <div
              key={index}
              style={{
                width: `${segmentWidth}%`,
                height: "100%",
                transformStyle: "preserve-3d",
                transform: `rotateY(${foldAngle}deg)`,
                transformOrigin: segment.isEven ? "left center" : "right center",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: `${folds * 100}%`,
                  height: "100%",
                  left: `-${index * 100}%`,
                }}
              >
                {children}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * CubeRotation - Content rotates like on a 3D cube face
 */
export const CubeRotationTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  rotateDirection?: "left" | "right" | "up" | "down";
}> = ({
  progress,
  direction,
  children,
  rotateDirection = "left",
}) => {
  let rotation: number;
  let translateZ: number;
  let opacity: number;

  // Calculate rotation and translation based on direction
  const isHorizontal = rotateDirection === "left" || rotateDirection === "right";
  const isPositive = rotateDirection === "right" || rotateDirection === "down";

  const startAngle = isPositive ? -90 : 90;
  const endAngle = isPositive ? 90 : -90;

  if (direction === "in") {
    rotation = interpolate(progress, [0, 1], [startAngle, 0], {
      easing: Easing.out(Easing.cubic),
    });
    opacity = interpolate(progress, [0, 0.3], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    rotation = interpolate(progress, [0, 1], [0, endAngle], {
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.7, 1], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  // Calculate Z translation for cube effect
  translateZ = Math.abs(Math.sin((rotation * Math.PI) / 180)) * -300;

  const transform = isHorizontal
    ? `perspective(1200px) rotateY(${rotation}deg) translateZ(${translateZ}px)`
    : `perspective(1200px) rotateX(${rotation}deg) translateZ(${translateZ}px)`;

  return (
    <AbsoluteFill
      style={{
        transform,
        opacity,
        backfaceVisibility: "hidden",
        transformOrigin: "center center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * PhotoFrame3D - Tilts like a framed photo being picked up
 */
export const PhotoFrame3DTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  frameColor?: string;
  framePadding?: number;
}> = ({
  progress,
  direction,
  children,
  frameColor = "white",
  framePadding = 20,
}) => {
  let rotateX: number;
  let rotateY: number;
  let translateY: number;
  let scale: number;
  let shadowOpacity: number;
  let opacity: number;

  if (direction === "in") {
    rotateX = interpolate(progress, [0, 0.6, 1], [30, -5, 0], {
      easing: Easing.out(Easing.cubic),
    });
    rotateY = interpolate(progress, [0, 1], [-15, 0], {
      easing: Easing.out(Easing.cubic),
    });
    translateY = interpolate(progress, [0, 1], [100, 0], {
      easing: Easing.out(Easing.back(1.2)),
    });
    scale = interpolate(progress, [0, 1], [0.8, 1], {
      easing: Easing.out(Easing.cubic),
    });
    shadowOpacity = interpolate(progress, [0, 1], [0, 0.3]);
    opacity = interpolate(progress, [0, 0.2], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    rotateX = interpolate(progress, [0, 0.4, 1], [0, -5, 30], {
      easing: Easing.in(Easing.cubic),
    });
    rotateY = interpolate(progress, [0, 1], [0, 15], {
      easing: Easing.in(Easing.cubic),
    });
    translateY = interpolate(progress, [0, 1], [0, 100], {
      easing: Easing.in(Easing.back(1.2)),
    });
    scale = interpolate(progress, [0, 1], [1, 0.8], {
      easing: Easing.in(Easing.cubic),
    });
    shadowOpacity = interpolate(progress, [0, 1], [0.3, 0]);
    opacity = interpolate(progress, [0.8, 1], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  return (
    <AbsoluteFill
      style={{
        perspective: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px) scale(${scale})`,
          transformOrigin: "center bottom",
          padding: framePadding,
          backgroundColor: frameColor,
          boxShadow: `0 30px 60px rgba(0,0,0,${shadowOpacity})`,
          opacity,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
