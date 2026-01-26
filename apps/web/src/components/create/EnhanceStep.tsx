"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Check,
  AlertCircle,
  ArrowRightLeft,
  Heart,
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

interface ImageData {
  id: string;
  preview: string;
  note: string;
  date: string;
  enhancedNote?: string;
}

interface EnhanceStepProps {
  projectId: any;
  onComplete: () => void;
  onBack: () => void;
}

export function EnhanceStep({
  projectId,
  onComplete,
  onBack,
}: EnhanceStepProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [hasEnhanced, setHasEnhanced] = useState(false);

  // Try Convex first
  let project: any = null;
  let captions: any = null;
  let enhanceCaptions: any = null;

  try {
    project = useQuery?.(api?.videos?.getProject, { projectId });
    captions = useQuery?.(api?.captions?.getProjectCaptions, { projectId });
    enhanceCaptions = useMutation?.(api?.captions?.enhanceCaptions);
  } catch {
    // Mock mode - ignore
  }

  // Load from sessionStorage in mock mode
  useEffect(() => {
    if (!project && !captions) {
      const stored = sessionStorage.getItem("uploadedImages");
      if (stored) {
        try {
          const parsedImages = JSON.parse(stored);
          setImages(parsedImages);
          // Check if any images have enhanced notes
          const anyEnhanced = parsedImages.some((img: ImageData) => img.enhancedNote);
          setHasEnhanced(anyEnhanced);
        } catch {
          console.error("Failed to parse stored images");
        }
      }
    }
  }, [project, captions]);

  // Check if captions are already enhanced (Convex mode)
  useEffect(() => {
    if (project?.status === "ready_to_render" && captions?.some((c: any) => c.enhancedCaption)) {
      setHasEnhanced(true);
    }
  }, [project?.status, captions]);

  const handleEnhance = async () => {
    if (enhanceCaptions) {
      // Convex mode
      setIsEnhancing(true);
      try {
        await enhanceCaptions({ projectId });
      } catch (error) {
        console.error("Enhancement failed:", error);
        setIsEnhancing(false);
      }
    } else {
      // Mock mode - enhancement was already done in MetadataStep
      // Just mark as enhanced
      setHasEnhanced(true);
    }
  };

  // Auto-advance when enhancement completes (Convex mode)
  useEffect(() => {
    if (project?.status === "ready_to_render" && isEnhancing) {
      setIsEnhancing(false);
      setHasEnhanced(true);
    }
    if (project?.status === "failed" && isEnhancing) {
      setIsEnhancing(false);
    }
  }, [project?.status, isEnhancing]);

  // Use Convex data or local data
  const displayCaptions = captions || images.map((img) => ({
    id: img.id,
    originalNote: img.note,
    enhancedCaption: img.enhancedNote,
    imageDate: img.date,
  }));

  const isProcessing = project?.status === "processing" || isEnhancing;
  const isFailed = project?.status === "failed";
  const isReady = hasEnhanced || project?.status === "ready_to_render";

  // In mock mode, if we have enhanced notes, we're ready
  const mockModeReady = !project && images.some((img) => img.enhancedNote);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Caption Enhancement
        </h2>
        <p className="text-muted-foreground">
          {mockModeReady
            ? "Your captions have been enhanced! Review them below and continue when ready."
            : "Our AI will transform your notes into beautiful, romantic captions perfect for your Valentine's video."}
        </p>
      </div>

      {/* Already Enhanced (Mock Mode) */}
      {mockModeReady && (
        <div className="text-center py-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 mb-6">
          <div className="relative inline-block mb-3">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Check className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-amber-500" />
          </div>
          <h3 className="text-lg font-medium text-green-700 mb-1">
            Captions Enhanced!
          </h3>
          <p className="text-sm text-gray-500">
            Your notes have been transformed into romantic captions
          </p>
        </div>
      )}

      {/* Enhancement Status - Not yet enhanced */}
      {!mockModeReady && !hasEnhanced && !isProcessing && !isFailed && (
        <div className="text-center py-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 mb-6">
          <Heart className="h-16 w-16 mx-auto text-pink-500 fill-pink-400 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-800">Ready to Enhance</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Click the button below to let AI transform your notes into romantic
            captions. This usually takes just a few seconds.
          </p>
          <Button
            onClick={handleEnhance}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Enhance Captions with AI
          </Button>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 mb-6">
          <div className="relative inline-block mb-4">
            <Loader2 className="h-16 w-16 text-pink-500 animate-spin" />
            <Sparkles className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">Enhancing Your Captions...</h3>
          <p className="text-gray-500">
            Our AI is crafting beautiful, romantic captions for your photos
          </p>
        </div>
      )}

      {isFailed && (
        <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-100 mb-6">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-700">Enhancement Failed</h3>
          <p className="text-gray-500 mb-4">
            {project?.errorMessage || "Something went wrong. Please try again."}
          </p>
          <Button onClick={handleEnhance} variant="outline" className="border-red-300 text-red-600">
            Try Again
          </Button>
        </div>
      )}

      {hasEnhanced && !mockModeReady && isReady && (
        <div className="text-center py-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 mb-6">
          <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
          <h3 className="text-lg font-medium text-green-700">
            Captions Enhanced!
          </h3>
        </div>
      )}

      {/* Caption Comparison */}
      {displayCaptions && displayCaptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2 text-gray-700">
            <ArrowRightLeft className="h-4 w-4" />
            Caption Comparison
          </h3>

          {displayCaptions.map((caption: any, index: number) => (
            <div
              key={caption.id}
              className="border rounded-xl p-4 bg-white shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                  Photo {index + 1}
                </span>
                {caption.imageDate && (
                  <span className="text-xs text-gray-400">{caption.imageDate}</span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    Your Note
                  </div>
                  <p className="text-sm text-gray-700">{caption.originalNote || "—"}</p>
                </div>

                {/* Enhanced */}
                <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                  <div className="text-xs text-pink-600 mb-1 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Enhanced Caption
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {caption.enhancedCaption || (
                      <span className="text-gray-400 italic">
                        Will appear after enhancement
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} disabled={isProcessing} className="border-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={(!hasEnhanced && !mockModeReady) || isProcessing}
          size="lg"
          className="px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-300/30"
        >
          Continue to Preview
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
