"use client";

import { useAuth } from "@/contexts/AuthContext";
import { formatDateTime, formatFileSize } from "@/lib/formatters";
import {
  deleteVideo,
  getVideoUrl,
  getVideoDownloadUrl,
  type Video,
} from "@/lib/videoService";
import { Download, Play, Trash2 } from "lucide-react";
import { useState } from "react";

interface VideoCardProps {
  video: Video;
  onDelete: (videoId: string) => void;
}

export default function VideoCard({ video, onDelete }: VideoCardProps) {
  const { isAuthenticated } = useAuth();
  const [showPlayer, setShowPlayer] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const videoUrl = getVideoUrl(video.storage_path);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${video.name}"?`)) return;

    setIsDeleting(true);
    const result = await deleteVideo(video.id, video.storage_path);

    if (result.success) {
      onDelete(video.id);
    } else {
      alert(`Failed to delete video: ${result.error}`);
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const downloadUrl = await getVideoDownloadUrl(video.storage_path);
      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = video.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Failed to generate download link");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
        <div className="relative bg-[#4a90e2] aspect-video flex items-center justify-center">
          <button
            onClick={() => setShowPlayer(true)}
            className="bg-white/90 hover:bg-white p-4 rounded-full transition-all transform hover:scale-110"
          >
            <Play size={32} className="text-[#4a90e2]" fill="currentColor" />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
            {video.name}
          </h3>

          <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-medium">{formatFileSize(video.size)}</span>
            </div>
            <div className="flex justify-between">
              <span>Uploaded:</span>
              <span className="font-medium">
                {formatDateTime(video.updated_at)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPlayer(true)}
              className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-[#4a90e2] text-white py-2 px-4 rounded-lg transition-all"
            >
              <Play size={18} />
              Play
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-white"></div>
              ) : (
                <Download size={18} />
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-white"></div>
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPlayer && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPlayer(false)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPlayer(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ✕
            </button>
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg shadow-2xl"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
