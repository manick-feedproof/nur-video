/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { getVideos, type Video } from "@/lib/videoService";
import { FileVideo } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await getVideos();

    if (result.success && result.videos) {
      setVideos(result.videos);
    } else {
      setError(result.error || "Failed to load videos");
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleVideoDelete = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
              <FileVideo size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No videos yet
            </h3>
            <p className="text-gray-600">
              Upload your first video to get started
            </p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={handleVideoDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
