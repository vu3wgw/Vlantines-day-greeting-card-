// CLOUD RENDERING: When rendering server-side, image URLs will be full https:// URLs
// from cloud storage instead of local staticFile paths. The resolveAssetUrl helper
// handles both cases. videoSrc may also be a full URL for CDN-hosted template videos.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  delayRender,
  continueRender,
} from "remotion";
import { z } from "zod";

const greenScreenImageSchema = z.object({
  imageUrl: z.string(),
  startAtFrame: z.number(),
  endAtFrame: z.number(),
  greenThreshold: z.number().min(0).max(255).default(120),
  redLimit: z.number().min(0).max(255).default(100),
  blueLimit: z.number().min(0).max(255).default(100),
});

export const greenScreenVideoSchema = z.object({
  videoSrc: z.string(),
  images: z.array(greenScreenImageSchema),
});

type GreenScreenVideoProps = z.infer<typeof greenScreenVideoSchema>;

type LoadedImage = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

/**
 * Resolve asset URL — supports base64 data URIs, blob URLs, and full http(s) URLs
 * in addition to local public/ file names resolved via staticFile().
 */
function resolveAssetUrl(url: string): string {
  if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http")) return url;
  return staticFile(url);
}

export const GreenScreenVideo: React.FC<GreenScreenVideoProps> = ({
  videoSrc,
  images,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImagesRef = useRef<Map<string, LoadedImage>>(new Map());
  const activeImageRef = useRef<z.infer<typeof greenScreenImageSchema> | null>(
    null,
  );
  const [handle] = useState(() => delayRender("Loading green screen images"));

  // Pre-load all images and extract their pixel data once
  useEffect(() => {
    const urls = [...new Set(images.map((i) => i.imageUrl))];
    if (urls.length === 0) {
      continueRender(handle);
      return;
    }

    let loaded = 0;
    for (const url of urls) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      // CLOUD RENDERING: resolveAssetUrl passes through full URLs (data:/blob:/http)
      img.src = resolveAssetUrl(url);
      img.onload = () => {
        const offscreen = document.createElement("canvas");
        offscreen.width = img.width;
        offscreen.height = img.height;
        const ctx = offscreen.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        loadedImagesRef.current.set(url, {
          data: imgData.data,
          width: img.width,
          height: img.height,
        });
        loaded++;
        if (loaded === urls.length) {
          continueRender(handle);
        }
      };
    }
  }, [images, handle]);

  // Track which image is active for the current frame
  const activeImage = images.find(
    (img) => frame >= img.startAtFrame && frame < img.endAtFrame,
  );
  activeImageRef.current = activeImage ?? null;

  const onVideoFrame = useCallback(
    (videoFrame: CanvasImageSource) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
      if (!ctx) return;

      ctx.drawImage(videoFrame, 0, 0, width, height);
      const frameData = ctx.getImageData(0, 0, width, height);
      const { data } = frameData;
      const len = data.length;

      const activeConfig = activeImageRef.current;
      const imgInfo = activeConfig
        ? loadedImagesRef.current.get(activeConfig.imageUrl)
        : undefined;

      if (!activeConfig || !imgInfo) {
        ctx.putImageData(frameData, 0, 0);
        return;
      }

      const { greenThreshold, redLimit, blueLimit } = activeConfig;

      // Pass 1: Find bounding box of all green pixels
      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;
      let hasGreen = false;

      for (let i = 0; i < len; i += 4) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (g > greenThreshold && r < redLimit && b < blueLimit) {
          const idx = i >> 2;
          const px = idx % width;
          const py = (idx - px) / width;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
          hasGreen = true;
        }
      }

      if (!hasGreen) {
        ctx.putImageData(frameData, 0, 0);
        return;
      }

      // Compute "cover" mapping from green bounding box to image
      const greenW = maxX - minX + 1;
      const greenH = maxY - minY + 1;
      const greenAR = greenW / greenH;
      const imgAR = imgInfo.width / imgInfo.height;

      let srcX: number;
      let srcY: number;
      let srcW: number;
      let srcH: number;

      if (imgAR > greenAR) {
        srcH = imgInfo.height;
        srcW = srcH * greenAR;
        srcX = (imgInfo.width - srcW) / 2;
        srcY = 0;
      } else {
        srcW = imgInfo.width;
        srcH = srcW / greenAR;
        srcX = 0;
        srcY = (imgInfo.height - srcH) / 2;
      }

      const imgData = imgInfo.data;
      const imgW = imgInfo.width;

      // Pass 2: Replace green pixels with image pixels
      for (let i = 0; i < len; i += 4) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (g > greenThreshold && r < redLimit && b < blueLimit) {
          const idx = i >> 2;
          const px = idx % width;
          const py = (idx - px) / width;

          const nx = (px - minX) / greenW;
          const ny = (py - minY) / greenH;

          const imgX = Math.min(
            Math.max(Math.floor(srcX + nx * srcW), 0),
            imgInfo.width - 1,
          );
          const imgY = Math.min(
            Math.max(Math.floor(srcY + ny * srcH), 0),
            imgInfo.height - 1,
          );

          const srcI = (imgY * imgW + imgX) << 2;
          data[i] = imgData[srcI]!;
          data[i + 1] = imgData[srcI + 1]!;
          data[i + 2] = imgData[srcI + 2]!;
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(frameData, 0, 0);
    },
    [width, height],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill>
        <OffthreadVideo
          style={{ opacity: 0 }}
          onVideoFrame={onVideoFrame}
          // CLOUD RENDERING: resolveAssetUrl passes through full URLs for CDN-hosted templates
          src={resolveAssetUrl(videoSrc)}
        />
      </AbsoluteFill>

      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
};
