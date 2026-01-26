import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";

interface Heart {
  id: number;
  x: number;
  startY: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
  emoji: string;
}

// Generate consistent hearts based on seed
function generateHearts(count: number, seed: string): Heart[] {
  const hearts: Heart[] = [];
  const emojis = ["❤️", "💕", "💖", "💗", "💓", "💞"];

  for (let i = 0; i < count; i++) {
    hearts.push({
      id: i,
      x: random(`${seed}-x-${i}`) * 100, // percentage
      startY: 100 + random(`${seed}-y-${i}`) * 20, // start below screen
      size: 16 + random(`${seed}-size-${i}`) * 24, // 16-40px
      speed: 0.3 + random(`${seed}-speed-${i}`) * 0.4, // pixels per frame
      delay: random(`${seed}-delay-${i}`) * 120, // frame delay
      opacity: 0.2 + random(`${seed}-opacity-${i}`) * 0.4, // 0.2-0.6
      emoji: emojis[Math.floor(random(`${seed}-emoji-${i}`) * emojis.length)] ?? "❤️",
    });
  }

  return hearts;
}

interface FloatingHeartsProps {
  seed?: string;
  count?: number;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  seed = "valentine-hearts",
  count = 15,
}) => {
  const frame = useCurrentFrame();
  const hearts = React.useMemo(
    () => generateHearts(count, seed),
    [count, seed]
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {hearts.map((heart) => {
        const adjustedFrame = Math.max(0, frame - heart.delay);
        const y = heart.startY - adjustedFrame * heart.speed;

        // Fade in when entering, fade out when near top
        // inputRange must be increasing, so use 0->100 and reverse the logic
        const fadeOpacity = interpolate(
          y,
          [0, 20, 90, 100],
          [0, heart.opacity, heart.opacity, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        // Subtle horizontal sway
        const sway = Math.sin(adjustedFrame * 0.05 + heart.id) * 10;

        // Don't render if above screen
        if (y < -10) return null;

        return (
          <div
            key={heart.id}
            style={{
              position: "absolute",
              left: `${heart.x}%`,
              top: `${y}%`,
              transform: `translateX(${sway}px)`,
              fontSize: heart.size,
              opacity: fadeOpacity,
              filter: "blur(0.5px)",
            }}
          >
            {heart.emoji}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
