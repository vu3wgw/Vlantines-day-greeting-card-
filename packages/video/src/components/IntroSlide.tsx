import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
  random,
} from "remotion";
import { FloatingHearts } from "./HeartAnimation";

interface IntroSlideProps {
  coupleName?: string;
  seed?: number;
}

export const IntroSlide: React.FC<IntroSlideProps> = ({ coupleName, seed = 0 }) => {
  const frame = useCurrentFrame();

  // Use seed for variety in animations
  const introStyle = Math.floor(random(`intro-style-${seed}`) * 3);

  // Fade in
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Heart animations
  const heartScale = interpolate(
    frame,
    [0, 20, 40, 60],
    [0, 1.3, 0.9, 1],
    { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) }
  );

  const heartRotate = interpolate(frame, [0, 60], [-10, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Title animation - staggered
  const titleOpacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [30, 55], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Names animation
  const nameOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nameScale = interpolate(frame, [50, 75], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Different intro titles for variety
  const introTitles = [
    "A Love Story",
    "Our Journey Together",
    "Moments of Love",
    "Written in the Stars",
    "Forever & Always",
  ];

  const title = introTitles[Math.floor(random(`intro-title-${seed}`) * introTitles.length)];

  // Different background gradients for variety
  const gradients = [
    "linear-gradient(135deg, #1a0a0f 0%, #2d1a1a 50%, #1a0a0f 100%)",
    "linear-gradient(180deg, #0f0a1a 0%, #1a1a2d 50%, #0f0a1a 100%)",
    "linear-gradient(135deg, #1a0f0f 0%, #2d1a24 50%, #1a0f14 100%)",
  ];

  return (
    <AbsoluteFill
      style={{
        background: gradients[introStyle],
        opacity,
      }}
    >
      {/* Floating hearts in background */}
      <FloatingHearts seed={`intro-${seed}`} count={25} />

      {/* Sparkle overlay */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,180,200,0.1) 0%, transparent 50%)",
        }}
      />

      {/* Main content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Animated heart */}
        <div
          style={{
            fontSize: 100,
            transform: `scale(${heartScale}) rotate(${heartRotate}deg)`,
            marginBottom: 50,
            filter: "drop-shadow(0 0 40px rgba(255, 100, 130, 0.6))",
          }}
        >
          💕
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: 56,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: "2px 2px 20px rgba(0,0,0,0.5)",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h1>

        {/* Decorative line */}
        <div
          style={{
            width: interpolate(frame, [40, 70], [0, 200], { extrapolateRight: "clamp" }),
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,180,200,0.8), transparent)",
            marginTop: 30,
            marginBottom: 30,
          }}
        />

        {/* Couple name with badge background */}
        {coupleName && (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: nameOpacity,
              transform: `scale(${nameScale})`,
            }}
          >
            <Img
              src={staticFile("valentine-badge.png")}
              style={{
                position: "absolute",
                width: 500,
                height: "auto",
              }}
            />
            <p
              style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: 42,
                fontStyle: "italic",
                fontWeight: 500,
                color: "#8b2252",
                textAlign: "center",
                margin: 0,
                position: "relative",
                zIndex: 1,
                textShadow: "none",
              }}
            >
              {coupleName}
            </p>
          </div>
        )}

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Inter', 'Helvetica', sans-serif",
            fontSize: 20,
            fontWeight: 300,
            color: "rgba(255, 200, 210, 0.7)",
            textAlign: "center",
            marginTop: 40,
            opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Swipe through our memories
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
