/**
 * Placeholder SVG Components
 * Simple shapes to demonstrate animations until custom SVGs are provided
 * Replace these with user's custom artwork
 */

import React from "react";

export interface SVGComponentProps {
  width?: number;
  height?: number;
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Placeholder Cupid - Simple figure with bow
 */
export const CupidSVG: React.FC<SVGComponentProps> = ({
  width = 400,
  height = 400,
  color = "#d81b60",
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 400"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="200" cy="250" rx="60" ry="80" fill={color} />

      {/* Head */}
      <circle cx="200" cy="150" r="50" fill={color} />

      {/* Wings */}
      <path
        d="M 140 220 Q 100 180 120 140 Q 140 180 140 220 Z"
        fill={color}
        opacity="0.7"
      />
      <path
        d="M 260 220 Q 300 180 280 140 Q 260 180 260 220 Z"
        fill={color}
        opacity="0.7"
      />

      {/* Bow */}
      <path
        d="M 280 260 Q 350 240 360 200"
        stroke={color}
        strokeWidth="8"
        fill="none"
      />
      <path
        d="M 360 180 L 370 200 L 350 210"
        fill={color}
      />

      {/* Bowstring */}
      <line
        x1="285"
        y1="255"
        x2="355"
        y2="205"
        stroke={color}
        strokeWidth="3"
      />
    </svg>
  );
};

/**
 * Placeholder Arrow - Simple arrow shape
 */
export const ArrowSVG: React.FC<SVGComponentProps> = ({
  width = 200,
  height = 50,
  color = "#d81b60",
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 50"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shaft */}
      <rect x="20" y="22" width="150" height="6" fill={color} />

      {/* Arrowhead */}
      <path
        d="M 170 25 L 195 25 L 182.5 10 Z"
        fill={color}
      />
      <path
        d="M 170 25 L 195 25 L 182.5 40 Z"
        fill={color}
      />

      {/* Fletching */}
      <path
        d="M 20 15 L 5 25 L 20 35 Z"
        fill={color}
        opacity="0.8"
      />
    </svg>
  );
};

/**
 * Placeholder Target - Bullseye circles
 */
export const TargetSVG: React.FC<SVGComponentProps> = ({
  width = 600,
  height = 600,
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 600 600"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring - White */}
      <circle cx="300" cy="300" r="280" fill="#ffffff" />

      {/* Red ring */}
      <circle cx="300" cy="300" r="220" fill="#d81b60" />

      {/* White ring */}
      <circle cx="300" cy="300" r="160" fill="#ffffff" />

      {/* Red ring */}
      <circle cx="300" cy="300" r="100" fill="#d81b60" />

      {/* Bullseye - White */}
      <circle cx="300" cy="300" r="40" fill="#ffffff" />

      {/* Center dot - Red */}
      <circle cx="300" cy="300" r="15" fill="#d81b60" />
    </svg>
  );
};

/**
 * Placeholder Rose - Simple flower shape
 */
export const RoseSVG: React.FC<SVGComponentProps & { bloomStage?: "bud" | "half" | "full" }> = ({
  width = 150,
  height = 150,
  color = "#d81b60",
  style,
  bloomStage = "full",
}) => {
  const scales = {
    bud: 0.5,
    half: 0.75,
    full: 1,
  };

  const scale = scales[bloomStage];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 150 150"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stem */}
      <rect x="70" y="80" width="10" height="60" fill="#2e7d32" rx="5" />

      {/* Leaves */}
      <ellipse
        cx="50"
        cy="100"
        rx="15"
        ry="8"
        fill="#4caf50"
        transform="rotate(-30 50 100)"
      />
      <ellipse
        cx="100"
        cy="110"
        rx="15"
        ry="8"
        fill="#4caf50"
        transform="rotate(30 100 110)"
      />

      {/* Petals - Scale based on bloom stage */}
      <g transform={`translate(75, 60) scale(${scale})`}>
        {/* Center petal */}
        <ellipse cx="0" cy="0" rx="12" ry="20" fill={color} />

        {/* Surrounding petals */}
        <ellipse
          cx="0"
          cy="-15"
          rx="12"
          ry="20"
          fill={color}
          opacity="0.9"
        />
        <ellipse
          cx="13"
          cy="-7"
          rx="12"
          ry="20"
          fill={color}
          opacity="0.85"
          transform="rotate(72 13 -7)"
        />
        <ellipse
          cx="8"
          cy="12"
          rx="12"
          ry="20"
          fill={color}
          opacity="0.85"
          transform="rotate(144 8 12)"
        />
        <ellipse
          cx="-8"
          cy="12"
          rx="12"
          ry="20"
          fill={color}
          opacity="0.85"
          transform="rotate(-144 -8 12)"
        />
        <ellipse
          cx="-13"
          cy="-7"
          rx="12"
          ry="20"
          fill={color}
          opacity="0.85"
          transform="rotate(-72 -13 -7)"
        />

        {/* Inner petals */}
        <circle cx="0" cy="0" r="10" fill={color} opacity="0.6" />
        <circle cx="0" cy="0" r="5" fill="#c2185b" />
      </g>
    </svg>
  );
};

