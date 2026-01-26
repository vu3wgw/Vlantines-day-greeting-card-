import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  random,
} from "remotion";
import { FloatingHearts } from "./HeartAnimation";

interface OutroSlideProps {
  coupleName?: string;
  seed?: number;
}

export const OutroSlide: React.FC<OutroSlideProps> = ({ coupleName, seed = 0 }) => {
  const frame = useCurrentFrame();

  // Use seed for variety
  const outroStyle = Math.floor(random(`outro-style-${seed}`) * 3);

  // Fade in
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Heart scale animation (pulsing)
  const heartScale = interpolate(
    frame % 40,
    [0, 20, 40],
    [1, 1.12, 1],
    { extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) }
  );

  // Heart glow animation
  const glowIntensity = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.4, 0.7, 0.4],
    { extrapolateRight: "clamp" }
  );

  // Text fade in staggered
  const titleOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [20, 45], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const subtitleOpacity = interpolate(frame, [40, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nameOpacity = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nameScale = interpolate(frame, [55, 80], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.3)),
  });

  // Different ending messages for variety
  const endingTitles = [
    "Your Love Story",
    "Forever Yours",
    "Our Story Continues",
    "To Many More Memories",
    "Love Always Wins",
  ];

  const endingSubtitles = [
    "Every moment matters",
    "Written in the stars",
    "A journey of love",
    "Together, forever",
    "The best is yet to come",
  ];

  const title = endingTitles[Math.floor(random(`outro-title-${seed}`) * endingTitles.length)];
  const subtitle = endingSubtitles[Math.floor(random(`outro-sub-${seed}`) * endingSubtitles.length)];

  // Different background gradients
  const gradients = [
    "linear-gradient(135deg, #1a0a0f 0%, #2d1a1a 50%, #1a0a0f 100%)",
    "linear-gradient(180deg, #0f0a1a 0%, #1a1a2d 50%, #0f0a1a 100%)",
    "radial-gradient(ellipse at center, #2d1a24 0%, #1a0f14 60%, #0a0505 100%)",
  ];

  // Different heart emojis
  const heartEmojis = ["❤️", "💕", "💖", "💗", "💞"];
  const mainHeart = heartEmojis[Math.floor(random(`outro-heart-${seed}`) * heartEmojis.length)];

  // Decorative footer emojis
  const footerEmojis = [
    ["💕", "💖", "💕"],
    ["✨", "❤️", "✨"],
    ["💗", "💓", "💗"],
    ["🌹", "💕", "🌹"],
    ["💐", "💖", "💐"],
  ];
  const footer = footerEmojis[Math.floor(random(`outro-footer-${seed}`) * footerEmojis.length)] ?? ["💕", "💖", "💕"];

  return (
    <AbsoluteFill
      style={{
        background: gradients[outroStyle],
        opacity,
      }}
    >
      {/* Floating hearts in background - more hearts for outro */}
      <FloatingHearts seed={`outro-${seed}`} count={30} />

      {/* Radial glow behind heart */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(255, 100, 130, ${glowIntensity * 0.15}) 0%, transparent 40%)`,
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
        {/* Large animated heart */}
        <div
          style={{
            fontSize: 130,
            transform: `scale(${heartScale})`,
            marginBottom: 50,
            filter: `drop-shadow(0 0 ${30 + glowIntensity * 20}px rgba(255, 100, 130, ${glowIntensity}))`,
          }}
        >
          {mainHeart}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: 58,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textShadow: "2px 2px 25px rgba(0,0,0,0.6)",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h1>

        {/* Decorative line */}
        <div
          style={{
            width: interpolate(frame, [45, 70], [0, 180], { extrapolateRight: "clamp" }),
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,180,200,0.7), transparent)",
            marginTop: 25,
            marginBottom: 25,
          }}
        />

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Inter', 'Helvetica', sans-serif",
            fontSize: 24,
            fontWeight: 300,
            color: "rgba(255, 200, 210, 0.85)",
            textAlign: "center",
            margin: 0,
            opacity: subtitleOpacity,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>

        {/* Couple name if provided */}
        {coupleName && (
          <p
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: 40,
              fontStyle: "italic",
              fontWeight: 500,
              color: "rgba(255, 200, 215, 0.95)",
              textAlign: "center",
              marginTop: 45,
              opacity: nameOpacity,
              transform: `scale(${nameScale})`,
              textShadow: "1px 1px 15px rgba(0,0,0,0.4)",
            }}
          >
            ~ {coupleName} ~
          </p>
        )}

        {/* Valentine's decoration footer */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 60,
            opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {footer.map((emoji, i) => (
            <span
              key={i}
              style={{
                fontSize: 32,
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        {/* Year/date watermark */}
        <p
          style={{
            position: "absolute",
            bottom: 60,
            fontFamily: "'Inter', 'Helvetica', sans-serif",
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(255, 200, 210, 0.4)",
            letterSpacing: "0.2em",
            opacity: interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {new Date().getFullYear()}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
