import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img } from "remotion";
import { KineticTitle, KineticSubtitle, KineticCoupleName } from "../../typography/KineticText";
import { FloatingHearts, HeartBurst } from "../../effects/ParticleSystem";
import { BokehBackground } from "../../effects/BokehBackground";
import { GradientBackground } from "../../backgrounds/GradientBackground";
import { createSpring } from "../../animation/springs";
import { COLOR_SCHEMES, type BaseSceneProps, type CoupleInfo, type ColorScheme } from "../types";

export interface IntroSceneProps extends BaseSceneProps {
  couple: CoupleInfo;
  colorScheme?: ColorScheme;
  showDate?: boolean;
  showDayCount?: boolean;
  tagline?: string;
  backgroundImage?: string;
}

/**
 * IntroScene - Dramatic opening with title reveal and couple name
 * Sets the emotional tone for the entire video
 */
export const IntroScene: React.FC<IntroSceneProps> = ({
  durationInFrames,
  couple,
  colorScheme = "warm",
  showDate = true,
  showDayCount = true,
  tagline = "Our Love Story",
  backgroundImage,
  seed = "intro",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];

  // Calculate days since start date
  let totalDays = 0;
  if (couple.startDate) {
    const start = new Date(couple.startDate);
    const today = new Date();
    const timeDiff = today.getTime() - start.getTime();
    totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  // Animation timing
  const titleDelay = 15;
  const couplenameDelay = 45;
  const taglineDelay = 75;
  const dateDelay = 95;

  // Background scale animation
  const bgScale = interpolate(frame, [0, durationInFrames], [1.1, 1], {
    easing: Easing.out(Easing.cubic),
  });

  // Vignette opacity
  const vignetteOpacity = interpolate(frame, [0, 30], [0.8, 0.5], {
    extrapolateRight: "clamp",
  });

  // Generate couple display name
  const coupleDisplayName = `${couple.name1} & ${couple.name2}`;

  // Heart burst timing
  const showHeartBurst = frame > couplenameDelay + 20 && frame < couplenameDelay + 80;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Layer 1: Gradient Background */}
      <GradientBackground
        colors={colors.gradient}
        animationSpeed={0.3}
      />

      {/* Layer 2: Optional Background Image */}
      {backgroundImage && (
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [0, 30], [0, 0.15], { extrapolateRight: "clamp" }),
          }}
        >
          <Img
            src={backgroundImage}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${bgScale})`,
              filter: "blur(30px) saturate(1.2)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Layer 3: Bokeh Effect */}
      <BokehBackground
        count={15}
        minSize={40}
        maxSize={120}
        color={colors.primary}
        opacity={0.3}
      />

      {/* Layer 4: Floating Hearts (subtle) */}
      <FloatingHearts
        count={12}
        speed={0.5}
        size={24}
        opacity={0.4}
      />

      {/* Layer 5: Heart Burst on name reveal */}
      {showHeartBurst && (
        <HeartBurst
          x={540}
          y={960}
          count={20}
          size={32}
          speed={1.5}
          startFrame={couplenameDelay + 20}
        />
      )}

      {/* Layer 6: Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
        }}
      >
        {/* Tagline */}
        <div style={{ marginBottom: 40 }}>
          <KineticSubtitle
            text={tagline}
            animation="fadeUp"
            delay={taglineDelay}
            color={colors.secondary}
            letterSpacing={4}
          />
        </div>

        {/* Couple Names - Main Title */}
        <div style={{ marginBottom: 30 }}>
          <KineticCoupleName
            text={coupleDisplayName}
            animation="fadeScale"
            delay={couplenameDelay}
            color={colors.primary}
          />
        </div>

        {/* Day Count */}
        {showDayCount && totalDays > 0 && (
          <div style={{ marginTop: 50 }}>
            <KineticCaption
              text={`${totalDays} ${totalDays === 1 ? "Day" : "Days"} Together`}
              animation="fadeUp"
              delay={dateDelay}
              color={colors.primary}
              opacity={1}
            />
          </div>
        )}

        {/* Optional Start Date */}
        {showDate && couple.startDate && (
          <div style={{ marginTop: 30 }}>
            <KineticCaption
              text={`Since ${couple.startDate}`}
              animation="fadeUp"
              delay={dateDelay + 10}
              color={colors.text}
              opacity={0.7}
            />
          </div>
        )}
      </AbsoluteFill>

      {/* Layer 7: Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${colors.background}88 100%)`,
          opacity: vignetteOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Layer 8: Fade in from black */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 20], [1, 0], { extrapolateRight: "clamp" }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// Helper component for date caption
const KineticCaption: React.FC<{
  text: string;
  animation: "fadeUp" | "fadeScale";
  delay: number;
  color: string;
  opacity?: number;
}> = ({ text, animation, delay, color, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = createSpring(frame, fps, "smooth", delay);

  const y = animation === "fadeUp"
    ? interpolate(progress, [0, 1], [30, 0])
    : 0;

  const scale = animation === "fadeScale"
    ? interpolate(progress, [0, 1], [0.8, 1])
    : 1;

  const textOpacity = interpolate(progress, [0, 1], [0, opacity]);

  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 28,
        fontWeight: 400,
        color,
        letterSpacing: 2,
        textTransform: "uppercase",
        transform: `translateY(${y}px) scale(${scale})`,
        opacity: textOpacity,
      }}
    >
      {text}
    </div>
  );
};

/**
 * MinimalIntro - Simplified intro for faster renders
 */
export const MinimalIntro: React.FC<IntroSceneProps> = ({
  durationInFrames,
  couple,
  colorScheme = "warm",
  tagline = "Our Love Story",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = COLOR_SCHEMES[colorScheme];
  const coupleDisplayName = `${couple.name1} & ${couple.name2}`;

  const titleProgress = createSpring(frame, fps, "smooth", 20);
  const nameProgress = createSpring(frame, fps, "bouncy", 50);

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
      {/* Simple gradient overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${colors.gradient[0]}22 0%, ${colors.gradient[2]}22 100%)`,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 32,
          color: colors.secondary,
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: interpolate(titleProgress, [0, 1], [0, 0.8]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
          marginBottom: 30,
        }}
      >
        {tagline}
      </div>

      {/* Couple Names */}
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 72,
          fontWeight: 700,
          color: colors.primary,
          textAlign: "center",
          opacity: interpolate(nameProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(nameProgress, [0, 1], [0.8, 1])})`,
        }}
      >
        {coupleDisplayName}
      </div>

      {/* Fade in */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 15], [1, 0], { extrapolateRight: "clamp" }),
        }}
      />
    </AbsoluteFill>
  );
};
