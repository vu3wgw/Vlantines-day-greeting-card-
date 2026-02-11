import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Img } from "remotion";
import { KineticCaption } from "../../typography/KineticText";
import { FloatingHearts, Sparkles } from "../../effects/ParticleSystem";
import { createSpring, staggeredSpring } from "../../animation/springs";
import { COLOR_SCHEMES, QUALITY_PRESETS, type BaseSceneProps, type SceneImage, type ColorScheme, type QualityPreset } from "../types";

export interface CollageSceneProps extends BaseSceneProps {
  images: SceneImage[];
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  layout?: "scattered" | "grid" | "polaroid" | "magazine";
  caption?: string;
}

interface ImagePosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

// Predefined layouts for different image counts
const LAYOUTS: Record<string, Record<number, ImagePosition[]>> = {
  scattered: {
    3: [
      { x: -180, y: -150, rotation: -12, scale: 0.5, zIndex: 1 },
      { x: 150, y: -100, rotation: 8, scale: 0.48, zIndex: 2 },
      { x: 0, y: 180, rotation: -5, scale: 0.52, zIndex: 3 },
    ],
    4: [
      { x: -200, y: -180, rotation: -15, scale: 0.45, zIndex: 1 },
      { x: 180, y: -150, rotation: 10, scale: 0.43, zIndex: 2 },
      { x: -150, y: 150, rotation: 8, scale: 0.44, zIndex: 3 },
      { x: 180, y: 180, rotation: -6, scale: 0.46, zIndex: 4 },
    ],
    5: [
      { x: -220, y: -200, rotation: -12, scale: 0.4, zIndex: 1 },
      { x: 200, y: -180, rotation: 15, scale: 0.38, zIndex: 2 },
      { x: 0, y: 0, rotation: 0, scale: 0.45, zIndex: 5 },
      { x: -180, y: 180, rotation: 10, scale: 0.38, zIndex: 3 },
      { x: 200, y: 200, rotation: -8, scale: 0.4, zIndex: 4 },
    ],
  },
  grid: {
    3: [
      { x: -200, y: 0, rotation: 0, scale: 0.48, zIndex: 1 },
      { x: 0, y: -50, rotation: 0, scale: 0.5, zIndex: 2 },
      { x: 200, y: 0, rotation: 0, scale: 0.48, zIndex: 1 },
    ],
    4: [
      { x: -150, y: -150, rotation: 0, scale: 0.45, zIndex: 1 },
      { x: 150, y: -150, rotation: 0, scale: 0.45, zIndex: 1 },
      { x: -150, y: 150, rotation: 0, scale: 0.45, zIndex: 1 },
      { x: 150, y: 150, rotation: 0, scale: 0.45, zIndex: 1 },
    ],
    5: [
      { x: -200, y: -150, rotation: 0, scale: 0.4, zIndex: 1 },
      { x: 0, y: -150, rotation: 0, scale: 0.4, zIndex: 1 },
      { x: 200, y: -150, rotation: 0, scale: 0.4, zIndex: 1 },
      { x: -100, y: 150, rotation: 0, scale: 0.42, zIndex: 2 },
      { x: 100, y: 150, rotation: 0, scale: 0.42, zIndex: 2 },
    ],
  },
  polaroid: {
    3: [
      { x: -50, y: -20, rotation: -15, scale: 0.5, zIndex: 1 },
      { x: 30, y: 0, rotation: 5, scale: 0.5, zIndex: 2 },
      { x: 80, y: 30, rotation: 18, scale: 0.5, zIndex: 3 },
    ],
    4: [
      { x: -80, y: -30, rotation: -18, scale: 0.45, zIndex: 1 },
      { x: 0, y: -10, rotation: -5, scale: 0.45, zIndex: 2 },
      { x: 70, y: 10, rotation: 8, scale: 0.45, zIndex: 3 },
      { x: 130, y: 40, rotation: 20, scale: 0.45, zIndex: 4 },
    ],
    5: [
      { x: -120, y: -40, rotation: -20, scale: 0.4, zIndex: 1 },
      { x: -40, y: -20, rotation: -8, scale: 0.4, zIndex: 2 },
      { x: 40, y: 0, rotation: 3, scale: 0.42, zIndex: 3 },
      { x: 110, y: 20, rotation: 12, scale: 0.4, zIndex: 4 },
      { x: 170, y: 50, rotation: 22, scale: 0.4, zIndex: 5 },
    ],
  },
  magazine: {
    3: [
      { x: -180, y: 0, rotation: 0, scale: 0.6, zIndex: 1 },
      { x: 140, y: -180, rotation: 0, scale: 0.4, zIndex: 2 },
      { x: 140, y: 120, rotation: 0, scale: 0.45, zIndex: 2 },
    ],
    4: [
      { x: -160, y: -100, rotation: 0, scale: 0.5, zIndex: 1 },
      { x: 160, y: -100, rotation: 0, scale: 0.5, zIndex: 1 },
      { x: -160, y: 180, rotation: 0, scale: 0.4, zIndex: 2 },
      { x: 160, y: 180, rotation: 0, scale: 0.4, zIndex: 2 },
    ],
    5: [
      { x: 0, y: -150, rotation: 0, scale: 0.55, zIndex: 2 },
      { x: -200, y: 100, rotation: 0, scale: 0.4, zIndex: 1 },
      { x: 0, y: 180, rotation: 0, scale: 0.38, zIndex: 1 },
      { x: 200, y: 100, rotation: 0, scale: 0.4, zIndex: 1 },
      { x: -200, y: -150, rotation: 0, scale: 0.3, zIndex: 1 },
    ],
  },
};

