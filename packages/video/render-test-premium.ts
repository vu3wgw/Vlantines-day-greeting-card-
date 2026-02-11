import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

async function main() {
  console.log("🎬 Premium Valentine Story - Test Render\n");

  // Read input from JSON file
  const inputPath = path.join(__dirname, "render-test-premium.json");

  if (!fs.existsSync(inputPath)) {
    console.error("Error: render-test-premium.json not found!");
    process.exit(1);
  }

  const inputData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  // Validate input
  if (!inputData.images || inputData.images.length < 2) {
    console.error("Error: Need at least 2 images in render-test-premium.json");
    process.exit(1);
  }

  console.log(`📸 Images: ${inputData.images.length}`);
  console.log(`💑 Couple: ${inputData.couple.name1} & ${inputData.couple.name2}`);
  console.log(`🎨 Color Scheme: ${inputData.colorScheme || "warm"}`);
  console.log(`⚡ Quality: ${inputData.quality || "balanced"}`);
  console.log(`✨ Transition Style: ${inputData.transitionStyle || "smooth"}\n`);

  // Create output directory
  const outDir = path.join(__dirname, "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Bundle the video
  console.log("📦 Bundling...");
  const startBundle = Date.now();
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, "src/entry.ts"),
    webpackOverride: (config) => config,
  });
  console.log(`   Done in ${((Date.now() - startBundle) / 1000).toFixed(1)}s\n`);

  // Get composition - use ValentineStory for premium
  console.log("🎯 Selecting ValentineStory composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ValentineStory",
    inputProps: inputData,
  });

  console.log(`   Duration: ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(1)}s)`);
  console.log(`   Resolution: ${composition.width}x${composition.height}`);
  console.log(`   FPS: ${composition.fps}\n`);

  // Render
  const outputPath = path.join(outDir, "valentine-premium-test.mp4");

  console.log("🎬 Rendering frames...");
  const startRender = Date.now();

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: inputData,
    onProgress: ({ progress }) => {
      const percent = Math.round(progress * 100);
      const bar = "█".repeat(Math.floor(percent / 5)) + "░".repeat(20 - Math.floor(percent / 5));
      process.stdout.write(`\r   [${bar}] ${percent}%`);
    },
  });

  const renderTime = ((Date.now() - startRender) / 1000).toFixed(1);
  console.log(`\n   Done in ${renderTime}s\n`);

  console.log("✅ Success!");
  console.log(`📁 Video saved to: ${outputPath}`);

  // Show file size
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 File size: ${sizeMB} MB`);
}

main().catch((err) => {
  console.error("\n❌ Render failed:", err);
  process.exit(1);
});
