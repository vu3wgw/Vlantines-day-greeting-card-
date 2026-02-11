import React from "react";
import { Composition, AbsoluteFill, staticFile } from "remotion";
import { ValentineVideo } from "./compositions/ValentineVideo";
import { ValentineStory, PremiumValentineStory } from "./story/ValentineStory";
import { CupidJourney, CupidJourneySchema, cupidJourneyDefaultProps } from "./compositions/CupidJourney";
import { ValentineUnwrapped, ValentineUnwrappedSchema, valentineUnwrappedDefaultProps } from "./unwrapped/ValentineUnwrapped";
import { UnwrappedDemo, unwrappedDemoDefaultProps } from "./github-unwrapped/UnwrappedDemo";
import { compositionSchema } from "./github-unwrapped/config";
import { HybridValentineVideo } from "./compositions/HybridValentineVideo";
import { ValentineFrameOverlay } from "./compositions/ValentineFrameOverlay";
// import { calculateDuration as unwrappedCalculateDuration } from "./github-unwrapped/Main";
import {
  VIDEO_CONFIG,
  ValentineVideoPropsSchema,
  PremiumVideoPropsSchema,
  HybridVideoPropsSchema,
  calculateDuration,
} from "./types";

// Simple test component
const TestComponent: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "red", justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ color: "white", fontSize: 60 }}>STUDIO WORKS!</h1>
    </AbsoluteFill>
  );
};

// Default props for Remotion Studio preview
const defaultProps = {
  images: [
    {
      url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800",
      caption: "This is where their story began. Emma was in her first year of college, and James was a senior.",
      date: "September 2020",
    },
    {
      url: "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=800",
      caption: "Their first adventure together. They explored the mountains, discovering not just nature but each other.",
      date: "December 2020",
    },
    {
      url: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800",
      caption: "The moment James knew it was forever. Under the stars, he realized Emma was the one.",
      date: "Valentine's Day 2021",
    },
    {
      url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
      caption: "Building dreams, side by side. They moved into their first apartment together.",
      date: "June 2022",
    },
    {
      url: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800",
      caption: "Every day is a new chapter in their love story. From strangers to soulmates.",
      date: "2024",
    },
  ],
  coupleName: "Emma & James",
  seed: 12345, // Fixed seed for consistent preview
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* TEST COMPOSITION - If you see this, Studio works! */}
      <Composition
        id="TEST"
        component={TestComponent}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1080}
      />

      {/* ============ GITHUB UNWRAPPED ORIGINAL ============ */}
      {/* The actual GitHub Unwrapped 2023 animation - ONLY THIS FOR NOW */}
      <Composition
        id="GitHubUnwrapped"
        component={UnwrappedDemo}
        durationInFrames={1800} // Fixed duration for now
        fps={30}
        width={1080}
        height={1080}
        schema={compositionSchema}
        defaultProps={unwrappedDemoDefaultProps}
      />

      {/* ============ HYBRID VALENTINE VIDEO ============ */}
      {/* Real video with green screen + Remotion overlays */}
      <Composition
        id="HybridValentineVideo"
        component={HybridValentineVideo}
        durationInFrames={1517} // 63.2s × 24fps (matches shot1 v1.mp4)
        fps={24}
        width={416}
        height={752}
        schema={HybridVideoPropsSchema}
        defaultProps={{
          compositedVideoUrl: staticFile("shot1_v1.mp4"), // Placeholder for studio preview
          images: defaultProps.images.slice(0, 3), // Use first 3 images
          coupleName: defaultProps.coupleName,
          overlayStyle: "romantic",
          seed: 12345,
        }}
      />

      {/* ============ VALENTINE FRAME OVERLAY ============ */}
      {/* Overlays couple images onto moving photo frames in Valentine video */}
      <Composition
        id="ValentineFrameOverlay"
        component={ValentineFrameOverlay}
        durationInFrames={1692} // 70.5s × 24fps (matches valintain 2.mp4)
        fps={24}
        width={416}
        height={752}
        defaultProps={{
          videoSrc: staticFile("valentine-video.mp4"),
          images: [
            staticFile("couple1.jpg"),
            staticFile("couple2.jpg"),
            staticFile("couple3.jpg"),
          ],
        }}
      />
    </>
  );
};
