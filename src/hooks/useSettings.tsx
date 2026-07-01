// ============================================
// FILE: hooks/useSettings.ts
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
}

const defaultSettings: Settings = {
  id: 1,
  store_name: 'Kivora Point',
  email: 'admin@kivorapoint.com',
  whatsapp: '+62 812-3456-7890',
  username: 'admin',
  flash_sale: true,
  show_out_of_stock: false,
  allow_negotiation: true,
  email_order: true,
  logo_url: null,
  profile_name: 'Admin',
  profile_avatar: null,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        // Jika data tidak ada, buat default
        if (error.code === 'PGRST116') {
          await createDefaultSettings();
          return;
        }
        setError(error.message);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error creating default:', err);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', 1)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return null;
      }

      if (data) {
        setSettings(data);
        // Update localStorage untuk sync
        if (updates.logo_url !== undefined) {
          localStorage.setItem('app_logo', updates.logo_url || '');
        }
        if (updates.store_name !== undefined) {
          localStorage.setItem('app_logo_text', updates.store_name || 'Kivora Point');
        }
        if (updates.profile_name !== undefined) {
          localStorage.setItem('profile_name', updates.profile_name || 'Admin');
        }
        if (updates.profile_avatar !== undefined) {
          localStorage.setItem('profile_avatar', updates.profile_avatar || '');
        }
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error updating:', err);
      return null;
    }
  };

  // Upload logo ke storage
  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('settings-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('settings-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading:', err);
      return null;
    }
  };

  // Upload avatar profile
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('settings-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('settings-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading:', err);
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
  };
}