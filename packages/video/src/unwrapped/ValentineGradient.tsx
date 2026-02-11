/**
 * Valentine Gradient Background
 * Romantic pink gradient backgrounds
 */

import React from "react";
import { AbsoluteFill } from "remotion";

export type ValentineGradientType =
  | "romantic-pink"
  | "soft-rose"
  | "sunset-pink"
  | "deep-magenta";

const gradients: Record<ValentineGradientType, string> = {
  "romantic-pink": "linear-gradient(135deg, #FF6B9D 0%, #C06C84 50%, #355C7D 100%)",
  "soft-rose": "linear-gradient(135deg, #FFD1DC 0%, #FFB6C1 50%, #FF69B4 100%)",
  "sunset-pink": "linear-gradient(135deg, #FF6B9D 0%, #FFC371 100%)",
  "deep-magenta": "linear-gradient(135deg, #C2185B 0%, #880E4F 50%, #4A148C 100%)",
};

export interface ValentineGradientProps {
  type: ValentineGradientType;
}

export const ValentineGradient: React.FC<ValentineGradientProps> = ({ type }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: gradients[type],
      }}
    />
  );
};
