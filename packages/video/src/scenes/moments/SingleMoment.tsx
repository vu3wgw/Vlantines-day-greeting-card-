import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img } from "remotion";
import { KineticCaption } from "../../typography/KineticText";
import { Sparkles, FloatingHearts } from "../../effects/ParticleSystem";
import { Glow } from "../../effects/Glow";
import { createSpring } from "../../animation/springs";
import { COLOR_SCHEMES, QUALITY_PRESETS, type BaseSceneProps, type SceneImage, type ColorScheme, type QualityPreset } from "../types";

export interface SingleMomentProps extends BaseSceneProps {
  image: SceneImage;
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  parallaxIntensity?: number;
  showCaption?: boolean;
  captionPosition?: "bottom" | "top" | "overlay";
  entryAnimation?: "zoom" | "slide" | "fade" | "pop";
}

/**
 * SingleMoment - Premium single photo scene with parallax depth
 * The hero treatment for important memories
 */
export const SingleMoment: React.FC<SingleMomentProps> = ({
  durationInFrames,
  image,
  colorScheme = "warm",
  quality = "balanced",
  parallaxIntensity = 1,
  showCaption = true,
  captionPosition = "bottom",
  entryAnimation = "zoom",
  seed = "single",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Entry animation timing
  const entryDuration = 45;
  const progress = createSpring(frame, fps, "smooth", 0);
  const entryProgress = Math.min(1, frame / entryDuration);

  // Exit timing
  const exitStart = durationInFrames - 30;
  const exitProgress = frame > exitStart
    ? (frame - exitStart) / 30
    : 0;

  // Calculate image transforms based on entry animation
  let imageScale: number;
  let imageX: number;
  let imageY: number;
  let imageOpacity: number;
  let imageRotation: number;

  switch (entryAnimation) {
    case "zoom":
      imageScale = interpolate(progress, [0, 1], [1.3, 1.05]);
      imageX = 0;
      imageY = 0;
      imageOpacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
      imageRotation = 0;
      break;

    case "slide":
      imageScale = interpolate(progress, [0, 1], [1.1, 1.02]);
      imageX = interpolate(progress, [0, 1], [-100, 0], { easing: Easing.out(Easing.cubic) });
      imageY = 0;
      imageOpacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
      imageRotation = interpolate(progress, [0, 1], [-3, 0]);
      break;

    case "pop":
      imageScale = interpolate(progress, [0, 0.5, 0.8, 1], [0, 1.15, 0.95, 1]);
      imageX = 0;
      imageY = 0;
      imageOpacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
      imageRotation = 0;
      break;

    case "fade":
    default:
      imageScale = interpolate(progress, [0, 1], [1.08, 1.02]);
      imageX = 0;
      imageY = 0;
      imageOpacity = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
      imageRotation = 0;
      break;
  }

  // Ken Burns effect during the scene (subtle)
  const kenBurnsScale = interpolate(frame, [entryDuration, durationInFrames], [1, 1.05], {
    extrapolateLeft: "clamp",
  });

  const kenBurnsX = interpolate(frame, [entryDuration, durationInFrames], [0, 20 * parallaxIntensity]);
  const kenBurnsY = interpolate(frame, [entryDuration, durationInFrames], [0, -15 * parallaxIntensity]);

  // Final transforms
  const finalScale = imageScale * kenBurnsScale;
  const finalX = imageX + kenBurnsX;
  const finalY = imageY + kenBurnsY;

  // Exit fade
  const finalOpacity = interpolate(exitProgress, [0, 1], [imageOpacity, 0]);

  // Caption animation
  const captionDelay = 30;
  const captionProgress = createSpring(frame, fps, "smooth", captionDelay);

  // Determine caption styling based on position
  const getCaptionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: 0,
      right: 0,
      padding: "40px 60px",
      textAlign: "center",
    };

    switch (captionPosition) {
      case "top":
        return { ...baseStyle, top: 100 };
      case "overlay":
        return {
          ...baseStyle,
          bottom: "30%",
          background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
          padding: "60px",
        };
      case "bottom":
      default:
        return { ...baseStyle, bottom: 120 };
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Blurred background (for framing) */}
      <AbsoluteFill>
        <Img
          src={image.url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `blur(40px) saturate(1.3)`,
            transform: `scale(1.2)`,
            opacity: 0.6,
          }}
        />
        {/* Dark overlay on blurred bg */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, ${colors.background}88 0%, transparent 30%, transparent 70%, ${colors.background}88 100%)`,
          }}
        />
      </AbsoluteFill>

      {/* Layer 2: Floating hearts (behind image) */}
      {qualitySettings.particles > 20 && (
        <FloatingHearts
          count={Math.floor(qualitySettings.particles * 0.3)}
          speed={0.4}
          size={20}
          opacity={0.3}
        />
      )}

      {/* Layer 3: Main Image */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: width * 0.85,
            maxHeight: height * 0.65,
            transform: `
              translate(${finalX}px, ${finalY}px)
              rotate(${imageRotation}deg)
              scale(${finalScale})
            `,
            opacity: finalOpacity,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: `
              0 25px 80px rgba(0,0,0,0.3),
              0 10px 30px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Glow effect behind image */}
          <Glow
            color={colors.primary}
            intensity={0.3}
            size={100}
          />

          <Img
            src={image.url}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: height * 0.65,
              objectFit: "contain",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Layer 4: Sparkles (in front of image) */}
      {qualitySettings.particles > 30 && progress > 0.5 && (
        <Sparkles
          count={Math.floor(qualitySettings.particles * 0.2)}
          size={8}
          opacity={0.6}
        />
      )}

      {/* Layer 5: Caption */}
      {showCaption && image.caption && (
        <div style={getCaptionStyle()}>
          <KineticCaption
            text={image.caption}
            animation="fadeUp"
            delay={captionDelay}
            springPreset="smooth"
            color={captionPosition === "overlay" ? "#ffffff" : colors.text}
            fontSize={36}
          />

          {/* Date if available */}
          {image.date && (
            <div
              style={{
                marginTop: 15,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 22,
                color: captionPosition === "overlay" ? "rgba(255,255,255,0.7)" : colors.secondary,
                opacity: interpolate(captionProgress, [0, 1], [0, 0.8]),
                transform: `translateY(${interpolate(captionProgress, [0, 1], [10, 0])}px)`,
              }}
            >
              {image.date}
            </div>
          )}
        </div>
      )}

      {/* Layer 6: Vignette */}
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
 * DramaticReveal - Single moment with more dramatic entrance
 */
export const DramaticReveal: React.FC<SingleMomentProps> = (props) => {
  return <SingleMoment {...props} entryAnimation="zoom" parallaxIntensity={1.5} />;
};

/**
 * SoftFocus - Single moment with gentler treatment
 */
export const SoftFocus: React.FC<SingleMomentProps> = (props) => {
  return <SingleMoment {...props} entryAnimation="fade" parallaxIntensity={0.5} />;
};
