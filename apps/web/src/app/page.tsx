"use client";

import Link from "next/link";
import { Heart, Sparkles, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Hero Section */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          {/* Floating hearts decoration */}
          <div className="relative inline-block mb-6">
            <Heart className="absolute -top-4 -left-8 h-6 w-6 text-pink-300 fill-pink-300 animate-pulse" />
            <Heart className="absolute -top-2 -right-6 h-4 w-4 text-rose-300 fill-rose-300 animate-pulse delay-150" />
            <Heart className="absolute -bottom-2 -left-4 h-5 w-5 text-pink-400 fill-pink-400 animate-pulse delay-300" />

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-300/40">
              <Play className="h-10 w-10 text-white fill-white ml-1" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Create Your
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent"> Love Story </span>
            Video
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Turn your favorite photos into a beautiful animated video.
            Add notes about each memory and let AI craft the perfect romantic captions.
          </p>

          <Link href="/create/upload">
            <Button
              size="lg"
              className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-300/40"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Create Your Video
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Upload 5-10 Photos</h3>
            <p className="text-sm text-gray-500">Select your favorite moments together. Drag to reorder them in your story.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">AI-Enhanced Captions</h3>
            <p className="text-sm text-gray-500">Write brief notes and AI will transform them into beautiful, romantic captions.</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-pink-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Animated Video</h3>
            <p className="text-sm text-gray-500">Get a professionally animated video with Ken Burns effects and smooth transitions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
