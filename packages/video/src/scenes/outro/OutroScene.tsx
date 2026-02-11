import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { KineticTitle, KineticCaption, KineticCoupleName } from "../../typography/KineticText";
import { FloatingHearts, Sparkles } from "../../effects/ParticleSystem";
import { BokehBackground } from "../../effects/BokehBackground";
import { createSpring } from "../../animation/springs";
import { COLOR_SCHEMES, QUALITY_PRESETS, type BaseSceneProps, type CoupleInfo, type ColorScheme, type QualityPreset } from "../types";

export interface OutroSceneProps extends BaseSceneProps {
  couple: CoupleInfo;
  colorScheme?: ColorScheme;
  quality?: QualityPreset;
  message?: string;
  showHeart?: boolean;
}

/**
 * OutroScene - Final emotional beat with names floating together
 * Clean, elegant ending that leaves a lasting impression
 */
export const OutroScene: React.FC<OutroSceneProps> = ({
  durationInFrames,
  couple,
  colorScheme = "warm",
  quality = "balanced",
  message = "Together Forever",
  showHeart = true,
  seed = "outro",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const qualitySettings = QUALITY_PRESETS[quality];

  // Animation timing
  const messageDelay = 15;
  const namesDelay = 40;
  const heartDelay = 70;

  // Progress animations
  const messageProgress = createSpring(frame, fps, "smooth", messageDelay);
  const namesProgress = createSpring(frame, fps, "bouncy", namesDelay);
  const heartProgress = createSpring(frame, fps, "wobbly", heartDelay);

  // Exit - fade to black
  const exitStart = durationInFrames - 40;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 40 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Couple display name
  const coupleDisplayName = `${couple.name1} & ${couple.name2}`;

  // Heart animation
  const heartScale = interpolate(heartProgress, [0, 0.5, 0.8, 1], [0, 1.2, 0.9, 1]);
  const heartOpacity = interpolate(heartProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // Subtle pulse effect
  const pulsePhase = Math.sin(frame * 0.08) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Gradient background */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at center, ${colors.gradient[1]}30 0%, transparent 50%),
            linear-gradient(180deg, ${colors.background} 0%, ${colors.gradient[2]}22 100%)
          `,
        }}
      />

      {/* Layer 2: Bokeh */}
      {qualitySettings.particles > 30 && (
        <BokehBackground
          count={12}
          minSize={60}
          maxSize={150}
          color={colors.primary}
          opacity={0.25}
        />
      )}

      {/* Layer 3: Floating hearts */}
      <FloatingHearts
        count={Math.floor(qualitySettings.particles * 0.4)}
        speed={0.3}
        size={22}
        opacity={0.3}
      />

      {/* Layer 4: Sparkles */}
      {qualitySettings.particles > 20 && frame > 30 && (
        <Sparkles
          count={Math.floor(qualitySettings.particles * 0.2)}
          size={8}
          opacity={0.4}
        />
      )}

      {/* Layer 5: Main Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: exitOpacity,
          padding: 60,
        }}
      >
        {/* Message */}
        <div style={{ marginBottom: 40 }}>
          <KineticCaption
            text={message}
            animation="fadeUp"
            delay={messageDelay}
            springPreset="smooth"
            color={colors.secondary}
            fontSize={32}
            letterSpacing={3}
          />
        </div>

        {/* Couple Names */}
        <div style={{ marginBottom: 50 }}>
          <KineticCoupleName
            text={coupleDisplayName}
            animation="fadeScale"
            delay={namesDelay}
            color={colors.primary}
          />
        </div>

        {/* Large Heart */}
        {showHeart && (
          <div
            style={{
              width: 120,
              height: 120,
              transform: `scale(${heartScale * (1 + pulsePhase * 0.05)})`,
              opacity: heartOpacity,
              filter: `drop-shadow(0 10px 30px ${colors.primary}44)`,
            }}
          >
            <svg viewBox="0 0 100 100" fill={colors.primary}>
              <path d="M50,90 C50,90 10,60 10,35 C10,20 20,10 30,10 C40,10 50,20 50,30 C50,20 60,10 70,10 C80,10 90,20 90,35 C90,60 50,90 50,90 Z" />
            </svg>
          </div>
        )}

        {/* Date if available */}
        {couple.startDate && (
          <div
            style={{
              marginTop: 60,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24,
              color: colors.text,
              opacity: interpolate(namesProgress, [0, 1], [0, 0.7]),
              transform: `translateY(${interpolate(namesProgress, [0, 1], [20, 0])}px)`,
              letterSpacing: 2,
            }}
          >
            Since {couple.startDate}
          </div>
        )}
      </AbsoluteFill>

      {/* Layer 6: Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${colors.background}55 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Layer 7: Fade to black */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(exitProgress, [0, 1], [0, 1]),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * MinimalOutro - Simple, elegant ending
 */
export const MinimalOutro: React.FC<OutroSceneProps> = ({
  durationInFrames,
  couple,
  colorScheme = "warm",
  message = "Forever",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];

  const namesDelay = 20;
  const namesProgress = createSpring(frame, fps, "smooth", namesDelay);

  const exitStart = durationInFrames - 30;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 30 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  const coupleDisplayName = `${couple.name1} & ${couple.name2}`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Simple gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, ${colors.gradient[1]}20 0%, ${colors.background} 60%)`,
        }}
      />

      {/* Minimal floating hearts */}
      <FloatingHearts
        count={10}
        speed={0.25}
        size={18}
        opacity={0.2}
      />

      {/* Content */}
      <div
        style={{
          textAlign: "center",
          opacity: exitOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 64,
            fontWeight: 700,
            color: colors.primary,
            opacity: interpolate(namesProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(namesProgress, [0, 1], [0.9, 1])})`,
            marginBottom: 30,
          }}
        >
          {coupleDisplayName}
        </div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            color: colors.secondary,
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: interpolate(namesProgress, [0, 1], [0, 0.8]),
            transform: `translateY(${interpolate(namesProgress, [0, 1], [15, 0])}px)`,
          }}
        >
          {message}
        </div>
      </div>

      {/* Fade to black */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(exitProgress, [0, 1], [0, 1]),
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * ThankYouOutro - With thank you message
 */
export const ThankYouOutro: React.FC<OutroSceneProps & { thankYouText?: string }> = ({
  durationInFrames,
  couple,
  colorScheme = "warm",
  thankYouText = "Thank You for Watching",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];

  const thanksDelay = 20;
  const namesDelay = 50;

  const thanksProgress = createSpring(frame, fps, "smooth", thanksDelay);
  const namesProgress = createSpring(frame, fps, "smooth", namesDelay);

  const exitStart = durationInFrames - 35;
  const exitProgress = frame > exitStart ? (frame - exitStart) / 35 : 0;
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  const coupleDisplayName = `${couple.name1} & ${couple.name2}`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.gradient[2]}15 100%)`,
        }}
      />

      {/* Hearts */}
      <FloatingHearts
        count={15}
        speed={0.3}
        size={20}
        opacity={0.25}
      />

      {/* Content */}
      <div
        style={{
          textAlign: "center",
          opacity: exitOpacity,
        }}
      >
        {/* Thank you text */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 36,
            color: colors.secondary,
            letterSpacing: 2,
            opacity: interpolate(thanksProgress, [0, 1], [0, 0.9]),
            transform: `translateY(${interpolate(thanksProgress, [0, 1], [20, 0])}px)`,
            marginBottom: 40,
          }}
        >
          {thankYouText}
        </div>

        {/* Couple names */}
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 56,
            fontWeight: 700,
            color: colors.primary,
            opacity: interpolate(namesProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(namesProgress, [0, 1], [0.85, 1])})`,
          }}
        >
          {coupleDisplayName}
        </div>

        {/* Heart */}
        <div
          style={{
            marginTop: 40,
            width: 80,
            height: 80,
            opacity: interpolate(namesProgress, [0, 1], [0, 1]),
          }}
        >
          <svg viewBox="0 0 100 100" fill={colors.primary}>
            <path d="M50,90 C50,90 10,60 10,35 C10,20 20,10 30,10 C40,10 50,20 50,30 C50,20 60,10 70,10 C80,10 90,20 90,35 C90,60 50,90 50,90 Z" />
          </svg>
        </div>
      </div>

      {/* Fade to black */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(exitProgress, [0, 1], [0, 1]),
        }}
      />
    </AbsoluteFill>
  );
};
