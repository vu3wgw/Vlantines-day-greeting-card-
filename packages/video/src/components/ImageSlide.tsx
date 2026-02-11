import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  random,
} from "remotion";

interface ImageSlideProps {
  imageUrl: string;
  caption: string;
  date?: string;
  daysSince?: number;
  context?: string;
  index?: number;
  seed?: number;
}

// Different Ken Burns animation directions
type KenBurnsDirection = "zoomIn" | "zoomOut" | "panLeft" | "panRight" | "panUp" | "panDown";

const getKenBurnsStyle = (
  direction: KenBurnsDirection,
  progress: number
): React.CSSProperties => {
  const baseScale = 1.1;

  switch (direction) {
    case "zoomIn":
      return {
        transform: `scale(${interpolate(progress, [0, 1], [1, 1.2])})`,
        transformOrigin: "center center",
      };
    case "zoomOut":
      return {
        transform: `scale(${interpolate(progress, [0, 1], [1.2, 1])})`,
        transformOrigin: "center center",
      };
    case "panLeft":
      return {
        transform: `scale(${baseScale}) translateX(${interpolate(progress, [0, 1], [3, -3])}%)`,
        transformOrigin: "center center",
      };
    case "panRight":
      return {
        transform: `scale(${baseScale}) translateX(${interpolate(progress, [0, 1], [-3, 3])}%)`,
        transformOrigin: "center center",
      };
    case "panUp":
      return {
        transform: `scale(${baseScale}) translateY(${interpolate(progress, [0, 1], [3, -3])}%)`,
        transformOrigin: "center center",
      };
    case "panDown":
      return {
        transform: `scale(${baseScale}) translateY(${interpolate(progress, [0, 1], [-3, 3])}%)`,
        transformOrigin: "center center",
      };
  }
};

// Different text animation styles
type TextAnimStyle = "slideUp" | "fadeScale" | "typewriter" | "splitWords";

export const ImageSlide: React.FC<ImageSlideProps> = ({
  imageUrl,
  caption,
  date,
  daysSince,
  context,
  index = 0,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Use seed + index for unique but consistent variations
  const uniqueSeed = seed + index * 100;

  // Pick Ken Burns direction based on seed
  const kenBurnsDirections: KenBurnsDirection[] = [
    "zoomIn", "zoomOut", "panLeft", "panRight", "panUp", "panDown"
  ];
  const kenBurnsDirection: KenBurnsDirection = kenBurnsDirections[
    Math.floor(random(`kb-${uniqueSeed}`) * kenBurnsDirections.length)
  ] ?? "zoomIn";

  // Pick text animation style
  const textStyles: TextAnimStyle[] = ["slideUp", "fadeScale", "slideUp", "fadeScale"];
  const textStyle = textStyles[Math.floor(random(`text-${uniqueSeed}`) * textStyles.length)];

  // Ken Burns progress (0 to 1)
  const kenBurnsProgress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade in at start, fade out at end
  const opacity = interpolate(
    frame,
    [0, 25, durationInFrames - 25, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  // Text animations based on style
  let captionStyle: React.CSSProperties = {};
  let captionTransform = "";

  switch (textStyle) {
    case "slideUp":
      const slideY = interpolate(frame, [30, 55], [60, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
      const slideOpacity = interpolate(frame, [30, 55], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      captionStyle = { opacity: slideOpacity };
      captionTransform = `translateY(${slideY}px)`;
      break;

    case "fadeScale":
      const scaleVal = interpolate(frame, [30, 55], [0.8, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.2)),
      });
      const fadeOpacity = interpolate(frame, [30, 55], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      captionStyle = { opacity: fadeOpacity };
      captionTransform = `scale(${scaleVal})`;
      break;
  }

  // Date animation
  const dateOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pick gradient overlay style
  const gradientStyles = [
    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 35%, transparent 65%)",
    "linear-gradient(to top, rgba(20,0,10,0.9) 0%, rgba(20,0,10,0.3) 40%, transparent 70%)",
    "linear-gradient(to top, rgba(0,0,20,0.85) 0%, rgba(0,0,20,0.35) 35%, transparent 65%)",
  ];
  const gradientStyle = gradientStyles[Math.floor(random(`grad-${uniqueSeed}`) * gradientStyles.length)];

  // Pick decorative emoji style
  const decorStyles = [
    { left: "❤️", right: "💕" },
    { left: "💖", right: "💖" },
    { left: "✨", right: "💕" },
    { left: "💗", right: "💓" },
    { left: "🌸", right: "💕" },
  ];
  const decor = decorStyles[Math.floor(random(`decor-${uniqueSeed}`) * decorStyles.length)] ?? { left: "❤️", right: "💕" };

  // Caption text position variety
  const captionPositions = ["bottom", "center-bottom"];
  const captionPos = captionPositions[Math.floor(random(`pos-${uniqueSeed}`) * captionPositions.length)];

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#0a0a0a" }}>
      {/* Background image with Ken Burns effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <Img
          src={imageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...getKenBurnsStyle(kenBurnsDirection, kenBurnsProgress),
          }}
        />
      </div>

      {/* Gradient overlay for text readability */}
      <AbsoluteFill
        style={{
          background: gradientStyle,
        }}
      />

      {/* Decorative corners */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 50,
          fontSize: 36,
          opacity: interpolate(frame, [10, 30], [0, 0.7], { extrapolateRight: "clamp" }),
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
        }}
      >
        {decor.left}
      </div>
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 50,
          fontSize: 36,
          opacity: interpolate(frame, [15, 35], [0, 0.7], { extrapolateRight: "clamp" }),
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
        }}
      >
        {decor.right}
      </div>

      {/* Caption container */}
      <div
        style={{
          position: "absolute",
          bottom: captionPos === "center-bottom" ? 180 : 130,
          left: 48,
          right: 48,
          transform: captionTransform,
          ...captionStyle,
        }}
      >
        {/* Days Since overlay (if provided) */}
        {daysSince !== undefined && context && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
              opacity: interpolate(frame, [40, 65], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontFamily: "'Inter', 'Helvetica', sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: "white",
                backgroundColor: "rgba(255,50,100,0.35)",
                backdropFilter: "blur(12px)",
                padding: "12px 28px",
                borderRadius: 25,
                border: "2px solid rgba(255,150,170,0.4)",
                textShadow: "1px 1px 6px rgba(0,0,0,0.6)",
                textAlign: "center",
              }}
            >
              It's been <strong>{daysSince}</strong> days since {context.toLowerCase()}
            </div>
          </div>
        )}

        {/* Date badge (if provided) */}
        {date && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
              opacity: dateOpacity,
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', 'Helvetica', sans-serif",
                fontSize: 18,
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
                backgroundColor: "rgba(255,100,130,0.25)",
                backdropFilter: "blur(8px)",
                padding: "8px 20px",
                borderRadius: 20,
                border: "1px solid rgba(255,150,170,0.3)",
                textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {date}
            </span>
          </div>
        )}

        {/* Caption text */}
        <p
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: 40,
            fontWeight: 600,
            color: "white",
            textShadow: "2px 2px 15px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)",
            textAlign: "center",
            lineHeight: 1.45,
            margin: 0,
            padding: "0 10px",
          }}
        >
          "{caption}"
        </p>
      </div>

      {/* Subtle vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
