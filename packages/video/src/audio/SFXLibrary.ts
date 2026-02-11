/**
 * SFXLibrary - Sound effects library and types
 * Defines all SFX used for transitions and events
 */

export type SFXType =
  | "whoosh-soft"
  | "whoosh-fast"
  | "pop-gentle"
  | "pop-bright"
  | "shimmer"
  | "shimmer-long"
  | "chime-magical"
  | "chime-soft"
  | "swoosh-left"
  | "swoosh-right"
  | "swoosh-up"
  | "swoosh-down"
  | "heartbeat"
  | "sparkle"
  | "reveal"
  | "impact-soft"
  | "transition-smooth"
  | "transition-dramatic";

export interface SFXConfig {
  type: SFXType;
  volume: number;
  startFrame: number;
  duration?: number; // Optional, most SFX are short
  fadeIn?: number;
  fadeOut?: number;
}

export interface SFXDefinition {
  type: SFXType;
  url: string;
  defaultVolume: number;
  durationMs: number;
  category: "transition" | "action" | "ambient" | "ui";
  description: string;
}

/**
 * SFX library definitions
 * URLs point to bundled audio files
 */
export const SFX_LIBRARY: Record<SFXType, SFXDefinition> = {
  "whoosh-soft": {
    type: "whoosh-soft",
    url: "/sfx/whoosh-soft.mp3",
    defaultVolume: 0.5,
    durationMs: 400,
    category: "transition",
    description: "Soft whoosh for gentle transitions",
  },
  "whoosh-fast": {
    type: "whoosh-fast",
    url: "/sfx/whoosh-fast.mp3",
    defaultVolume: 0.6,
    durationMs: 300,
    category: "transition",
    description: "Fast whoosh for dynamic transitions",
  },
  "pop-gentle": {
    type: "pop-gentle",
    url: "/sfx/pop-gentle.mp3",
    defaultVolume: 0.4,
    durationMs: 200,
    category: "action",
    description: "Gentle pop for sticker landing",
  },
  "pop-bright": {
    type: "pop-bright",
    url: "/sfx/pop-bright.mp3",
    defaultVolume: 0.5,
    durationMs: 250,
    category: "action",
    description: "Bright pop for emphasis",
  },
  "shimmer": {
    type: "shimmer",
    url: "/sfx/shimmer.mp3",
    defaultVolume: 0.4,
    durationMs: 600,
    category: "action",
    description: "Sparkle/shimmer for reveals",
  },
  "shimmer-long": {
    type: "shimmer-long",
    url: "/sfx/shimmer-long.mp3",
    defaultVolume: 0.35,
    durationMs: 1200,
    category: "ambient",
    description: "Extended shimmer for magical moments",
  },
  "chime-magical": {
    type: "chime-magical",
    url: "/sfx/chime-magical.mp3",
    defaultVolume: 0.45,
    durationMs: 800,
    category: "action",
    description: "Magical chime for heart effects",
  },
  "chime-soft": {
    type: "chime-soft",
    url: "/sfx/chime-soft.mp3",
    defaultVolume: 0.35,
    durationMs: 600,
    category: "action",
    description: "Soft chime for subtle accents",
  },
  "swoosh-left": {
    type: "swoosh-left",
    url: "/sfx/swoosh-left.mp3",
    defaultVolume: 0.5,
    durationMs: 350,
    category: "transition",
    description: "Directional swoosh from left",
  },
  "swoosh-right": {
    type: "swoosh-right",
    url: "/sfx/swoosh-right.mp3",
    defaultVolume: 0.5,
    durationMs: 350,
    category: "transition",
    description: "Directional swoosh from right",
  },
  "swoosh-up": {
    type: "swoosh-up",
    url: "/sfx/swoosh-up.mp3",
    defaultVolume: 0.5,
    durationMs: 350,
    category: "transition",
    description: "Directional swoosh upward",
  },
  "swoosh-down": {
    type: "swoosh-down",
    url: "/sfx/swoosh-down.mp3",
    defaultVolume: 0.5,
    durationMs: 350,
    category: "transition",
    description: "Directional swoosh downward",
  },
  "heartbeat": {
    type: "heartbeat",
    url: "/sfx/heartbeat.mp3",
    defaultVolume: 0.3,
    durationMs: 800,
    category: "ambient",
    description: "Heartbeat pulse for romantic moments",
  },
  "sparkle": {
    type: "sparkle",
    url: "/sfx/sparkle.mp3",
    defaultVolume: 0.35,
    durationMs: 400,
    category: "action",
    description: "Sparkle for particle effects",
  },
  "reveal": {
    type: "reveal",
    url: "/sfx/reveal.mp3",
    defaultVolume: 0.5,
    durationMs: 700,
    category: "action",
    description: "Reveal sound for photo appearance",
  },
  "impact-soft": {
    type: "impact-soft",
    url: "/sfx/impact-soft.mp3",
    defaultVolume: 0.4,
    durationMs: 300,
    category: "action",
    description: "Soft impact for landing animations",
  },
  "transition-smooth": {
    type: "transition-smooth",
    url: "/sfx/transition-smooth.mp3",
    defaultVolume: 0.45,
    durationMs: 500,
    category: "transition",
    description: "Smooth transition sound",
  },
  "transition-dramatic": {
    type: "transition-dramatic",
    url: "/sfx/transition-dramatic.mp3",
    defaultVolume: 0.55,
    durationMs: 600,
    category: "transition",
    description: "Dramatic transition for climax",
  },
};

