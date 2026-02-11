import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";

export interface HeartWipeTransitionProps {
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  color?: string;
  softEdge?: number;
}

/**
 * HeartWipe Transition - Heart shape expands/contracts to reveal content
 * Perfect for romantic transitions between scenes
 */
export const HeartWipeTransition: React.FC<HeartWipeTransitionProps> = ({
  progress,
  direction,
  children,
  color = "#ff6b9d",
  softEdge = 0.05,
}) => {
  // Heart shape SVG path for mask
  const heartPath = `
    M 50 20
    C 50 20, 20 0, 10 20
    C 0 40, 10 70, 50 95
    C 90 70, 100 40, 90 20
    C 80 0, 50 20, 50 20
    Z
  `;

  let maskSize: number;
  let opacity: number;

  if (direction === "in") {
    // Heart expands to reveal new content
    maskSize = interpolate(progress, [0, 1], [0, 200], {
      easing: Easing.out(Easing.cubic),
    });
    opacity = interpolate(progress, [0, 0.3], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    // Heart contracts to hide content
    maskSize = interpolate(progress, [0, 1], [200, 0], {
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.7, 1], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  // Create gradient for soft edge
  const gradientStops = softEdge > 0
    ? `black ${100 - softEdge * 100}%, transparent 100%`
    : "black 100%";

  return (
    <AbsoluteFill>
      {/* Background heart color that shows during transition */}
      <AbsoluteFill
        style={{
          backgroundColor: color,
          opacity: direction === "in"
            ? interpolate(progress, [0, 0.5], [1, 0], { extrapolateRight: "clamp" })
            : interpolate(progress, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
        }}
      />

      {/* Content with heart mask */}
      <AbsoluteFill
        style={{
          opacity,
          maskImage: `url("data:image/svg+xml,${encodeURIComponent(`
            <svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
              <defs>
                <radialGradient id='fade'>
                  <stop offset='${100 - softEdge * 100}%' stop-color='black'/>
                  <stop offset='100%' stop-color='transparent'/>
                </radialGradient>
              </defs>
              <path d='${heartPath}' fill='url(#fade)'/>
            </svg>
          `)}")`,
          WebkitMaskImage: `url("data:image/svg+xml,${encodeURIComponent(`
            <svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
              <defs>
                <radialGradient id='fade'>
                  <stop offset='${100 - softEdge * 100}%' stop-color='black'/>
                  <stop offset='100%' stop-color='transparent'/>
                </radialGradient>
              </defs>
              <path d='${heartPath}' fill='url(#fade)'/>
            </svg>
          `)}")`,
          maskSize: `${maskSize}% ${maskSize}%`,
          WebkitMaskSize: `${maskSize}% ${maskSize}%`,
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * HeartBurst Transition - Multiple hearts burst outward
 */
export const HeartBurstTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  heartCount?: number;
}> = ({
  progress,
  direction,
  children,
  heartCount = 12,
}) => {
  const hearts = React.useMemo(() => {
    return Array.from({ length: heartCount }, (_, i) => {
      const angle = (i / heartCount) * Math.PI * 2;
      return {
        angle,
        delay: (i / heartCount) * 0.3,
        size: 30 + Math.random() * 40,
      };
    });
  }, [heartCount]);

  let contentOpacity: number;
  let contentScale: number;

  if (direction === "in") {
    contentOpacity = interpolate(progress, [0.3, 0.7], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    contentScale = interpolate(progress, [0.3, 1], [0.8, 1], {
      extrapolateLeft: "clamp",
      easing: Easing.out(Easing.back(1.5)),
    });
  } else {
    contentOpacity = interpolate(progress, [0, 0.5], [1, 0], {
      extrapolateRight: "clamp",
    });
    contentScale = interpolate(progress, [0, 0.7], [1, 0.8], {
      extrapolateRight: "clamp",
    });
  }

  return (
    <AbsoluteFill>
      {/* Main content */}
      <AbsoluteFill
        style={{
          opacity: contentOpacity,
          transform: `scale(${contentScale})`,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Burst hearts */}
      {hearts.map((heart, i) => {
        const adjustedProgress = Math.max(0, Math.min(1,
          direction === "in"
            ? (progress - heart.delay) / (1 - heart.delay)
            : progress / (1 - heart.delay)
        ));

        const distance = direction === "in"
          ? interpolate(adjustedProgress, [0, 1], [0, 600])
          : interpolate(adjustedProgress, [0, 1], [600, 0]);

        const heartOpacity = direction === "in"
          ? interpolate(adjustedProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
          : interpolate(adjustedProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

        const rotation = adjustedProgress * 360;

        const x = Math.cos(heart.angle) * distance;
        const y = Math.sin(heart.angle) * distance;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: heart.size,
              height: heart.size,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg)`,
              opacity: heartOpacity,
              fontSize: heart.size,
              color: "#ff6b9d",
            }}
          >
            ❤️
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * DoublePulse Transition - Two hearts pulse and reveal
 */
export const DoublePulseTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
}> = ({
  progress,
  direction,
  children,
}) => {
  // Two heartbeat pulses
  const pulse1 = interpolate(
    progress,
    [0, 0.15, 0.3, 0.45],
    [1, 1.3, 1, 1.1],
    { extrapolateRight: "clamp" }
  );

  const pulse2 = interpolate(
    progress,
    [0.45, 0.6, 0.75, 0.9],
    [1, 1.2, 1, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = progress < 0.45 ? pulse1 : pulse2;

  let opacity: number;
  if (direction === "in") {
    opacity = interpolate(progress, [0, 0.3, 0.9, 1], [0, 0.5, 0.8, 1]);
  } else {
    opacity = interpolate(progress, [0, 0.1, 0.7, 1], [1, 0.8, 0.5, 0]);
  }

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * LoveLetterReveal - Unfolds like a love letter
 */
export const LoveLetterReveal: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
}> = ({
  progress,
  direction,
  children,
}) => {
  let foldY: number;
  let foldX: number;
  let opacity: number;

  if (direction === "in") {
    // Unfold vertically then horizontally
    foldY = interpolate(progress, [0, 0.5], [90, 0], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    foldX = interpolate(progress, [0.4, 0.9], [90, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    opacity = interpolate(progress, [0, 0.2], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    // Fold back up
    foldX = interpolate(progress, [0, 0.5], [0, 90], {
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
    foldY = interpolate(progress, [0.4, 1], [0, 90], {
      extrapolateLeft: "clamp",
      easing: Easing.in(Easing.cubic),
    });
    opacity = interpolate(progress, [0.8, 1], [1, 0], {
      extrapolateLeft: "clamp",
    });
  }

  return (
    <AbsoluteFill
      style={{
        perspective: 1000,
      }}
    >
      <AbsoluteFill
        style={{
          transform: `rotateX(${foldY}deg) rotateY(${foldX}deg)`,
          transformOrigin: "center center",
          opacity,
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
