"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Heart, ArrowLeft, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Filter to only images and limit to 10 total
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const remainingSlots = 10 - images.length;
    const newImages = imageFiles.slice(0, remainingSlots);

    // Create previews
    const newPreviews = newImages.map(file => URL.createObjectURL(file));

    setImages(prev => [...prev, ...newImages]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]); // Clean up memory
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder arrays
    const newImages = [...images];
    const newPreviews = [...previews];

    const draggedImage = newImages[draggedIndex];
    const draggedPreview = newPreviews[draggedIndex];

    newImages.splice(draggedIndex, 1);
    newPreviews.splice(draggedIndex, 1);

    newImages.splice(index, 0, draggedImage);
    newPreviews.splice(index, 0, draggedPreview);

    setImages(newImages);
    setPreviews(newPreviews);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleContinue = async () => {
    if (images.length >= 5) {
      setIsUploading(true);

      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store images in sessionStorage
      sessionStorage.setItem('uploadedImages', JSON.stringify(previews));
      sessionStorage.setItem('imageCount', images.length.toString());
      router.push('/create/crop');
    }
  };

  const handleBack = () => {
    // Clear any stored data and go home
    sessionStorage.removeItem('uploadedImages');
    sessionStorage.removeItem('imageCount');
    sessionStorage.removeItem('imageDetails');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-800">Create Your Love Story</h1>
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <p className="text-gray-600 text-lg">Upload 5-10 photos of your journey together</p>
          {images.length > 0 && (
            <p className="text-sm text-pink-600 mt-2">💡 Drag to reorder • Hover to remove</p>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-pink-300 rounded-xl cursor-pointer bg-pink-50 hover:bg-pink-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-pink-400 mb-4" />
                <p className="mb-2 text-lg font-semibold text-gray-700">
                  Click to upload photos
                </p>
                <p className="text-sm text-gray-500">
                  {images.length} of 5-10 photos uploaded
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={images.length >= 10}
              />
            </label>
          </div>

          {/* Photo Grid with Drag and Drop */}
          {images.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 text-center">
                📸 Your Story Order (First to Last)
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Drag photos to reorder them
              </p>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`relative group cursor-move transition-all ${
                      draggedIndex === index
                        ? 'scale-110 opacity-50 z-10'
                        : 'hover:scale-105'
                    }`}
                  >
                    {/* Image */}
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl border-2 border-pink-200 shadow-md"
                    />

                    {/* Number Badge */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>

                    {/* Elegant Remove Button on Hover */}
                    {hoveredIndex === index && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/95 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-600 transition-all z-20 border border-gray-200"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-pink-500 animate-spin mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Preparing Your Photos</h3>
                <p className="text-gray-600 text-center">
                  Getting everything ready for your love story...
                </p>
                <div className="w-full mt-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Uploading {images.length} photos</span>
                    <span>Please wait...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 h-full rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={images.length < 5 || isUploading}
            className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all ${
              images.length >= 5 && !isUploading
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isUploading ? 'Preparing...' : 'Continue to Add Details →'}
          </button>
        </div>

        {images.length < 5 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Upload at least 5 photos to continue
          </p>
        )}
      </div>
    </div>
  );
}
