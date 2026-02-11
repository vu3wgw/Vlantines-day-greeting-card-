"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Download, CheckCircle, Share2, Home } from "lucide-react";

export default function DownloadPage() {
  const router = useRouter();
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if we have the required data
    const imageDetails = sessionStorage.getItem('imageDetails');
    if (!imageDetails) {
      router.push('/create/upload');
      return;
    }

    // Simulate rendering progress
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          setIsComplete(true);
          return 100;
        }
        return prev + 2;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [router]);

  const handleDownload = () => {
    // In production, this would trigger actual video download
    alert('Video download would start here. In production, this will download the rendered video file.');
  };

  const handleCreateAnother = () => {
    // Clear session storage
    sessionStorage.removeItem('uploadedImages');
    sessionStorage.removeItem('imageCount');
    sessionStorage.removeItem('imageDetails');
    router.push('/create/upload');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          {isRendering ? (
            <>
              {/* Rendering State */}
              <div className="flex justify-center mb-8">
                <Heart className="w-20 h-20 text-red-500 fill-red-500 animate-pulse" />
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                Rendering Your Video
              </h1>

              <p className="text-center text-gray-600 mb-8">
                We're creating your high-quality video file...
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-red-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm">
                {renderProgress}% Complete
              </p>

              <div className="mt-8 p-4 bg-pink-50 rounded-xl">
                <p className="text-center text-sm text-pink-700">
                  ⏱️ This may take a few moments. Please don't close this window.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Complete State */}
              <div className="flex justify-center mb-8">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>

              <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                Your Video is Ready!
              </h1>

              <p className="text-center text-gray-600 mb-8">
                Your beautiful love story video has been created successfully.
              </p>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download Video
                </button>

                <button
                  onClick={handleCreateAnother}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 border-2 border-gray-200 transition-all"
                >
                  <Heart className="w-5 h-5" />
                  Create Another Video
                </button>

                <button
                  onClick={handleGoHome}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </button>
              </div>

              {/* Share Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Share2 className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold text-gray-800">Share Your Love Story</h3>
                </div>
                <p className="text-center text-sm text-gray-600">
                  Share this special video with your loved one on Valentine's Day! 💕
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
