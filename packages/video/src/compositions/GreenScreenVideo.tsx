// CLOUD RENDERING: When rendering server-side, image URLs will be full https:// URLs
// from cloud storage instead of local staticFile paths. The resolveAssetUrl helper
// handles both cases. videoSrc may also be a full URL for CDN-hosted template videos.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

const greenScreenImageSchema = z.object({
  imageUrl: z.string(),
  startAtFrame: z.number(),
  endAtFrame: z.number(),
  greenThreshold: z.number().min(0).max(255).default(120),
  redLimit: z.number().min(0).max(255).default(100),
  blueLimit: z.number().min(0).max(255).default(100),
  caption: z.string().optional(),
  date: z.string().optional(),
});

export const greenScreenVideoSchema = z.object({
  videoSrc: z.string(),
  images: z.array(greenScreenImageSchema),
  coupleName: z.string().optional(),
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
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("http")
  )
    return url;
  return staticFile(url);
}

/**
 * Parse a user-entered date string into a Date object.
 * Handles: "March 15, 2023", "March 2023", "2023", etc.
 * Returns null if unparseable.
 */
function parseMemoryDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Try native parse first (handles "March 15, 2023" and "2023" well)
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  // "Month Year" e.g. "March 2023" — native handles this on most engines,
  // but fall back to manual parse
  const monthYear = dateStr.match(
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i,
  );
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function formatDaysAgo(dateStr: string): string | null {
  const date = parseMemoryDate(dateStr);
  if (!date) return null;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return null; // future date
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days.toLocaleString()} days ago`;
}

/** Caption overlay shown during each image slot */
const CaptionOverlay: React.FC<{ caption?: string; date?: string }> = ({
  caption,
  date,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const daysAgo = date ? formatDaysAgo(date) : null;

  if (!caption && !date) return null;

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const slideY = interpolate(frame, [0, 20], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "10px 12px 0",
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${slideY * -1}px)`,
          minWidth: 300,
        }}
      >
        <Img
          src={staticFile("valentine-frame.png")}
          style={{
            position: "absolute",
            width: 380,
            scale: 1.15,
            height: "auto",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "18px 40px 10px",
          }}
        >
          {caption && (
            <p
              style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#6b1a3a",
                textAlign: "center",
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {caption}
            </p>
          )}
          {date && (
            <p
              style={{
                fontFamily: "'Inter', 'Helvetica', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: "#9e4b6e",
                textAlign: "center",
                margin: "4px 0 0",
                letterSpacing: "0.04em",
              }}
            >
              {date}
            </p>
          )}
          {daysAgo && (
            <p
              style={{
                fontFamily: "'Inter', 'Helvetica', sans-serif",
                fontSize: 10,
                fontWeight: 400,
                fontStyle: "italic",
                color: "#b06b8a",
                textAlign: "center",
                margin: "2px 0 0",
                letterSpacing: "0.03em",
              }}
            >
              {daysAgo}
            </p>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Couple name overlay shown at the end of the video */
const CoupleNameOutro: React.FC<{ coupleName: string }> = ({ coupleName }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 30], [0.9, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale})`,
        }}
      >
        <Img
          src={staticFile("valentine-frame-2.png")}
          style={{
            position: "absolute",
            width: 800,
            height: "auto",
          }}
        />
        <p
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            maxWidth: "100%",
            // width: "100%",
            fontSize: 26,
            fontStyle: "italic",
            fontWeight: 600,
            color: "#8b2252",
            textAlign: "center",
            margin: 0,
            padding: "0 14px",
            transform: `scale(${scale * 0.4})`,
            position: "relative",
            zIndex: 1,
          }}
        >
          {coupleName}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const GreenScreenVideo: React.FC<GreenScreenVideoProps> = ({
  videoSrc,
  images,
  coupleName,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImagesRef = useRef<Map<string, LoadedImage>>(new Map());
  const activeImageRef = useRef<z.infer<typeof greenScreenImageSchema> | null>(
    null,
  );
  const [handle] = useState(() => delayRender("Loading green screen images"));
  // Stable bounding box cache — accumulates the max extent per slot to prevent
  // frame-to-frame jitter from video compression artifacts at green edges.
  const bboxCacheRef = useRef<{
    key: string; // startAtFrame used as slot identity
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);

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

      // Pass 1: Find bounding box of all green pixels in this frame
      let fMinX = width;
      let fMaxX = 0;
      let fMinY = height;
      let fMaxY = 0;
      let hasGreen = false;

      for (let i = 0; i < len; i += 4) {
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (g > greenThreshold && r < redLimit && b < blueLimit) {
          const idx = i >> 2;
          const px = idx % width;
          const py = (idx - px) / width;
          if (px < fMinX) fMinX = px;
          if (px > fMaxX) fMaxX = px;
          if (py < fMinY) fMinY = py;
          if (py > fMaxY) fMaxY = py;
          hasGreen = true;
        }
      }

      if (!hasGreen) {
        ctx.putImageData(frameData, 0, 0);
        return;
      }

      // Stabilize bounding box: accumulate max extent per slot so compression
      // artifacts at green edges don't cause the composited image to jitter.
      const slotKey = String(activeConfig.startAtFrame);
      const cached = bboxCacheRef.current;
      let minX: number;
      let maxX: number;
      let minY: number;
      let maxY: number;

      if (cached && cached.key === slotKey) {
        // Merge: only ever expand, never shrink
        minX = Math.min(cached.minX, fMinX);
        maxX = Math.max(cached.maxX, fMaxX);
        minY = Math.min(cached.minY, fMinY);
        maxY = Math.max(cached.maxY, fMaxY);
        cached.minX = minX;
        cached.maxX = maxX;
        cached.minY = minY;
        cached.maxY = maxY;
      } else {
        // New slot — start fresh
        minX = fMinX;
        maxX = fMaxX;
        minY = fMinY;
        maxY = fMaxY;
        bboxCacheRef.current = { key: slotKey, minX, maxX, minY, maxY };
      }

      // Compute "cover" mapping from stabilized bounding box to image
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

  // Last slot's endAtFrame — couple name shows after this
  const lastSlotEnd =
    images.length > 0 ? Math.max(...images.map((img) => img.endAtFrame)) : 0;

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

      {/* Caption overlays — one per image slot */}
      {images.map((img, i) =>
        img.caption || img.date ? (
          <Sequence
            key={i}
            from={img.startAtFrame}
            durationInFrames={img.endAtFrame - img.startAtFrame}
            name={`Caption ${i + 1}`}
          >
            <CaptionOverlay caption={img.caption} date={img.date} />
          </Sequence>
        ) : null,
      )}

      {/* Couple name at the end of the video */}
      {coupleName && lastSlotEnd > 0 && (
        <Sequence from={lastSlotEnd} name="Couple Name">
          <CoupleNameOutro coupleName={coupleName} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
