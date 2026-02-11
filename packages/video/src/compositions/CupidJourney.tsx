/**
 * CupidJourney - Main cinematic composition
 * Cupid shoots arrow → flies through milestones → hits target → roses bloom
 */

import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { z } from "zod";

// Import all cinematic components
import { Arrow, useArrowPosition } from "../cinematic/Arrow";
import { CloudLayers, SkyGradient } from "../cinematic/CloudLayers";
import { MilestoneTrack, generateMilestonesFromPhotos } from "../cinematic/MilestoneMarker";
import { TargetImpact } from "../cinematic/TargetImpact";
import { CupidSVG, TargetSVG } from "../assets/svg/PlaceholderSVGs";
import { createArrowPath, type Point } from "../cinematic/ArrowPath";
import { speedFunctions } from "../cinematic/remapSpeed";
import { COLOR_SCHEMES, type CoupleInfo, type SceneImage, type ColorScheme } from "../scenes/types";

// Props schema
export const CupidJourneySchema = z.object({
  couple: z.object({
    name1: z.string(),
    name2: z.string(),
    startDate: z.string().optional(),
    relationshipLabel: z.string().optional(),
  }),
  images: z.array(
    z.object({
      url: z.string(),
      caption: z.string().optional(),
      date: z.string().optional(),
      isFavorite: z.boolean().optional(),
    })
  ),
  colorScheme: z.enum(["warm", "cool", "vibrant", "soft"]).default("warm"),
});

export type CupidJourneyProps = z.infer<typeof CupidJourneySchema>;

/**
 * Main composition - 60 seconds @ 30fps = 1800 frames
 */
