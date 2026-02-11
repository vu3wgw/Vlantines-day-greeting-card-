import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

interface IconProps {
  size?: number;
  color?: string;
  opacity?: number;
  x?: number;
  y?: number;
  rotation?: number;
  animation?: "float" | "scale" | "rotate" | "none";
}

/**
 * Cupid icon - Valentine's symbol of love
 */
export const Cupid: React.FC<IconProps> = ({
  size = 80,
  color = "#d81b60",
  opacity = 1,
  x = 0,
  y = 0,
  rotation = 0,
  animation = "none",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let animatedY = y;
  let animatedRotation = rotation;
  let animatedScale = 1;

  if (animation === "float") {
    animatedY = y + interpolate(frame, [0, fps * 2, fps * 4], [0, -10, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "repeat",
    });
  } else if (animation === "rotate") {
    animatedRotation = rotation + interpolate(frame, [0, fps * 4], [0, 360], {
      extrapolateRight: "repeat",
    });
  } else if (animation === "scale") {
    animatedScale = interpolate(frame, [0, fps, fps * 2], [1, 1.2, 1], {
      extrapolateRight: "repeat",
      easing: Easing.inOut(Easing.ease),
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: animatedY,
        width: size,
        height: size,
        transform: `rotate(${animatedRotation}deg) scale(${animatedScale})`,
        opacity,
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Wings */}
        <path
          d="M30 30 Q20 20, 25 10 Q30 5, 35 10 Q40 15, 35 25 Z"
          fill={color}
          opacity={0.6}
        />
        <path
          d="M70 30 Q80 20, 75 10 Q70 5, 65 10 Q60 15, 65 25 Z"
          fill={color}
          opacity={0.6}
        />

        {/* Body */}
        <circle cx="50" cy="35" r="12" fill={color} />
        <ellipse cx="50" cy="55" rx="8" ry="15" fill={color} />

        {/* Head */}
        <circle cx="50" cy="25" r="8" fill="#ffd5e5" />

        {/* Bow and Arrow */}
        <path
          d="M60 45 L85 60"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M80 55 L85 60 L80 65"
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        <circle cx="85" cy="60" r="3" fill={color} />
      </svg>
    </div>
  );
};

/**
 * Rose icon - Classic Valentine's flower
 */
export const Rose: React.FC<IconProps> = ({
  size = 60,
  color = "#d81b60",
  opacity = 1,
  x = 0,
  y = 0,
  rotation = 0,
  animation = "none",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let animatedY = y;
  let animatedRotation = rotation;
  let animatedScale = 1;

  if (animation === "float") {
    animatedY = y + interpolate(frame, [0, fps * 3, fps * 6], [0, -8, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "repeat",
    });
  } else if (animation === "rotate") {
    animatedRotation = rotation + interpolate(frame, [0, fps * 6], [0, 360], {
      extrapolateRight: "repeat",
    });
  } else if (animation === "scale") {
    animatedScale = interpolate(frame, [0, fps * 1.5, fps * 3], [0.9, 1.1, 0.9], {
      extrapolateRight: "repeat",
      easing: Easing.inOut(Easing.ease),
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: animatedY,
        width: size,
        height: size,
        transform: `rotate(${animatedRotation}deg) scale(${animatedScale})`,
        opacity,
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Stem */}
        <path
          d="M50 50 Q48 70, 45 90"
          stroke="#2e7d32"
          strokeWidth="3"
          fill="none"
        />

        {/* Leaves */}
        <path
          d="M47 65 Q40 65, 38 70 Q40 72, 45 70"
          fill="#43a047"
        />
        <path
          d="M46 75 Q53 75, 55 80 Q53 82, 48 80"
          fill="#43a047"
        />

        {/* Rose petals - layered */}
        <circle cx="50" cy="35" r="18" fill={color} opacity={0.3} />
        <circle cx="50" cy="35" r="14" fill={color} opacity={0.5} />
        <circle cx="50" cy="35" r="10" fill={color} opacity={0.7} />

        {/* Inner petals */}
        <path
          d="M45 30 Q50 25, 55 30 Q50 35, 45 30"
          fill={color}
        />
        <path
          d="M45 40 Q50 45, 55 40 Q50 35, 45 40"
          fill={color}
        />
        <path
          d="M40 35 Q35 30, 40 25 Q45 30, 40 35"
          fill={color}
        />
        <path
          d="M60 35 Q65 30, 60 25 Q55 30, 60 35"
          fill={color}
        />

        {/* Center */}
        <circle cx="50" cy="35" r="5" fill="#c2185b" />
      </svg>
    </div>
  );
};

/**
 * Rose Field - Multiple roses for background
 */
export const RoseField: React.FC<{
  count?: number;
  side: "left" | "right";
  width?: number;
  height?: number;
  scrollSpeed?: number;
}> = ({
  count = 5,
  side,
  width = 200,
  height = 1920,
  scrollSpeed = 1,
}) => {
  const frame = useCurrentFrame();

  const roses = Array.from({ length: count }, (_, i) => {
    const yOffset = (height / count) * i;
    const scroll = (frame * scrollSpeed * 5) % height;
    const y = (yOffset - scroll + height) % height;
    const x = side === "left" ? 20 + (i % 2) * 30 : width - 80 - (i % 2) * 30;
    const rotation = side === "left" ? 15 + i * 5 : -15 - i * 5;

    return (
      <Rose
        key={i}
        x={x}
        y={y}
        size={40 + (i % 3) * 10}
        rotation={rotation}
        opacity={0.6}
      />
    );
  });

  return <>{roses}</>;
};

/**
 * Floating Cupids - Background decoration
 */
export const FloatingCupids: React.FC<{
  count?: number;
  width?: number;
  height?: number;
}> = ({
  count = 3,
  width = 1080,
  height = 1920,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cupids = Array.from({ length: count }, (_, i) => {
    const offsetX = (width / count) * i + (i * 100);
    const offsetY = (height / count) * i;

    const x = interpolate(
      frame,
      [0, fps * 10],
      [offsetX, offsetX + 100],
      {
        extrapolateRight: "repeat",
      }
    );

    const y = offsetY + Math.sin((frame + i * fps) / fps) * 30;

    return (
      <Cupid
        key={i}
        x={x}
        y={y}
        size={60}
        opacity={0.3}
        animation="float"
      />
    );
  });

  return <>{cupids}</>;
};
