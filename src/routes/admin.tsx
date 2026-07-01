// ============================================
// FILE: app/routes/admin.tsx - FIX localStorage SSR
// ============================================
import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AdminShell } from "@/components/admin-shell";
import { useSettings } from "@/hooks/useSettings";
import { ActionModal } from "@/components/action-modal";
import { isBrowser } from "@/lib/browser";
import { 
  Save, 
  Store, 
  User, 
  Settings, 
  Palette,
  Moon,
  Sun,
  Monitor,
  Camera,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  beforeLoad: async () => {
    // Coba ambil session dari Supabase
    const { data } = await supabase.auth.getSession();
    
    // Jika tidak ada session, cek localStorage (hanya di browser)
    if (!data.session && isBrowser) {
      const storedSession = localStorage.getItem("sb-session");
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          // Set session ke supabase client
          await supabase.auth.setSession(session);
          return { session };
        } catch (e) {
          console.error("Failed to restore session:", e);
        }
      }
      
      // Jika tidak ada session sama sekali, redirect ke login
      throw redirect({ to: "/" });
    }
    
    return { session: data.session };
  },
});

function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const [isSettingsPage, setIsSettingsPage] = useState(false);

  useEffect(() => {
    console.log("🔍 AdminLayout mounted!");
    
    const checkAuth = async () => {
      try {
        // First try to get session from Supabase
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("🔍 Session from Supabase:", session);
        
        // If no session, try to restore from localStorage (only in browser)
        if (!session && isBrowser) {
          const storedSession = localStorage.getItem("sb-session");
          if (storedSession) {
            try {
              const sessionData = JSON.parse(storedSession);
              console.log("🔍 Restoring session from localStorage");
              const { data: restoredData, error: restoreError } = await supabase.auth.setSession(sessionData);
              if (restoreError) {
                console.error("🔍 Restore error:", restoreError);
                throw restoreError;
              }
              session = restoredData.session;
            } catch (e) {
              console.error("🔍 Failed to restore session:", e);
              if (isBrowser) {
                localStorage.removeItem("sb-session");
                localStorage.removeItem("admin");
                localStorage.removeItem("role");
              }
            }
          }
        }
        
        // If still no session, redirect to login
        if (!session) {
          console.log("🔍 No session found, redirecting to login");
          if (isBrowser) {
            window.location.href = "/";
          }
          return;
        }

        // Save session to localStorage for persistence (only in browser)
        if (isBrowser) {
          localStorage.setItem("sb-session", JSON.stringify(session));
          localStorage.setItem("admin", "true");
        }
        
        // Get user profile
        if (session.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (profile && isBrowser) {
            localStorage.setItem("role", profile.role || "viewer");
          }
        }
        
        setError(null);
      } catch (err) {
        console.error("🔍 Auth error:", err);
        setError("Authentication error");
        if (isBrowser) {
          localStorage.removeItem("sb-session");
          localStorage.removeItem("admin");
          localStorage.removeItem("role");
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe ke auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔍 Auth state changed:", event);
        
        if (event === "SIGNED_OUT") {
          if (isBrowser) {
            localStorage.removeItem("sb-session");
            localStorage.removeItem("admin");
            localStorage.removeItem("role");
            window.location.href = "/";
          }
        } else if (event === "SIGNED_IN" && session && isBrowser) {
          localStorage.setItem("sb-session", JSON.stringify(session));
          localStorage.setItem("admin", "true");
        } else if (event === "TOKEN_REFRESHED" && session && isBrowser) {
          localStorage.setItem("sb-session", JSON.stringify(session));
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const path = location.pathname;
    console.log("🔍 Current path:", path);
    setIsSettingsPage(path === "/admin/setting" || path === "/admin/settings");
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="text-white">Loading ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="text-white">Error: {error}</div>
      </div>
    );
  }

  return (
    <AdminShell title="Dashboard" subtitle="Kivora Point Admin">
      {isSettingsPage ? <SettingsPage /> : <Outlet />}
    </AdminShell>
  );
}

// ============================================
// SETTINGS PAGE - (SAMA SEPERTI SEBELUMNYA)
// ============================================
function SettingsPage() {
  const { settings, loading, updateSettings, uploadLogo, uploadAvatar, refetch } = useSettings();
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // ================= ACTION MODAL STATE =================
  const [modal, setModal] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
    loading: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: checked
    }));
  };

  // ================= HANDLE SAVE DENGAN ACTION MODAL =================
  const handleSave = async () => {
    setModal({
      open: true,
      type: "warning",
      title: "Konfirmasi Simpan",
      message: "Apakah Anda yakin ingin menyimpan perubahan settings?",
      loading: false,
    });
  };

  const confirmSave = async () => {
    setModal(prev => ({ ...prev, loading: true }));

    try {
      // Upload logo jika ada
      if (previewLogo) {
        const logoFile = document.getElementById('logo-upload') as HTMLInputElement;
        if (logoFile?.files?.[0]) {
          const url = await uploadLogo(logoFile.files[0]);
          if (url) {
            formData.logo_url = url;
          }
        }
      }

      // Upload avatar jika ada
      if (previewAvatar) {
        const avatarFile = document.getElementById('avatar-upload') as HTMLInputElement;
        if (avatarFile?.files?.[0]) {
          const url = await uploadAvatar(avatarFile.files[0]);
          if (url) {
            formData.profile_avatar = url;
          }
        }
      }

      const result = await updateSettings(formData);
      
      if (result) {
        setModal({
          open: true,
          type: "success",
          title: "Berhasil!",
          message: "Settings berhasil disimpan",
          loading: false,
        });
        setPreviewLogo(null);
        setPreviewAvatar(null);
        await refetch();
      } else {
        setModal({
          open: true,
          type: "error",
          title: "Gagal!",
          message: "Gagal menyimpan settings",
          loading: false,
        });
      }
    } catch (err) {
      console.error('Save error:', err);
      setModal({
        open: true,
        type: "error",
        title: "Error!",
        message: err instanceof Error ? err.message : "Terjadi kesalahan",
        loading: false,
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-gray-400">Configure your Kivora Point admin workspace</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ================= STORE PROFILE ================= */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Store Profile</h2>
                <p className="text-xs text-gray-400">Public marketplace identity</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Store Name */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Store Name</label>
                <input 
                  name="store_name"
                  value={formData.store_name || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="Enter store name"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Store Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img 
                      src={previewLogo || formData.logo_url || '/default-logo.png'} 
                      alt="Logo" 
                      className="h-16 w-16 rounded-xl object-cover border border-gray-700 bg-gray-900/50"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition">
                      <Camera className="h-5 w-5 text-white" />
                      <input 
                        id="logo-upload"
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
                  {previewLogo && (
                    <button 
                      onClick={() => setPreviewLogo(null)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <p className="text-xs text-gray-500">Click on logo to change</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Contact Email</label>
                <input 
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="Enter email address"
                  type="email"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">WhatsApp</label>
                <input 
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="Enter WhatsApp number"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Store Currency</label>
                <select 
                  name="currency"
                  value={formData.currency || 'IDR'}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="IDR">Indonesian Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="SGD">Singapore Dollar (SGD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= PROFILE ================= */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Admin Profile</h2>
                <p className="text-xs text-gray-400">Your personal information</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Profile Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img 
                      src={previewAvatar || formData.profile_avatar || '/default-avatar.png'} 
                      alt="Avatar" 
                      className="h-16 w-16 rounded-full object-cover border border-gray-700 bg-gray-900/50"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                      <Camera className="h-5 w-5 text-white" />
                      <input 
                        id="avatar-upload"
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  {previewAvatar && (
                    <button 
                      onClick={() => setPreviewAvatar(null)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <p className="text-xs text-gray-500">Click on avatar to change</p>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
                <input 
                  name="username"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="Enter username"
                />
              </div>

              {/* Profile Name */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
                <input 
                  name="profile_name"
                  value={formData.profile_name || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="Enter display name"
                />
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  name="current_password"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password</label>
                <input 
                  type="password" 
                  name="new_password"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" 
                  placeholder="Enter new password"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= PREFERENCES ================= */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-600 text-white">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Marketplace Preferences</h2>
              <p className="text-xs text-gray-400">Control how the store behaves</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Toggle 
                label="Enable flash sale banner" 
                checked={formData.flash_sale || false}
                onChange={(checked) => handleCheckboxChange('flash_sale', checked)}
              />
              <Toggle 
                label="Show out-of-stock accounts"
                checked={formData.show_out_of_stock || false}
                onChange={(checked) => handleCheckboxChange('show_out_of_stock', checked)}
              />
              <Toggle 
                label="Allow customer negotiation"
                checked={formData.allow_negotiation || false}
                onChange={(checked) => handleCheckboxChange('allow_negotiation', checked)}
              />
            </div>
            <div className="space-y-3">
              <Toggle 
                label="Send email on new order"
                checked={formData.email_order || false}
                onChange={(checked) => handleCheckboxChange('email_order', checked)}
              />
              <Toggle 
                label="Enable WhatsApp notifications"
                checked={formData.whatsapp_notif || false}
                onChange={(checked) => handleCheckboxChange('whatsapp_notif', checked)}
              />
              <Toggle 
                label="Auto-archive completed orders"
                checked={formData.auto_archive || false}
                onChange={(checked) => handleCheckboxChange('auto_archive', checked)}
              />
            </div>
          </div>
        </div>

        {/* ================= THEME ================= */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-600 text-white">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Theme & Appearance</h2>
              <p className="text-xs text-gray-400">Customize your dashboard look</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <ThemeOption 
              label="Dark"
              icon={<Moon className="h-5 w-5" />}
              isActive={theme === "dark"}
              onClick={() => setTheme("dark")}
            />
            <ThemeOption 
              label="Light"
              icon={<Sun className="h-5 w-5" />}
              isActive={theme === "light"}
              onClick={() => setTheme("light")}
            />
            <ThemeOption 
              label="System"
              icon={<Monitor className="h-5 w-5" />}
              isActive={theme === "system"}
              onClick={() => setTheme("system")}
            />
          </div>
        </div>
      </div>

      {/* ================= ACTION MODAL ================= */}
      <ActionModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        loading={modal.loading}
        onClose={() => {
          if (!modal.loading) {
            setModal({ ...modal, open: false });
            if (modal.type === "success") {
              refetch();
            }
          }
        }}
        onConfirm={() => {
          if (modal.type === "warning") {
            confirmSave();
          } else {
            setModal({ ...modal, open: false });
            if (modal.type === "success") {
              refetch();
            }
          }
        }}
        confirmText={
          modal.type === "warning" 
            ? "Ya, Simpan" 
            : modal.type === "success" 
            ? "OK" 
            : "Tutup"
        }
        danger={modal.type === "error"}
      />
    </>
  );
}

// ================= COMPONENTS =================

function Toggle({ 
  label, 
  checked = false,
  onChange
}: { 
  label: string; 
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-700 bg-gray-900/30 p-4 transition hover:bg-gray-800/50">
      <span className="text-sm text-white">{label}</span>
      <div className="relative" onClick={handleToggle}>
        <input 
          type="checkbox" 
          checked={isChecked} 
          readOnly
          className="peer sr-only" 
        />
        <div className="h-6 w-11 rounded-full bg-gray-700 transition peer-checked:bg-blue-600">
          <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${isChecked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>
    </label>
  );
}

function ThemeOption({ 
  label, 
  icon, 
  isActive, 
  onClick
}: { 
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
        isActive 
          ? "border-blue-500 bg-blue-500/10" 
          : "border-gray-700 hover:border-gray-500"
      }`}
    >
      <div className={`text-2xl ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
        {label}
      </span>
      {isActive && (
        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
      )}
    </button>
  );
}