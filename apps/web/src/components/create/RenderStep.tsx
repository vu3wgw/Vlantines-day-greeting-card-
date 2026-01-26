"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Download,
  Share2,
  Check,
  AlertCircle,
  RefreshCw,
  Heart,
  Video,
} from "lucide-react";

// Try to import Convex - will be undefined in mock mode
let useQuery: any, useMutation: any, api: any;
try {
  const convexReact = require("convex/react");
  useQuery = convexReact.useQuery;
  useMutation = convexReact.useMutation;
  api = require("@my-better-t-app/backend/convex/_generated/api").api;
} catch {
  // Mock mode
}

interface RenderStepProps {
  projectId: any;
}

type RenderStatus = "ready" | "rendering" | "completed" | "failed";

export function RenderStep({ projectId }: RenderStepProps) {
  const [status, setStatus] = useState<RenderStatus>("ready");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [coupleName, setCoupleName] = useState<string>("");

  // Try Convex first
  let project: any = null;
  let renderStatus: any = null;
  let downloadUrl: any = null;
  let startRender: any = null;
  let retryRender: any = null;

  try {
    project = useQuery?.(api?.videos?.getProject, { projectId });
    renderStatus = useQuery?.(api?.rendering?.getRenderStatus, { projectId });
    downloadUrl = useQuery?.(api?.rendering?.getVideoDownloadUrl, { projectId });
    startRender = useMutation?.(api?.rendering?.startRender);
    retryRender = useMutation?.(api?.rendering?.retryRender);
  } catch {
    // Mock mode - ignore
  }

  // Load couple name from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("coupleName");
    if (stored) setCoupleName(stored);
  }, []);

  // Convert blob URL to base64, or return base64 as-is
  const toBase64 = async (url: string): Promise<string> => {
    // If already a base64 data URL, return as-is
    if (url.startsWith("data:")) {
      return url;
    }

    // Convert blob URL to base64
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to convert URL to base64:", url, err);
      throw new Error("Failed to load image - please try re-uploading");
    }
  };

  // Local render using API
  const handleLocalRender = async () => {
    setStatus("rendering");
    setProgress(0);
    setError(null);

    try {
      // Get images from sessionStorage
      const storedImages = sessionStorage.getItem("uploadedImages");
      if (!storedImages) {
        throw new Error("No images found. Please go back and upload images.");
      }

      let images;
      try {
        images = JSON.parse(storedImages);
      } catch (parseError) {
        console.error("Failed to parse stored images:", parseError);
        throw new Error("Image data was corrupted (storage limit exceeded). Please try with fewer or smaller images.");
      }

      if (!Array.isArray(images) || images.length < 5) {
        throw new Error("At least 5 images required");
      }

      // Simulate progress while converting images
      setProgress(10);

      // Convert blob URLs to base64 (base64 data URLs pass through as-is)
      const processedImages = await Promise.all(
        images.map(async (img: any) => {
          const base64Url = await toBase64(img.preview);
          return {
            url: base64Url,
            caption: img.enhancedNote || img.note || "A beautiful memory",
            date: img.date || undefined,
          };
        })
      );

      setProgress(20);

      // Get couple name
      const name = coupleName || sessionStorage.getItem("coupleName") || "Our Love Story";

      // Simulate progress during render
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 3000);

      // Call render API
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: processedImages,
          coupleName: name,
          seed: Date.now(),
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Render failed: ${response.status}`);
      }

      // Get video blob
      const videoBlob = await response.blob();
      const url = URL.createObjectURL(videoBlob);

      setProgress(100);
      setVideoUrl(url);
      setStatus("completed");
    } catch (err) {
      console.error("Render error:", err);
      setError(err instanceof Error ? err.message : "Render failed");
      setStatus("failed");
    }
  };

  // Handle Convex-based render
  const handleConvexRender = async () => {
    if (!startRender) return;
    try {
      await startRender({ projectId });
    } catch (error) {
      console.error("Failed to start render:", error);
    }
  };

  const handleRetry = () => {
    setError(null);
    setVideoUrl(null);
    setStatus("ready");
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "valentine-video.mp4";
    a.click();
  };

  const handleShare = async () => {
    const url = videoUrl || downloadUrl;
    if (!url) return;

    if (navigator.share && videoUrl) {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], "valentine-video.mp4", { type: "video/mp4" });
        await navigator.share({
          title: "My Valentine's Day Video",
          text: "Check out this Valentine's Day video I made!",
          files: [file],
        });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Use Convex status if available
  const effectiveStatus = project?.status === "completed" ? "completed" :
                          project?.status === "rendering" ? "rendering" :
                          project?.status === "failed" ? "failed" : status;
  const effectiveProgress = renderStatus?.progress || progress;
  const effectiveVideoUrl = downloadUrl || videoUrl;
  const effectiveError = renderStatus?.errorMessage || project?.errorMessage || error;

  // Determine if we should use local or Convex rendering
  const useLocalRender = !startRender || projectId === "mock-project-id";

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Create Your Video
        </h2>
        <p className="text-muted-foreground">
          {effectiveStatus === "completed"
            ? "Your video is ready! Download it and share with your loved one."
            : "Click the button below to render your Valentine's video."}
        </p>
      </div>

      {/* Ready to render state */}
      {effectiveStatus === "ready" && (
        <div className="text-center py-12 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
          <Heart className="h-20 w-20 mx-auto text-pink-500 fill-pink-400 mb-4" />
          <h3 className="text-xl font-medium mb-2 text-gray-800">Ready to Create Your Video</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your photos and captions are ready. Click below to render your
            personalized Valentine's video. This usually takes 1-2 minutes.
          </p>
          <Button
            onClick={useLocalRender ? handleLocalRender : handleConvexRender}
            size="lg"
            className="px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-300/30"
          >
            <Video className="h-4 w-4 mr-2" />
            Create Video
          </Button>
        </div>
      )}

      {/* Rendering state */}
      {effectiveStatus === "rendering" && (
        <div className="text-center py-12 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
          <div className="relative inline-block mb-4">
            <Loader2 className="h-20 w-20 text-pink-500 animate-spin" />
            <Heart className="h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500 fill-pink-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">Creating Your Video...</h3>
          <p className="text-gray-500 mb-6">
            This usually takes 1-2 minutes. Please don&apos;t close this page.
          </p>

          {/* Progress bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-pink-600">{Math.round(effectiveProgress)}%</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${effectiveProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Completed state */}
      {effectiveStatus === "completed" && effectiveVideoUrl && (
        <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
          <div className="relative inline-block mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-300/30">
              <Check className="h-10 w-10 text-white" />
            </div>
            <Heart className="h-8 w-8 absolute -top-1 -right-1 text-pink-500 fill-pink-400" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-green-700">
            Your Video is Ready!
          </h3>
          <p className="text-gray-500 mb-8">
            Download your video and share it with your special someone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleDownload}
              size="lg"
              className="px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-300/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Video
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare} className="border-pink-300 text-pink-600">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Video preview */}
          <div className="mt-8 max-w-sm mx-auto">
            <video
              src={effectiveVideoUrl}
              controls
              className="w-full rounded-xl shadow-xl"
              poster=""
            />
          </div>
        </div>
      )}

      {/* Failed state */}
      {effectiveStatus === "failed" && (
        <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-700">
            Rendering Failed
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {effectiveError || "Something went wrong during rendering. Please try again."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={handleRetry} variant="outline" className="border-red-300 text-red-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="border-gray-300 text-gray-600">
              <a href="/create">
                Start Fresh
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Create another video */}
      {effectiveStatus === "completed" && (
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-400 mb-3">
            Want to create another video?
          </p>
          <Button variant="outline" asChild className="border-pink-300 text-pink-600">
            <a href="/create">
              <Heart className="h-4 w-4 mr-2" />
              Create New Video
            </a>
          </Button>
        </div>
      )}
    </Card>
  );
}
