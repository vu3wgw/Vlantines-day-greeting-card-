/**
 * Valentine Noise Effect - Inspired by GitHub Unwrapped
 * Creates atmospheric particle noise with pink Valentine colors
 */

import { noise2D } from "@remotion/noise";
import React, { useMemo } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

const unitSize = 15;

// Pink Valentine's palette
const pinkPalette = [
  "#FF1493", // Deep pink
  "#FF69B4", // Hot pink
  "#FFB6C1", // Light pink
  "#FFC0CB", // Pink
  "#FF82AB", // Pale violet red
  "#FF6EB4", // Medium pink
  "#FF91C7", // Soft pink
  "#E75480", // Dark pink
  "#F88379", // Salmon pink
  "#FFD1DC", // Pastel pink
];

export interface ValentineNoiseProps {
  translateX: number;
  translateY: number;
}

export const ValentineNoise: React.FC<ValentineNoiseProps> = ({
  translateX,
  translateY,
}) => {
  const { width, height } = useVideoConfig();

  const samples = useMemo(() => {
    const unitsHorizontal = width / unitSize;
    const unitsVertical = height / unitSize;

    const unitOffsetX = Math.floor(translateX / unitSize);
    const unitOffsetY = Math.floor(translateY / unitSize);

    return Array.from({ length: unitsHorizontal }, (_, column) => {
      return Array.from({ length: unitsVertical }, (__, row) => {
        const x = column - unitOffsetY;
        const y = row - unitOffsetX - x * unitsHorizontal;
        return { x: noise2D("valentine-seed", y * 6, x * 6) };
      });
    });
  }, [height, translateX, translateY, width]);

  const memoizedSamples = useMemo(() => {
    return samples.map((sample, i) => {
      return (
        <div key={i} style={{ display: "flex", flexDirection: "row" }}>
          {sample.map((s, j) => {
            if (s.x < 0.9) {
              return null;
            }

            const str = String(s.x);
            const randomDigit = Number(str[2]);
            const randomDigit2 = Number(str[4]);
            const randomDigit3 = Number(str[6]);

            return (
              <div
                key={`${i}-${j}`}
                style={{
                  width: 6 * randomDigit2 * 0.1,
                  height: 6 * randomDigit2 * 0.1,
                  left: i * unitSize,
                  top: j * unitSize,
                  position: "absolute",
                  transform: `translateY(${
                    translateX % unitSize
                  }px) translateX(${translateY % unitSize}px)`,
                  backgroundColor: pinkPalette[randomDigit],
                  fontSize: 10,
                  borderRadius: "50%",
                  opacity: randomDigit3 * 0.05 + 0.6,
                }}
              />
            );
          })}
        </div>
      );
    });
  }, [samples, translateX, translateY]);

  return <AbsoluteFill>{memoizedSamples}</AbsoluteFill>;
};
