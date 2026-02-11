/**
 * AudioTimeline - SFX synchronization with scene transitions
 * Generates a timeline of audio events based on scene assignments
 */

import type { SceneAssignment } from "../story/SceneSelector";
import type { SFXType, SFXConfig } from "./SFXLibrary";
import { getSFX, getRecommendedSFX } from "./SFXLibrary";

export interface AudioEvent {
  id: string;
  type: "sfx" | "music";
  startFrame: number;
  endFrame?: number;
  sfxType?: SFXType;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface MusicTrack {
  url: string;
  name: string;
  bpm: number;
  duration: number; // in seconds
  style: string;
}

export interface AudioTimelineConfig {
  musicTrack?: MusicTrack;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  enableSFX: boolean;
}

/**
 * Generate audio events for all scenes
 */
export function generateAudioTimeline(
  sceneAssignments: SceneAssignment[],
  fps: number,
  config: AudioTimelineConfig
): AudioEvent[] {
  const events: AudioEvent[] = [];

  if (!config.enableSFX) {
    return events;
  }

  let eventIndex = 0;

  for (const scene of sceneAssignments) {
    const sceneEvents = generateSceneAudioEvents(
      scene,
      fps,
      config.sfxVolume,
      eventIndex
    );

    events.push(...sceneEvents);
    eventIndex += sceneEvents.length;
  }

  return events;
}

/**
 * Generate audio events for a single scene
 */
function generateSceneAudioEvents(
  scene: SceneAssignment,
  fps: number,
  baseVolume: number,
  startIndex: number
): AudioEvent[] {
  const events: AudioEvent[] = [];
  let eventIndex = startIndex;

  // Scene entry SFX
  const entrySFX = getRecommendedSFX(scene.type, "enter");
  if (entrySFX.length > 0) {
    const sfxType = entrySFX[0];
    const sfxDef = getSFX(sfxType);

    events.push({
      id: `sfx-${eventIndex++}`,
      type: "sfx",
      startFrame: scene.startFrame + Math.round(scene.transitionIn * 0.3),
      sfxType,
      volume: sfxDef.defaultVolume * baseVolume,
    });
  }

  // Scene-specific events
  switch (scene.type) {
    case "intro":
      // Title reveal shimmer
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 45, // After initial animation
        sfxType: "shimmer",
        volume: 0.4 * baseVolume,
      });
      break;

    case "sticker-showcase":
      // Staggered pops for each sticker
      const stickerCount = Math.min(scene.images.length, 4);
      for (let i = 0; i < stickerCount; i++) {
        events.push({
          id: `sfx-${eventIndex++}`,
          type: "sfx",
          startFrame: scene.startFrame + 15 + i * 8, // Staggered
          sfxType: i % 2 === 0 ? "pop-gentle" : "pop-bright",
          volume: (0.35 + i * 0.05) * baseVolume, // Slightly increasing volume
        });
      }

      // Heart burst if present
      if (scene.images.length >= 2) {
        events.push({
          id: `sfx-${eventIndex++}`,
          type: "sfx",
          startFrame: scene.startFrame + 55,
          sfxType: "chime-magical",
          volume: 0.45 * baseVolume,
        });
      }
      break;

