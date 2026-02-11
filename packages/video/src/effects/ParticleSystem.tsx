import React from "react";
import { useCurrentFrame, useVideoConfig, random, interpolate } from "remotion";

export type ParticleType = "heart" | "sparkle" | "confetti" | "petal" | "star";
export type SpawnMode = "burst" | "continuous" | "edges" | "rain" | "float";

// Particle emojis/shapes
const PARTICLE_SHAPES: Record<ParticleType, string[]> = {
  heart: ["❤️", "💕", "💖", "💗", "💓", "💝"],
  sparkle: ["✨", "⭐", "💫", "🌟"],
  confetti: ["🎊", "🎉", "✨"],
  petal: ["🌸", "🌺", "💮", "🌷"],
  star: ["⭐", "🌟", "✨", "💫"],
};

// Colors for CSS-based particles
const PARTICLE_COLORS: Record<ParticleType, string[]> = {
  heart: ["#ff6b8a", "#ff8fa3", "#ffb3c1", "#ff4d6d", "#c9184a"],
  sparkle: ["#ffd700", "#fff4cc", "#ffeb99", "#ffe066"],
  confetti: ["#ff6b8a", "#ffd700", "#87ceeb", "#98fb98", "#dda0dd"],
  petal: ["#ffb6c1", "#ffc0cb", "#ff69b4", "#ffb7c5"],
  star: ["#ffd700", "#ffeb3b", "#fff176"],
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  wobbleSpeed: number;
  wobbleAmount: number;
  delay: number;
  shape: string;
  color: string;
  opacity: number;
}

export interface ParticleSystemProps {
  type?: ParticleType;
  count?: number;
  spawn?: SpawnMode;
  seed?: string | number;
  colors?: string[];
  useEmoji?: boolean;
  className?: string;
}

/**
 * ParticleSystem - Animated particles for visual flair
 * Hearts, sparkles, confetti floating through the scene
 */
