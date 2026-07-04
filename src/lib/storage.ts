// ============================================
// FILE: lib/storage.ts
// ============================================

import { supabase } from "./supabase";

const BUCKET_NAME = "banners";

// ================= UPLOAD IMAGE =================
export async function uploadBannerImage(file: File, fileName?: string): Promise<string | null> {
  try {
    const ext = file.name.split(".").pop();
    const uniqueName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
    const filePath = `banners/${uniqueName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Error in uploadBannerImage:", error);
    return null;
  }
}

// ================= DELETE IMAGE =================
export async function deleteBannerImage(imageUrl: string): Promise<boolean> {
  try {
    const urlParts = imageUrl.split("/public/banners/");
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteBannerImage:", error);
    return false;
  }
}

// ================= REPLACE IMAGE =================
export async function replaceBannerImage(
  oldImageUrl: string | null,
  newFile: File,
  fileName?: string
): Promise<string | null> {
  if (oldImageUrl) {
    await deleteBannerImage(oldImageUrl);
  }
  return uploadBannerImage(newFile, fileName);
}