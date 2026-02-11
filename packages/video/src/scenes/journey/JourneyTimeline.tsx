import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { RoseField } from "../../effects/ValentineIcons";
import { createSpring } from "../../animation/springs";
import type { BaseSceneProps, ColorScheme } from "../types";
import { COLOR_SCHEMES } from "../types";

interface Milestone {
  date: string;
  label: string;
  description: string;
  daysFromStart: number;
}

export interface JourneyTimelineProps extends BaseSceneProps {
  couple: {
    name1: string;
    name2: string;
  };
  startDate: string; // ISO date string
  milestones: Milestone[];
  colorScheme?: ColorScheme;
}

/**
 * Journey Timeline Scene - Animated road with milestone stones
 * Shows the progression of the relationship over time
 */
export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  durationInFrames,
  couple,
  startDate,
  milestones,
  colorScheme = "warm",
  seed = "journey",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];

  // Road scroll animation
  const roadScroll = interpolate(frame, [0, durationInFrames], [0, height * 2], {
    extrapolateRight: "clamp",
  });

  // Calculate current days
  const today = new Date();
  const start = new Date(startDate);
  const totalDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Sky gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, ${colors.gradient[0]}22 0%, ${colors.background} 50%)`,
        }}
      />

      {/* Rose fields on both sides */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 200, height }}>
        <RoseField side="left" count={8} scrollSpeed={roadScroll / 1000} />
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, width: 200, height }}>
        <RoseField side="right" count={8} scrollSpeed={roadScroll / 1000} />
      </div>

      {/* Road in center */}
      <Road roadScroll={roadScroll} color={colors.text} />

      {/* Milestones */}
      <Milestones
        milestones={milestones}
        roadScroll={roadScroll}
        frame={frame}
        fps={fps}
        colors={colors}
      />

      {/* Top overlay - journey title */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 60,
          background: `linear-gradient(to bottom, ${colors.background} 0%, transparent 30%)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 48,
            fontWeight: 700,
            color: colors.primary,
            textAlign: "center",
            opacity: interpolate(frame, [0, 20], [0, 1]),
          }}
        >
          Our Journey Together
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 32,
            color: colors.text,
            marginTop: 20,
            opacity: interpolate(frame, [10, 30], [0, 1]),
          }}
        >
          {totalDays} Days and Counting
        </div>
      </AbsoluteFill>

      {/* Bottom overlay - couple names */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: 60,
          background: `linear-gradient(to top, ${colors.background} 0%, transparent 30%)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 40,
            fontWeight: 700,
            color: colors.primary,
            opacity: interpolate(frame, [20, 40], [0, 1]),
          }}
        >
          {couple.name1} & {couple.name2}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Road component - Animated center road
 */
const Road: React.FC<{ roadScroll: number; color: string }> = ({ roadScroll, color }) => {
  const { height } = useVideoConfig();

  // Road markings pattern
  const markings = Array.from({ length: 20 }, (_, i) => {
    const y = (i * 100 - roadScroll) % (height + 200);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: 8,
          height: 50,
          backgroundColor: "#fff",
          transform: "translateX(-50%)",
          opacity: 0.8,
        }}
      />
    );
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 0,
        width: 300,
        height: "100%",
        transform: "translateX(-50%)",
        background: `linear-gradient(to right, ${color}11 0%, ${color}22 50%, ${color}11 100%)`,
      }}
    >
      {/* Road edges */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 4,
          height: "100%",
          backgroundColor: color,
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 4,
          height: "100%",
          backgroundColor: color,
          opacity: 0.3,
        }}
      />

      {/* Road markings */}
      {markings}
    </div>
  );
};

/**
 * Milestones component - Shows milestone stones along the journey
 */
const Milestones: React.FC<{
  milestones: Milestone[];
  roadScroll: number;
  frame: number;
  fps: number;
  colors: any;
}> = ({ milestones, roadScroll, frame, fps, colors }) => {
  const { width, height } = useVideoConfig();

  return (
    <>
      {milestones.map((milestone, index) => {
        // Position milestones at intervals
        const baseY = (index + 1) * 300;
        const y = baseY - (roadScroll % (height + 600));

        // Only show if in viewport
        if (y < -200 || y > height + 200) return null;

        // Alternate left/right placement
        const side = index % 2 === 0 ? "left" : "right";
        const x = side === "left" ? width * 0.3 : width * 0.7;

        // Fade in animation
        const appearProgress = createSpring(frame - (index * 20), fps, "smooth", 0);

        return (
          <MilestoneStone
            key={index}
            x={x}
            y={y}
            milestone={milestone}
            side={side}
            colors={colors}
            opacity={appearProgress}
          />
        );
      })}
    </>
  );
};

/**
 * Individual milestone stone
 */
const MilestoneStone: React.FC<{
  x: number;
  y: number;
  milestone: Milestone;
  side: "left" | "right";
  colors: any;
  opacity: number;
}> = ({ x, y, milestone, side, colors, opacity }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${opacity})`,
        opacity,
      }}
    >
      {/* Stone background */}
      <div
        style={{
          position: "relative",
          width: 280,
          padding: 30,
          background: `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.secondary}22 100%)`,
          border: `3px solid ${colors.primary}`,
          borderRadius: 20,
          boxShadow: `0 8px 32px ${colors.primary}44`,
        }}
      >
        {/* Days badge */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: side === "left" ? 20 : undefined,
            right: side === "right" ? 20 : undefined,
            padding: "8px 16px",
            backgroundColor: colors.primary,
            color: "#ffffff",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 20,
            boxShadow: `0 4px 16px ${colors.primary}66`,
          }}
        >
          Day {milestone.daysFromStart}
        </div>

        {/* Content */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 24,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            {milestone.label}
          </div>
          <div
            style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: 16,
              color: colors.text,
              opacity: 0.8,
              lineHeight: 1.4,
            }}
          >
            {milestone.description}
          </div>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 14,
              color: colors.primary,
              marginTop: 10,
              fontWeight: 600,
            }}
          >
            {milestone.date}
          </div>
        </div>

        {/* Connector line to road */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            [side]: -60,
            width: 60,
            height: 2,
            backgroundColor: colors.primary,
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  );
};