export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  type = "heart",
  count = 30,
  spawn = "float",
  seed = "particles",
  colors,
  useEmoji = true,
  className,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height, width } = useVideoConfig();

  // Generate particles based on seed for consistency
  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seedKey = `${seed}-${i}`;
      const shapes = PARTICLE_SHAPES[type];
      const defaultColors = colors || PARTICLE_COLORS[type];

      return {
        id: i,
        x: random(seedKey + "-x") * width,
        y: random(seedKey + "-y") * height * 1.5, // Start some above/below
        size: 16 + random(seedKey + "-size") * 24,
        rotation: random(seedKey + "-rot") * 360,
        speed: 0.5 + random(seedKey + "-speed") * 1.5,
        wobbleSpeed: 0.02 + random(seedKey + "-wobbleSpeed") * 0.04,
        wobbleAmount: 10 + random(seedKey + "-wobbleAmt") * 30,
        delay: random(seedKey + "-delay") * 60,
        shape: shapes[Math.floor(random(seedKey + "-shape") * shapes.length)],
        color: defaultColors[Math.floor(random(seedKey + "-color") * defaultColors.length)],
        opacity: 0.4 + random(seedKey + "-opacity") * 0.5,
      };
    });
  }, [seed, count, type, width, height, colors]);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {particles.map((particle) => {
        const adjustedFrame = frame - particle.delay;
        if (adjustedFrame < 0) return null;

        // Calculate position based on spawn mode
        let currentY = particle.y;
        let currentX = particle.x;
        let currentOpacity = particle.opacity;
        let currentScale = 1;

        switch (spawn) {
          case "float":
            // Float upward with wobble
            currentY = particle.y - adjustedFrame * particle.speed;
            currentX =
              particle.x +
              Math.sin(adjustedFrame * particle.wobbleSpeed + particle.id) *
                particle.wobbleAmount;
            // Fade based on position
            const floatProgress = 1 - (height - currentY) / (height * 1.5);
            currentOpacity = particle.opacity * Math.max(0, Math.min(1, floatProgress * 2));
            break;

          case "rain":
            // Fall downward
            currentY = (particle.y + adjustedFrame * particle.speed * 2) % (height * 1.2);
            currentX =
              particle.x + Math.sin(adjustedFrame * particle.wobbleSpeed) * 10;
            break;

          case "burst":
            // Burst from center outward
            const burstProgress = Math.min(1, adjustedFrame / 30);
            const angle = (particle.id / count) * Math.PI * 2;
            const distance = burstProgress * 400;
            currentX = width / 2 + Math.cos(angle) * distance;
            currentY = height / 2 + Math.sin(angle) * distance;
            currentOpacity = particle.opacity * (1 - burstProgress * 0.8);
            currentScale = interpolate(burstProgress, [0, 0.3, 1], [0, 1.2, 0.5]);
            break;

          case "edges":
            // Float in from edges
            const edgeProgress = Math.min(1, adjustedFrame / 60);
            const startEdge = Math.floor(random(`${seed}-edge-${particle.id}`) * 4);
            let startX = particle.x;
            let startY = particle.y;
            let endX = width / 2 + (random(`${seed}-endX-${particle.id}`) - 0.5) * width * 0.6;
            let endY = height / 2 + (random(`${seed}-endY-${particle.id}`) - 0.5) * height * 0.6;

            switch (startEdge) {
              case 0: startX = -50; startY = particle.y % height; break;
              case 1: startX = width + 50; startY = particle.y % height; break;
              case 2: startY = -50; startX = particle.x % width; break;
              case 3: startY = height + 50; startX = particle.x % width; break;
            }

            currentX = interpolate(edgeProgress, [0, 1], [startX, endX]);
            currentY = interpolate(edgeProgress, [0, 1], [startY, endY]);
            currentOpacity = interpolate(edgeProgress, [0, 0.2, 0.8, 1], [0, particle.opacity, particle.opacity, 0]);
            break;

          case "continuous":
          default:
            // Continuous upward flow
            currentY = ((particle.y - adjustedFrame * particle.speed) % (height * 1.5)) - height * 0.25;
            currentX =
              particle.x +
              Math.sin(adjustedFrame * particle.wobbleSpeed + particle.id) *
                particle.wobbleAmount;
            // Fade in/out at edges
            const yProgress = currentY / height;
            if (yProgress < 0.1) currentOpacity = particle.opacity * (yProgress / 0.1);
            else if (yProgress > 0.9) currentOpacity = particle.opacity * ((1 - yProgress) / 0.1);
            break;
        }

        // Rotation animation
        const rotation =
          particle.rotation + adjustedFrame * (particle.speed * 2);

        const style: React.CSSProperties = {
          position: "absolute",
          left: currentX,
          top: currentY,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${currentScale})`,
          opacity: currentOpacity,
          fontSize: useEmoji ? particle.size : undefined,
          filter: "blur(0.5px)",
          willChange: "transform, opacity",
        };

        if (useEmoji) {
          return (
            <span key={particle.id} style={style}>
              {particle.shape}
            </span>
          );
        } else {
          // CSS shape (heart)
          return (
            <div
              key={particle.id}
              style={{
                ...style,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: type === "heart" ? "50% 50% 0 0" : "50%",
                transform: `${style.transform} ${type === "heart" ? "rotate(-45deg)" : ""}`,
              }}
            />
          );
        }
      })}
    </div>
  );
};

/**
 * HeartBurst - Hearts burst from a point
 */
export const HeartBurst: React.FC<{
  count?: number;
  seed?: string;
}> = ({ count = 20, seed = "burst" }) => {
  return <ParticleSystem type="heart" count={count} spawn="burst" seed={seed} />;
};

/**
 * FloatingHearts - Hearts float upward continuously
 */
export const FloatingHearts: React.FC<{
  count?: number;
  seed?: string;
}> = ({ count = 25, seed = "hearts" }) => {
  return <ParticleSystem type="heart" count={count} spawn="float" seed={seed} />;
};

/**
 * Sparkles - Sparkles for magical moments
 */
export const Sparkles: React.FC<{
  count?: number;
  seed?: string;
}> = ({ count = 15, seed = "sparkle" }) => {
  return <ParticleSystem type="sparkle" count={count} spawn="edges" seed={seed} />;
};

/**
 * Confetti - Celebration confetti
 */
export const Confetti: React.FC<{
  count?: number;
  seed?: string;
}> = ({ count = 40, seed = "confetti" }) => {
  return <ParticleSystem type="confetti" count={count} spawn="rain" seed={seed} />;
};
