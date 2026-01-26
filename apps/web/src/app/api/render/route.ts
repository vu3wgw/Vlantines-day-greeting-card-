import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const maxDuration = 300; // 5 minutes timeout

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, coupleName, seed } = body;

    if (!images || images.length < 5) {
      return NextResponse.json(
        { error: "At least 5 images required" },
        { status: 400 }
      );
    }

    // Create temp directory for this render
    const tempDir = path.join(os.tmpdir(), `valentine-render-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Keep base64 data URLs - Remotion can handle them directly
    // (file:// URLs don't work due to Chrome security restrictions)
    const processedImages = images.map((img: any) => ({
      ...img,
      // Keep the base64 data URL as-is
      url: img.url,
    }));

    // Create props file
    const propsPath = path.join(tempDir, "props.json");
    const props = {
      images: processedImages,
      coupleName: coupleName || "Our Love Story",
      seed: seed || Date.now(),
    };
    await fs.writeFile(propsPath, JSON.stringify(props, null, 2));

    // Output path
    const outputPath = path.join(tempDir, "output.mp4");

    // Get the video package path
    const videoPackagePath = path.resolve(
      process.cwd(),
      "..",
      "..",
      "packages",
      "video"
    );

    // Run Remotion render
    const renderResult = await new Promise<{ success: boolean; error?: string }>(
      (resolve) => {
        const args = [
          "run",
          "remotion",
          "render",
          "ValentineVideo",
          `--props=${propsPath}`,
          `--output=${outputPath}`,
        ];

        console.log(`Running: bun ${args.join(" ")} in ${videoPackagePath}`);

        const child = spawn("bun", args, {
          cwd: videoPackagePath,
          shell: true,
          env: { ...process.env },
        });

        let stderr = "";
        let stdout = "";

        child.stdout?.on("data", (data) => {
          stdout += data.toString();
          console.log(data.toString());
        });

        child.stderr?.on("data", (data) => {
          stderr += data.toString();
          console.error(data.toString());
        });

        child.on("close", (code) => {
          if (code === 0) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: stderr || stdout || `Exit code: ${code}` });
          }
        });

        child.on("error", (err) => {
          resolve({ success: false, error: err.message });
        });

        // Timeout after 4 minutes
        setTimeout(() => {
          child.kill();
          resolve({ success: false, error: "Render timeout" });
        }, 240000);
      }
    );

    if (!renderResult.success) {
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      return NextResponse.json(
        { error: renderResult.error || "Render failed" },
        { status: 500 }
      );
    }

    // Read the rendered video
    const videoBuffer = await fs.readFile(outputPath);

    // Cleanup temp directory
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    // Return video file
    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="valentine-video.mp4"',
        "Content-Length": videoBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
