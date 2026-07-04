// ============================================
// FILE: hooks/useSettings.tsx - FIXED
// ============================================

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Settings {
  id: number;
  store_name: string | null;
  email: string | null;
  whatsapp: string | null;
  username: string | null;
  flash_sale: boolean | null;
  show_out_of_stock: boolean | null;
  allow_negotiation: boolean | null;
  email_order: boolean | null;
  logo_url: string | null;
  profile_name: string | null;
  profile_avatar: string | null;
  store_currency?: string | null;
}

const defaultSettings: Settings = {
  id: 1,
  store_name: 'Kivora Point',
  email: 'kivorapoint99@gmail.com',
  whatsapp: '6285717677980',
  username: 'admin',
  flash_sale: true,
  show_out_of_stock: false,
  allow_negotiation: true,
  email_order: true,
  logo_url: null,
  profile_name: 'Admin',
  profile_avatar: null,
  store_currency: 'IDR',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================= FETCH =================
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createDefaultSettings();
          return;
        }
        console.error('❌ Fetch error:', error);
        setError(error.message);
        return;
      }

      if (data) {
        setSettings(data);
        updateLocalStorage(data);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE DEFAULT =================
  const createDefaultSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating default:', error);
        return;
      }

      if (data) {
        setSettings(data);
        updateLocalStorage(data);
      }
    } catch (err) {
      console.error('❌ Error creating default:', err);
    }
  };

  // ================= UPDATE LOCAL STORAGE =================
  const updateLocalStorage = (data: Settings) => {
    if (data.logo_url) localStorage.setItem('app_logo', data.logo_url);
    if (data.store_name) localStorage.setItem('app_logo_text', data.store_name);
    if (data.profile_name) localStorage.setItem('profile_name', data.profile_name);
    if (data.profile_avatar) localStorage.setItem('profile_avatar', data.profile_avatar);
  };

  // ================= UPDATE SETTINGS =================
  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      console.log('🔍 Updating settings:', updates);

      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Code:', error.code);
        console.error('❌ Message:', error.message);
        return null;
      }

      console.log('✅ Settings updated:', data);

      if (data) {
        setSettings(data);
        updateLocalStorage(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('❌ Error updating settings:', err);
      return null;
    }
  };

  // ================= DELETE OLD IMAGE =================
  const deleteOldImage = async (oldUrl: string | null) => {
    if (!oldUrl) return true;

    try {
      const path = oldUrl.split('/settings-images/')[1];
      if (!path) return true;

      const { error } = await supabase.storage
        .from('settings-images')
        .remove([path]);

      if (error) {
        console.error('❌ Error deleting old image:', error);
        return false;
      }

      console.log('✅ Old image deleted:', path);
      return true;
    } catch (err) {
      console.error('❌ Error deleting old image:', err);
      return false;
    }
  };

  // ================= UPLOAD LOGO =================
  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const oldLogoUrl = settings?.logo_url || null;

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('settings-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('settings-images').getPublicUrl(filePath);
      const newUrl = data.publicUrl;

      if (oldLogoUrl) {
        await deleteOldImage(oldLogoUrl);
      }

      return newUrl;
    } catch (err) {
      console.error('❌ Error uploading logo:', err);
      return null;
    }
  };

  // ================= UPLOAD AVATAR =================
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const oldAvatarUrl = settings?.profile_avatar || null;

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('settings-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage.from('settings-images').getPublicUrl(filePath);
      const newUrl = data.publicUrl;

      if (oldAvatarUrl) {
        await deleteOldImage(oldAvatarUrl);
      }

      return newUrl;
    } catch (err) {
      console.error('❌ Error uploading avatar:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    uploadLogo,
    uploadAvatar,
    refetch: fetchSettings,
    deleteOldImage,
  };
}