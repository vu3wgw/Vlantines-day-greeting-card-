"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Check } from "lucide-react";

interface CropData {
  preview: string;
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels: any;
}

export default function CropPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const previews = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    const count = parseInt(sessionStorage.getItem('imageCount') || '0');

    if (count === 0) {
      router.push('/create/upload');
      return;
    }

    setImages(previews);
    // Initialize crop data for each image
    setCropData(previews.map((preview: string) => ({
      preview,
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedAreaPixels: null
    })));
  }, [router]);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleNext = () => {
    // Save current crop settings
    const updatedCropData = [...cropData];
    updatedCropData[currentIndex] = {
      ...updatedCropData[currentIndex],
      crop,
      zoom,
      croppedAreaPixels
    };
    setCropData(updatedCropData);

    if (currentIndex < images.length - 1) {
      // Move to next image
      setCurrentIndex(currentIndex + 1);
      const nextCrop = updatedCropData[currentIndex + 1];
      setCrop(nextCrop.crop);
      setZoom(nextCrop.zoom);
    } else {
      // All done, save and continue
      sessionStorage.setItem('cropData', JSON.stringify(updatedCropData));
      router.push('/create/details');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Save current crop
      const updatedCropData = [...cropData];
      updatedCropData[currentIndex] = {
        ...updatedCropData[currentIndex],
        crop,
        zoom,
        croppedAreaPixels
      };
      setCropData(updatedCropData);

      // Go to previous
      setCurrentIndex(currentIndex - 1);
      const prevCrop = updatedCropData[currentIndex - 1];
      setCrop(prevCrop.crop);
      setZoom(prevCrop.zoom);
    }
  };

  const handleBack = () => {
    router.push('/create/upload');
  };

  if (images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 mb-4 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Upload
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Adjust Your Photos</h1>
          <p className="text-sm text-gray-600">
            Photo {currentIndex + 1} of {images.length} • Position faces in the upper center area
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index < currentIndex
                    ? 'bg-green-500'
                    : index === currentIndex
                    ? 'bg-pink-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Cropper Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative w-full mx-auto" style={{ height: '600px' }}>
            {/* Cropper */}
            <Cropper
              image={currentImage}
              crop={crop}
              zoom={zoom}
              aspect={9 / 16}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
              style={{
                containerStyle: {
                  borderRadius: '12px',
                  overflow: 'hidden',
                },
                cropAreaStyle: {
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                },
              }}
            />

            {/* Grayscale overlays for areas outside the 9:16 crop */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {/* Left side grayscale */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 'calc((100% - (600px * 9 / 16)) / 2)',
                  backdropFilter: 'grayscale(100%)',
                  WebkitBackdropFilter: 'grayscale(100%)',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
              />
              {/* Right side grayscale */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 'calc((100% - (600px * 9 / 16)) / 2)',
                  backdropFilter: 'grayscale(100%)',
                  WebkitBackdropFilter: 'grayscale(100%)',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
              />
            </div>

            {/* Face Placement Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
              {/* Face guide box - upper center */}
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '20%', width: '35%', height: '25%' }}>
                <div className="w-full h-full border-2 border-dashed border-pink-400 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👤</div>
                    <p className="text-xs font-semibold text-pink-600 bg-white/90 px-3 py-1 rounded-full">
                      Position faces here
                    </p>
                  </div>
                </div>
              </div>

              {/* 9:16 Ratio indicator */}
              <div className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded-lg">
                <p className="text-white text-xs font-semibold">9:16 Ratio</p>
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <ZoomIn className="w-4 h-4 inline mr-1" />
              Zoom
            </label>
            <div className="flex items-center gap-3">
              <ZoomOut className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <ZoomIn className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 min-w-[40px] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <p className="text-xs text-pink-800">
              💡 <strong>Tip:</strong> Drag to reposition, use the slider to zoom, and position faces in the upper pink area for best results
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              currentIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-red-600 shadow-md hover:shadow-lg transition-all"
          >
            {currentIndex === images.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                Continue to Details
              </>
            ) : (
              <>
                Next Photo
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
