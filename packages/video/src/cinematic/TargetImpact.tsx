/**
 * TargetImpact - Orchestrates the arrow impact sequence
 * Slow-motion impact, rose bloom, petal scatter, and finale text
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { TargetSVG } from "../assets/svg/PlaceholderSVGs";
import { RoseBloom, RoseRadialBurst } from "./RoseBloom";
import { PetalScatter, PetalExplosion } from "./PetalScatter";
import { remapSpeed } from "./remapSpeed";
import type { CoupleInfo, ColorScheme } from "../scenes/types";
import { COLOR_SCHEMES } from "../scenes/types";

export interface TargetImpactProps {
  /** Target position */
  targetX?: number;
  targetY?: number;
  /** Couple information for finale */
  couple: CoupleInfo;
  /** Total days together */
  totalDays?: number;
  /** Color scheme */
  colorScheme?: ColorScheme;
  /** Duration of impact sequence */
  durationInFrames: number;
}

/**
 * Main impact sequence orchestration
 */
export const TargetImpact: React.FC<TargetImpactProps> = ({
  targetX = 540,
  targetY = 960,
  couple,
  totalDays = 0,
  colorScheme = "warm",
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];

  // Impact timing
  const IMPACT_FRAME = 60; // Arrow hits at frame 60
  const BLOOM_START = IMPACT_FRAME + 10;
  const PETAL_START = IMPACT_FRAME + 30;
  const TEXT_START = IMPACT_FRAME + 90;

  // Slow-motion time remapping around impact
  const slowMoStart = IMPACT_FRAME - 10;
  const slowMoEnd = IMPACT_FRAME + 40;

  const timeScale = interpolate(
    frame,
    [slowMoStart, IMPACT_FRAME, slowMoEnd],
    [1, 0.3, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.5, 0, 0.5, 1),
    }
  );

  // Target shake on impact
  const targetShake = frame >= IMPACT_FRAME && frame < IMPACT_FRAME + 15
    ? Math.sin(frame * 2) * 10
    : 0;

  // Target scale (impact recoil)
  const targetScale = interpolate(
    frame,
    [IMPACT_FRAME, IMPACT_FRAME + 10, IMPACT_FRAME + 20],
    [1, 1.15, 1],
    { extrapolateRight: "clamp" }
  );

  // Target crack/break effect
  const targetOpacity = interpolate(
    frame,
    [IMPACT_FRAME + 30, IMPACT_FRAME + 50],
    [1, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Sky gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${colors.gradient[0]}22 0%, ${colors.gradient[2]}44 100%)`,
        }}
      />

      {/* Target */}
      <div
        style={{
          position: "absolute",
          left: targetX,
          top: targetY,
          transform: `
            translate(-50%, -50%)
            translateX(${targetShake}px)
            scale(${targetScale})
          `,
          opacity: targetOpacity,
        }}
      >
        <TargetSVG width={600} height={600} />
      </div>

      {/* Impact flash */}
      {frame >= IMPACT_FRAME && frame < IMPACT_FRAME + 10 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#ffffff",
            opacity: interpolate(frame, [IMPACT_FRAME, IMPACT_FRAME + 10], [0.8, 0]),
          }}
        />
      )}

      {/* Rose bloom from arrow */}
      {frame >= BLOOM_START && (
        <RoseBloom
          centerX={targetX}
          centerY={targetY}
          roseCount={7}
          startFrame={BLOOM_START}
          color={colors.primary}
        />
      )}

      {/* Radial burst of roses */}
      {frame >= BLOOM_START + 20 && (
        <RoseRadialBurst
          centerX={targetX}
          centerY={targetY}
          count={12}
          startFrame={BLOOM_START + 20}
          color={colors.primary}
        />
      )}

      {/* Petal scatter */}
      {frame >= PETAL_START && (
        <>
          <PetalScatter
            centerX={targetX}
            centerY={targetY}
            petalCount={50}
            startFrame={PETAL_START}
            color={colors.primary}
            seed="impact-petals"
          />
          <PetalExplosion
            centerX={targetX}
            centerY={targetY}
            count={30}
            startFrame={PETAL_START + 10}
            power={20}
            color={colors.secondary}
          />
        </>
      )}

      {/* Finale text */}
      {frame >= TEXT_START && (
        <FinaleText
          couple={couple}
          totalDays={totalDays}
          startFrame={TEXT_START}
          colors={colors}
        />
      )}
    </AbsoluteFill>
  );
};

/**
 * Finale text reveal
 */
interface FinaleTextProps {
  couple: CoupleInfo;
  totalDays: number;
  startFrame: number;
  colors: any;
}

const FinaleText: React.FC<FinaleTextProps> = ({
  couple,
  totalDays,
  startFrame,
  colors,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;

  // Staggered text reveals
  const line1Progress = interpolate(relativeFrame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line2Progress = interpolate(relativeFrame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const line3Progress = interpolate(relativeFrame, [40, 70], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Happy Valentine's Day */}
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 72,
          fontWeight: 700,
          color: colors.primary,
          textAlign: "center",
          marginBottom: 40,
          opacity: line1Progress,
          transform: `translateY(${interpolate(line1Progress, [0, 1], [50, 0])}px)`,
        }}
      >
        Happy Valentine's Day
      </div>

      {/* Couple names */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 56,
          fontWeight: 600,
          color: colors.text,
          textAlign: "center",
          marginBottom: 30,
          opacity: line2Progress,
          transform: `translateY(${interpolate(line2Progress, [0, 1], [50, 0])}px)`,
        }}
      >
        {couple.name1} & {couple.name2}
      </div>

      {/* Days together */}
      {totalDays > 0 && (
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 36,
            fontWeight: 500,
            color: colors.secondary,
            textAlign: "center",
            opacity: line3Progress,
            transform: `translateY(${interpolate(line3Progress, [0, 1], [50, 0])}px)`,
          }}
        >
          {totalDays.toLocaleString()} {totalDays === 1 ? "Day" : "Days"} Together
        </div>
      )}

      {/* Decorative hearts */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 40,
          opacity: line3Progress,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            width="30"
            height="30"
            viewBox="0 0 100 100"
            style={{
              animation: `pulse ${1 + i * 0.2}s infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <path
              d="M50,90 C50,90 10,60 10,35 C10,20 20,10 30,10 C40,10 50,20 50,30 C50,20 60,10 70,10 C80,10 90,20 90,35 C90,60 50,90 50,90 Z"
              fill={colors.primary}
            />
          </svg>
        ))}
      </div>
    </AbsoluteFill>
  );
};