/**
 * CollageScene - Multiple photos arranged in creative layouts
 * Great for montages and collections of memories
 */
export const CollageScene: React.FC<CollageSceneProps> = ({
  durationInFrames,
  images,
  colorScheme = "warm",
  quality = "balanced",
  layout = "scattered",
  caption,
  seed = "collage",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Get positions for current image count
  const imageCount = Math.min(images.length, 5);
  const positions = LAYOUTS[layout][imageCount] || LAYOUTS[layout][3];

  // Exit timing
  const exitStart = durationInFrames - 35;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 35 : 0;

  // Caption timing
  const captionDelay = 60;
  const captionProgress = createSpring(frame, fps, "smooth", captionDelay);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, ${colors.gradient[0]}22 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, ${colors.gradient[2]}22 0%, transparent 50%)
          `,
        }}
      />

      {/* Layer 2: Floating particles */}
      {qualitySettings.particles > 20 && (
        <FloatingHearts
          count={Math.floor(qualitySettings.particles * 0.2)}
          speed={0.4}
          size={16}
          opacity={0.2}
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
        {images.slice(0, imageCount).map((image, index) => {
          const pos = positions[index];
          const progress = staggeredSpring(frame, fps, "bouncy", index, 6);

          // Entry animation
          const entryX = (index % 2 === 0 ? -1 : 1) * 600;
          const entryY = (index % 3 - 1) * 400;
          const entryRotation = pos.rotation + (index % 2 === 0 ? -30 : 30);

          const currentX = interpolate(progress, [0, 1], [entryX, pos.x]);
          const currentY = interpolate(progress, [0, 1], [entryY, pos.y]);
          const currentRotation = interpolate(progress, [0, 1], [entryRotation, pos.rotation]);
          const currentScale = interpolate(progress, [0, 1], [0.2, pos.scale]);
          const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

          // Exit fade
          const finalOpacity = interpolate(exitProgress, [0, 1], [opacity, 0]);

          // Ken Burns effect
          const kenBurnsOffset = interpolate(frame, [30, durationInFrames], [0, 10], {
            extrapolateLeft: "clamp",
          });

          // Polaroid-style frame for polaroid layout
          const isPolaroid = layout === "polaroid";
          const framePadding = isPolaroid ? 15 : 0;
          const frameBottom = isPolaroid ? 50 : 0;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `
                  translate(-50%, -50%)
                  translate(${currentX}px, ${currentY}px)
                  rotate(${currentRotation}deg)
                  scale(${currentScale})
                `,
                opacity: finalOpacity,
                zIndex: pos.zIndex,
                padding: framePadding,
                paddingBottom: frameBottom,
                backgroundColor: isPolaroid ? "white" : "transparent",
                borderRadius: isPolaroid ? 4 : 12,
                boxShadow: `
                  0 15px 50px rgba(0,0,0,${isPolaroid ? 0.3 : 0.2}),
                  0 5px 20px rgba(0,0,0,0.15)
                `,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  borderRadius: isPolaroid ? 0 : 12,
                }}
              >
                <Img
                  src={image.url}
                  style={{
                    width: width * 0.45,
                    height: height * 0.35,
                    objectFit: "cover",
                    transform: `translate(${kenBurnsOffset * (index % 2 === 0 ? 1 : -1)}px, ${kenBurnsOffset * 0.5}px)`,
                    display: "block",
                  }}
                />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Layer 4: Sparkles */}
      {qualitySettings.particles > 30 && frame > 40 && (
        <Sparkles
          count={Math.floor(qualitySettings.particles * 0.15)}
          size={6}
          opacity={0.5}
        />
      )}

      {/* Layer 5: Caption */}
      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          <KineticCaption
            text={caption}
            animation="fadeUp"
            delay={captionDelay}
            springPreset="smooth"
            color={colors.text}
            fontSize={30}
          />
        </div>
      )}

      {/* Layer 6: Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, ${colors.background}66 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * ScatteredMemories - Casual scattered layout
 */
export const ScatteredMemories: React.FC<Omit<CollageSceneProps, "layout">> = (props) => {
  return <CollageScene {...props} layout="scattered" />;
};

/**
 * PolaroidStack - Polaroid-style stacked photos
 */
export const PolaroidStack: React.FC<Omit<CollageSceneProps, "layout">> = (props) => {
  return <CollageScene {...props} layout="polaroid" />;
};

/**
 * MagazineLayout - Editorial-style grid
 */
export const MagazineLayout: React.FC<Omit<CollageSceneProps, "layout">> = (props) => {
  return <CollageScene {...props} layout="magazine" />;
};

/**
 * GridCollage - Clean grid arrangement
 */
export const GridCollage: React.FC<Omit<CollageSceneProps, "layout">> = (props) => {
  return <CollageScene {...props} layout="grid" />;
};
