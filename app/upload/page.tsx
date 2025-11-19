"use client";

import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { uploadVideo } from "@/lib/videoService";
import { CheckCircle, Upload, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    setSuccess(false);

    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 50MB limit");
        setSelectedFile(null);
        setVideoName("");
        return;
      }

      // Check if it's a video file
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file");
        setSelectedFile(null);
        setVideoName("");
        return;
      }

      setSelectedFile(file);
      setVideoName(file.name); // Auto-populate the video name
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoName.trim()) {
      setError("Please provide a video name");
      return;
    }

    setUploading(true);
    setError("");

    const result = await uploadVideo(selectedFile, videoName.trim());

    if (result.success) {
      setSuccess(true);
      setSelectedFile(null);
      setVideoName("");
      // Reset file input
      const input = document.getElementById("video-input") as HTMLInputElement;
      if (input) input.value = "";

      // Redirect to videos page after 2 seconds
      setTimeout(() => {
        router.push("/videos");
      }, 2000);
    } else {
      setError(result.error || "Upload failed");
    }

    setUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Header />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-full mb-4">
                <Upload size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
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
                    <Video size={48} className="mx-auto text-gray-400 mb-4" />
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
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>Video uploaded successfully! Redirecting...</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || !videoName.trim() || uploading}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