    case "dual-moment":
      // Two whooshes for side entry
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 8,
        sfxType: "swoosh-left",
        volume: 0.5 * baseVolume,
      });
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 16,
        sfxType: "swoosh-right",
        volume: 0.5 * baseVolume,
      });
      break;

    case "collage":
      // Quick staggered pops
      for (let i = 0; i < Math.min(scene.images.length, 4); i++) {
        events.push({
          id: `sfx-${eventIndex++}`,
          type: "sfx",
          startFrame: scene.startFrame + 10 + i * 6,
          sfxType: "pop-gentle",
          volume: 0.35 * baseVolume,
        });
      }
      break;

    case "together":
      // Dramatic transition
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 5,
        sfxType: "transition-dramatic",
        volume: 0.55 * baseVolume,
      });

      // Convergence shimmer
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 60,
        sfxType: "shimmer-long",
        volume: 0.4 * baseVolume,
      });

      // Name reveal chime
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 70,
        sfxType: "chime-magical",
        volume: 0.5 * baseVolume,
      });
      break;

    case "heart-collage":
      // Staggered gentle pops
      for (let i = 0; i < Math.min(scene.images.length, 8); i++) {
        events.push({
          id: `sfx-${eventIndex++}`,
          type: "sfx",
          startFrame: scene.startFrame + 10 + i * 5,
          sfxType: "pop-gentle",
          volume: 0.3 * baseVolume,
        });
      }

      // Completion chime
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 80,
        sfxType: "chime-magical",
        volume: 0.5 * baseVolume,
      });

      // Heartbeat pulse
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 90,
        sfxType: "heartbeat",
        volume: 0.35 * baseVolume,
      });
      break;

    case "outro":
      // Soft transition
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 10,
        sfxType: "transition-smooth",
        volume: 0.4 * baseVolume,
      });

      // Heart chime
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + 70,
        sfxType: "chime-soft",
        volume: 0.4 * baseVolume,
      });

      // Final shimmer
      events.push({
        id: `sfx-${eventIndex++}`,
        type: "sfx",
        startFrame: scene.startFrame + scene.duration - 60,
        sfxType: "shimmer-long",
        volume: 0.3 * baseVolume,
        fadeOut: 30,
      });
      break;
  }

  return events;
}

/**
 * Generate music volume keyframes
 * Creates fade in/out and intensity adjustments
 */
export function generateMusicKeyframes(
  totalDuration: number,
  fps: number,
  baseVolume: number
): { frame: number; volume: number }[] {
  const keyframes: { frame: number; volume: number }[] = [];

  // Fade in (first 2 seconds)
  const fadeInEnd = 2 * fps;
  keyframes.push({ frame: 0, volume: 0 });
  keyframes.push({ frame: fadeInEnd, volume: baseVolume });

  // Build to climax (70-85% of video)
  const climaxStart = Math.round(totalDuration * 0.7);
  const climaxPeak = Math.round(totalDuration * 0.85);
  keyframes.push({ frame: climaxStart, volume: baseVolume });
  keyframes.push({ frame: climaxPeak, volume: baseVolume * 1.15 }); // Slight boost

  // Fade out (last 3 seconds)
  const fadeOutStart = totalDuration - 3 * fps;
  keyframes.push({ frame: fadeOutStart, volume: baseVolume });
  keyframes.push({ frame: totalDuration, volume: 0 });

  return keyframes;
}

/**
 * Get music volume at a specific frame
 */
export function getMusicVolumeAtFrame(
  frame: number,
  keyframes: { frame: number; volume: number }[]
): number {
  // Find surrounding keyframes
  let prevKeyframe = keyframes[0];
  let nextKeyframe = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame >= keyframes[i].frame && frame < keyframes[i + 1].frame) {
      prevKeyframe = keyframes[i];
      nextKeyframe = keyframes[i + 1];
      break;
    }
  }

  // Interpolate
  const progress = (frame - prevKeyframe.frame) / (nextKeyframe.frame - prevKeyframe.frame || 1);
  return prevKeyframe.volume + (nextKeyframe.volume - prevKeyframe.volume) * progress;
}

/**
 * Get active audio events for a frame
 */
export function getActiveAudioEvents(
  frame: number,
  events: AudioEvent[],
  fps: number
): AudioEvent[] {
  return events.filter((event) => {
    const sfxDef = event.sfxType ? getSFX(event.sfxType) : null;
    const duration = sfxDef ? Math.round(sfxDef.durationMs / 1000 * fps) : 30;
    const endFrame = event.endFrame || event.startFrame + duration;

    return frame >= event.startFrame && frame < endFrame;
  });
}

export type { AudioEvent, MusicTrack, AudioTimelineConfig };
