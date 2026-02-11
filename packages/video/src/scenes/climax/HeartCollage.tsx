import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img } from "remotion";
import { KineticTitle, KineticCaption } from "../../typography/KineticText";
import { HeartCollage as HeartStickerCollage } from "../../stickers/StickerGroup";
import { FloatingHearts, HeartBurst, Sparkles } from "../../effects/ParticleSystem";
import { createSpring, staggeredSpring } from "../../animation/springs";
import { COLOR_SCHEMES, QUALITY_PRESETS, type BaseSceneProps, type SceneImage, type CoupleInfo, type ColorScheme, type QualityPreset } from "../types";
import type { StickerImage } from "../../stickers/StickerGroup";

export interface HeartCollageProps extends BaseSceneProps {
  images: SceneImage[];
  couple?: CoupleInfo;
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  message?: string;
  showNames?: boolean;
}

// Heart shape positions for arranging photos
const HEART_POSITIONS = [
  // Top left curve
  { x: -180, y: -200, rotation: -15, scale: 0.28 },
  // Top center
  { x: 0, y: -260, rotation: 0, scale: 0.28 },
  // Top right curve
  { x: 180, y: -200, rotation: 15, scale: 0.28 },
  // Left side
  { x: -240, y: -20, rotation: -20, scale: 0.28 },
  // Right side
  { x: 240, y: -20, rotation: 20, scale: 0.28 },
  // Bottom left
  { x: -160, y: 150, rotation: -10, scale: 0.28 },
  // Bottom right
  { x: 160, y: 150, rotation: 10, scale: 0.28 },
  // Bottom point
  { x: 0, y: 280, rotation: 0, scale: 0.3 },
];

/**
 * HeartCollage - Photos arranged in heart shape
 * The ultimate romantic scene for finales
 */
