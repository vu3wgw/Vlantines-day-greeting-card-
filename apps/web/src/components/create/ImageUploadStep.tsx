"use client";

import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, AlertCircle, Heart, ArrowRight, GripVertical, Loader2 } from "lucide-react";

// Try to import Convex - will be undefined in mock mode
let useMutation: any;
let api: any;
try {
  const convexReact = require("convex/react");
  useMutation = convexReact.useMutation;
  api = require("@my-better-t-app/backend/convex/_generated/api").api;
} catch {
  // Mock mode - Convex not available
}

// Compress and convert image to base64 data URL
const compressImageToBase64 = (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 JPEG
      const base64 = canvas.toDataURL("image/jpeg", quality);
      resolve(base64);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

interface UploadedImage {
  file: File;
  preview: string;
  storageId?: string;
  uploading: boolean;
  error?: string;
}

interface ImageUploadStepProps {
  onComplete: (projectId: any) => void;
}

export function ImageUploadStep({ onComplete }: ImageUploadStepProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  // Use mock functions when Convex is not available
  let createProject: any, generateUploadUrl: any, addImageToProject: any;
  try {
    createProject = useMutation?.(api?.videos?.createProject);
    generateUploadUrl = useMutation?.(api?.videos?.generateUploadUrl);
    addImageToProject = useMutation?.(api?.videos?.addImageToProject);
  } catch {
    // Mock mode - functions will be undefined
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const remainingSlots = 10 - images.length;
      const newFiles = acceptedFiles.slice(0, remainingSlots);

      const newImages = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
      }));

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"],
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    noClick: images.length >= 10,
  });

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (dragIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setImages((prev) => {
      const newImages = [...prev];
      const [draggedItem] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, draggedItem);
      return newImages;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleContinue = async () => {
    if (images.length < 5) {
      setError("Please upload at least 5 images");
      return;
    }

    setIsCreating(true);
    setError(null);

    // Mock mode - compress images and store as base64
    if (!createProject) {
      const compressedImages: { id: string; preview: string; note: string; date: string }[] = [];

      for (let i = 0; i < images.length; i++) {
        setImages((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploading: true } : p))
        );

        try {
          // Compress image to base64 (max 1200px wide, 70% quality)
          const base64 = await compressImageToBase64(images[i].file, 1200, 0.7);

          compressedImages.push({
            id: `mock-${i}`,
            preview: base64,
            note: "",
            date: "",
          });

          setImages((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, uploading: false, storageId: `mock-${i}` } : p
            )
          );
        } catch (err) {
          console.error(`Failed to compress image ${i}:`, err);
          setImages((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, uploading: false, error: "Failed to process" } : p
            )
          );
        }
      }

      // Store compressed images in sessionStorage
      try {
        sessionStorage.setItem("uploadedImages", JSON.stringify(compressedImages));
      } catch (storageError) {
        console.error("Storage error:", storageError);
        setError("Images too large. Try using fewer or smaller images.");
        setIsCreating(false);
        return;
      }

      onComplete("mock-project-id" as any);
      return;
    }

    try {
      const projectId = await createProject({});

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        setImages((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, uploading: true } : p))
        );

        try {
          const uploadUrl = await generateUploadUrl();

          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": img.file.type },
            body: img.file,
          });

          if (!result.ok) throw new Error("Upload failed");

          const { storageId } = await result.json();

          await addImageToProject({
            projectId,
            storageId,
            order: i,
            originalNote: "",
          });

          setImages((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, uploading: false, storageId } : p
            )
          );
        } catch {
          setImages((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, uploading: false, error: "Failed to upload" } : p
            )
          );
          throw new Error("Upload failed");
        }
      }

      onComplete(projectId);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload images. Please try again.");
      setIsCreating(false);
    }
  };

  const uploadedCount = images.filter((img) => img.storageId).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upload Your Photos</h2>
        <p className="text-gray-500">
          Select 5-10 of your favorite photos together. Drag to reorder them in your video.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive
            ? "border-pink-400 bg-gradient-to-br from-pink-50 to-rose-50 scale-[1.01]"
            : "border-pink-200 hover:border-pink-300 hover:bg-pink-50/30"
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Decorative hearts */}
        <div className="absolute top-4 left-4 text-pink-200">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        <div className="absolute bottom-4 right-4 text-pink-200">
          <Heart className="h-8 w-8 fill-current" />
        </div>
        <div className="absolute top-1/2 right-8 text-pink-100 -translate-y-1/2">
          <Heart className="h-12 w-12 fill-current" />
        </div>

        <div className="relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg shadow-pink-300/30">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            {isDragActive ? "Drop your photos here!" : "Drag & drop your photos"}
          </p>
          <p className="text-gray-400 mb-6">
            or click to browse from your device
          </p>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 border border-pink-100 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-pink-400" />
              JPG, PNG, WebP
            </span>
            <span className="w-1 h-1 rounded-full bg-pink-300" />
            <span>Max 10MB each</span>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="flex -space-x-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 border-white transition-colors ${
                i < images.length
                  ? "bg-gradient-to-br from-pink-500 to-rose-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className={`text-sm font-medium ${images.length >= 5 ? "text-pink-600" : "text-gray-500"}`}>
          {images.length}/10 photos
          {images.length < 5 && <span className="text-gray-400 font-normal"> ({5 - images.length} more needed)</span>}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Drag hint */}
      {images.length > 1 && !isCreating && (
        <div className="mt-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <GripVertical className="h-4 w-4" />
          <span>Drag photos to reorder them in your video</span>
        </div>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              draggable={!isCreating && images.length > 1}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              className={`
                relative aspect-square rounded-xl overflow-hidden bg-gray-100 group shadow-md transition-all duration-200
                ${!isCreating && images.length > 1 ? "cursor-grab active:cursor-grabbing" : ""}
                ${draggedIndex === idx ? "opacity-50 scale-95" : "hover:shadow-lg hover:scale-[1.02]"}
                ${dragOverIndex === idx && draggedIndex !== idx ? "ring-4 ring-pink-400 ring-offset-2 scale-105" : ""}
              `}
            >
              <img
                src={img.preview}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* Drag handle indicator */}
              {!isCreating && images.length > 1 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur text-xs text-gray-600 shadow">
                    <GripVertical className="h-3 w-3" />
                    <span>Drag</span>
                  </div>
                </div>
              )}

              {/* Upload overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Success overlay */}
              {img.storageId && !img.uploading && (
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/40 to-transparent flex items-end justify-center pb-2">
                  <div className="bg-white text-pink-500 rounded-full p-1 shadow-lg">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              )}

              {/* Order badge */}
              <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-xs font-bold flex items-center justify-center text-white shadow-lg">
                {idx + 1}
              </div>

              {/* Remove button */}
              {!isCreating && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Continue button */}
      <div className="mt-10 flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={images.length < 5 || isCreating}
          size="lg"
          className="px-8 py-6 text-base rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-300/30 disabled:opacity-50 disabled:shadow-none"
        >
          {isCreating ? (
            <span className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading {uploadedCount}/{images.length}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue
              <ArrowRight className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
