/**
 * Valentine Unwrapped - Main composition
 * Inspired by GitHub Unwrapped's cinematic style with Valentine's theme
 */

import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { z } from "zod";
import { ValentineOpening, OPENING_DURATION, OPENING_OVERLAP } from "./ValentineOpening";
import type { CoupleInfo, SceneImage, ColorScheme } from "../scenes/types";

export const ValentineUnwrappedSchema = z.object({
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
  ).optional(),
  colorScheme: z.enum(["warm", "cool", "vibrant", "soft"]).default("warm"),
});

export type ValentineUnwrappedProps = z.infer<typeof ValentineUnwrappedSchema>;

/**
 * Main Valentine Unwrapped composition
 * Uses Series for smooth scene transitions
 */
export const ValentineUnwrapped: React.FC<ValentineUnwrappedProps> = ({
  couple,
  images = [],
  colorScheme = "warm",
}) => {
  const coupleName = `${couple.name1} & ${couple.name2}`;

  // Calculate total days together
  const totalDays = couple.startDate
    ? Math.floor(
        (new Date().getTime() - new Date(couple.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060842", // Dark background like GitHub Unwrapped
      }}
    >
      <Series>
        {/* Act 1: Opening Scene (Heart Rocket Launch) */}
        <Series.Sequence durationInFrames={OPENING_DURATION}>
          <ValentineOpening coupleName={coupleName} />
        </Series.Sequence>

        {/* Act 2: Journey Through Memories */}
        {images.length > 0 && (
          <Series.Sequence
            durationInFrames={images.length * 90}
            offset={-OPENING_OVERLAP}
          >
            <JourneyScene
              couple={couple}
              images={images}
              totalDays={totalDays}
            />
          </Series.Sequence>
        )}

        {/* Act 3: Finale */}
        <Series.Sequence durationInFrames={180} offset={-10}>
          <FinaleScene couple={couple} totalDays={totalDays} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

/**
 * Journey scene - showing couple's memories
 */
const JourneyScene: React.FC<{
  couple: CoupleInfo;
  images: any[];
  totalDays: number;
}> = ({ couple, images, totalDays }) => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #FF6B9D 0%, #C06C84 50%, #355C7D 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 60,
          color: "#FFF",
          textAlign: "center",
        }}
      >
        {images.length} Beautiful Moments
      </div>
    </AbsoluteFill>
  );
};

/**
 * Finale scene - celebration
 */
const FinaleScene: React.FC<{
  couple: CoupleInfo;
  totalDays: number;
}> = ({ couple, totalDays }) => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #C2185B 0%, #880E4F 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 72,
          fontWeight: 700,
          color: "#FFF",
          textAlign: "center",
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        Happy Valentine's Day
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 56,
          color: "#FFD1DC",
          textAlign: "center",
        }}
      >
        {couple.name1} & {couple.name2}
      </div>
      {totalDays > 0 && (
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 36,
            color: "#FFC0CB",
            textAlign: "center",
          }}
        >
          {totalDays.toLocaleString()} Days Together
        </div>
      )}
    </AbsoluteFill>
  );
};

// Default props for testing
export const valentineUnwrappedDefaultProps: ValentineUnwrappedProps = {
  couple: {
    name1: "Emma",
    name2: "James",
    startDate: "2022-02-14",
  },
  images: [
    {
      url: "https://picsum.photos/seed/love1/1080/1920",
      caption: "The day we first met",
      date: "February 2022",
      isFavorite: true,
    },
    {
      url: "https://picsum.photos/seed/love2/1080/1920",
      caption: "Our first adventure",
      date: "March 2022",
    },
    {
      url: "https://picsum.photos/seed/love3/1080/1920",
      caption: "Dancing under the stars",
      date: "Summer 2022",
      isFavorite: true,
    },
  ],
  colorScheme: "warm",
};
