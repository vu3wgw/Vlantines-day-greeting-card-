import React from "react";
import { Composition } from "remotion";
import { ValentineVideo } from "./compositions/ValentineVideo";
import {
  VIDEO_CONFIG,
  ValentineVideoPropsSchema,
  calculateDuration,
} from "./types";

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
      {/* Main composition */}
      <Composition
        id="ValentineVideo"
        component={ValentineVideo}
        durationInFrames={calculateDuration(defaultProps.images.length)}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        schema={ValentineVideoPropsSchema}
        defaultProps={defaultProps}
      />

      {/* Preview with different seed - shows variation */}
      <Composition
        id="ValentineVideoAlt"
        component={ValentineVideo}
        durationInFrames={calculateDuration(defaultProps.images.length)}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        schema={ValentineVideoPropsSchema}
        defaultProps={{
          ...defaultProps,
          seed: 99999, // Different seed = different animations
        }}
      />

      {/* Preview with more images */}
      <Composition
        id="ValentineVideoLong"
        component={ValentineVideo}
        durationInFrames={calculateDuration(8)}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        schema={ValentineVideoPropsSchema}
        defaultProps={{
          ...defaultProps,
          seed: 54321,
          images: [
            ...defaultProps.images,
            {
              url: "https://images.unsplash.com/photo-1501901609772-df0848060b33?w=800",
              caption: "Adventures await them. Emma and James set off to explore the world together.",
              date: "Summer 2023",
            },
            {
              url: "https://images.unsplash.com/photo-1522098543979-ffc7f79a56c4?w=800",
              caption: "Through every season, their love only grew stronger. Hand in hand, heart to heart.",
            },
            {
              url: "https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=800",
              caption: "Forever grateful for the day they met. This is just the beginning of their forever.",
              date: "Always",
            },
          ],
        }}
      />
    </>
  );
};
