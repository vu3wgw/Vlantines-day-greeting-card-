import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence } from "remotion";

// Scene imports
import { IntroScene, MinimalIntro } from "../scenes/intro/IntroScene";
import { SingleMoment, DramaticReveal } from "../scenes/moments/SingleMoment";
import { DualMoment, BeforeAfter } from "../scenes/moments/DualMoment";
import { CollageScene, ScatteredMemories } from "../scenes/moments/CollageScene";
import { StickerShowcase, CoupleShowcase } from "../scenes/moments/StickerShowcase";
import { TogetherScene, GentleTogether } from "../scenes/climax/TogetherScene";
import { HeartCollage, SimpleHeartCollage } from "../scenes/climax/HeartCollage";
import { OutroScene, MinimalOutro } from "../scenes/outro/OutroScene";

// Transition imports
import { ZoomBlurTransition } from "../transitions/premium/ZoomBlur";
import { HeartWipeTransition } from "../transitions/premium/HeartWipe";
import { HeartDissolveTransition } from "../transitions/premium/ParticleDissolve";

// Story orchestration
import type { StoryConfig, SceneImage, CoupleInfo, ColorScheme, QualityPreset } from "../scenes/types";
import { createStoryConfig, validateStoryConfig } from "./StoryConfig";
import { selectScenes, getActiveScene, getSceneProgress, isInTransition, SceneAssignment } from "./SceneSelector";
import { getPacingForFrame, calculateFadeTiming } from "./PacingEngine";

export interface ValentineStoryProps {
  couple: CoupleInfo;
  images: SceneImage[];
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  transitionStyle?: "smooth" | "dynamic" | "dramatic";
  seed?: string;
}

/**
 * ValentineStory - Main composition that orchestrates the entire video
 * Automatically selects scenes, manages transitions, and creates the story arc
 */
export const ValentineStory: React.FC<ValentineStoryProps> = ({
  couple,
  images,
  colorScheme = "warm",
  quality = "balanced",
  transitionStyle = "smooth",
  seed = "valentine",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Create story configuration
  const storyConfig = React.useMemo(
    () =>
      createStoryConfig(couple, images, {
        totalDurationSeconds: durationInFrames / fps,
        fps,
        quality,
        colorScheme,
        transitionStyle,
      }),
    [couple, images, durationInFrames, fps, quality, colorScheme, transitionStyle]
  );

  // Validate configuration
  const errors = React.useMemo(() => validateStoryConfig(storyConfig), [storyConfig]);

  // Select and arrange scenes
  const sceneAssignments = React.useMemo(
    () => selectScenes(storyConfig, seed),
    [storyConfig, seed]
  );

  // Handle validation errors
  if (errors.length > 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div style={{ color: "#ff6b6b", fontSize: 24, textAlign: "center" }}>
          <div style={{ marginBottom: 20, fontWeight: "bold" }}>Configuration Error</div>
          {errors.map((error, i) => (
            <div key={i} style={{ marginBottom: 10, fontSize: 18 }}>
              {error}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      {sceneAssignments.map((assignment, index) => (
        <Sequence
          key={assignment.sceneId}
          from={assignment.startFrame}
          durationInFrames={assignment.duration}
          name={`${assignment.type}-${index}`}
        >
          <SceneRenderer
            assignment={assignment}
            couple={couple}
            colorScheme={colorScheme}
            quality={quality}
            allImages={images}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/**
 * SceneRenderer - Renders the appropriate scene component based on assignment
 */
const SceneRenderer: React.FC<{
  assignment: SceneAssignment;
  couple: CoupleInfo;
  colorScheme: ColorScheme;
  quality: QualityPreset;
  allImages: SceneImage[];
}> = ({ assignment, couple, colorScheme, quality, allImages }) => {
  const baseProps = {
    durationInFrames: assignment.duration,
    colorScheme,
    quality,
    seed: assignment.sceneId,
  };

  switch (assignment.type) {
    case "intro":
      return quality === "fast" ? (
        <MinimalIntro
          {...baseProps}
          couple={couple}
          tagline="Our Love Story"
        />
      ) : (
        <IntroScene
          {...baseProps}
          couple={couple}
          tagline="Our Love Story"
          showDate={true}
        />
      );

    case "single-moment":
      return assignment.act === "beginning" ? (
        <DramaticReveal
          {...baseProps}
          image={assignment.images[0]}
          showCaption={true}
          captionPosition="bottom"
        />
      ) : (
        <SingleMoment
          {...baseProps}
          image={assignment.images[0]}
          showCaption={true}
          entryAnimation="zoom"
        />
      );

    case "dual-moment":
      return (
        <DualMoment
          {...baseProps}
          images={assignment.images as [SceneImage, SceneImage]}
          layout="side-by-side"
          entryDirection="sides"
          showCaptions={true}
        />
      );

    case "collage":
      return (
        <CollageScene
          {...baseProps}
          images={assignment.images}
          layout="scattered"
          caption={assignment.images[0]?.caption}
        />
      );

    case "sticker-showcase":
      return assignment.images.length === 2 ? (
        <CoupleShowcase
          {...baseProps}
          images={assignment.images}
          showBurst={true}
          caption={assignment.images[0]?.caption}
        />
      ) : (
        <StickerShowcase
          {...baseProps}
          images={assignment.images}
          layout="auto"
          showBurst={true}
          caption={assignment.images[0]?.caption}
        />
      );

    case "together":
      return quality === "fast" ? (
        <GentleTogether
          {...baseProps}
          images={assignment.images}
          couple={couple}
          message="Forever Together"
        />
      ) : (
        <TogetherScene
          {...baseProps}
          images={assignment.images}
          couple={couple}
          message="Forever Together"
        />
      );

    case "heart-collage":
      return quality === "fast" ? (
        <SimpleHeartCollage
          {...baseProps}
          images={allImages}
          couple={couple}
          message="Our Memories"
        />
      ) : (
        <HeartCollage
          {...baseProps}
          images={allImages}
          couple={couple}
          message="Our Love Story"
          showNames={true}
        />
      );

    case "outro":
      return quality === "fast" ? (
        <MinimalOutro
          {...baseProps}
          couple={couple}
          message="Forever"
        />
      ) : (
        <OutroScene
          {...baseProps}
          couple={couple}
          message="Together Forever"
          showHeart={true}
        />
      );

    default:
      return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          <div style={{ color: "#fff", padding: 20 }}>
            Unknown scene type: {assignment.type}
          </div>
        </AbsoluteFill>
      );
  }
};

/**
 * SimpleValentineStory - Simplified version for faster rendering
 */
export const SimpleValentineStory: React.FC<ValentineStoryProps> = (props) => {
  return <ValentineStory {...props} quality="fast" />;
};

/**
 * PremiumValentineStory - Full quality with all effects
 */
export const PremiumValentineStory: React.FC<ValentineStoryProps> = (props) => {
  return <ValentineStory {...props} quality="premium" />;
};