/**
 * Get SFX definition by type
 */
export function getSFX(type: SFXType): SFXDefinition {
  return SFX_LIBRARY[type];
}

/**
 * Get all SFX of a category
 */
export function getSFXByCategory(category: SFXDefinition["category"]): SFXDefinition[] {
  return Object.values(SFX_LIBRARY).filter((sfx) => sfx.category === category);
}

/**
 * Get recommended SFX for scene types
 */
export function getRecommendedSFX(sceneType: string, event: string): SFXType[] {
  const recommendations: Record<string, Record<string, SFXType[]>> = {
    intro: {
      enter: ["shimmer-long", "chime-soft"],
      titleReveal: ["shimmer", "reveal"],
    },
    "single-moment": {
      enter: ["whoosh-soft", "reveal"],
      photoReveal: ["shimmer", "pop-gentle"],
    },
    "dual-moment": {
      enter: ["swoosh-left", "swoosh-right"],
      photoReveal: ["pop-gentle", "pop-bright"],
    },
    collage: {
      enter: ["whoosh-fast"],
      stickerLand: ["pop-gentle", "impact-soft"],
    },
    "sticker-showcase": {
      enter: ["whoosh-soft"],
      stickerFlyIn: ["whoosh-fast", "swoosh-left", "swoosh-right"],
      stickerLand: ["pop-gentle", "pop-bright"],
      heartBurst: ["chime-magical", "sparkle"],
    },
    together: {
      enter: ["transition-dramatic"],
      converge: ["shimmer-long", "whoosh-soft"],
      nameReveal: ["chime-magical"],
    },
    "heart-collage": {
      enter: ["chime-soft"],
      photoAppear: ["pop-gentle"],
      pulse: ["heartbeat"],
      complete: ["shimmer-long", "chime-magical"],
    },
    outro: {
      enter: ["transition-smooth"],
      heartAppear: ["chime-magical", "heartbeat"],
      fadeOut: ["shimmer-long"],
    },
  };

  return recommendations[sceneType]?.[event] || ["whoosh-soft"];
}

/**
 * Calculate SFX volume based on position in video
 */
export function calculateSFXVolume(
  baseVolume: number,
  frame: number,
  totalDuration: number,
  musicVolume: number
): number {
  // Reduce SFX volume when music is loud
  const musicDuck = Math.max(0.6, 1 - musicVolume * 0.3);

  // Slight volume increase towards climax
  const progress = frame / totalDuration;
  let positionMultiplier = 1;
  if (progress > 0.7 && progress < 0.9) {
    positionMultiplier = 1.1; // Slightly louder at climax
  }

  return Math.min(1, baseVolume * musicDuck * positionMultiplier);
}

export type { SFXDefinition };
