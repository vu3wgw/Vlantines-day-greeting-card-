// Main exports for the video package
export { ValentineVideo } from "./compositions/ValentineVideo";
export { GreenScreenVideo, greenScreenVideoSchema } from "./compositions/GreenScreenVideo";
export { GREEN_SCREEN_SLOTS, GREEN_SCREEN_CONFIG } from "./compositions/greenScreenConstants";
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
} from "./types";
