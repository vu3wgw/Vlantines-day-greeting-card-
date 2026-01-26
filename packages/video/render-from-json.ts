import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

async function main() {
  // Read input from JSON file
  const inputPath = path.join(__dirname, "render-input.json");

  if (!fs.existsSync(inputPath)) {
    console.error("Error: render-input.json not found!");
    console.log("Please create render-input.json with your images and captions.");
    process.exit(1);
  }

  const inputData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  // Validate input
  if (!inputData.images || inputData.images.length < 5) {
    console.error("Error: Need at least 5 images in render-input.json");
    process.exit(1);
  }

  console.log(`Rendering video with ${inputData.images.length} images...`);
  console.log(`Couple name: ${inputData.coupleName || "Not specified"}`);

  // Bundle the video
  console.log("Bundling...");
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, "src/entry.ts"),
    webpackOverride: (config) => config,
  });

  // Get composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ValentineVideo",
    inputProps: inputData,
  });

  // Render
  const outputPath = path.join(__dirname, "out", "valentine-custom.mp4");

  console.log("Rendering frames...");
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: inputData,
    onProgress: ({ progress }) => {
      process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`);
    },
  });

  console.log(`\n\nVideo saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
