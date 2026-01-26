import { z } from "zod";

// Available transition types
export const TransitionTypeSchema = z.enum([
  "crossfade",
  "slideLeft",
  "slideRight",
  "slideUp",
  "slideDown",
  "zoom",
  "blur",
  "wipeHorizontal",
  "wipeVertical",
]);

export type TransitionType = z.infer<typeof TransitionTypeSchema>;

// All available transitions for random selection
export const ALL_TRANSITIONS: TransitionType[] = [
  "crossfade",
  "slideLeft",
  "slideRight",
  "slideUp",
  "slideDown",
  "zoom",
  "blur",
  "wipeHorizontal",
  "wipeVertical",
];

// Timeline element types
export const TimelineElementTypeSchema = z.enum(["intro", "image", "outro"]);

export type TimelineElementType = z.infer<typeof TimelineElementTypeSchema>;

// Individual timeline element
export const TimelineElementSchema = z.object({
  id: z.string(),
  type: TimelineElementTypeSchema,
  durationSeconds: z.number().min(1).max(10),
  transitionIn: TransitionTypeSchema.optional(),
  transitionOut: TransitionTypeSchema.optional(),
});

export type TimelineElement = z.infer<typeof TimelineElementSchema>;

// Heart density levels
export const HeartDensitySchema = z.enum(["low", "medium", "high"]);

export type HeartDensity = z.infer<typeof HeartDensitySchema>;

// Global video settings
export const GlobalSettingsSchema = z.object({
  backgroundColor: z.string().default("#0a0a0a"),
  heartDensity: HeartDensitySchema.default("medium"),
});

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

// Complete video timeline configuration
export const VideoTimelineSchema = z.object({
  elements: z.array(TimelineElementSchema),
  globalSettings: GlobalSettingsSchema,
});

export type VideoTimeline = z.infer<typeof VideoTimelineSchema>;

// Props for transition components
export interface TransitionProps {
  progress: number; // 0 to 1
  direction: "in" | "out";
  children: React.ReactNode;
}

// Default durations in seconds
export const DEFAULT_DURATIONS = {
  intro: 4,
  image: 4,
  outro: 4,
  transition: 1,
} as const;

// Heart counts by density
export const HEART_COUNTS: Record<HeartDensity, number> = {
  low: 8,
  medium: 15,
  high: 25,
};
