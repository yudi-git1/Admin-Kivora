// ============================================
// FILE: lib/banners.ts - ADMIN (FULL CRUD)
// ============================================

import { supabase } from "./supabase";
import { uploadBannerImage, deleteBannerImage, replaceBannerImage } from "./storage";

export interface Banner {
  id: string;
  type: "flash_sale" | "category_ff" | "category_mlbb";
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string;
  link: string;
  icon: string;
  background_color: string;
  image_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ================= GET ALL BANNERS =================
export async function getBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getBanners:", error);
    return [];
  }
}

// ================= GET ACTIVE BANNERS =================
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching active banners:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getActiveBanners:", error);
    return [];
  }
}

// ================= GET BANNER BY ID =================
export async function getBannerById(id: string): Promise<Banner | null> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    console.error("Error in getBannerById:", error);
    return null;
  }
}

// ================= GET BANNER BY TYPE =================
export async function getBannerByType(type: Banner["type"]): Promise<Banner | null> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("type", type)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    console.error("Error in getBannerByType:", error);
    return null;
  }
}

// ================= UPDATE BANNER (TANPA GAMBAR) =================
export async function updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating banner:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in updateBanner:", error);
    return null;
  }
}

// ================= UPDATE BANNER + GAMBAR =================
export async function updateBannerWithImage(
  id: string,
  updates: Partial<Banner>,
  imageFile?: File | null
): Promise<Banner | null> {
  try {
    let imageUrl = updates.image_url;

    if (imageFile) {
      const oldBanner = await getBannerById(id);
      
      const uploadedUrl = await replaceBannerImage(
        oldBanner?.image_url || null,
        imageFile,
        `banner-${id}-${Date.now()}`
      );

      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    return updateBanner(id, {
      ...updates,
      image_url: imageUrl,
    });
  } catch (error) {
    console.error("Error in updateBannerWithImage:", error);
    return null;
  }
}

// ================= TOGGLE ACTIVE =================
export async function toggleBannerActive(id: string, isActive: boolean): Promise<Banner | null> {
  return updateBanner(id, { is_active: isActive });
}

// ================= CREATE BANNER (TAMBAH BARU) =================
export async function createBanner(data: Omit<Banner, 'id' | 'created_at' | 'updated_at'>): Promise<Banner | null> {
  try {
    const { data: banner, error } = await supabase
      .from("banners")
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating banner:", error);
      return null;
    }
    return banner;
  } catch (error) {
    console.error("Error in createBanner:", error);
    return null;
  }
}

// ================= DELETE BANNER =================
export async function deleteBanner(id: string): Promise<boolean> {
  try {
    // Ambil data banner dulu buat hapus gambar
    const banner = await getBannerById(id);
    if (banner?.image_url) {
      await deleteBannerImage(banner.image_url);
    }

    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting banner:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in deleteBanner:", error);
    return false;
  }
}