import React from "react";
import { Audio, useCurrentFrame, useVideoConfig, interpolate, Sequence } from "remotion";
import type { AudioEvent, MusicTrack, AudioTimelineConfig } from "./AudioTimeline";
import { generateMusicKeyframes, getMusicVolumeAtFrame, generateAudioTimeline } from "./AudioTimeline";
import { getSFX, SFXType } from "./SFXLibrary";
import type { SceneAssignment } from "../story/SceneSelector";

export interface AudioCompositionProps {
  sceneAssignments: SceneAssignment[];
  musicTrack?: MusicTrack;
  config: AudioTimelineConfig;
}

/**
 * AudioComposition - Renders all audio for the video
 * Handles music and SFX with proper timing and volume
 */
export const AudioComposition: React.FC<AudioCompositionProps> = ({
  sceneAssignments,
  musicTrack,
  config,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // Generate audio timeline
  const audioEvents = React.useMemo(
    () => generateAudioTimeline(sceneAssignments, fps, config),
    [sceneAssignments, fps, config]
  );

  // Generate music keyframes
  const musicKeyframes = React.useMemo(
    () => generateMusicKeyframes(durationInFrames, fps, config.musicVolume),
    [durationInFrames, fps, config.musicVolume]
  );

  return (
    <>
      {/* Background Music */}
      {musicTrack && (
        <MusicLayer
          track={musicTrack}
          keyframes={musicKeyframes}
          masterVolume={config.masterVolume}
        />
      )}

      {/* SFX Layer */}
      {config.enableSFX && (
        <SFXLayer
          events={audioEvents}
          masterVolume={config.masterVolume}
        />
      )}
    </>
  );
};

/**
 * MusicLayer - Handles background music with volume automation
 */
const MusicLayer: React.FC<{
  track: MusicTrack;
  keyframes: { frame: number; volume: number }[];
  masterVolume: number;
}> = ({ track, keyframes, masterVolume }) => {
  const frame = useCurrentFrame();

  // Calculate current volume
  const currentVolume = getMusicVolumeAtFrame(frame, keyframes) * masterVolume;

  return (
    <Audio
      src={track.url}
      volume={currentVolume}
      startFrom={0}
    />
  );
};

/**
 * SFXLayer - Renders all sound effects
 */
const SFXLayer: React.FC<{
  events: AudioEvent[];
  masterVolume: number;
}> = ({ events, masterVolume }) => {
  const { fps } = useVideoConfig();

  return (
    <>
      {events
        .filter((event) => event.type === "sfx" && event.sfxType)
        .map((event) => {
          const sfxDef = getSFX(event.sfxType!);
          const durationFrames = Math.ceil(sfxDef.durationMs / 1000 * fps);

          return (
            <Sequence
              key={event.id}
              from={event.startFrame}
              durationInFrames={durationFrames}
              name={`sfx-${event.sfxType}`}
            >
              <SFXPlayer
                sfxType={event.sfxType!}
                volume={event.volume * masterVolume}
                fadeIn={event.fadeIn}
                fadeOut={event.fadeOut}
              />
            </Sequence>
          );
        })}
    </>
  );
};

/**
 * SFXPlayer - Individual SFX with fade support
 */
const SFXPlayer: React.FC<{
  sfxType: SFXType;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ sfxType, volume, fadeIn = 0, fadeOut = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sfxDef = getSFX(sfxType);
  const durationFrames = Math.ceil(sfxDef.durationMs / 1000 * fps);

  // Calculate volume with fades
  let currentVolume = volume;

  if (fadeIn > 0 && frame < fadeIn) {
    currentVolume = interpolate(frame, [0, fadeIn], [0, volume]);
  }

  if (fadeOut > 0 && frame > durationFrames - fadeOut) {
    currentVolume = interpolate(
      frame,
      [durationFrames - fadeOut, durationFrames],
      [volume, 0],
      { extrapolateRight: "clamp" }
    );
  }

  return (
    <Audio
      src={sfxDef.url}
      volume={Math.max(0, currentVolume)}
    />
  );
};

/**
 * SimpleAudioComposition - Simplified audio without SFX
 */
export const SimpleAudioComposition: React.FC<{
  musicUrl: string;
  volume?: number;
}> = ({ musicUrl, volume = 0.7 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Simple fade in/out
  const fadeInFrames = 2 * fps;
  const fadeOutFrames = 3 * fps;

  let currentVolume = volume;

  // Fade in
  if (frame < fadeInFrames) {
    currentVolume = interpolate(frame, [0, fadeInFrames], [0, volume]);
  }

  // Fade out
  if (frame > durationInFrames - fadeOutFrames) {
    currentVolume = interpolate(
      frame,
      [durationInFrames - fadeOutFrames, durationInFrames],
      [volume, 0]
    );
  }

  return <Audio src={musicUrl} volume={currentVolume} />;
};

/**
 * AudioPreview - Component for previewing audio in the wizard
 */
export const AudioPreview: React.FC<{
  audioUrl: string;
  isPlaying: boolean;
  volume?: number;
}> = ({ audioUrl, isPlaying, volume = 0.7 }) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Autoplay blocked, user needs to interact first
        });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      preload="auto"
      style={{ display: "none" }}
    />
  );
};

/**
 * Create default audio configuration
 */
export function createDefaultAudioConfig(): AudioTimelineConfig {
  return {
    masterVolume: 1,
    musicVolume: 0.7,
    sfxVolume: 0.5,
    enableSFX: true,
  };
}

/**
 * Audio configuration presets
 */
export const AUDIO_PRESETS = {
  balanced: {
    masterVolume: 1,
    musicVolume: 0.7,
    sfxVolume: 0.5,
    enableSFX: true,
  },
  musicFocused: {
    masterVolume: 1,
    musicVolume: 0.85,
    sfxVolume: 0.3,
    enableSFX: true,
  },
  sfxHeavy: {
    masterVolume: 1,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    enableSFX: true,
  },
  quiet: {
    masterVolume: 0.6,
    musicVolume: 0.6,
    sfxVolume: 0.4,
    enableSFX: true,
  },
  musicOnly: {
    masterVolume: 1,
    musicVolume: 0.8,
    sfxVolume: 0,
    enableSFX: false,
  },
};

export type AudioPreset = keyof typeof AUDIO_PRESETS;
