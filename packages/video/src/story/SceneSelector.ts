/**
 * SceneSelector - Intelligent scene assignment for images
 * Determines which scene type to use for each part of the video
 */

import { random } from "remotion";
import type {
  SceneType,
  SceneMeta,
  SceneTiming,
  StoryAct,
  SceneImage,
  StoryConfig,
} from "../scenes/types";
import {
  STORY_ARC,
  DEFAULT_SCENE_DURATIONS,
  SCENE_WEIGHTS,
  getRecommendedScenesForAct,
  getTransitionDuration,
} from "./StoryConfig";

export interface SceneAssignment {
  sceneId: string;
  type: SceneType;
  images: SceneImage[];
  startFrame: number;
  duration: number;
  transitionIn: number;
  transitionOut: number;
  act: StoryAct;
}

/**
 * Select and arrange scenes for the entire video
 */
export function selectScenes(config: StoryConfig, seed: string = "valentine"): SceneAssignment[] {
  const { images, totalDuration, fps, transitionStyle } = config;
  const assignments: SceneAssignment[] = [];

  // Calculate act boundaries
  const beginningEnd = Math.round(totalDuration * STORY_ARC.beginning);
  const journeyEnd = beginningEnd + Math.round(totalDuration * STORY_ARC.journey);

  let currentFrame = 0;
  let imageIndex = 0;

  // ============ ACT 1: BEGINNING ============
  // Intro scene (no images)
  const introDuration = Math.min(DEFAULT_SCENE_DURATIONS.intro, beginningEnd * 0.6);
  assignments.push({
    sceneId: `intro-${seed}`,
    type: "intro",
    images: [],
    startFrame: currentFrame,
    duration: introDuration,
    transitionIn: 0,
    transitionOut: getTransitionDuration(transitionStyle, currentFrame, totalDuration, fps),
    act: "beginning",
  });
  currentFrame += introDuration;

  // First image gets premium single-moment treatment
  if (imageIndex < images.length && currentFrame < beginningEnd) {
    const duration = Math.min(
      DEFAULT_SCENE_DURATIONS["single-moment"],
      beginningEnd - currentFrame
    );
    assignments.push({
      sceneId: `first-moment-${seed}`,
      type: "single-moment",
      images: [images[imageIndex]],
      startFrame: currentFrame,
      duration,
      transitionIn: getTransitionDuration(transitionStyle, currentFrame, totalDuration, fps),
      transitionOut: getTransitionDuration(transitionStyle, currentFrame + duration, totalDuration, fps),
      act: "beginning",
    });
    currentFrame += duration;
    imageIndex++;
  }

  // ============ ACT 2: JOURNEY ============
  // Distribute remaining images (except last 2 for climax)
  const journeyImages = images.slice(imageIndex, Math.max(imageIndex, images.length - 2));
  const availableJourneyFrames = journeyEnd - currentFrame;
  const imagesForJourney = journeyImages.length;

  if (imagesForJourney > 0) {
    const journeyScenes = planJourneyScenes(
      journeyImages,
      availableJourneyFrames,
      fps,
      transitionStyle,
      totalDuration,
      seed
    );

    for (const scene of journeyScenes) {
      assignments.push({
        ...scene,
        startFrame: currentFrame,
        act: "journey",
      });
      currentFrame += scene.duration;
      imageIndex += scene.images.length;
    }
  }

  // ============ ACT 3: TOGETHER ============
  const remainingImages = images.slice(imageIndex);
  const availableTogetherFrames = totalDuration - currentFrame;

  // Together scene with converging stickers
  if (remainingImages.length > 0) {
    const togetherDuration = Math.min(
      DEFAULT_SCENE_DURATIONS.together,
      availableTogetherFrames * 0.4
    );
    assignments.push({
      sceneId: `together-${seed}`,
      type: "together",
      images: remainingImages,
      startFrame: currentFrame,
      duration: togetherDuration,
      transitionIn: getTransitionDuration(transitionStyle, currentFrame, totalDuration, fps),
      transitionOut: getTransitionDuration(transitionStyle, currentFrame + togetherDuration, totalDuration, fps),
      act: "together",
    });
    currentFrame += togetherDuration;
  }

  // Heart collage (if we have enough images)
  if (images.length >= 4 && currentFrame < totalDuration - DEFAULT_SCENE_DURATIONS.outro - 30) {
    const heartDuration = Math.min(
      DEFAULT_SCENE_DURATIONS["heart-collage"],
      totalDuration - currentFrame - DEFAULT_SCENE_DURATIONS.outro
    );
    assignments.push({
      sceneId: `heart-collage-${seed}`,
      type: "heart-collage",
      images: images.slice(0, 8), // Use up to 8 images
      startFrame: currentFrame,
      duration: heartDuration,
      transitionIn: getTransitionDuration(transitionStyle, currentFrame, totalDuration, fps),
      transitionOut: getTransitionDuration(transitionStyle, currentFrame + heartDuration, totalDuration, fps),
      act: "together",
    });
    currentFrame += heartDuration;
  }

  // Outro scene
  const outroDuration = Math.max(
    90, // Minimum 3 seconds
    totalDuration - currentFrame
  );
  assignments.push({
    sceneId: `outro-${seed}`,
    type: "outro",
    images: [],
    startFrame: currentFrame,
    duration: outroDuration,
    transitionIn: getTransitionDuration(transitionStyle, currentFrame, totalDuration, fps),
    transitionOut: 0,
    act: "together",
  });

  return assignments;
}

