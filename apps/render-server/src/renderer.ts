import path from "path";
import os from "os";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { VIDEO_CONFIG, calculateDuration } from "@my-better-t-app/video";

interface ImageData {
  url: string | null;
  caption: string;
  date?: string;
  order: number;
}

interface RenderOptions {
  images: ImageData[];
  coupleName?: string;
  onProgress?: (progress: number) => Promise<void>;
}

interface RenderResult {
  outputPath: string;
  duration: number;
}

// Cache the bundled composition
let bundledPath: string | null = null;

async function ensureBundled(): Promise<string> {
  if (bundledPath) {
    return bundledPath;
  }

  console.log("[Renderer] Bundling Remotion composition...");
  const bundleStart = Date.now();

  bundledPath = await bundle({
    entryPoint: require.resolve("@my-better-t-app/video/src/index.ts"),
    webpackOverride: (config) => config,
  });

  console.log(`[Renderer] Bundled in ${Date.now() - bundleStart}ms`);
  return bundledPath;
}

export async function renderVideo(options: RenderOptions): Promise<RenderResult> {
  const { images, coupleName, onProgress } = options;

  // Filter out images with null URLs and sort by order
  const validImages = images
    .filter((img): img is ImageData & { url: string } => img.url !== null)
    .sort((a, b) => a.order - b.order)
    .map((img) => ({
      url: img.url,
      caption: img.caption,
      date: img.date,
    }));

  if (validImages.length < 5) {
    throw new Error("At least 5 valid images are required");
  }

  const durationInFrames = calculateDuration(validImages.length);
  const outputPath = path.join(os.tmpdir(), `valentine-${Date.now()}.mp4`);

  console.log(`[Renderer] Starting render with ${validImages.length} images`);
  console.log(`[Renderer] Duration: ${durationInFrames} frames (${durationInFrames / VIDEO_CONFIG.fps}s)`);
  console.log(`[Renderer] Output: ${outputPath}`);

  // Ensure composition is bundled
  const bundlePath = await ensureBundled();

  // Select the composition
  const composition = await selectComposition({
    serveUrl: bundlePath,
    id: "ValentineVideo",
    inputProps: {
      images: validImages,
      coupleName,
    },
  });

  // Override composition settings
  const compositionWithDuration = {
    ...composition,
    durationInFrames,
    fps: VIDEO_CONFIG.fps,
    width: VIDEO_CONFIG.width,
    height: VIDEO_CONFIG.height,
  };

  const renderStart = Date.now();

  // Render the video
  await renderMedia({
    composition: compositionWithDuration,
    serveUrl: bundlePath,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: {
      images: validImages,
      coupleName,
    },
    // Quality settings optimized for cost
    crf: 23, // Good quality/size balance
    pixelFormat: "yuv420p", // Maximum compatibility
    // Progress callback
    onProgress: async ({ progress }) => {
      const percent = Math.round(progress * 100);
      if (onProgress) {
        await onProgress(percent);
      }
    },
    // Performance settings
    concurrency: 2, // Parallel frame rendering
    // Chromium options
    chromiumOptions: {
      disableWebSecurity: true,
    },
  });

  const duration = Date.now() - renderStart;
  console.log(`[Renderer] Render completed in ${duration}ms`);

  return {
    outputPath,
    duration,
  };
}

// Pre-bundle on startup for faster first render
ensureBundled().catch((err) => {
  console.error("[Renderer] Failed to pre-bundle:", err);
});
