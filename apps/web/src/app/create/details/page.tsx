"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, GripVertical, Calendar, ArrowLeft } from "lucide-react";

interface ImageDetails {
  preview: string;
  date: string;
  context: string;
  dateType: 'full' | 'month' | 'year'; // Track what kind of date precision
}

const CONTEXT_EXAMPLES = [
  "We went on our first date",
  "We went on our first trip together",
  "We got engaged",
  "Our wedding day",
  "We moved in together",
  "We adopted our first pet",
  "We met each other's parents for the first time",
  "Our anniversary celebration",
];

// Generate year options for dropdown
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }
  return years;
};

export default function DetailsPage() {
  const router = useRouter();
  const [imageDetails, setImageDetails] = useState<ImageDetails[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const previews = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');
    const count = parseInt(sessionStorage.getItem('imageCount') || '0');

    if (count === 0) {
      router.push('/create/upload');
      return;
    }

    setImageDetails(previews.map((preview: string) => ({
      preview,
      date: '',
      context: '',
      dateType: 'full'
    })));
  }, [router]);

  const updateDetails = (index: number, field: keyof ImageDetails, value: string) => {
    setImageDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newDetails = [...imageDetails];
    const draggedItem = newDetails[draggedIndex];

    newDetails.splice(draggedIndex, 1);
    newDetails.splice(index, 0, draggedItem);

    setImageDetails(newDetails);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleContinue = () => {
    const allFilled = imageDetails.every(detail => detail.date && detail.context);
    if (allFilled) {
      sessionStorage.setItem('imageDetails', JSON.stringify(imageDetails));
      router.push('/create/processing');
    }
  };

  const handleBack = () => {
    router.push('/create/crop');
  };

  if (imageDetails.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const allFilled = imageDetails.every(detail => detail.date && detail.context);
  const filledCount = imageDetails.filter(detail => detail.date && detail.context).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 mb-4 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Adjust Photos
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">Add Your Story Details</h1>
          </div>
          <p className="text-sm text-gray-600">
            Fill in the details for each photo • {filledCount} of {imageDetails.length} completed
          </p>
          <p className="text-xs text-pink-600 mt-1">💡 Drag to reorder</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex gap-1">
            {imageDetails.map((detail, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all ${
                  detail.date && detail.context
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* All Images List with Drag and Drop */}
        <div className="space-y-3 mb-6">
          {imageDetails.map((detail, index) => {
            // Get placeholder for this index
            const placeholder = CONTEXT_EXAMPLES[index % CONTEXT_EXAMPLES.length];

            return (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-xl shadow-md transition-all ${
                  draggedIndex === index
                    ? 'scale-105 opacity-50 shadow-xl'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="p-4">
                  {/* Header with drag handle */}
                  <div className="flex items-center gap-2 mb-3 cursor-move">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div className="flex items-center justify-center w-7 h-7 bg-pink-100 text-pink-600 font-bold rounded-full text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">
                      Photo {index + 1}
                      {detail.date && detail.context && (
                        <span className="ml-2 text-xs text-green-600">✓ Complete</span>
                      )}
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Image Preview */}
                    <div>
                      <img
                        src={detail.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>

                    {/* Input Form */}
                    <div className="space-y-3">
                      {/* Date Type Selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          <Calendar className="w-3.5 h-3.5 inline mr-1" />
                          When was this taken?
                        </label>
                        <div className="flex gap-1.5 mb-2">
                          <button
                            onClick={() => updateDetails(index, 'dateType', 'full')}
                            className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${
                              detail.dateType === 'full'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            Exact Date
                          </button>
                          <button
                            onClick={() => updateDetails(index, 'dateType', 'month')}
                            className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${
                              detail.dateType === 'month'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            Month & Year
                          </button>
                          <button
                            onClick={() => updateDetails(index, 'dateType', 'year')}
                            className={`px-2.5 py-1 text-[10px] rounded-full transition-colors ${
                              detail.dateType === 'year'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            Year Only
                          </button>
                        </div>

                        {/* Unified Date Input Box */}
                        <div className="relative">
                          {/* Date Input - Full Date */}
                          {detail.dateType === 'full' && (
                            <div className="relative">
                              <div className="relative">
                                {/* Clickable Calendar icon on LEFT */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`date-input-${index}`);
                                    if (input) (input as HTMLInputElement).showPicker();
                                  }}
                                  className="absolute left-2.5 top-2.5 z-10 hover:scale-110 transition-transform"
                                >
                                  <Calendar className="w-4 h-4 text-pink-500" />
                                </button>
                                <input
                                  id={`date-input-${index}`}
                                  type="date"
                                  value={detail.date}
                                  onChange={(e) => updateDetails(index, 'date', e.target.value)}
                                  className="w-full pl-10 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:ring-0 text-gray-700 bg-white transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:opacity-0"
                                  placeholder="Select exact date"
                                />
                              </div>
                              <div className="mt-1.5 text-[10px] text-gray-500">
                                Click to pick the exact date
                              </div>
                            </div>
                          )}

                          {/* Date Input - Month & Year */}
                          {detail.dateType === 'month' && (
                            <div className="relative">
                              <div className="relative">
                                {/* Clickable Calendar icon on LEFT */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`date-input-${index}`);
                                    if (input) (input as HTMLInputElement).showPicker();
                                  }}
                                  className="absolute left-2.5 top-2.5 z-10 hover:scale-110 transition-transform"
                                >
                                  <Calendar className="w-4 h-4 text-pink-500" />
                                </button>
                                <input
                                  id={`date-input-${index}`}
                                  type="month"
                                  value={detail.date}
                                  onChange={(e) => updateDetails(index, 'date', e.target.value)}
                                  className="w-full pl-10 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:ring-0 text-gray-700 bg-white transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:opacity-0"
                                  placeholder="Select month & year"
                                />
                              </div>
                              <div className="mt-1.5 text-[10px] text-gray-500">
                                Click to select month and year
                              </div>
                            </div>
                          )}

                          {/* Date Input - Year Only */}
                          {detail.dateType === 'year' && (
                            <div className="relative">
                              <div className="relative">
                                {/* Calendar icon on LEFT */}
                                <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-pink-500 pointer-events-none z-10" />
                                <select
                                  value={detail.date}
                                  onChange={(e) => updateDetails(index, 'date', e.target.value)}
                                  className="w-full pl-10 pr-9 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:ring-0 text-gray-700 bg-white transition-colors appearance-none cursor-pointer"
                                >
                                  <option value="" className="text-gray-400">Select a year...</option>
                                  {generateYearOptions().map(year => (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  ))}
                                </select>
                                {/* Dropdown arrow icon on RIGHT */}
                                <div className="absolute right-2.5 top-2.5 pointer-events-none text-gray-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                              <div className="mt-1.5 text-[10px] text-gray-500">
                                Click to select the year
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Context Input */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          What's the story behind this photo?
                        </label>
                        <textarea
                          value={detail.context}
                          onChange={(e) => updateDetails(index, 'context', e.target.value)}
                          placeholder={placeholder}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-pink-400 focus:ring-0 resize-none placeholder:text-gray-400 placeholder:italic"
                        />
                        <p className="text-[10px] text-gray-500 mt-1.5">
                          💡 Write a short description - the video will show "It's been X days since {detail.context.toLowerCase() || 'this moment'}"
                        </p>

                        {/* Quick Examples */}
                        {!detail.context && (
                          <div className="mt-2">
                            <p className="text-[10px] text-gray-500 mb-1.5">Quick examples:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {CONTEXT_EXAMPLES.slice(0, 3).map((example, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => updateDetails(index, 'context', example)}
                                  className="text-[10px] px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors"
                                >
                                  {example}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center sticky bottom-6">
          <button
            onClick={handleContinue}
            disabled={!allFilled}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              allFilled
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allFilled ? 'Create Video ✨' : `Complete ${imageDetails.length - filledCount} more`}
          </button>
        </div>
      </div>
    </div>
  );
}