export const HeartCollage: React.FC<HeartCollageProps> = ({
  durationInFrames,
  images,
  couple,
  colorScheme = "warm",
  quality = "balanced",
  message = "Our Love Story",
  showNames = true,
  seed = "heart-collage",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Use up to 8 images
  const displayImages = images.slice(0, 8);

  // Animation timing
  const buildDuration = 80; // Time to build the heart

  // Exit timing
  const exitStart = durationInFrames - 45;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 45 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.9]);

  // Heart "pulse" effect after building
  const pulsePhase = frame > buildDuration
    ? Math.sin((frame - buildDuration) * 0.15) * 0.5 + 0.5
    : 0;
  const heartPulse = 1 + pulsePhase * 0.03;

  // Message timing
  const messageDelay = buildDuration + 20;

  // Names timing
  const namesDelay = messageDelay + 25;

  // Heart burst timing
  const burstDelay = buildDuration + 10;
  const showHeartBurst = frame > burstDelay && frame < burstDelay + 60;

  // Couple display name
  const coupleDisplayName = couple ? `${couple.name1} & ${couple.name2}` : "";

  // Background glow intensity
  const bgGlowIntensity = interpolate(frame, [0, buildDuration, buildDuration + 20], [0, 0.2, 0.35], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Gradient background with glow */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at center, ${colors.primary}${Math.round(bgGlowIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 45%),
            radial-gradient(ellipse at 20% 30%, ${colors.gradient[0]}15 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, ${colors.gradient[2]}15 0%, transparent 40%),
            ${colors.background}
          `,
        }}
      />

      {/* Layer 2: Floating hearts */}
      {qualitySettings.particles > 20 && (
        <FloatingHearts
          count={Math.floor(qualitySettings.particles * 0.35)}
          speed={0.4}
          size={20}
          opacity={0.25}
        />
      )}

      {/* Layer 3: Heart shape made of photos */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${heartPulse * exitScale})`,
          opacity: exitOpacity,
        }}
      >
        {displayImages.map((image, index) => {
          if (index >= HEART_POSITIONS.length) return null;

          const pos = HEART_POSITIONS[index];
          const progress = staggeredSpring(frame, fps, "bouncy", index, 5);

          // Entry animation - fly in from random edges
          const angle = (index / displayImages.length) * Math.PI * 2;
          const entryDistance = 800;
          const entryX = Math.cos(angle) * entryDistance;
          const entryY = Math.sin(angle) * entryDistance;
          const entryRotation = pos.rotation + (index % 2 === 0 ? -40 : 40);

          const currentX = interpolate(progress, [0, 1], [entryX, pos.x]);
          const currentY = interpolate(progress, [0, 1], [entryY, pos.y]);
          const currentRotation = interpolate(progress, [0, 1], [entryRotation, pos.rotation]);
          const currentScale = interpolate(progress, [0, 1], [0.1, pos.scale]);
          const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                transform: `translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg) scale(${currentScale})`,
                opacity,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: `
                  0 15px 40px rgba(0,0,0,0.2),
                  0 5px 15px rgba(0,0,0,0.1)
                `,
              }}
            >
              <Img
                src={image.url}
                style={{
                  width: width * 0.4,
                  height: height * 0.25,
                  objectFit: "cover",
                }}
              />

              {/* Subtle color overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, ${colors.primary}11 0%, transparent 100%)`,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Layer 4: Heart burst */}
      {showHeartBurst && (
        <HeartBurst
          x={540}
          y={960}
          count={35}
          size={30}
          speed={1.8}
          startFrame={burstDelay}
        />
      )}

      {/* Layer 5: Sparkles */}
      {qualitySettings.particles > 30 && frame > buildDuration && (
        <Sparkles
          count={Math.floor(qualitySettings.particles * 0.25)}
          size={10}
          opacity={0.6}
        />
      )}

      {/* Layer 6: Text Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 100,
          opacity: exitOpacity,
        }}
      >
        {/* Message */}
        <KineticCaption
          text={message}
          animation="fadeUp"
          delay={messageDelay}
          springPreset="smooth"
          color={colors.secondary}
          fontSize={28}
        />

        {/* Couple Names */}
        {showNames && coupleDisplayName && (
          <div style={{ marginTop: 15 }}>
            <KineticTitle
              text={coupleDisplayName}
              animation="fadeScale"
              delay={namesDelay}
              springPreset="bouncy"
              color={colors.primary}
              fontSize={52}
            />
          </div>
        )}
      </AbsoluteFill>

      {/* Layer 7: Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, ${colors.background}66 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * PulsingHeartCollage - More dramatic with stronger pulse
 */
export const PulsingHeartCollage: React.FC<HeartCollageProps> = (props) => {
  return <HeartCollage {...props} quality="premium" />;
};

/**
 * SimpleHeartCollage - Cleaner version without extra effects
 */
export const SimpleHeartCollage: React.FC<HeartCollageProps> = ({
  durationInFrames,
  images,
  colorScheme = "warm",
  message = "Our Memories",
  seed = "simple-heart",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const displayImages = images.slice(0, 8);

  // Simplified animation
  const exitStart = durationInFrames - 30;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 30 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  const messageDelay = 60;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Simple gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, ${colors.gradient[1]}22 0%, ${colors.background} 60%)`,
        }}
      />

      {/* Heart shape */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: exitOpacity,
        }}
      >
        {displayImages.map((image, index) => {
          if (index >= HEART_POSITIONS.length) return null;

          const pos = HEART_POSITIONS[index];
          const progress = staggeredSpring(frame, fps, "smooth", index, 8);

          const currentScale = interpolate(progress, [0, 1], [0, pos.scale]);
          const opacity = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg) scale(${currentScale})`,
                opacity,
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              <Img
                src={image.url}
                style={{
                  width: width * 0.4,
                  height: height * 0.25,
                  objectFit: "cover",
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Message */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: exitOpacity,
        }}
      >
        <KineticCaption
          text={message}
          animation="fadeUp"
          delay={messageDelay}
          springPreset="smooth"
          color={colors.text}
          fontSize={32}
        />
      </div>
    </AbsoluteFill>
  );
};
