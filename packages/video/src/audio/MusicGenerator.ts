/**
 * MusicGenerator - ElevenLabs music generation integration
 * Generates romantic background music options for user selection
 */

export interface MusicStyle {
  id: string;
  name: string;
  prompt: string;
  description: string;
  bpm: number;
  mood: "romantic" | "playful" | "cinematic" | "gentle" | "upbeat";
}

export interface GeneratedMusic {
  id: string;
  styleId: string;
  url: string;
  duration: number; // seconds
  generatedAt: Date;
  status: "pending" | "generating" | "ready" | "error";
  errorMessage?: string;
}

/**
 * Predefined music styles for Valentine's videos
 */
export const MUSIC_STYLES: MusicStyle[] = [
  {
    id: "romantic-piano",
    name: "Romantic Piano",
    prompt: "gentle romantic piano melody, emotional, wedding, soft strings, warm, love ballad",
    description: "Classic romantic piano with gentle strings",
    bpm: 72,
    mood: "romantic",
  },
  {
    id: "indie-love",
    name: "Indie Love",
    prompt: "indie acoustic love song, warm guitar, nostalgic, heartfelt, folk romance",
    description: "Warm acoustic guitar with indie folk feel",
    bpm: 95,
    mood: "gentle",
  },
  {
    id: "cinematic-epic",
    name: "Cinematic Epic",
    prompt: "emotional cinematic orchestral, building crescendo, epic love theme, sweeping strings",
    description: "Epic orchestral piece with emotional build",
    bpm: 85,
    mood: "cinematic",
  },
  {
    id: "playful-ukulele",
    name: "Playful Ukulele",
    prompt: "happy ukulele, playful, joyful love, light percussion, cheerful, carefree romance",
    description: "Cheerful ukulele for playful moments",
    bpm: 120,
    mood: "playful",
  },
  {
    id: "modern-rnb",
    name: "Modern R&B",
    prompt: "smooth R&B, romantic, contemporary, sultry vocals, modern love song, chill",
    description: "Smooth contemporary R&B vibes",
    bpm: 90,
    mood: "romantic",
  },
];

/**
 * Get music style by ID
 */
export function getMusicStyle(styleId: string): MusicStyle | undefined {
  return MUSIC_STYLES.find((style) => style.id === styleId);
}

/**
 * Get all music styles
 */
export function getAllMusicStyles(): MusicStyle[] {
  return MUSIC_STYLES;
}

/**
 * Get recommended music style based on video characteristics
 */
export function getRecommendedStyle(options: {
  imageCount: number;
  videoDuration: number;
  colorScheme?: string;
}): MusicStyle {
  const { imageCount, videoDuration, colorScheme } = options;

  // More images = more dynamic music
  if (imageCount > 8) {
    return MUSIC_STYLES.find((s) => s.id === "cinematic-epic")!;
  }

  // Shorter videos = upbeat music
  if (videoDuration < 45) {
    return MUSIC_STYLES.find((s) => s.id === "playful-ukulele")!;
  }

  // Warm color scheme = romantic piano
  if (colorScheme === "warm") {
    return MUSIC_STYLES.find((s) => s.id === "romantic-piano")!;
  }

  // Default to indie love
  return MUSIC_STYLES.find((s) => s.id === "indie-love")!;
}

/**
 * Generate music using ElevenLabs API
 * Note: This is the client-side interface; actual generation happens server-side
 */
export interface MusicGenerationRequest {
  styleId: string;
  duration: number; // seconds
  customPrompt?: string;
}

export interface MusicGenerationResponse {
  requestId: string;
  status: "queued" | "processing" | "completed" | "failed";
  musicUrl?: string;
  errorMessage?: string;
}

/**
 * Create music generation request payload for API
 */
export function createMusicGenerationPayload(
  request: MusicGenerationRequest
): { prompt: string; duration: number } {
  const style = getMusicStyle(request.styleId);

  if (!style) {
    throw new Error(`Unknown music style: ${request.styleId}`);
  }

  const prompt = request.customPrompt
    ? `${style.prompt}, ${request.customPrompt}`
    : style.prompt;

  return {
    prompt,
    duration: request.duration,
  };
}

/**
 * Validate music duration requirements
 */
export function validateMusicDuration(duration: number): string | null {
  if (duration < 15) {
    return "Music duration must be at least 15 seconds";
  }

  if (duration > 300) {
    return "Music duration cannot exceed 5 minutes";
  }

  return null;
}

/**
 * Calculate recommended music duration based on video
 */
export function getRecommendedMusicDuration(videoDuration: number): number {
  // Music should be slightly longer than video to allow for fade
  return Math.ceil(videoDuration + 3);
}

/**
 * ElevenLabs API configuration
 */
export interface ElevenLabsConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * Music generation state for UI
 */
export interface MusicGenerationState {
  selectedStyleId: string | null;
  generatedTracks: Map<string, GeneratedMusic>;
  isGenerating: boolean;
  currentRequest: MusicGenerationRequest | null;
  error: string | null;
}

/**
 * Create initial music generation state
 */
export function createInitialMusicState(): MusicGenerationState {
  return {
    selectedStyleId: null,
    generatedTracks: new Map(),
    isGenerating: false,
    currentRequest: null,
    error: null,
  };
}

/**
 * Format music duration for display
 */
export function formatMusicDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get mood emoji for music style
 */
export function getMoodEmoji(mood: MusicStyle["mood"]): string {
  const emojis: Record<MusicStyle["mood"], string> = {
    romantic: "💕",
    playful: "🎵",
    cinematic: "🎬",
    gentle: "🌸",
    upbeat: "✨",
  };
  return emojis[mood];
}
