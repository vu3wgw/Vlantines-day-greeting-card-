"use client";

import { useState, useEffect } from "react";
import { ImageUploadStep } from "@/components/create/ImageUploadStep";
import { MetadataStep } from "@/components/create/MetadataStep";
import { EnhanceStep } from "@/components/create/EnhanceStep";
import { PreviewStep } from "@/components/create/PreviewStep";
import { RenderStep } from "@/components/create/RenderStep";
import { Heart, Sparkles, Upload, FileText, Wand2, Play, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "upload" | "metadata" | "enhance" | "preview" | "render";

const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: "upload", label: "Upload", icon: <Upload className="h-4 w-4" /> },
  { key: "metadata", label: "Details", icon: <FileText className="h-4 w-4" /> },
  { key: "enhance", label: "AI Magic", icon: <Wand2 className="h-4 w-4" /> },
  { key: "preview", label: "Preview", icon: <Play className="h-4 w-4" /> },
  { key: "render", label: "Create", icon: <Download className="h-4 w-4" /> },
];

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [projectId, setProjectId] = useState<any>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Check if there's existing session data on mount
  useEffect(() => {
    const storedImages = sessionStorage.getItem("uploadedImages");
    const storedStep = sessionStorage.getItem("currentStep");

    if (storedImages) {
      try {
        const images = JSON.parse(storedImages);
        if (images.length > 0) {
          // Restore session
          setProjectId("mock-project-id");
          if (storedStep && steps.some(s => s.key === storedStep)) {
            setCurrentStep(storedStep as Step);
          } else {
            setCurrentStep("metadata");
          }
        }
      } catch {
        // Invalid data, start fresh
      }
    }
  }, []);

  // Save current step to sessionStorage
  useEffect(() => {
    if (currentStep !== "upload") {
      sessionStorage.setItem("currentStep", currentStep);
    }
  }, [currentStep]);

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const handleUploadComplete = async (newProjectId: any) => {
    setProjectId(newProjectId);
    setCurrentStep("metadata");
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleClearAll = () => {
    sessionStorage.removeItem("uploadedImages");
    sessionStorage.removeItem("coupleName");
    sessionStorage.removeItem("currentStep");
    setProjectId(null);
    setCurrentStep("upload");
    setShowClearConfirm(false);
  };

  const hasSessionData = projectId !== null || currentStep !== "upload";

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/80 via-white to-rose-50/50">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/30 to-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-pink-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-[350px] h-[350px] bg-gradient-to-tl from-rose-200/25 to-pink-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-5xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-5">
            <Heart className="h-9 w-9 text-pink-500 fill-pink-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
              Create Your Love Story
            </h1>
            <Heart className="h-9 w-9 text-pink-500 fill-pink-400" />
          </div>
          <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
            Transform your favorite memories into a stunning Valentine&apos;s video in minutes
          </p>
        </div>

        {/* Modern Progress Steps - Clickable for navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 p-2 bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl shadow-pink-200/20 border border-pink-100/50">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isClickable = isCompleted || isCurrent;

              return (
                <div key={step.key} className="flex items-center">
                  <button
                    onClick={() => isClickable && setCurrentStep(step.key)}
                    disabled={!isClickable}
                    className={`
                      flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      ${isCurrent
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-400/30"
                        : isCompleted
                          ? "bg-pink-100/80 text-pink-600 hover:bg-pink-200/80 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    <span className={`
                      flex items-center justify-center
                      ${isCurrent ? "text-white" : isCompleted ? "text-pink-500" : "text-gray-300"}
                    `}>
                      {isCompleted ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.icon}
                    </span>
                    <span className="hidden md:inline">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 rounded-full ${isCompleted ? "bg-pink-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Container */}
        <div className="relative">
          {/* Glass card background */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-pink-200/10 border border-white/80" />

          {/* Content */}
          <div className="relative p-8 md:p-10 min-h-[500px]">
            {currentStep === "upload" && (
              <ImageUploadStep onComplete={handleUploadComplete} />
            )}
            {currentStep === "metadata" && projectId && (
              <MetadataStep
                projectId={projectId}
                onComplete={() => setCurrentStep("enhance")}
                onBack={goBack}
              />
            )}
            {currentStep === "enhance" && projectId && (
              <EnhanceStep
                projectId={projectId}
                onComplete={() => setCurrentStep("preview")}
                onBack={goBack}
              />
            )}
            {currentStep === "preview" && projectId && (
              <PreviewStep
                projectId={projectId}
                onComplete={() => setCurrentStep("render")}
                onBack={goBack}
              />
            )}
            {currentStep === "render" && projectId && (
              <RenderStep projectId={projectId} />
            )}
          </div>
        </div>

        {/* Clear All Button - Only show when there's session data */}
        {hasSessionData && (
          <div className="mt-6 text-center">
            {showClearConfirm ? (
              <div className="inline-flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="text-sm text-red-600">Clear all progress?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleClearAll}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Yes, Clear All
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span>Powered by AI</span>
            <span className="text-pink-300">•</span>
            <span>Made with love</span>
            <Sparkles className="h-4 w-4 text-pink-400" />
          </p>
        </div>
      </div>
    </div>
  );
}
