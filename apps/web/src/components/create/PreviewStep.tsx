"use client";

import { useMemo, useState, useEffect } from "react";
import { Player } from "@remotion/player";
import { ValentineStory, VIDEO_CONFIG } from "@my-better-t-app/video";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, Play, Info, Heart, Sparkles } from "lucide-react";

// Try to import Convex - will be undefined in mock mode
let useQuery: any, api: any;
try {
  const convexReact = require("convex/react");
  useQuery = convexReact.useQuery;
  api = require("@my-better-t-app/backend/convex/_generated/api").api;
} catch {
  // Mock mode
}

interface ImageData {
  id: string;
  preview: string;
  note: string;
  date: string;
  enhancedNote?: string;
  stickerUrl?: string;
}

interface PreviewStepProps {
  projectId: any;
  onComplete: () => void;
  onBack: () => void;
}

export function PreviewStep({ projectId, onComplete, onBack }: PreviewStepProps) {
  const [localImages, setLocalImages] = useState<ImageData[]>([]);
  const [coupleName, setCoupleName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Try Convex first
  let project: any = null;
  try {
    project = useQuery?.(api?.videos?.getProject, { projectId });
  } catch {
    // Mock mode - ignore
  }

  // Load from sessionStorage in mock mode
  useEffect(() => {
    if (!project) {
      const storedImages = sessionStorage.getItem("uploadedImages");
      const storedCoupleName = sessionStorage.getItem("coupleName");

      if (storedImages) {
        try {
          setLocalImages(JSON.parse(storedImages));
        } catch {
          console.error("Failed to parse stored images");
        }
      }
      if (storedCoupleName) {
        setCoupleName(storedCoupleName);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [project]);

  // Parse couple name into name1 & name2
  const parseCoupleNames = (name: string): { name1: string; name2: string } => {
    const cleanName = name || "Our Love Story";
    const separators = [" & ", " and ", " + "];
    for (const sep of separators) {
      if (cleanName.includes(sep)) {
        const [name1, name2] = cleanName.split(sep).map((n) => n.trim());
        return { name1: name1 || "You", name2: name2 || "Me" };
      }
    }
    return { name1: cleanName, name2: "" };
  };

  const videoProps = useMemo(() => {
    if (project?.images) {
      // Convex mode
      const images = project.images
        .sort((a: any, b: any) => a.order - b.order)
        .map((img: any) => ({
          url: img.url || "",
          caption: img.enhancedCaption || img.originalNote,
          date: img.imageDate,
          stickerUrl: img.stickerUrl,
        }));

      const couple = parseCoupleNames(project.coupleName);

      return {
        couple: {
          name1: couple.name1,
          name2: couple.name2,
        },
        images,
        colorScheme: "warm" as const,
        quality: "balanced" as const,
        transitionStyle: "smooth" as const,
        seed: "preview",
      };
    } else if (localImages.length > 0) {
      // Mock mode - use sessionStorage data
      const images = localImages.map((img) => ({
        url: img.preview,
        caption: img.enhancedNote || img.note,
        date: img.date,
        stickerUrl: img.stickerUrl,
      }));

      const couple = parseCoupleNames(coupleName || "Our Love Story");

      return {
        couple: {
          name1: couple.name1,
          name2: couple.name2,
        },
        images,
        colorScheme: "warm" as const,
        quality: "balanced" as const,
        transitionStyle: "smooth" as const,
        seed: "preview",
      };
    }
    return null;
  }, [project, localImages, coupleName]);

  if (isLoading || (!project && localImages.length === 0)) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </Card>
    );
  }

  if (!videoProps || videoProps.images.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Heart className="h-12 w-12 text-pink-300 mb-4" />
        <p className="text-gray-500">No images found. Please go back and upload images.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </Card>
    );
  }

  // Calculate duration: 60 seconds for premium composition
  const durationInFrames = 60 * VIDEO_CONFIG.fps;
  const durationSeconds = 60;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Play className="h-5 w-5 text-pink-500" />
          Preview Your Video
        </h2>
        <p className="text-muted-foreground">
          Watch a preview of your Valentine&apos;s video. When you&apos;re happy
          with it, proceed to render the final video.
        </p>
      </div>

      {/* Video info */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Info className="h-4 w-4 text-pink-500" />
          {videoProps.images.length} photos
        </span>
        <span>•</span>
        <span>~{durationSeconds} seconds</span>
        <span>•</span>
        <span>1080x1920 (9:16)</span>
      </div>

      {/* Premium badge */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          Premium Animation
        </span>
        <span className="text-gray-400">Spring physics • Kinetic typography • Sticker collages</span>
      </div>

      {/* Remotion Player */}
      <div className="flex justify-center bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden p-4">
        <div className="w-full max-w-[400px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl">
          <Player
            component={ValentineStory}
            inputProps={videoProps}
            durationInFrames={durationInFrames}
            fps={VIDEO_CONFIG.fps}
            compositionWidth={VIDEO_CONFIG.width}
            compositionHeight={VIDEO_CONFIG.height}
            style={{
              width: "100%",
              height: "100%",
            }}
            controls
            autoPlay={false}
            loop
            clickToPlay
          />
        </div>
      </div>

      {/* Caption preview list */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Captions in this video:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {videoProps.images.map((img: any, index: number) => (
            <div
              key={index}
              className="text-sm p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100 flex items-start gap-2"
            >
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                {index + 1}
              </span>
              <span className="line-clamp-2 text-gray-700">{img.caption}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="border-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Edit Captions
        </Button>
        <Button
          onClick={onComplete}
          size="lg"
          className="px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-300/30"
        >
          Render Final Video
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
