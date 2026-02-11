"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { Heart, Download, ArrowLeft } from "lucide-react";
import { ValentineVideo } from "@my-better-t-app/video";

interface ImageDetail {
  preview: string;
  date: string;
  context: string;
  dateType: 'full' | 'month' | 'year';
}

export default function PreviewPage() {
  const router = useRouter();
  const [imageDetails, setImageDetails] = useState<ImageDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detailsStr = sessionStorage.getItem('imageDetails');
    if (!detailsStr) {
      router.push('/create/upload');
      return;
    }

    const details = JSON.parse(detailsStr);
    setImageDetails(details);
    setIsLoading(false);
  }, [router]);

  const handleDownload = () => {
    router.push('/create/download');
  };

  const handleBack = () => {
    router.push('/create/details');
  };

  // Calculate days between dates for overlays
  const calculateDaysSince = (dateStr: string, dateType: string) => {
    let then: Date;

    if (dateType === 'year') {
      // If only year, use January 1st of that year
      then = new Date(`${dateStr}-01-01`);
    } else if (dateType === 'month') {
      // If month and year, use 1st day of that month
      then = new Date(`${dateStr}-01`);
    } else {
      // Full date
      then = new Date(dateStr);
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - then.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date display based on type
  const formatDate = (dateStr: string, dateType: string) => {
    if (dateType === 'year') {
      return dateStr; // Just the year
    } else if (dateType === 'month') {
      const date = new Date(dateStr + '-01');
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Prepare data for video
  const videoProps = {
    images: imageDetails.map(detail => ({
      url: detail.preview,
      caption: detail.context, // Use context as caption
      date: formatDate(detail.date, detail.dateType),
      daysSince: calculateDaysSince(detail.date, detail.dateType),
      context: detail.context
    })),
    coupleName: "You & Your Love" // Default couple name
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-red-50 to-rose-100">
        <p>Loading preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-800">Preview Your Love Story</h1>
          </div>
          <p className="text-gray-600">Watch your beautiful memories come to life</p>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="max-w-md mx-auto bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
            <Player
              component={ValentineVideo}
              inputProps={videoProps}
              durationInFrames={900}
              compositionWidth={1080}
              compositionHeight={1920}
              fps={30}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Edit Details
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Download Video
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-800 mb-3">Your Story Timeline:</h3>
          <div className="space-y-2">
            {imageDetails.map((detail, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <span className="text-pink-500 font-semibold">{index + 1}.</span>
                <div>
                  <p className="text-gray-700">{detail.context}</p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(detail.date, detail.dateType)} • {calculateDaysSince(detail.date, detail.dateType)} days ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
