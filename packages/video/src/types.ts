import { z } from "zod";

export const ImageDataSchema = z.object({
  url: z.string(),
  caption: z.string(),
  date: z.string().optional(),
});

export type ImageData = z.infer<typeof ImageDataSchema>;

export const ValentineVideoPropsSchema = z.object({
  images: z.array(ImageDataSchema).min(5).max(10),
  coupleName: z.string().optional(),
  seed: z.number().optional(), // Seed for random variations - makes each video unique
});

export type ValentineVideoProps = z.infer<typeof ValentineVideoPropsSchema>;

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

  // Calculate where images start (overlapping with intro)
  const imagesStartFrame = introDurationFrames - transitionDurationFrames;

  // Calculate where outro starts (overlapping with last image)
  const outroStart =
    imagesStartFrame +
    imageCount * imageDurationFrames -
    (imageCount - 1) * transitionDurationFrames -
    transitionDurationFrames;

  // Total duration is outro start + outro duration
  return outroStart + outroDurationFrames;
}
