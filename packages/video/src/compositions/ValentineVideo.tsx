import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { ImageSlide, FloatingHearts, OutroSlide, IntroSlide } from "../components";
import type { ValentineVideoProps } from "../types";
import { VIDEO_CONFIG } from "../types";
import {
  autoAssignVariedTransitions,
  getTransitionComponent,
} from "../transitions";
import type { TransitionType } from "../timeline/types";
import { HEART_COUNTS } from "../timeline/types";
import type { HeartDensity } from "../timeline/types";

// Wrapper component that applies transitions
const TransitionWrapper: React.FC<{
  transitionType: TransitionType;
  durationInFrames: number;
  transitionFrames: number;
  children: React.ReactNode;
}> = ({ transitionType, durationInFrames, transitionFrames, children }) => {
  const frame = useCurrentFrame();
  const TransitionComponent = getTransitionComponent(transitionType);

  // Calculate transition progress for in and out
  const inProgress = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outProgress = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Determine if we're in the in-transition, out-transition, or stable phase
  const isInTransition = frame < transitionFrames;
  const isOutTransition = frame > durationInFrames - transitionFrames;

  if (isInTransition) {
    return (
      <TransitionComponent progress={inProgress} direction="in">
        {children}
      </TransitionComponent>
    );
  }

  if (isOutTransition) {
    return (
      <TransitionComponent progress={outProgress} direction="out">
        {children}
      </TransitionComponent>
    );
  }

  // Stable phase - just render normally
  return <AbsoluteFill>{children}</AbsoluteFill>;
};

export const ValentineVideo: React.FC<ValentineVideoProps> = ({
  images,
  coupleName,
  seed = Date.now(), // Default seed based on timestamp for unique videos
}) => {
  const {
    introDurationFrames,
    imageDurationFrames,
    transitionDurationFrames,
    outroDurationFrames,
  } = VIDEO_CONFIG;

  // Auto-assign varied transitions for each image based on seed
  const imageTransitions = autoAssignVariedTransitions(seed, images.length);

  // Intro and outro get crossfade by default (can be customized later)
  const introTransition: TransitionType = "crossfade";
  const outroTransition: TransitionType = "crossfade";

  // Calculate when images start (after intro)
  const imagesStartFrame = introDurationFrames - transitionDurationFrames; // Overlap intro fade with first image

  // Calculate when the outro starts
  const outroStart =
    imagesStartFrame +
    images.length * imageDurationFrames -
    (images.length - 1) * transitionDurationFrames -
    transitionDurationFrames; // Overlap with last image

  // Heart density based on seed (adds variety)
  const heartDensities: HeartDensity[] = ["low", "medium", "high"];
  const heartDensity: HeartDensity = heartDensities[seed % 3] ?? "medium";
  const heartCount = HEART_COUNTS[heartDensity];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Background layer with floating hearts - visible throughout */}
      <FloatingHearts seed={`main-bg-${seed}`} count={heartCount} />

      {/* Intro sequence with transition */}
      <Sequence from={0} durationInFrames={introDurationFrames} name="Intro">
        <TransitionWrapper
          transitionType={introTransition}
          durationInFrames={introDurationFrames}
          transitionFrames={transitionDurationFrames}
        >
          <IntroSlide coupleName={coupleName} seed={seed} />
        </TransitionWrapper>
      </Sequence>

      {/* Image sequences with dynamic transitions */}
      {images.map((image, index) => {
        // Each image starts earlier than the previous one ends (for crossfade)
        const startFrame =
          imagesStartFrame + index * (imageDurationFrames - transitionDurationFrames);

        // Get the transition type for this image
        const transitionType: TransitionType = imageTransitions[index] ?? "crossfade";

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={imageDurationFrames}
            name={`Image ${index + 1} (${transitionType}): ${image.caption.slice(0, 25)}...`}
          >
            <TransitionWrapper
              transitionType={transitionType}
              durationInFrames={imageDurationFrames}
              transitionFrames={transitionDurationFrames}
            >
              <ImageSlide
                imageUrl={image.url}
                caption={image.caption}
                date={image.date}
                index={index}
                seed={seed}
              />
            </TransitionWrapper>
          </Sequence>
        );
      })}

      {/* Outro sequence with transition */}
      <Sequence
        from={outroStart}
        durationInFrames={outroDurationFrames}
        name="Outro"
      >
        <TransitionWrapper
          transitionType={outroTransition}
          durationInFrames={outroDurationFrames}
          transitionFrames={transitionDurationFrames}
        >
          <OutroSlide coupleName={coupleName} seed={seed} />
        </TransitionWrapper>
      </Sequence>
    </AbsoluteFill>
  );
};
