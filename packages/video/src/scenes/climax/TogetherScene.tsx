import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img } from "remotion";
import { KineticTitle, KineticCaption } from "../../typography/KineticText";
import { ConvergingStickers } from "../../stickers/StickerGroup";
import { FloatingHearts, HeartBurst, Sparkles } from "../../effects/ParticleSystem";
import { Glow } from "../../effects/Glow";
import { createSpring } from "../../animation/springs";
import { COLOR_SCHEMES, QUALITY_PRESETS, type BaseSceneProps, type SceneImage, type CoupleInfo, type ColorScheme, type QualityPreset } from "../types";
import type { StickerImage } from "../../stickers/StickerGroup";

export interface TogetherSceneProps extends BaseSceneProps {
  images: SceneImage[];
  couple: CoupleInfo;
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  message?: string;
}

/**
 * TogetherScene - Emotional climax where all elements come together
 * Stickers converge to center, names display prominently
 */
export const TogetherScene: React.FC<TogetherSceneProps> = ({
  durationInFrames,
  images,
  couple,
  colorScheme = "warm",
  quality = "balanced",
  message = "Forever Together",
  seed = "together",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Convert to sticker images
  const stickerImages: StickerImage[] = images.slice(0, 8).map((img, index) => ({
    url: img.stickerUrl || img.url,
    id: `together-${index}`,
  }));

  // Animation phases
  const convergeDuration = 60;
  const holdDuration = 40;
  const convergeProgress = Math.min(1, frame / convergeDuration);

  // Names appear after convergence
  const namesDelay = convergeDuration + 10;
  const namesProgress = createSpring(frame, fps, "smooth", namesDelay);

  // Message appears after names
  const messageDelay = namesDelay + 30;
  const messageProgress = createSpring(frame, fps, "smooth", messageDelay);

  // Exit timing
  const exitStart = durationInFrames - 40;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 40 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Heart burst after convergence
  const burstDelay = convergeDuration + 5;
  const showHeartBurst = frame > burstDelay && frame < burstDelay + 70;

  // Couple display name
  const coupleDisplayName = `${couple.name1} & ${couple.name2}`;

  // Center glow intensity builds up
  const glowIntensity = interpolate(convergeProgress, [0, 0.8, 1], [0, 0.3, 0.6]);

  // Background pulse effect
  const pulsePhase = Math.sin(frame * 0.08) * 0.5 + 0.5;
  const bgGlow = interpolate(pulsePhase, [0, 1], [0.1, 0.2]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Pulsing gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at center, ${colors.primary}${Math.round(bgGlow * 255).toString(16).padStart(2, '0')} 0%, transparent 50%),
            radial-gradient(circle at 30% 30%, ${colors.gradient[0]}22 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, ${colors.gradient[2]}22 0%, transparent 40%),
            ${colors.background}
          `,
        }}
      />

      {/* Layer 2: Floating hearts (intense) */}
      {qualitySettings.particles > 20 && (
        <FloatingHearts
          count={Math.floor(qualitySettings.particles * 0.5)}
          speed={0.6}
          size={24}
          opacity={0.35}
        />
      )}

      {/* Layer 3: Converging Stickers */}
      <AbsoluteFill style={{ opacity: exitOpacity }}>
        <ConvergingStickers
          images={stickerImages}
          convergeDuration={convergeDuration}
          finalScale={0.25}
          springPreset="smooth"
          startDelay={5}
        />
      </AbsoluteFill>

      {/* Layer 4: Center Glow */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.primary}${Math.round(glowIntensity * 200).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            transform: `scale(${1 + pulsePhase * 0.1})`,
          }}
        />
      </AbsoluteFill>

      {/* Layer 5: Heart burst effect */}
      {showHeartBurst && (
        <HeartBurst
          x={540}
          y={960}
          count={40}
          size={36}
          speed={2}
          startFrame={burstDelay}
        />
      )}

      {/* Layer 6: Sparkles */}
      {qualitySettings.particles > 30 && convergeProgress > 0.5 && (
        <Sparkles
          count={Math.floor(qualitySettings.particles * 0.3)}
          size={10}
          opacity={0.7}
        />
      )}

      {/* Layer 7: Text Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: exitOpacity,
        }}
      >
        {/* Couple Names */}
        <div
          style={{
            marginTop: 250, // Below the converging stickers
            textAlign: "center",
          }}
        >
          <KineticTitle
            text={coupleDisplayName}
            animation="fadeScale"
            delay={namesDelay}
            springPreset="bouncy"
            color={colors.primary}
            fontSize={68}
          />
        </div>

        {/* Message */}
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
          }}
        >
          <KineticCaption
            text={message}
            animation="fadeUp"
            delay={messageDelay}
            springPreset="smooth"
            color={colors.text}
            fontSize={36}
          />
        </div>
      </AbsoluteFill>

      {/* Layer 8: Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${colors.background}77 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * EmotionalPeak - Maximum visual intensity version
 */
export const EmotionalPeak: React.FC<TogetherSceneProps> = (props) => {
  return <TogetherScene {...props} quality="premium" />;
};

/**
 * GentleTogether - Softer, more intimate version
 */
export const GentleTogether: React.FC<TogetherSceneProps> = ({
  durationInFrames,
  images,
  couple,
  colorScheme = "soft",
  message = "Our Journey Together",
  seed = "gentle",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];

  // Simplified animation - just two main images
  const progress = createSpring(frame, fps, "gentle", 10);

  // Names timing
  const namesDelay = 50;
  const namesProgress = createSpring(frame, fps, "smooth", namesDelay);

  // Exit
  const exitStart = durationInFrames - 35;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 35 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  const coupleDisplayName = `${couple.name1} & ${couple.name2}`;

  // Use first two images
  const image1 = images[0];
  const image2 = images[1] || images[0];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Soft gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${colors.gradient[0]}22 0%, ${colors.gradient[2]}22 100%)`,
        }}
      />

      {/* Gentle floating hearts */}
      <FloatingHearts
        count={15}
        speed={0.3}
        size={18}
        opacity={0.2}
      />

      {/* Two images coming together */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          opacity: exitOpacity,
        }}
      >
        {[image1, image2].map((image, index) => {
          const startX = index === 0 ? -300 : 300;
          const x = interpolate(progress, [0, 1], [startX, index === 0 ? -60 : 60]);
          const rotation = interpolate(progress, [0, 1], [index === 0 ? -15 : 15, index === 0 ? -5 : 5]);
          const scale = interpolate(progress, [0, 1], [0.4, 0.55]);
          const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                transform: `translateX(${x}px) rotate(${rotation}deg) scale(${scale})`,
                opacity,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              <Img
                src={image?.stickerUrl || image?.url || ""}
                style={{
                  width: 400,
                  height: 500,
                  objectFit: "cover",
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Names and message */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 150,
          opacity: exitOpacity,
        }}
      >
        <KineticTitle
          text={coupleDisplayName}
          animation="fadeUp"
          delay={namesDelay}
          springPreset="smooth"
          color={colors.primary}
          fontSize={56}
        />

        <div style={{ marginTop: 20 }}>
          <KineticCaption
            text={message}
            animation="fadeUp"
            delay={namesDelay + 20}
            springPreset="smooth"
            color={colors.text}
            fontSize={28}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
