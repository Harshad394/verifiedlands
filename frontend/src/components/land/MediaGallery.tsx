"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Video, Navigation, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  images: string[];
  videoUrl?: string | null;
  droneVideoUrl?: string | null;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  images,
  videoUrl,
  droneVideoUrl,
}) => {
  const [activeTab, setActiveTab] = useState<"photos" | "video" | "drone">("photos");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const hasPhotos = images && images.length > 0;
  const hasVideo = !!videoUrl;
  const hasDrone = !!droneVideoUrl;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4">
      {/* Media Type Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
        <button
          onClick={() => setActiveTab("photos")}
          className={cn(
            "px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors",
            activeTab === "photos"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Photos ({images?.length || 0})</span>
        </button>

        {hasVideo && (
          <button
            onClick={() => setActiveTab("video")}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors",
              activeTab === "video"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            )}
          >
            <Video className="w-4 h-4" />
            <span>Walkthrough Video</span>
          </button>
        )}

        {hasDrone && (
          <button
            onClick={() => setActiveTab("drone")}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors",
              activeTab === "drone"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            )}
          >
            <Navigation className="w-4 h-4" />
            <span>Drone View</span>
          </button>
        )}
      </div>

      {/* Media Content Display */}
      <div className="px-4 pb-4">
        {activeTab === "photos" && (
          <div className="space-y-3">
            <div className="relative h-[380px] sm:h-[480px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              {hasPhotos ? (
                <img
                  src={images[selectedImageIndex]}
                  alt="Land photo"
                  className="w-full h-full object-contain bg-slate-950"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <Building2 className="w-12 h-12 mb-2" />
                  <span className="text-sm font-medium">No Photos Uploaded</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {hasPhotos && images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 bg-slate-950 transition-all",
                      selectedImageIndex === idx
                        ? "border-emerald-500 ring-2 ring-emerald-500/50"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "video" && videoUrl && (
          <div className="relative h-[380px] sm:h-[480px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <video src={videoUrl} controls className="w-full h-full object-contain" />
          </div>
        )}

        {activeTab === "drone" && droneVideoUrl && (
          <div className="relative h-[380px] sm:h-[480px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <video src={droneVideoUrl} controls className="w-full h-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
};