/**
 * Plan scene arrangement for the journey act
 * Balances variety, pacing, and image usage
 */
function planJourneyScenes(
  images: SceneImage[],
  availableFrames: number,
  fps: number,
  transitionStyle: "smooth" | "dynamic" | "dramatic",
  totalDuration: number,
  seed: string
): Omit<SceneAssignment, "startFrame" | "act">[] {
  const scenes: Omit<SceneAssignment, "startFrame" | "act">[] = [];
  let remainingImages = [...images];
  let remainingFrames = availableFrames;
  let sceneIndex = 0;

  // Scene type rotation to ensure variety
  const sceneRotation: SceneType[] = [
    "single-moment",
    "dual-moment",
    "sticker-showcase",
    "collage",
    "single-moment",
    "dual-moment",
  ];

  while (remainingImages.length > 0 && remainingFrames > fps * 3) {
    // Select scene type based on rotation and available images
    let sceneType = sceneRotation[sceneIndex % sceneRotation.length];

    // Adjust based on remaining images
    if (remainingImages.length === 1) {
      sceneType = "single-moment";
    } else if (remainingImages.length === 2) {
      sceneType = random(`${seed}-${sceneIndex}`) > 0.5 ? "dual-moment" : "single-moment";
    } else if (remainingImages.length >= 3 && random(`${seed}-collage-${sceneIndex}`) > 0.7) {
      sceneType = "collage";
    }

    // Determine how many images this scene uses
    let imageCount: number;
    switch (sceneType) {
      case "single-moment":
        imageCount = 1;
        break;
      case "dual-moment":
        imageCount = Math.min(2, remainingImages.length);
        break;
      case "sticker-showcase":
        imageCount = Math.min(4, remainingImages.length);
        break;
      case "collage":
        imageCount = Math.min(4, remainingImages.length);
        break;
      default:
        imageCount = 1;
    }

    // Get images for this scene
    const sceneImages = remainingImages.slice(0, imageCount);
    remainingImages = remainingImages.slice(imageCount);

    // Calculate duration
    let duration = DEFAULT_SCENE_DURATIONS[sceneType];

    // Adjust duration based on remaining frames and scenes
    const estimatedRemainingScenes = Math.ceil(remainingImages.length / 2);
    const avgFramesPerScene = remainingFrames / (estimatedRemainingScenes + 1);

    duration = Math.min(duration, Math.max(fps * 3, avgFramesPerScene));

    // Create scene assignment
    scenes.push({
      sceneId: `journey-${sceneIndex}-${seed}`,
      type: sceneType,
      images: sceneImages,
      duration: Math.round(duration),
      transitionIn: getTransitionDuration(transitionStyle, 0, totalDuration, fps),
      transitionOut: getTransitionDuration(transitionStyle, duration, totalDuration, fps),
    });

    remainingFrames -= duration;
    sceneIndex++;
  }

  return scenes;
}

/**
 * Get scene assignments as timing information
 */
export function getSceneTimings(assignments: SceneAssignment[]): SceneTiming[] {
  return assignments.map((assignment) => ({
    sceneId: assignment.sceneId,
    startFrame: assignment.startFrame,
    endFrame: assignment.startFrame + assignment.duration,
    transitionIn: assignment.transitionIn,
    transitionOut: assignment.transitionOut,
  }));
}

/**
 * Find which scene is active at a given frame
 */
export function getActiveScene(
  assignments: SceneAssignment[],
  frame: number
): SceneAssignment | null {
  for (const assignment of assignments) {
    const endFrame = assignment.startFrame + assignment.duration;
    if (frame >= assignment.startFrame && frame < endFrame) {
      return assignment;
    }
  }
  return null;
}

/**
 * Get progress within a scene (0-1)
 */
export function getSceneProgress(
  assignment: SceneAssignment,
  frame: number
): number {
  const relativeFrame = frame - assignment.startFrame;
  return Math.max(0, Math.min(1, relativeFrame / assignment.duration));
}

/**
 * Check if we're in a transition period
 */
export function isInTransition(
  assignments: SceneAssignment[],
  frame: number
): { inTransition: boolean; progress: number; fromScene?: SceneAssignment; toScene?: SceneAssignment } {
  for (let i = 0; i < assignments.length - 1; i++) {
    const current = assignments[i];
    const next = assignments[i + 1];

    const transitionStart = current.startFrame + current.duration - current.transitionOut;
    const transitionEnd = next.startFrame + next.transitionIn;

    if (frame >= transitionStart && frame < transitionEnd) {
      const transitionDuration = transitionEnd - transitionStart;
      const progress = (frame - transitionStart) / transitionDuration;

      return {
        inTransition: true,
        progress,
        fromScene: current,
        toScene: next,
      };
    }
  }

  return { inTransition: false, progress: 0 };
}

export type { SceneAssignment };
