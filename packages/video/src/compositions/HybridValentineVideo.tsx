import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import type { HybridVideoProps } from "../types";

export const HybridValentineVideo: React.FC<HybridVideoProps> = ({
  compositedVideoUrl,
  images,
  coupleName,
  overlayStyle = "romantic",
  seed = Date.now(),
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // Load green screen config to get frame ranges
  // TODO: Import this dynamically or pass as prop
  const greenScreenRegions = [
    { index: 0, startFrame: 0, endFrame: 500 },
    { index: 1, startFrame: 501, endFrame: 1000 },
    { index: 2, startFrame: 1001, endFrame: 1517 },
  ];

  return (
    <AbsoluteFill>
      {/* LAYER 1: Composited base video (green screen already replaced) */}
      <OffthreadVideo
        src={compositedVideoUrl}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* LAYER 2: Text captions for each image */}
      {overlayStyle !== "minimal" && images.map((image, index) => {
        // Map image to green screen region
        const region = greenScreenRegions[index];
        if (!region) return null;

        const duration = region.endFrame - region.startFrame;

        return (
          <Sequence
            key={index}
            from={region.startFrame}
            durationInFrames={duration}
            name={`Caption: ${image.caption}`}
          >
            <CaptionOverlay
              caption={image.caption}
              date={image.date}
              style={overlayStyle}
              duration={duration}
            />
          </Sequence>
        );
      })}

      {/* LAYER 3: Floating elements (if romantic or cinematic) */}
      {overlayStyle !== "minimal" && (
        <FloatingHearts seed={seed} count={overlayStyle === "cinematic" ? 20 : 10} />
      )}

      {/* LAYER 4: Intro */}
      <Sequence from={0} durationInFrames={90}>
        <IntroOverlay coupleName={coupleName} seed={seed} />
      </Sequence>

      {/* LAYER 5: Outro */}
      <Sequence from={durationInFrames - 120} durationInFrames={120}>
        <OutroOverlay coupleName={coupleName} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Caption overlay component
const CaptionOverlay: React.FC<{
  caption: string;
  date?: string;
  style: string;
  duration: number;
}> = ({ caption, date, style, duration }) => {
  const frame = useCurrentFrame();

  // Fade in/out animation
  const opacity = interpolate(
    frame,
    [0, 20, duration - 30, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );

  // Subtle scale animation
  const scale = interpolate(
    frame,
    [0, 20],
    [0.95, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Position text at bottom to avoid green screen area (usually in middle) */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 40,
          right: 40,
          textAlign: "center",
          transform: `scale(${scale})`,
        }}
      >
        {date && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
              backgroundColor: "rgba(255, 100, 130, 0.35)",
              backdropFilter: "blur(12px)",
              padding: "6px 18px",
              borderRadius: 20,
              display: "inline-block",
              marginBottom: 10,
              border: "1px solid rgba(255, 150, 170, 0.5)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            {date}
          </div>
        )}
        <p
          style={{
            fontFamily: style === "cinematic" ? "'Playfair Display', serif" : "'Inter', sans-serif",
            fontSize: style === "cinematic" ? 24 : 20,
            fontWeight: style === "cinematic" ? 700 : 600,
            color: "white",
            textShadow:
              style === "cinematic"
                ? "3px 3px 25px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.7)"
                : "2px 2px 15px rgba(0,0,0,0.9)",
            margin: 0,
            lineHeight: 1.4,
            maxWidth: "90%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {caption}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Intro overlay component
const IntroOverlay: React.FC<{ coupleName?: string; seed: number }> = ({
  coupleName,
  seed,
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [0, 35],
    [0.8, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.5)),
    }
  );

  const opacity = interpolate(
    frame,
    [0, 20, 70, 90],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(15px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          transform: `scale(${scale})`,
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            textShadow: "4px 4px 30px rgba(0,0,0,0.95)",
            margin: 0,
            padding: "0 20px",
          }}
        >
          {coupleName || "Our Love Story"}
        </h1>
        <div
          style={{
            marginTop: 15,
            fontSize: 18,
            color: "rgba(255, 200, 210, 0.9)",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}
        >
          Happy Valentine's Day
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Outro overlay component
const OutroOverlay: React.FC<{ coupleName?: string }> = ({ coupleName }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 30, 90, 120],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const heartScale = interpolate(
    frame,
    [0, 30, 60],
    [0, 1.2, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(2)),
    }
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div
          style={{
            fontSize: 60,
            marginBottom: 20,
            transform: `scale(${heartScale})`,
          }}
        >
          ❤️
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            marginBottom: 15,
            textShadow: "3px 3px 20px rgba(0,0,0,0.9)",
          }}
        >
          Happy Valentine's Day
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 20,
            color: "rgba(255, 200, 210, 0.9)",
            textAlign: "center",
            margin: 0,
          }}
        >
          {coupleName || "Forever & Always"}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// Simple floating hearts effect
const FloatingHearts: React.FC<{ seed: number; count: number }> = ({
  seed,
  count,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate deterministic random positions based on seed
  const hearts = Array.from({ length: count }, (_, i) => {
    const random = (n: number) => (Math.sin(seed + i * n) + 1) / 2;

    const startX = random(123) * width;
    const amplitude = 30 + random(456) * 50;
    const speed = 0.5 + random(789) * 1.5;
    const delay = i * 5;

    const y = interpolate(
      frame - delay,
      [0, 200],
      [height + 50, -50],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    const x = startX + Math.sin((frame - delay) * 0.02 * speed) * amplitude;

    const opacity = interpolate(
      frame - delay,
      [0, 20, 180, 200],
      [0, 0.4, 0.4, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    const scale = interpolate(
      frame - delay,
      [0, 20],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.5)),
      }
    );

    return { x, y, opacity, scale };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {hearts.map((heart, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: heart.x,
            top: heart.y,
            fontSize: 24,
            opacity: heart.opacity,
            transform: `scale(${heart.scale})`,
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
          }}
        >
          ❤️
        </div>
      ))}
    </AbsoluteFill>
  );
};
