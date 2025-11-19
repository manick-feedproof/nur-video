/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useAuth } from "@/contexts/AuthContext";
import VideoCard from "@/components/VideoCard";
import { VIDEO_CATEGORIES, type VideoCategory } from "@/lib/constants";
import { getVideos, uploadVideo, type Video } from "@/lib/videoService";
import {
  CheckCircle,
  FileVideo,
  LogIn,
  LogOut,
  Upload,
  Video as VideoIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavigationButton from "./components/NavigationButton";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export default function HomePage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<VideoCategory>("Semua");

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [category, setCategory] = useState<VideoCategory>("Semua");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadVideos = useCallback(async (category: VideoCategory) => {
    setLoading(true);
    setError("");
    const result = await getVideos(category);

    if (result.success && result.videos) {
      setVideos(result.videos);
    } else {
      setError(result.error || "Failed to load videos");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!showUpload) {
      loadVideos(selectedCategory);
    }
  }, [loadVideos, selectedCategory, showUpload]);

  const handleCategoryChange = (cat: VideoCategory) => {
    setSelectedCategory(cat);
  };

  const handleVideoDelete = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleShowUpload = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setShowUpload(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");
    setUploadSuccess(false);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("File size exceeds 50MB limit");
        setSelectedFile(null);
        setVideoName("");
        return;
      }

      if (!file.type.startsWith("video/")) {
        setUploadError("Please select a valid video file");
        setSelectedFile(null);
        setVideoName("");
        return;
      }

      setSelectedFile(file);
      setVideoName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoName.trim()) {
      setUploadError("Please provide a video name");
      return;
    }

    setUploading(true);
    setUploadError("");

    const result = await uploadVideo(selectedFile, videoName.trim(), category);

    if (result.success) {
      setUploadSuccess(true);
      setSelectedFile(null);
      setVideoName("");
      setCategory("Semua");
      const input = document.getElementById("video-input") as HTMLInputElement;
      if (input) input.value = "";

      setTimeout(() => {
        setShowUpload(false);
        setUploadSuccess(false);
        loadVideos(selectedCategory);
      }, 2000);
    } else {
      setUploadError(result.error || "Upload failed");
    }

    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#89f6fe] to-[#66a6ff] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 flex-col sm:flex-row">
            <span className="text-6xl">🌸</span>
            <h1 className="text-5xl sm:text-6xl font-bold text-white">
              Therapy Relaksasi
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-white/90 font-medium">
            Platform Video Relaksasi untuk Kesehatan Lansia
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="flex items-center justify-center gap-4 flex-wrap max-w-3xl mx-auto mb-12">
          <NavigationButton
            onClick={() => setShowUpload(false)}
            icon={<VideoIcon size={24} />}
            active={!showUpload}
          >
            Galeri video
          </NavigationButton>

          {/* Upload Video */}
          {isAuthenticated && (
            <NavigationButton
              onClick={handleShowUpload}
              icon={<Upload size={24} />}
              active={showUpload}
            >
              Upload video
            </NavigationButton>
          )}

          {/* Login/Logout */}
          {isAuthenticated ? (
            <NavigationButton
              onClick={handleLogout}
              icon={<LogOut size={24} className="text-red-400" />}
            >
              Logout
            </NavigationButton>
          ) : (
            <NavigationButton
              onClick={() => router.push("/login")}
              icon={<LogIn size={24} />}
            >
              Login
            </NavigationButton>
          )}
        </div>

        {/* Content Section */}
        {!showUpload ? (
          /* Videos List */
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="mb-4 pb-2 border-b-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <VideoIcon size={32} className="text-[#4a90e2]" />
                <h2 className="text-3xl sm:text-4xl font-bold text-[#4a90e2]">
                  Galeri Video Relaksasi
                </h2>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Filter Kategori:
              </h3>
              <div className="pb-2">
                <div className="flex gap-3 flex-wrap">
                  {VIDEO_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-6 py-2.5 cursor-pointer hover:scale-105 duration-300 rounded-full font-medium transition-all whitespace-nowrap ${
                        selectedCategory === cat
                          ? "bg-[#4a90e2] text-white shadow-lg"
                          : "bg-white text-[#4a90e2] border-2 border-[#4a90e2] hover:bg-blue-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
          </div>
        ) : (
          /* Upload Form */
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a90e2] rounded-full mb-4">
                <Upload size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#4a90e2] mb-2">
                Upload Video
              </h2>
              <p className="text-gray-600">
                Select a video file to upload (Max: 50MB)
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="video-input"
                  className="block w-full cursor-pointer"
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <VideoIcon
                      size={48}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Click to select video
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: MP4, AVI, MOV, etc.
                    </p>
                  </div>
                </label>
                <input
                  type="file"
                  id="video-input"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setVideoName("");
                          const input = document.getElementById(
                            "video-input"
                          ) as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="video-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Video Name
                    </label>
                    <input
                      type="text"
                      id="video-name"
                      value={videoName}
                      onChange={(e) => setVideoName(e.target.value)}
                      placeholder="Enter video name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {VIDEO_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2 cursor-pointer hover:scale-105 duration-300 rounded-full font-medium transition-all ${
                            category === cat
                              ? "bg-[#4a90e2] text-white shadow-md"
                              : "bg-white text-[#4a90e2] border-2 border-[#4a90e2]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>
                    Video uploaded successfully! Returning to gallery...
                  </span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || !videoName.trim() || uploading}
                className="w-full bg-[#4a90e2] cursor-pointer text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </span>
                ) : (
                  "Upload Video"
                )}
              </button>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                  Maximum file size: 50MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
