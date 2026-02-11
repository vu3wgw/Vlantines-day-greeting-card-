/**
 * Heart Rocket - Valentine's themed rocket with heart shape
 * Original design for Valentine's animation
 */

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";

export interface HeartRocketProps {
  color?: string;
  scale?: number;
}

export const HeartRocket: React.FC<HeartRocketProps> = ({
  color = "#FF1493",
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulse animation
  const pulse = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
  });

  const heartScale = interpolate(pulse, [0, 1], [0.95, 1]);

  return (
    <svg
      width={300 * scale}
      height={350 * scale}
      viewBox="0 0 300 350"
      style={{
        transform: `scale(${heartScale})`,
      }}
    >
      {/* Heart body (rocket body) */}
      <path
        d="M 150 50
           C 150 50 120 20 90 20
           C 60 20 40 40 40 70
           C 40 110 150 180 150 180
           C 150 180 260 110 260 70
           C 260 40 240 20 210 20
           C 180 20 150 50 150 50 Z"
        fill={color}
        stroke="#C2185B"
        strokeWidth="3"
      />

      {/* Rocket window/porthole */}
      <circle cx="150" cy="80" r="25" fill="#FFF" opacity="0.9" />
      <circle cx="150" cy="80" r="20" fill="#FFD1DC" opacity="0.7" />

      {/* Wings */}
      <path
        d="M 80 140 L 50 220 L 90 190 Z"
        fill="#FF6B9D"
        stroke="#C2185B"
        strokeWidth="2"
      />
      <path
        d="M 220 140 L 250 220 L 210 190 Z"
        fill="#FF6B9D"
        stroke="#C2185B"
        strokeWidth="2"
      />

      {/* Bottom fins */}
      <path
        d="M 150 180 L 120 240 L 140 200 Z"
        fill="#FFB6C1"
        stroke="#C2185B"
        strokeWidth="2"
      />
      <path
        d="M 150 180 L 180 240 L 160 200 Z"
        fill="#FFB6C1"
        stroke="#C2185B"
        strokeWidth="2"
      />

      {/* Flame exhaust (will be animated separately) */}
      <g opacity="0.8">
        <ellipse cx="150" cy="200" rx="20" ry="30" fill="#FF6B9D" />
        <ellipse cx="150" cy="210" rx="15" ry="25" fill="#FFC371" />
        <ellipse cx="150" cy="220" rx="10" ry="20" fill="#FFD1DC" />
      </g>

      {/* Hearts decorations */}
      <path
        d="M 130 90 C 130 90 125 85 120 85 C 115 85 112 88 112 92 C 112 98 130 108 130 108 C 130 108 148 98 148 92 C 148 88 145 85 140 85 C 135 85 130 90 130 90 Z"
        fill="#FFF"
        opacity="0.8"
      />
      <path
        d="M 170 90 C 170 90 165 85 160 85 C 155 85 152 88 152 92 C 152 98 170 108 170 108 C 170 108 188 98 188 92 C 188 88 185 85 180 85 C 175 85 170 90 170 90 Z"
        fill="#FFF"
        opacity="0.8"
      />
    </svg>
  );
};
