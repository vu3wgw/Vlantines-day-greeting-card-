/**
 * Valentine Video Package
 * Premium animation system for romantic video creation
 *
 * Includes:
 * - GitHub Unwrapped / Vox-quality animations
 * - Spring physics for natural, bouncy motion
 * - Kinetic typography with character-by-character animation
 * - Sticker/cutout collage system
 * - Premium transitions (ParticleDissolve, HeartWipe, etc.)
 * - Story orchestration with automatic scene selection
 * - Audio system with music and SFX
 */

// Main exports for the video package
export { ValentineVideo } from "./compositions/ValentineVideo";
export { RemotionRoot } from "./Root";

// Component exports
export { ImageSlide, FloatingHearts, OutroSlide } from "./components";

// Type exports
export {
  VIDEO_CONFIG,
  calculateDuration,
  type ImageData,
  type ValentineVideoProps,
  ValentineVideoPropsSchema,
  ImageDataSchema,
  type CoupleInfo,
  type PremiumVideoProps,
  CoupleInfoSchema,
  PremiumVideoPropsSchema,
} from "./types";

// ============ PREMIUM ANIMATION SYSTEM ============

// Animation primitives (springs, easing, interpolators)
export * from "./animation";

// Custom hooks (useSpringValue, useParallax, useStaggeredEntrance)
export * from "./hooks";

// Kinetic typography system
export * from "./typography";

// Visual effects (particles, glow, bokeh)
export * from "./effects";

// Dynamic backgrounds
export * from "./backgrounds";

// Sticker/cutout collage system
export * from "./stickers";

// Premium transitions
export * from "./transitions";

// Scene components (SingleMoment, DualMoment, Collage, etc.)
export * from "./scenes";

// Story orchestration (StoryConfig, SceneSelector, PacingEngine)
export * from "./story";

// Audio system (SFX, Music, Timeline)
export * from "./audio";

// Premium compositions
export {
  ValentineStory,
  SimpleValentineStory,
  PremiumValentineStory,
} from "./story/ValentineStory";
