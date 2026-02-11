/**
 * StoryConfig - Configuration for the Valentine story arc
 * Defines the structure, pacing, and flow of the video
 */

import type {
  StoryConfig,
  SceneType,
  SceneMeta,
  SceneTiming,
  StoryAct,
  SceneImage,
  CoupleInfo,
  ColorScheme,
  QualityPreset,
} from "../scenes/types";

/**
 * Story arc percentages - how the video time is divided
 */
export const STORY_ARC = {
  beginning: 0.20, // 20% - Intro, first impression
  journey: 0.60,   // 60% - The memories and moments
  together: 0.20,  // 20% - Climax and outro
};

/**
 * Default scene durations in frames (at 30fps)
 */
export const DEFAULT_SCENE_DURATIONS: Record<SceneType, number> = {
  "intro": 150,           // 5 seconds
  "chapter": 90,          // 3 seconds (not used in seamless flow)
  "single-moment": 120,   // 4 seconds
  "dual-moment": 135,     // 4.5 seconds
  "collage": 150,         // 5 seconds
  "sticker-showcase": 135, // 4.5 seconds
  "together": 180,        // 6 seconds
  "heart-collage": 165,   // 5.5 seconds
  "outro": 150,           // 5 seconds
};

/**
 * Scene weights for selection algorithm
 * Higher weight = more likely to be chosen for variety
 */
export const SCENE_WEIGHTS: Record<SceneType, number> = {
  "intro": 1,
  "chapter": 0,
  "single-moment": 3,
  "dual-moment": 2,
  "collage": 2,
  "sticker-showcase": 2,
  "together": 1,
  "heart-collage": 1,
  "outro": 1,
};

/**
 * Create default story configuration
 */
export function createStoryConfig(
  couple: CoupleInfo,
  images: SceneImage[],
  options: {
    totalDurationSeconds?: number;
    fps?: number;
    quality?: QualityPreset;
    colorScheme?: ColorScheme;
    transitionStyle?: "smooth" | "dynamic" | "dramatic";
  } = {}
): StoryConfig {
  const {
    totalDurationSeconds = 60,
    fps = 30,
    quality = "balanced",
    colorScheme = "warm",
    transitionStyle = "smooth",
  } = options;

  return {
    couple,
    images,
    totalDuration: totalDurationSeconds * fps,
    fps,
    quality,
    transitionStyle,
    colorScheme,
  };
}

/**
 * Calculate how many scenes fit in each act
 */
export function calculateActDurations(
  totalDuration: number,
  fps: number
): Record<StoryAct, { duration: number; frames: number }> {
  return {
    beginning: {
      duration: Math.round(totalDuration * STORY_ARC.beginning / fps),
      frames: Math.round(totalDuration * STORY_ARC.beginning),
    },
    journey: {
      duration: Math.round(totalDuration * STORY_ARC.journey / fps),
      frames: Math.round(totalDuration * STORY_ARC.journey),
    },
    together: {
      duration: Math.round(totalDuration * STORY_ARC.together / fps),
      frames: Math.round(totalDuration * STORY_ARC.together),
    },
  };
}

/**
 * Determine which act a frame belongs to
 */
export function getActForFrame(frame: number, totalDuration: number): StoryAct {
  const beginningEnd = totalDuration * STORY_ARC.beginning;
  const journeyEnd = beginningEnd + totalDuration * STORY_ARC.journey;

  if (frame < beginningEnd) return "beginning";
  if (frame < journeyEnd) return "journey";
  return "together";
}

/**
 * Get recommended scene types for each act
 */
export function getRecommendedScenesForAct(act: StoryAct): SceneType[] {
  switch (act) {
    case "beginning":
      return ["intro", "single-moment"];
    case "journey":
      return ["single-moment", "dual-moment", "collage", "sticker-showcase"];
    case "together":
      return ["together", "heart-collage", "outro"];
  }
}

/**
 * Calculate the intensity level (0-1) for a given frame
 * Used for dynamic effects like particle density
 */
export function getIntensityForFrame(frame: number, totalDuration: number): number {
  const progress = frame / totalDuration;

  // Intensity curve: starts low, builds through journey, peaks at climax
  if (progress < 0.15) {
    // Beginning - gentle start
    return 0.3 + progress * 2;
  } else if (progress < 0.75) {
    // Journey - steady increase
    return 0.5 + (progress - 0.15) * 0.5;
  } else if (progress < 0.9) {
    // Climax - peak intensity
    return 0.8 + (progress - 0.75) * 1.3;
  } else {
    // Outro - gentle fade
    return 1 - (progress - 0.9) * 3;
  }
}

/**
 * Get transition duration based on style and position in video
 */
export function getTransitionDuration(
  style: "smooth" | "dynamic" | "dramatic",
  frame: number,
  totalDuration: number,
  fps: number
): number {
  const baseDurations = {
    smooth: 1.0,    // 1 second
    dynamic: 0.7,   // 0.7 seconds
    dramatic: 1.2,  // 1.2 seconds
  };

  let duration = baseDurations[style];

  // Adjust based on position in video
  const progress = frame / totalDuration;

  if (progress < 0.2) {
    // Beginning - slower transitions
    duration *= 1.2;
  } else if (progress > 0.8) {
    // Climax - slightly faster
    duration *= 0.9;
  }

  return Math.round(duration * fps);
}

/**
 * Validate story configuration
 */
export function validateStoryConfig(config: StoryConfig): string[] {
  const errors: string[] = [];

  if (config.images.length < 2) {
    errors.push("At least 2 images are required");
  }

  if (config.totalDuration < config.fps * 15) {
    errors.push("Video must be at least 15 seconds long");
  }

  if (!config.couple.name1 || !config.couple.name2) {
    errors.push("Both couple names are required");
  }

  // Check if we have enough duration for all images
  const minDurationPerImage = 3 * config.fps; // 3 seconds minimum
  const requiredDuration = config.images.length * minDurationPerImage + 10 * config.fps; // +10s for intro/outro

  if (config.totalDuration < requiredDuration) {
    errors.push(`Video duration too short for ${config.images.length} images. Need at least ${Math.ceil(requiredDuration / config.fps)} seconds.`);
  }

  return errors;
}

/**
 * Get color palette variations based on frame position
 * Allows for subtle color shifts throughout the video
 */
export function getColorVariation(
  baseScheme: ColorScheme,
  frame: number,
  totalDuration: number
): { warmth: number; saturation: number } {
  const progress = frame / totalDuration;

  // Warmth increases towards climax, decreases slightly at end
  let warmth = 1;
  if (progress < 0.3) {
    warmth = 0.9 + progress * 0.3;
  } else if (progress > 0.85) {
    warmth = 1.1 - (progress - 0.85) * 0.5;
  } else {
    warmth = 1 + (progress - 0.3) * 0.2;
  }

  // Saturation follows similar pattern
  const saturation = 0.9 + Math.sin(progress * Math.PI) * 0.15;

  return { warmth, saturation };
}

export type { StoryConfig, SceneType, SceneMeta, SceneTiming, StoryAct };
