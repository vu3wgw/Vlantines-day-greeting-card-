"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles } from "lucide-react";

export default function ProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparing your love story...");

  useEffect(() => {
    // Check if we have the required data
    const imageDetails = sessionStorage.getItem('imageDetails');
    if (!imageDetails) {
      router.push('/create/upload');
      return;
    }

    // Simulate processing with status updates
    const statuses = [
      { progress: 0, text: "Preparing your love story..." },
      { progress: 20, text: "Analyzing your beautiful moments..." },
      { progress: 40, text: "Calculating your time together..." },
      { progress: 60, text: "Adding magical overlays..." },
      { progress: 80, text: "Compositing your memories..." },
      { progress: 95, text: "Almost ready..." },
      { progress: 100, text: "Complete!" }
    ];

    let currentStatusIndex = 0;

    const interval = setInterval(() => {
      if (currentStatusIndex < statuses.length) {
        setProgress(statuses[currentStatusIndex].progress);
        setStatusText(statuses[currentStatusIndex].text);
        currentStatusIndex++;
      } else {
        clearInterval(interval);
        // Navigate to preview after a brief moment
        setTimeout(() => {
          router.push('/create/preview');
        }, 500);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          {/* Animated Hearts */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Heart className="w-20 h-20 text-red-500 fill-red-500 animate-pulse" />
              <Sparkles className="w-8 h-8 text-pink-400 absolute -top-2 -right-2 animate-spin" />
              <Sparkles className="w-6 h-6 text-pink-300 absolute -bottom-1 -left-1 animate-ping" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Creating Your Video
          </h1>

          {/* Status Text */}
          <p className="text-center text-gray-600 mb-8 text-lg">
            {statusText}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-red-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Progress Percentage */}
          <p className="text-center text-gray-500 text-sm">
            {progress}% Complete
          </p>

          {/* Fun Message */}
          <div className="mt-8 p-4 bg-pink-50 rounded-xl">
            <p className="text-center text-sm text-pink-700">
              💕 We're carefully crafting each moment of your story...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
