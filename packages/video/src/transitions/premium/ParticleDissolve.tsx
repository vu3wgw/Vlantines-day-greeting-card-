import React from "react";
import { AbsoluteFill, interpolate, Easing, random, useVideoConfig } from "remotion";

export interface ParticleDissolveTransitionProps {
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  particleCount?: number;
  particleType?: "heart" | "square" | "circle" | "star";
  particleSize?: number;
  color?: string;
  seed?: string | number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotation: number;
  delay: number;
  scale: number;
}

/**
 * ParticleDissolve Transition - Image dissolves into particles or assembles from them
 * Creates magical appearance/disappearance effect
 */
export const ParticleDissolveTransition: React.FC<ParticleDissolveTransitionProps> = ({
  progress,
  direction,
  children,
  particleCount = 100,
  particleType = "heart",
  particleSize = 20,
  color = "#ff6b9d",
  seed = "dissolve",
}) => {
  const { width, height } = useVideoConfig();

  // Generate particles
  const particles = React.useMemo((): Particle[] => {
    return Array.from({ length: particleCount }, (_, i) => {
      const seedKey = `${seed}-${i}`;
      // Grid position for where particle "comes from" in the image
      const gridX = (i % 10) / 10;
      const gridY = Math.floor(i / 10) / Math.ceil(particleCount / 10);

      // Random offset for the scattered position
      const angle = random(`${seedKey}-angle`) * Math.PI * 2;
      const distance = 300 + random(`${seedKey}-dist`) * 500;

      return {
        id: i,
        // Position in image (normalized 0-1)
        x: gridX,
        y: gridY,
        // Scattered position (pixels from center)
        targetX: Math.cos(angle) * distance,
        targetY: Math.sin(angle) * distance,
        rotation: (random(`${seedKey}-rot`) - 0.5) * 720,
        delay: random(`${seedKey}-delay`) * 0.4,
        scale: 0.5 + random(`${seedKey}-scale`) * 1,
      };
    });
  }, [particleCount, seed]);

  // Content opacity - fades out as particles take over
  let contentOpacity: number;
  if (direction === "out") {
    // Dissolving out - content fades as particles scatter
    contentOpacity = interpolate(progress, [0, 0.4], [1, 0], {
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    });
  } else {
    // Assembling in - particles converge then content appears
    contentOpacity = interpolate(progress, [0.6, 1], [0, 1], {
      extrapolateLeft: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  }

  // Render particle shape
  const renderParticle = (type: string) => {
    switch (type) {
      case "heart":
        return "❤️";
      case "star":
        return "⭐";
      case "circle":
        return "●";
      case "square":
      default:
        return "■";
    }
  };

  return (
    <AbsoluteFill>
      {/* Main content */}
      <AbsoluteFill style={{ opacity: contentOpacity }}>
        {children}
      </AbsoluteFill>

      {/* Particles */}
      {particles.map((particle) => {
        // Calculate particle's individual progress
        const particleProgress = Math.max(0, Math.min(1,
          direction === "out"
            ? (progress - particle.delay) / (1 - particle.delay)
            : (progress - particle.delay) / (1 - particle.delay)
        ));

        // Position interpolation
        let x: number;
        let y: number;
        let rotation: number;
        let opacity: number;
        let scale: number;

        if (direction === "out") {
          // Scatter outward from image position
          x = interpolate(particleProgress, [0, 1], [
            (particle.x - 0.5) * width * 0.8,
            particle.targetX,
          ], { easing: Easing.out(Easing.cubic) });

          y = interpolate(particleProgress, [0, 1], [
            (particle.y - 0.5) * height * 0.8,
            particle.targetY,
          ], { easing: Easing.out(Easing.cubic) });

          rotation = interpolate(particleProgress, [0, 1], [0, particle.rotation]);
          opacity = interpolate(particleProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);
          scale = interpolate(particleProgress, [0, 0.3, 1], [0.5, particle.scale, particle.scale * 0.3]);
        } else {
          // Converge inward to image position
          x = interpolate(particleProgress, [0, 1], [
            particle.targetX,
            (particle.x - 0.5) * width * 0.8,
          ], { easing: Easing.out(Easing.cubic) });

          y = interpolate(particleProgress, [0, 1], [
            particle.targetY,
            (particle.y - 0.5) * height * 0.8,
          ], { easing: Easing.out(Easing.cubic) });

          rotation = interpolate(particleProgress, [0, 1], [particle.rotation, 0]);
          opacity = interpolate(particleProgress, [0, 0.2, 0.7, 1], [0, 1, 1, 0]);
          scale = interpolate(particleProgress, [0, 0.7, 1], [particle.scale * 0.3, particle.scale, 0.5]);
        }

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
              opacity,
              fontSize: particleSize,
              color: particleType === "heart" || particleType === "star" ? undefined : color,
              pointerEvents: "none",
            }}
          >
            {renderParticle(particleType)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * HeartDissolve - Specialized version that dissolves into hearts
 */
export const HeartDissolveTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  heartCount?: number;
}> = ({
  progress,
  direction,
  children,
  heartCount = 80,
}) => {
  return (
    <ParticleDissolveTransition
      progress={progress}
      direction={direction}
      particleCount={heartCount}
      particleType="heart"
      particleSize={24}
      seed="hearts"
    >
      {children}
    </ParticleDissolveTransition>
  );
};

/**
 * SparkleDissolve - Dissolves with sparkle/star particles
 */
export const SparkleDissolveTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
}> = ({
  progress,
  direction,
  children,
}) => {
  return (
    <ParticleDissolveTransition
      progress={progress}
      direction={direction}
      particleCount={60}
      particleType="star"
      particleSize={16}
      seed="sparkles"
    >
      {children}
    </ParticleDissolveTransition>
  );
};

/**
 * PixelDissolve - Dissolves into square pixels
 */
export const PixelDissolveTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
  gridSize?: number;
}> = ({
  progress,
  direction,
  children,
  gridSize = 15,
}) => {
  const totalPixels = gridSize * gridSize;

  return (
    <ParticleDissolveTransition
      progress={progress}
      direction={direction}
      particleCount={totalPixels}
      particleType="square"
      particleSize={Math.max(10, 60 / gridSize * 3)}
      color="rgba(255, 107, 157, 0.8)"
      seed="pixels"
    >
      {children}
    </ParticleDissolveTransition>
  );
};

/**
 * BubbleDissolve - Dissolves into floating bubbles
 */
export const BubbleDissolveTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
}> = ({
  progress,
  direction,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const bubbleCount = 50;

  const bubbles = React.useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => ({
      id: i,
      x: (random(`bubble-x-${i}`) - 0.5) * width * 0.8,
      y: (random(`bubble-y-${i}`) - 0.5) * height * 0.8,
      size: 20 + random(`bubble-size-${i}`) * 40,
      delay: random(`bubble-delay-${i}`) * 0.3,
      floatOffset: random(`bubble-float-${i}`) * Math.PI * 2,
    }));
  }, [width, height]);

  let contentOpacity: number;
  if (direction === "out") {
    contentOpacity = interpolate(progress, [0, 0.4], [1, 0], {
      extrapolateRight: "clamp",
    });
  } else {
    contentOpacity = interpolate(progress, [0.6, 1], [0, 1], {
      extrapolateLeft: "clamp",
    });
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: contentOpacity }}>
        {children}
      </AbsoluteFill>

      {bubbles.map((bubble) => {
        const bubbleProgress = Math.max(0, Math.min(1,
          (progress - bubble.delay) / (1 - bubble.delay)
        ));

        let y: number;
        let opacity: number;
        let scale: number;

        if (direction === "out") {
          y = interpolate(bubbleProgress, [0, 1], [bubble.y, bubble.y - 400]);
          opacity = interpolate(bubbleProgress, [0, 0.2, 0.8, 1], [0, 0.8, 0.6, 0]);
          scale = interpolate(bubbleProgress, [0, 0.3, 1], [0.3, 1, 1.2]);
        } else {
          y = interpolate(bubbleProgress, [0, 1], [bubble.y + 400, bubble.y]);
          opacity = interpolate(bubbleProgress, [0, 0.2, 0.8, 1], [0, 0.6, 0.8, 0]);
          scale = interpolate(bubbleProgress, [0, 0.7, 1], [1.2, 1, 0.3]);
        }

        // Add slight wobble
        const wobbleX = Math.sin(bubbleProgress * Math.PI * 4 + bubble.floatOffset) * 20;

        return (
          <div
            key={bubble.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: bubble.size,
              height: bubble.size,
              borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,107,157,0.4))",
              border: "2px solid rgba(255,255,255,0.5)",
              transform: `translate(-50%, -50%) translate(${bubble.x + wobbleX}px, ${y}px) scale(${scale})`,
              opacity,
              boxShadow: "inset -5px -5px 10px rgba(255,107,157,0.3)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * ConfettiDissolve - Explodes into confetti
 */
export const ConfettiDissolveTransition: React.FC<{
  progress: number;
  direction: "in" | "out";
  children: React.ReactNode;
}> = ({
  progress,
  direction,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const confettiCount = 80;

  const confettiColors = ["#ff6b9d", "#ff9eb5", "#ffc4d6", "#ffdd00", "#ff8800", "#ff4444"];

  const confetti = React.useMemo(() => {
    return Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      startX: (random(`conf-sx-${i}`) - 0.5) * width * 0.6,
      startY: (random(`conf-sy-${i}`) - 0.5) * height * 0.6,
      endX: (random(`conf-ex-${i}`) - 0.5) * width * 1.5,
      endY: height / 2 + random(`conf-ey-${i}`) * 300,
      rotation: random(`conf-rot-${i}`) * 720,
      rotationAxis: random(`conf-axis-${i}`) > 0.5 ? "X" : "Y",
      color: confettiColors[Math.floor(random(`conf-color-${i}`) * confettiColors.length)],
      width: 8 + random(`conf-w-${i}`) * 12,
      height: 15 + random(`conf-h-${i}`) * 20,
      delay: random(`conf-delay-${i}`) * 0.2,
    }));
  }, [width, height]);

  let contentOpacity: number;
  if (direction === "out") {
    contentOpacity = interpolate(progress, [0, 0.3], [1, 0], {
      extrapolateRight: "clamp",
    });
  } else {
    contentOpacity = interpolate(progress, [0.7, 1], [0, 1], {
      extrapolateLeft: "clamp",
    });
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: contentOpacity }}>
        {children}
      </AbsoluteFill>

      {confetti.map((piece) => {
        const pieceProgress = Math.max(0, Math.min(1,
          (progress - piece.delay) / (1 - piece.delay)
        ));

        let x: number;
        let y: number;
        let rotation: number;
        let opacity: number;

        if (direction === "out") {
          x = interpolate(pieceProgress, [0, 1], [piece.startX, piece.endX], {
            easing: Easing.out(Easing.quad),
          });
          y = interpolate(pieceProgress, [0, 0.3, 1], [piece.startY, piece.startY - 100, piece.endY], {
            easing: Easing.in(Easing.quad),
          });
          rotation = pieceProgress * piece.rotation;
          opacity = interpolate(pieceProgress, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);
        } else {
          x = interpolate(pieceProgress, [0, 1], [piece.endX, piece.startX], {
            easing: Easing.in(Easing.quad),
          });
          y = interpolate(pieceProgress, [0, 0.7, 1], [piece.endY, piece.startY - 100, piece.startY], {
            easing: Easing.out(Easing.quad),
          });
          rotation = (1 - pieceProgress) * piece.rotation;
          opacity = interpolate(pieceProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
        }

        const rotateStyle = piece.rotationAxis === "X"
          ? `rotateX(${rotation}deg)`
          : `rotateY(${rotation}deg)`;

        return (
          <div
            key={piece.id}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) ${rotateStyle}`,
              opacity,
              borderRadius: 2,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
