import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { KineticCaption } from "../../typography/KineticText";
import { Sticker, StickerFrame } from "../../stickers/Sticker";
import { StickerGroup, DuoStickers, CoupleStickers } from "../../stickers/StickerGroup";
import { FloatingHearts, HeartBurst, Sparkles } from "../../effects/ParticleSystem";
import { createSpring } from "../../animation/springs";
import { COLOR_SCHEMES, QUALITY_PRESETS, type BaseSceneProps, type SceneImage, type ColorScheme, type QualityPreset } from "../types";
import type { StickerImage } from "../../stickers/StickerGroup";
import type { LayoutName } from "../../stickers/CollageLayouts";

export interface StickerShowcaseProps extends BaseSceneProps {
  images: SceneImage[];
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  layout?: LayoutName | "auto";
  caption?: string;
  showBurst?: boolean;
  framed?: boolean;
}

/**
 * StickerShowcase - Vox-style cutout stickers flying into frame
 * Uses background-removed images for dynamic collage effect
 */
export const StickerShowcase: React.FC<StickerShowcaseProps> = ({
  durationInFrames,
  images,
  colorScheme = "warm",
  quality = "balanced",
  layout = "auto",
  caption,
  showBurst = true,
  framed = false,
  seed = "stickers",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Convert SceneImages to StickerImages (use stickerUrl if available, else regular url)
  const stickerImages: StickerImage[] = images.map((img, index) => ({
    url: img.stickerUrl || img.url,
    id: `sticker-${index}`,
  }));

  // Determine layout based on image count if auto
  const getAutoLayout = (): LayoutName => {
    switch (images.length) {
      case 1: return "duo"; // Will only show first
      case 2: return "couple";
      case 3: return "trio";
      case 4: return "quad";
      default: return "quad-scattered";
    }
  };

  const actualLayout = layout === "auto" ? getAutoLayout() : layout;

  // Exit timing
  const exitStart = durationInFrames - 40;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 40 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Heart burst timing (after stickers land)
  const burstDelay = 35 + images.length * 8;
  const showHeartBurst = showBurst && frame > burstDelay && frame < burstDelay + 60;

  // Caption timing
  const captionDelay = 45 + images.length * 8;
  const captionProgress = createSpring(frame, fps, "smooth", captionDelay);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Animated gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at 30% 30%, ${colors.gradient[0]}30 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, ${colors.gradient[2]}30 0%, transparent 40%),
            linear-gradient(135deg, ${colors.background} 0%, ${colors.gradient[2]}15 100%)
          `,
        }}
      />

      {/* Layer 2: Floating hearts (background) */}
      {qualitySettings.particles > 20 && (
        <FloatingHearts
          count={Math.floor(qualitySettings.particles * 0.25)}
          speed={0.5}
          size={20}
          opacity={0.25}
        />
      )}

      {/* Layer 3: Sticker Group */}
      <AbsoluteFill style={{ opacity: exitOpacity }}>
        <StickerGroup
          images={stickerImages}
          layout={actualLayout}
          entryAnimation="flyIn"
          entryDirection="edges"
          springPreset="bouncy"
          staggerFrames={8}
          startDelay={10}
          wiggle={true}
          shadow={true}
          framed={framed}
          seed={seed}
        />
      </AbsoluteFill>

      {/* Layer 4: Heart burst effect */}
      {showHeartBurst && (
        <HeartBurst
          x={540}
          y={960}
          count={25}
          size={28}
          speed={1.2}
          startFrame={burstDelay}
        />
      )}

      {/* Layer 5: Sparkles */}
      {qualitySettings.particles > 30 && frame > burstDelay && (
        <Sparkles
          count={Math.floor(qualitySettings.particles * 0.15)}
          size={8}
          opacity={0.5}
        />
      )}

      {/* Layer 6: Caption */}
      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            padding: "0 60px",
            textAlign: "center",
            opacity: exitOpacity,
          }}
        >
          <KineticCaption
            text={caption}
            animation="fadeUp"
            delay={captionDelay}
            springPreset="smooth"
            color={colors.text}
            fontSize={34}
          />
        </div>
      )}

      {/* Layer 7: Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, ${colors.background}55 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * CoupleShowcase - Two stickers close together (couple shots)
 */
export const CoupleShowcase: React.FC<StickerShowcaseProps> = ({
  durationInFrames,
  images,
  colorScheme = "warm",
  quality = "balanced",
  caption,
  showBurst = true,
  seed = "couple",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Need exactly 2 images
  const stickerImages: [StickerImage, StickerImage] = [
    { url: images[0]?.stickerUrl || images[0]?.url || "", id: "couple-1" },
    { url: images[1]?.stickerUrl || images[1]?.url || images[0]?.url || "", id: "couple-2" },
  ];

  // Exit timing
  const exitStart = durationInFrames - 40;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 40 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Heart burst timing
  const burstDelay = 55;
  const showHeartBurst = showBurst && frame > burstDelay && frame < burstDelay + 60;

  // Caption timing
  const captionDelay = 60;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, ${colors.gradient[1]}30 0%, ${colors.background} 70%)`,
        }}
      />

      {/* Floating hearts */}
      {qualitySettings.particles > 20 && (
        <FloatingHearts
          count={Math.floor(qualitySettings.particles * 0.3)}
          speed={0.4}
          size={22}
          opacity={0.3}
        />
      )}

      {/* Couple Stickers */}
      <AbsoluteFill style={{ opacity: exitOpacity }}>
        <CoupleStickers
          images={stickerImages}
          springPreset="bouncy"
          startDelay={10}
        />
      </AbsoluteFill>

      {/* Heart burst */}
      {showHeartBurst && (
        <HeartBurst
          x={540}
          y={960}
          count={30}
          size={32}
          speed={1.5}
          startFrame={burstDelay}
        />
      )}

      {/* Caption */}
      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 0,
            right: 0,
            padding: "0 60px",
            textAlign: "center",
            opacity: exitOpacity,
          }}
        >
          <KineticCaption
            text={caption}
            animation="fadeUp"
            delay={captionDelay}
            springPreset="smooth"
            color={colors.text}
            fontSize={36}
          />
        </div>
      )}

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 45%, ${colors.background}66 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * FramedShowcase - Stickers with polaroid-style frames
 */
export const FramedShowcase: React.FC<StickerShowcaseProps> = (props) => {
  return <StickerShowcase {...props} framed={true} />;
};

/**
 * DynamicShowcase - More energetic sticker entrance
 */
export const DynamicShowcase: React.FC<StickerShowcaseProps> = (props) => {
  return <StickerShowcase {...props} showBurst={true} />;
};