/**
 * Placeholder Rose Petal - Single petal for particle effects
 */
export const RosePetalSVG: React.FC<SVGComponentProps> = ({
  width = 40,
  height = 60,
  color = "#d81b60",
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 60"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 20 0 Q 35 15 30 40 Q 25 55 20 60 Q 15 55 10 40 Q 5 15 20 0 Z"
        fill={color}
        opacity="0.8"
      />
      {/* Vein detail */}
      <path
        d="M 20 5 Q 20 30 20 55"
        stroke={color}
        strokeWidth="1"
        opacity="0.3"
        fill="none"
      />
    </svg>
  );
};

/**
 * Placeholder Cloud - Fluffy cloud shape
 */
export const CloudSVG: React.FC<SVGComponentProps & { variant?: 1 | 2 | 3 }> = ({
  width = 200,
  height = 100,
  style,
  variant = 1,
}) => {
  const variants = {
    1: { circles: [{ cx: 50, r: 40 }, { cx: 100, r: 50 }, { cx: 150, r: 35 }] },
    2: { circles: [{ cx: 40, r: 35 }, { cx: 90, r: 45 }, { cx: 140, r: 40 }, { cx: 170, r: 30 }] },
    3: { circles: [{ cx: 60, r: 45 }, { cx: 120, r: 40 }, { cx: 160, r: 35 }] },
  };

  const cloudData = variants[variant];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 100"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.8">
        {cloudData.circles.map((circle, i) => (
          <circle
            key={i}
            cx={circle.cx}
            cy="60"
            r={circle.r}
            fill="#ffffff"
          />
        ))}
      </g>
    </svg>
  );
};

/**
 * Placeholder Milestone Frame - Decorative border
 */
export const MilestoneFrameSVG: React.FC<SVGComponentProps> = ({
  width = 300,
  height = 300,
  color = "#d81b60",
  style,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 300"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer frame */}
      <rect
        x="10"
        y="10"
        width="280"
        height="280"
        fill="none"
        stroke={color}
        strokeWidth="6"
        rx="10"
      />

      {/* Inner frame */}
      <rect
        x="25"
        y="25"
        width="250"
        height="250"
        fill="none"
        stroke={color}
        strokeWidth="3"
        rx="5"
      />

      {/* Corner decorations */}
      <circle cx="25" cy="25" r="8" fill={color} />
      <circle cx="275" cy="25" r="8" fill={color} />
      <circle cx="25" cy="275" r="8" fill={color} />
      <circle cx="275" cy="275" r="8" fill={color} />

      {/* Center cutout for photo */}
      <rect
        x="50"
        y="50"
        width="200"
        height="200"
        fill="rgba(255,255,255,0.1)"
        rx="3"
      />
    </svg>
  );
};
