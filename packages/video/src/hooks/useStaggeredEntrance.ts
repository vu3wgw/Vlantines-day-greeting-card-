import { useCurrentFrame, useVideoConfig } from "remotion";
import { createSpring, SpringPreset } from "../animation/springs";
import { interpolate, Easing } from "remotion";

interface StaggeredItemAnimation {
  opacity: number;
  scale: number;
  translateY: number;
  translateX: number;
  rotate: number;
}

/**
 * Hook for creating staggered entrance animations for multiple items
 * Perfect for lists, grids, or sequential reveals
 */
export function useStaggeredEntrance(
  itemCount: number,
  options: {
    staggerFrames?: number;
    startDelay?: number;
    preset?: SpringPreset;
    animation?: "fadeUp" | "fadeScale" | "flyIn" | "pop" | "rotate";
    direction?: "left" | "right" | "top" | "bottom";
    distance?: number;
  } = {}
): StaggeredItemAnimation[] {
  const {
    staggerFrames = 5,
    startDelay = 0,
    preset = "bouncy",
    animation = "fadeUp",
    direction = "bottom",
    distance = 50,
  } = options;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return Array.from({ length: itemCount }, (_, index) => {
    const itemDelay = startDelay + index * staggerFrames;
    const progress = createSpring(frame, fps, preset, itemDelay);

    let opacity = 1;
    let scale = 1;
    let translateY = 0;
    let translateX = 0;
    let rotate = 0;

    switch (animation) {
      case "fadeUp":
        opacity = Math.min(1, progress * 1.5);
        translateY = (1 - progress) * distance;
        break;

      case "fadeScale":
        opacity = Math.min(1, progress * 1.5);
        scale = 0.7 + 0.3 * progress;
        break;

      case "flyIn":
        opacity = Math.min(1, progress * 2);
        switch (direction) {
          case "left":
            translateX = (1 - progress) * -distance;
            break;
          case "right":
            translateX = (1 - progress) * distance;
            break;
          case "top":
            translateY = (1 - progress) * -distance;
            break;
          case "bottom":
            translateY = (1 - progress) * distance;
            break;
        }
        break;

      case "pop":
        opacity = Math.min(1, progress * 3);
        scale = progress; // 0 to 1
        break;

      case "rotate":
        opacity = Math.min(1, progress * 1.5);
        scale = 0.8 + 0.2 * progress;
        rotate = (1 - progress) * 15;
        break;
    }

    return {
      opacity,
      scale,
      translateY,
      translateX,
      rotate,
    };
  });
}

/**
 * Hook for character-by-character text animation
 */
export function useCharacterAnimation(
  text: string,
  options: {
    staggerFrames?: number;
    startDelay?: number;
    preset?: SpringPreset;
    animation?: "fadeUp" | "fadeScale" | "wave" | "bounce";
  } = {}
): Array<{
  char: string;
  opacity: number;
  translateY: number;
  scale: number;
}> {
  const {
    staggerFrames = 2,
    startDelay = 0,
    preset = "smooth",
    animation = "fadeUp",
  } = options;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const characters = text.split("");

  return characters.map((char, index) => {
    const itemDelay = startDelay + index * staggerFrames;
    const progress = createSpring(frame, fps, preset, itemDelay);

    let opacity = Math.min(1, progress * 1.5);
    let translateY = 0;
    let scale = 1;

    switch (animation) {
      case "fadeUp":
        translateY = (1 - progress) * 30;
        break;

      case "fadeScale":
        scale = 0.5 + 0.5 * progress;
        break;

      case "wave":
        // Wave effect - oscillates up and down
        const waveOffset = Math.sin((frame + index * 5) * 0.1) * 5;
        translateY = (1 - progress) * 30 + waveOffset * progress;
        break;

      case "bounce":
        // Bounce at the end
        translateY = (1 - progress) * 50;
        if (progress > 0.8) {
          const bounceProgress = (progress - 0.8) / 0.2;
          translateY += Math.sin(bounceProgress * Math.PI) * 10;
        }
        break;
    }

    return {
      char,
      opacity,
      translateY,
      scale,
    };
  });
}

/**
 * Hook for word-by-word text animation
 */
export function useWordAnimation(
  text: string,
  options: {
    staggerFrames?: number;
    startDelay?: number;
    preset?: SpringPreset;
    animation?: "fadeUp" | "fadeScale" | "highlight";
  } = {}
): Array<{
  word: string;
  opacity: number;
  translateY: number;
  scale: number;
  color?: string;
}> {
  const {
    staggerFrames = 8,
    startDelay = 0,
    preset = "smooth",
    animation = "fadeUp",
  } = options;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return words.map((word, index) => {
    const itemDelay = startDelay + index * staggerFrames;
    const progress = createSpring(frame, fps, preset, itemDelay);

    let opacity = Math.min(1, progress * 1.5);
    let translateY = 0;
    let scale = 1;

    switch (animation) {
      case "fadeUp":
        translateY = (1 - progress) * 25;
        break;

      case "fadeScale":
        scale = 0.8 + 0.2 * progress;
        break;

      case "highlight":
        // Words "light up" as they appear
        opacity = progress;
        scale = 0.95 + 0.05 * progress;
        break;
    }

    return {
      word,
      opacity,
      translateY,
      scale,
    };
  });
}

/**
 * Hook for line-by-line text animation
 */
export function useLineAnimation(
  lines: string[],
  options: {
    staggerFrames?: number;
    startDelay?: number;
    preset?: SpringPreset;
  } = {}
): Array<{
  line: string;
  opacity: number;
  translateY: number;
  translateX: number;
}> {
  const {
    staggerFrames = 15,
    startDelay = 0,
    preset = "smooth",
  } = options;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return lines.map((line, index) => {
    const itemDelay = startDelay + index * staggerFrames;
    const progress = createSpring(frame, fps, preset, itemDelay);

    return {
      line,
      opacity: Math.min(1, progress * 1.5),
      translateY: (1 - progress) * 20,
      translateX: 0,
    };
  });
}
