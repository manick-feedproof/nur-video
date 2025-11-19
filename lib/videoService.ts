import { supabase } from "@/lib/supabase";
import type { VideoCategory } from "@/lib/constants";

export interface Video {
  id: string;
  name: string;
  size: number;
  storage_path: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const BUCKET_NAME = "videos";

export async function uploadVideo(
  file: File,
  customName?: string,
  category: VideoCategory = "Semua"
): Promise<{ success: boolean; error?: string; video?: Video }> {
  try {
    // Upload to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Insert metadata into database
    const { data, error: dbError } = await supabase
      .from("videos")
      .insert({
        name: customName || file.name,
        size: file.size,
        storage_path: filePath,
        category: category,
      })
      .select()
      .single();

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      throw dbError;
    }

    return { success: true, video: data as Video };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    return { success: false, error: errorMessage };
  }
}

export async function getVideos(category?: VideoCategory): Promise<{
  success: boolean;
  videos?: Video[];
  error?: string;
}> {
  try {
    let query = supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by category if provided and not "Semua"
    if (category && category !== "Semua") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, videos: data as Video[] };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch videos";
    return { success: false, error: errorMessage };
  }
}

export async function deleteVideo(
  videoId: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from("videos")
      .delete()
      .eq("id", videoId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: errorMessage };
  }
}

export function getVideoUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function getVideoDownloadUrl(
  storagePath: string
): Promise<string> {
  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 60, {
      download: true,
    });

  return data?.signedUrl || "";
}
