/**
 * Valentine Opening Scene - Inspired by GitHub Unwrapped style
 * Heart rocket launch with zoom out effect
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { ValentineGradient } from "./ValentineGradient";
import { ValentineNoise } from "./ValentineNoise";
import { HeartRocket } from "./HeartRocket";
import { remapSpeed } from "../cinematic/remapSpeed";

export const OPENING_DURATION = 130;
export const OPENING_OVERLAP = 10;

export interface ValentineOpeningProps {
  coupleName: string;
}

export const ValentineOpening: React.FC<ValentineOpeningProps> = ({
  coupleName,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  // Zoom out animation (like GitHub Unwrapped)
  const zoomDelay = 10;
  const zoomDuration = 60;

  const zoomSpring = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: zoomDuration,
    delay: zoomDelay,
  });

  const zoomProgress =
    zoomSpring * 0.9 +
    interpolate(frame, [0, zoomDelay + zoomDuration], [-0.1, 0.1], {
      extrapolateRight: "clamp",
    });

  const scale = interpolate(zoomProgress, [0, 1], [2.5, 1]);
  const offset = interpolate(zoomProgress, [0, 1], [0, 0]);
  const x = offset / scale;

  // Exit zoom animation (zoom into space)
  const exitProgress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    delay: durationInFrames - 20,
    durationInFrames: 60,
  });

  const exitDistance = interpolate(exitProgress, [0, 1], [1, 0.000005]);
  const exitScale = 1 / exitDistance;
  const exitTranslateX = (exitScale - 1) * 200;

  // Rocket launch animation
  const takeOffSpeedFunction = (f: number) =>
    10 ** interpolate(f, [0, 120], [-1, 4]);

  const acceleratedFrame = remapSpeed(frame, takeOffSpeedFunction);
  const rocketTranslateY = interpolate(acceleratedFrame, [0, 100], [0, -300]);

  // Title fade animations
  const titleFadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  const titleFadeOut = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translateX(${x}px)`,
      }}
    >
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Background gradient */}
        <AbsoluteFill
          style={{
            opacity: interpolate(exitProgress, [0, 1], [1, 0]),
          }}
        >
          <ValentineGradient type="romantic-pink" />
          <ValentineNoise translateX={100} translateY={30} />
        </AbsoluteFill>

        {/* Title */}
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: titleFadeIn * titleFadeOut,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 80,
              fontWeight: 700,
              color: "#FFF",
              textAlign: "center",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              marginBottom: 20,
            }}
          >
            {coupleName}
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 36,
              fontWeight: 400,
              color: "#FFD1DC",
              textAlign: "center",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Love Unwrapped
          </div>
        </AbsoluteFill>

        {/* Ground/mountains layer */}
        <AbsoluteFill
          style={{
            bottom: 0,
            top: "auto",
            height: 400,
            background: "linear-gradient(180deg, transparent 0%, #355C7D 100%)",
            transform: `translateY(${interpolate(
              exitProgress,
              [0, 0.7],
              [0, 500]
            )}px)`,
          }}
        />

        {/* Foreground hills */}
        <AbsoluteFill
          style={{
            bottom: 0,
            top: "auto",
            height: 300,
            background: "linear-gradient(180deg, transparent 0%, #C06C84 100%)",
            transformOrigin: "bottom",
            transform: `scale(${exitScale}) translateY(${exitTranslateX}px)`,
          }}
        />

        {/* Heart Rocket */}
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateY(${rocketTranslateY + 100}px)`,
          }}
        >
          <HeartRocket color="#FF1493" scale={0.8} />
        </AbsoluteFill>

        {/* Sparkle particles */}
        {frame > 20 && (
          <SparkleParticles
            count={30}
            color="#FFD1DC"
            opacity={interpolate(frame, [20, 50], [0, 0.8]) * titleFadeOut}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Sparkle particles for Valentine's atmosphere
 */
const SparkleParticles: React.FC<{
  count: number;
  color: string;
  opacity: number;
}> = ({ count, color, opacity }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {Array.from({ length: count }).map((_, i) => {
        const x = (i * 123) % 100;
        const y = (i * 456) % 100;
        const delay = i * 2;
        const size = 3 + (i % 5);

        const sparkleProgress = Math.sin((frame - delay) * 0.1) * 0.5 + 0.5;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: "50%",
              opacity: opacity * sparkleProgress,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