export const CupidJourney: React.FC<CupidJourneyProps> = ({
  couple,
  images,
  colorScheme = "warm",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];

  // Calculate total days together
  const totalDays = useMemo(() => {
    if (!couple.startDate) return 0;
    const start = new Date(couple.startDate);
    const today = new Date();
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [couple.startDate]);

  // Generate milestones from images
  const milestones = useMemo(
    () => generateMilestonesFromPhotos(images),
    [images]
  );

  // Timeline structure (frames)
  const CUPID_SCENE_DURATION = 90; // 3s - Cupid draws and shoots
  const ARROW_FLIGHT_DURATION = 1200; // 40s - Arrow journey
  const IMPACT_SCENE_DURATION = 360; // 12s - Target impact and finale

  // Positions
  const cupidPosition: Point = { x: 200, y: 1600 };
  const targetPosition: Point = { x: 880, y: 1600 };

  // Arrow path
  const arrowPath = useMemo(
    () =>
      createArrowPath({
        start: cupidPosition,
        end: targetPosition,
        arcHeight: 400,
        milestoneCount: milestones.length,
      }),
    [cupidPosition, targetPosition, milestones.length]
  );

  // Arrow progress for milestone tracking
  const arrowStartFrame = CUPID_SCENE_DURATION;
  const arrowProgress = interpolate(
    frame,
    [arrowStartFrame, arrowStartFrame + ARROW_FLIGHT_DURATION],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill>
      {/* Act 1: The Shot (Cupid scene) */}
      <Sequence durationInFrames={CUPID_SCENE_DURATION}>
        <CupidScene
          cupidPosition={cupidPosition}
          colorScheme={colorScheme}
        />
      </Sequence>

      {/* Act 2: The Journey (Arrow flight) */}
      <Sequence
        from={CUPID_SCENE_DURATION}
        durationInFrames={ARROW_FLIGHT_DURATION}
        offset={-30} // Smooth overlap transition
      >
        <ArrowJourneyScene
          arrowPath={arrowPath}
          startPosition={cupidPosition}
          endPosition={targetPosition}
          milestones={milestones}
          arrowProgress={arrowProgress}
          colorScheme={colorScheme}
          durationInFrames={ARROW_FLIGHT_DURATION}
        />
      </Sequence>

      {/* Act 3: The Impact (Target scene) */}
      <Sequence
        from={CUPID_SCENE_DURATION + ARROW_FLIGHT_DURATION}
        durationInFrames={IMPACT_SCENE_DURATION}
        offset={-20} // Smooth overlap
      >
        <TargetImpact
          targetX={targetPosition.x}
          targetY={targetPosition.y}
          couple={couple}
          totalDays={totalDays}
          colorScheme={colorScheme}
          durationInFrames={IMPACT_SCENE_DURATION}
        />
      </Sequence>

      {/* Fade in from black at start */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 20], [1, 0], { extrapolateRight: "clamp" }),
          pointerEvents: "none",
        }}
      />

      {/* Fade to black at end */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(
            frame,
            [CUPID_SCENE_DURATION + ARROW_FLIGHT_DURATION + IMPACT_SCENE_DURATION - 30, CUPID_SCENE_DURATION + ARROW_FLIGHT_DURATION + IMPACT_SCENE_DURATION],
            [0, 1],
            { extrapolateLeft: "clamp" }
          ),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Act 1: Cupid draws bow and shoots arrow
 */
interface CupidSceneProps {
  cupidPosition: Point;
  colorScheme: ColorScheme;
}

const CupidScene: React.FC<CupidSceneProps> = ({ cupidPosition, colorScheme }) => {
  const frame = useCurrentFrame();
  const colors = COLOR_SCHEMES[colorScheme];

  // Cupid entrance
  const cupidOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const cupidY = interpolate(frame, [0, 30], [100, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Bow draw animation
  const bowDrawProgress = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Sky gradient */}
      <SkyGradient colorScheme="romantic" />

      {/* Cloud layers */}
      <CloudLayers progress={frame / 100} tint={colors.secondary} />

      {/* Ground */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 400,
          background: `linear-gradient(180deg, transparent 0%, ${colors.gradient[0]}22 100%)`,
        }}
      />

      {/* Cupid */}
      <div
        style={{
          position: "absolute",
          left: cupidPosition.x,
          top: cupidPosition.y + cupidY,
          transform: "translate(-50%, -50%)",
          opacity: cupidOpacity,
        }}
      >
        <CupidSVG width={400} height={400} color={colors.primary} />
      </div>

      {/* Title overlay */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 200,
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 64,
            fontWeight: 700,
            color: colors.primary,
            textAlign: "center",
            opacity: interpolate(frame, [20, 50], [0, 1]),
            textShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          A Journey of Love
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Act 2: Arrow flies through milestones
 */
interface ArrowJourneySceneProps {
  arrowPath: string;
  startPosition: Point;
  endPosition: Point;
  milestones: any[];
  arrowProgress: number;
  colorScheme: ColorScheme;
  durationInFrames: number;
}

const ArrowJourneyScene: React.FC<ArrowJourneySceneProps> = ({
  arrowPath,
  startPosition,
  endPosition,
  milestones,
  arrowProgress,
  colorScheme,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const colors = COLOR_SCHEMES[colorScheme];

  // Speed function for arrow acceleration
  const speedFn = (f: number) =>
    speedFunctions.launch(f, 0, 60) || speedFunctions.cruise(f);

  return (
    <AbsoluteFill>
      {/* Sky gradient */}
      <SkyGradient colorScheme="romantic" />

      {/* Animated cloud layers (parallax) */}
      <CloudLayers progress={arrowProgress} tint={colors.secondary} />

      {/* Milestone markers */}
      <MilestoneTrack
        milestones={milestones}
        arrowProgress={arrowProgress}
        color={colors.primary}
      />

      {/* Target in distance */}
      <div
        style={{
          position: "absolute",
          left: endPosition.x,
          top: endPosition.y,
          transform: "translate(-50%, -50%)",
          opacity: interpolate(arrowProgress, [0.7, 0.9], [0, 1]),
        }}
      >
        <TargetSVG width={600} height={600} />
      </div>

      {/* Flying arrow */}
      <Arrow
        startPosition={startPosition}
        endPosition={endPosition}
        arcHeight={400}
        startFrame={0}
        durationInFrames={durationInFrames}
        speedFn={speedFn}
        color={colors.primary}
      />
    </AbsoluteFill>
  );
};

// Export default props for testing
export const cupidJourneyDefaultProps: CupidJourneyProps = {
  couple: {
    name1: "Emma",
    name2: "James",
    startDate: "2022-02-14",
  },
  images: [
    {
      url: "https://picsum.photos/seed/couple1/1080/1920",
      caption: "The day we first met",
      date: "February 2022",
      isFavorite: true,
    },
    {
      url: "https://picsum.photos/seed/couple2/1080/1920",
      caption: "Our first adventure",
      date: "March 2022",
    },
    {
      url: "https://picsum.photos/seed/couple3/1080/1920",
      caption: "Dancing under the stars",
      date: "Summer 2022",
      isFavorite: true,
    },
    {
      url: "https://picsum.photos/seed/couple4/1080/1920",
      caption: "Building memories",
      date: "Fall 2022",
    },
    {
      url: "https://picsum.photos/seed/couple5/1080/1920",
      caption: "Forever grateful",
      date: "2023",
      isFavorite: true,
    },
  ],
  colorScheme: "warm",
};
