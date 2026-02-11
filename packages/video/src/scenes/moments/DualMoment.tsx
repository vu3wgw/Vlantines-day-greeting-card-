import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img } from "remotion";
import { KineticCaption } from "../../typography/KineticText";
import { FloatingHearts } from "../../effects/ParticleSystem";
import { createSpring, staggeredSpring } from "../../animation/springs";
import { COLOR_SCHEMES, QUALITY_PRESETS, type BaseSceneProps, type SceneImage, type ColorScheme, type QualityPreset } from "../types";

export interface DualMomentProps extends BaseSceneProps {
  images: [SceneImage, SceneImage];
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  layout?: "side-by-side" | "diagonal" | "overlapping" | "stacked";
  entryDirection?: "sides" | "top-bottom" | "same";
  showCaptions?: boolean;
}

/**
 * DualMoment - Two photos displayed together
 * Perfect for showing parallel moments or before/after
 */
export const DualMoment: React.FC<DualMomentProps> = ({
  durationInFrames,
  images,
  colorScheme = "warm",
  quality = "balanced",
  layout = "side-by-side",
  entryDirection = "sides",
  showCaptions = true,
  seed = "dual",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Staggered entry animations
  const progress1 = staggeredSpring(frame, fps, "bouncy", 0, 8);
  const progress2 = staggeredSpring(frame, fps, "bouncy", 1, 8);

  // Exit timing
  const exitStart = durationInFrames - 30;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 30 : 0;

  // Calculate positions based on layout
  const getImageTransform = (index: number, progress: number) => {
    let x = 0, y = 0, rotation = 0, scale = 1;

    switch (layout) {
      case "side-by-side":
        x = index === 0 ? -220 : 220;
        rotation = index === 0 ? -5 : 5;
        scale = 0.6;
        break;

      case "diagonal":
        x = index === 0 ? -180 : 180;
        y = index === 0 ? -150 : 150;
        rotation = index === 0 ? -8 : 8;
        scale = 0.55;
        break;

      case "overlapping":
        x = index === 0 ? -100 : 100;
        y = index === 0 ? -50 : 50;
        rotation = index === 0 ? -6 : 4;
        scale = index === 0 ? 0.65 : 0.6;
        break;

      case "stacked":
        x = 0;
        y = index === 0 ? -200 : 200;
        rotation = index === 0 ? -3 : 3;
        scale = 0.55;
        break;
    }

    // Entry animation offsets
    let entryX = 0, entryY = 0;
    const entryOffset = 800;

    switch (entryDirection) {
      case "sides":
        entryX = index === 0 ? -entryOffset : entryOffset;
        break;
      case "top-bottom":
        entryY = index === 0 ? -entryOffset : entryOffset;
        break;
      case "same":
        entryX = -entryOffset;
        break;
    }

    // Interpolate from entry position to final position
    const currentX = interpolate(progress, [0, 1], [entryX, x]);
    const currentY = interpolate(progress, [0, 1], [entryY, y]);
    const currentRotation = interpolate(progress, [0, 1], [rotation + (index === 0 ? -20 : 20), rotation]);
    const currentScale = interpolate(progress, [0, 1], [0.3, scale]);
    const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

    // Exit fade
    const finalOpacity = interpolate(exitProgress, [0, 1], [opacity, 0]);

    return {
      transform: `translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg) scale(${currentScale})`,
      opacity: finalOpacity,
    };
  };

  // Subtle Ken Burns during scene
  const kenBurnsOffset = interpolate(frame, [30, durationInFrames], [0, 15], {
    extrapolateLeft: "clamp",
  });

  // Caption timing
  const captionDelay = 50;
  const captionProgress = createSpring(frame, fps, "smooth", captionDelay);

  // Get combined caption if both have captions
  const combinedCaption = images[0].caption && images[1].caption
    ? `${images[0].caption} • ${images[1].caption}`
    : images[0].caption || images[1].caption;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Soft gradient background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${colors.gradient[0]}33 0%, ${colors.gradient[2]}33 100%)`,
        }}
      />

      {/* Layer 2: Floating hearts */}
      {qualitySettings.particles > 20 && (
        <FloatingHearts
          count={Math.floor(qualitySettings.particles * 0.25)}
          speed={0.5}
          size={18}
          opacity={0.25}
        />
      )}

      {/* Layer 3: Images */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {images.map((image, index) => {
          const transform = getImageTransform(index, index === 0 ? progress1 : progress2);

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: -width * 0.25,
                marginTop: -height * 0.25,
                ...transform,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: `
                  0 20px 60px rgba(0,0,0,0.25),
                  0 8px 25px rgba(0,0,0,0.15)
                `,
              }}
            >
              <Img
                src={image.url}
                style={{
                  width: width * 0.5,
                  height: height * 0.5,
                  objectFit: "cover",
                  transform: `translate(${kenBurnsOffset * (index === 0 ? 1 : -1)}px, ${kenBurnsOffset * 0.5}px)`,
                }}
              />

              {/* Subtle gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "30%",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Layer 4: Caption */}
      {showCaptions && combinedCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          <KineticCaption
            text={combinedCaption}
            animation="fadeUp"
            delay={captionDelay}
            springPreset="smooth"
            color={colors.text}
            fontSize={32}
          />
        </div>
      )}

      {/* Layer 5: Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 60%, ${colors.background}55 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * BeforeAfter - Specialized dual moment for comparison
 */
export const BeforeAfter: React.FC<Omit<DualMomentProps, "layout">> = (props) => {
  return <DualMoment {...props} layout="side-by-side" entryDirection="sides" />;
};

/**
 * ThenAndNow - Diagonal layout for timeline comparison
 */
export const ThenAndNow: React.FC<Omit<DualMomentProps, "layout">> = (props) => {
  return <DualMoment {...props} layout="diagonal" entryDirection="top-bottom" />;
};

/**
 * OverlappingMemories - More artistic overlapping layout
 */
export const OverlappingMemories: React.FC<Omit<DualMomentProps, "layout">> = (props) => {
  return <DualMoment {...props} layout="overlapping" entryDirection="same" />;
};
