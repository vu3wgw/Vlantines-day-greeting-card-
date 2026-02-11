import { z } from "zod";

export const ImageDataSchema = z.object({
  url: z.string(),
  caption: z.string(),
  date: z.string().optional(),
  daysSince: z.number().optional(), // Days since this moment
  context: z.string().optional(), // Original context from user
  stickerUrl: z.string().optional(), // Background-removed version
  isFavorite: z.boolean().optional(),
});

export type ImageData = z.infer<typeof ImageDataSchema>;

export const ValentineVideoPropsSchema = z.object({
  images: z.array(ImageDataSchema).min(2).max(15),
  coupleName: z.string().optional(),
  seed: z.number().optional(), // Seed for random variations - makes each video unique
});

export type ValentineVideoProps = z.infer<typeof ValentineVideoPropsSchema>;

// Premium Valentine Story Schema
export const CoupleInfoSchema = z.object({
  name1: z.string(),
  name2: z.string(),
  startDate: z.string(), // Required - relationship start date
  relationshipLabel: z.string().optional(),
});

export type CoupleInfo = z.infer<typeof CoupleInfoSchema>;

export const PremiumVideoPropsSchema = z.object({
  couple: CoupleInfoSchema,
  images: z.array(ImageDataSchema).min(2).max(15),
  colorScheme: z.enum(["warm", "cool", "vibrant", "soft"]).optional(),
  quality: z.enum(["fast", "balanced", "premium"]).optional(),
  transitionStyle: z.enum(["smooth", "dynamic", "dramatic"]).optional(),
  musicUrl: z.string().optional(),
  seed: z.string().optional(),
});

export type PremiumVideoProps = z.infer<typeof PremiumVideoPropsSchema>;

// Video configuration constants
export const VIDEO_CONFIG = {
  fps: 30,
  width: 1080,
  height: 1920, // 9:16 aspect ratio for social media
  introDurationFrames: 4 * 30, // 4 second intro
  imageDurationFrames: 4 * 30, // 4 seconds per image
  transitionDurationFrames: 1 * 30, // 1 second transition
  outroDurationFrames: 4 * 30, // 4 second outro
} as const;

// Calculate total duration based on image count
export function calculateDuration(imageCount: number): number {
  const { introDurationFrames, imageDurationFrames, transitionDurationFrames, outroDurationFrames } = VIDEO_CONFIG;

  // Calculate where images start (overlapping more with intro for better first image visibility)
  const imagesStartFrame = introDurationFrames - transitionDurationFrames * 2;

  // Calculate where outro starts (overlapping with last image)
  const outroStart =
    imagesStartFrame +
    imageCount * imageDurationFrames -
    (imageCount - 1) * transitionDurationFrames -
    transitionDurationFrames;

  // Total duration is outro start + outro duration
  return outroStart + outroDurationFrames;
}

// Green screen region schema for hybrid videos
export const GreenScreenRegionSchema = z.object({
  index: z.number().int(),
  startFrame: z.number().int().min(0),
  endFrame: z.number().int().min(0),
  position: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1),
  }),
  fitMode: z.enum(["cover", "contain", "fill"]).default("cover"),
});

export type GreenScreenRegion = z.infer<typeof GreenScreenRegionSchema>;

// Hybrid video props schema (real video + Remotion overlays)
export const HybridVideoPropsSchema = z.object({
  compositedVideoUrl: z.string(),
  images: z.array(ImageDataSchema).min(1).max(15),
  coupleName: z.string().optional(),
  overlayStyle: z.enum(["minimal", "romantic", "cinematic"]).default("romantic"),
  seed: z.number().optional(),
});

export type HybridVideoProps = z.infer<typeof HybridVideoPropsSchema>;
