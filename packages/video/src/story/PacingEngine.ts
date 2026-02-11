/**
 * PacingEngine - Dynamic timing and rhythm control
 * Adjusts scene durations and intensities for optimal flow
 */

import type { SceneAssignment } from "./SceneSelector";
import type { StoryConfig, QualityPreset } from "../scenes/types";
import { getIntensityForFrame } from "./StoryConfig";

export interface PacingAdjustment {
  sceneDurationMultiplier: number;
  transitionDurationMultiplier: number;
  particleIntensity: number;
  motionIntensity: number;
}

/**
 * Calculate pacing adjustments based on position in video
 */
export function getPacingForFrame(
  frame: number,
  totalDuration: number,
  fps: number
): PacingAdjustment {
  const progress = frame / totalDuration;
  const intensity = getIntensityForFrame(frame, totalDuration);

  // Scene duration: longer at start and end, faster in middle
  let sceneDurationMultiplier = 1;
  if (progress < 0.15) {
    sceneDurationMultiplier = 1.2; // Slower start
  } else if (progress > 0.5 && progress < 0.75) {
    sceneDurationMultiplier = 0.85; // Faster middle
  } else if (progress > 0.9) {
    sceneDurationMultiplier = 1.1; // Slower ending
  }

  // Transition duration: smoother at start, quicker during journey
  let transitionDurationMultiplier = 1;
  if (progress < 0.2) {
    transitionDurationMultiplier = 1.3;
  } else if (progress > 0.3 && progress < 0.8) {
    transitionDurationMultiplier = 0.9;
  }

  // Particle intensity follows overall intensity
  const particleIntensity = intensity;

  // Motion intensity: more movement in middle, calmer at bookends
  let motionIntensity = 0.8;
  if (progress < 0.15) {
    motionIntensity = 0.6;
  } else if (progress > 0.4 && progress < 0.85) {
    motionIntensity = 1 + (intensity - 0.5) * 0.5;
  } else if (progress > 0.9) {
    motionIntensity = 0.7;
  }

  return {
    sceneDurationMultiplier,
    transitionDurationMultiplier,
    particleIntensity,
    motionIntensity,
  };
}

/**
 * Apply pacing adjustments to scene assignments
 */
export function applyPacingToScenes(
  assignments: SceneAssignment[],
  totalDuration: number,
  fps: number
): SceneAssignment[] {
  return assignments.map((assignment) => {
    const pacing = getPacingForFrame(assignment.startFrame, totalDuration, fps);

    return {
      ...assignment,
      duration: Math.round(assignment.duration * pacing.sceneDurationMultiplier),
      transitionIn: Math.round(assignment.transitionIn * pacing.transitionDurationMultiplier),
      transitionOut: Math.round(assignment.transitionOut * pacing.transitionDurationMultiplier),
    };
  });
}

/**
 * Calculate ideal beat timing for music sync
 * Returns array of frame numbers where beats should occur
 */
export function calculateBeatFrames(
  totalDuration: number,
  fps: number,
  bpm: number = 120
): number[] {
  const beatFrames: number[] = [];
  const framesPerBeat = (60 / bpm) * fps;

  for (let frame = 0; frame < totalDuration; frame += framesPerBeat) {
    beatFrames.push(Math.round(frame));
  }

  return beatFrames;
}

/**
 * Align scene transitions to nearest beat
 */
export function alignToBeat(
  frame: number,
  beatFrames: number[],
  tolerance: number = 5
): number {
  let nearestBeat = frame;
  let minDistance = Infinity;

  for (const beat of beatFrames) {
    const distance = Math.abs(beat - frame);
    if (distance < minDistance && distance <= tolerance) {
      minDistance = distance;
      nearestBeat = beat;
    }
  }

  return nearestBeat;
}

/**
 * Get quality-adjusted particle counts
 */
export function getParticleCount(
  baseCount: number,
  quality: QualityPreset,
  intensity: number
): number {
  const qualityMultipliers = {
    fast: 0.5,
    balanced: 0.75,
    premium: 1,
  };

  return Math.round(baseCount * qualityMultipliers[quality] * intensity);
}

/**
 * Calculate Ken Burns effect parameters based on pacing
 */
export function getKenBurnsParams(
  frame: number,
  sceneDuration: number,
  intensity: number
): { scale: number; x: number; y: number } {
  const progress = frame / sceneDuration;

  // Gentle zoom and pan
  const baseScale = 1 + intensity * 0.1;
  const scale = baseScale + progress * intensity * 0.05;

  // Pan direction varies
  const x = Math.sin(progress * Math.PI) * intensity * 20;
  const y = Math.cos(progress * Math.PI * 0.5) * intensity * 15;

  return { scale, x, y };
}

/**
 * Calculate motion blur amount based on motion intensity
 */
export function getMotionBlur(motionIntensity: number, isTransition: boolean): number {
  if (!isTransition) return 0;

  // Light motion blur during transitions
  return motionIntensity * 2; // 0-2px blur
}

/**
 * Get spring config adjustments based on pacing
 */
export function getSpringAdjustment(motionIntensity: number): {
  stiffnessMultiplier: number;
  dampingMultiplier: number;
} {
  // Higher intensity = snappier springs
  return {
    stiffnessMultiplier: 0.8 + motionIntensity * 0.4,
    dampingMultiplier: 1.2 - motionIntensity * 0.3,
  };
}

/**
 * Calculate fade timing for smooth scene transitions
 */
export function calculateFadeTiming(
  frame: number,
  sceneStart: number,
  sceneDuration: number,
  transitionIn: number,
  transitionOut: number
): { fadeIn: number; fadeOut: number } {
  const relativeFrame = frame - sceneStart;

  // Fade in at start
  let fadeIn = 1;
  if (relativeFrame < transitionIn) {
    fadeIn = relativeFrame / transitionIn;
  }

  // Fade out at end
  let fadeOut = 1;
  const fadeOutStart = sceneDuration - transitionOut;
  if (relativeFrame > fadeOutStart) {
    fadeOut = 1 - (relativeFrame - fadeOutStart) / transitionOut;
  }

  return {
    fadeIn: Math.max(0, Math.min(1, fadeIn)),
    fadeOut: Math.max(0, Math.min(1, fadeOut)),
  };
}

/**
 * Generate easing curve based on scene type and position
 */
export function getSceneEasing(
  sceneType: string,
  progress: number,
  motionIntensity: number
): number {
  // Ease out for most scenes
  let eased = 1 - Math.pow(1 - progress, 2 + motionIntensity);

  // Special handling for intro/outro
  if (sceneType === "intro" || sceneType === "outro") {
    // Smoother easing
    eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  }

  return eased;
}
