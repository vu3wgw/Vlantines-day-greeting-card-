/**
 * Scene Types - Defines the structure for all video scenes
 */

export interface SceneImage {
  url: string;
  caption?: string;
  date?: string;
  stickerUrl?: string; // Background-removed version
  isFavorite?: boolean;
}

export interface BaseSceneProps {
  /** Duration of this scene in frames */
  durationInFrames: number;
  /** Starting frame of this scene */
  startFrame?: number;
  /** Seed for deterministic randomness */
  seed?: string | number;
}

export interface SceneTransition {
  type: "none" | "fade" | "slide" | "zoom" | "heart" | "particle" | "flip";
  direction?: "in" | "out" | "both";
  durationInFrames?: number;
}

/**
 * Scene metadata for the story orchestrator
 */
export interface SceneMeta {
  id: string;
  type: SceneType;
  imageCount: number;
  duration: number;
  transition: SceneTransition;
  weight: number; // Priority weight for scene selection
}

export type SceneType =
  | "intro"
  | "journey"
  | "chapter"
  | "single-moment"
  | "dual-moment"
  | "collage"
  | "sticker-showcase"
  | "together"
  | "heart-collage"
  | "outro";

/**
 * Story act structure
 */
export type StoryAct = "beginning" | "journey" | "together";

/**
 * Couple information for personalization
 */
export interface CoupleInfo {
  name1: string;
  name2: string;
  startDate?: string;
  relationshipLabel?: string; // "together", "married", etc.
}

/**
 * Overall story configuration
 */
export interface StoryConfig {
  couple: CoupleInfo;
  images: SceneImage[];
  totalDuration: number; // in frames
  fps: number;
  quality: "fast" | "balanced" | "premium";
  musicTrack?: string;
  transitionStyle: "smooth" | "dynamic" | "dramatic";
  colorScheme: "warm" | "cool" | "vibrant" | "soft";
}

/**
 * Scene timing information
 */
export interface SceneTiming {
  sceneId: string;
  startFrame: number;
  endFrame: number;
  transitionIn: number;
  transitionOut: number;
}

/**
 * Quality presets affecting visual complexity
 */
export const QUALITY_PRESETS = {
  fast: {
    particles: 20,
    parallaxLayers: 2,
    textAnimation: "word" as const,
    shadowQuality: "low",
    blurQuality: "low",
  },
  balanced: {
    particles: 40,
    parallaxLayers: 3,
    textAnimation: "character" as const,
    shadowQuality: "medium",
    blurQuality: "medium",
  },
  premium: {
    particles: 60,
    parallaxLayers: 4,
    textAnimation: "character" as const,
    shadowQuality: "high",
    blurQuality: "high",
  },
};

/**
 * Color scheme definitions - optimized for readability
 */
export const COLOR_SCHEMES = {
  warm: {
    primary: "#d81b60", // Deep rose - better contrast
    secondary: "#f06292", // Medium rose
    background: "#ffffff", // Pure white for clarity
    accent: "#ff6f00", // Deep orange accent
    text: "#1a1a1a", // Near black for maximum readability
    gradient: ["#880e4f", "#c2185b", "#d81b60"], // Deep to medium gradient
  },
  cool: {
    primary: "#1565c0", // Deep blue
    secondary: "#42a5f5", // Medium blue
    background: "#ffffff",
    accent: "#0097a7", // Teal accent
    text: "#1a1a1a",
    gradient: ["#0d47a1", "#1565c0", "#1976d2"],
  },
  vibrant: {
    primary: "#c2185b", // Vibrant magenta
    secondary: "#e91e63", // Bright pink
    background: "#ffffff",
    accent: "#ff6f00", // Orange accent
    text: "#000000", // Pure black
    gradient: ["#880e4f", "#c2185b", "#e91e63"],
  },
  soft: {
    primary: "#8d6e63", // Warm brown
    secondary: "#a1887f", // Light brown
    background: "#fafafa", // Off white
    accent: "#d7ccc8", // Beige accent
    text: "#3e2723", // Dark brown
    gradient: ["#5d4037", "#6d4c41", "#8d6e63"],
  },
};

export type ColorScheme = keyof typeof COLOR_SCHEMES;
export type QualityPreset = keyof typeof QUALITY_PRESETS;
