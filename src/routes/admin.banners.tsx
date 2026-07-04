// ============================================
// FILE: routes/admin.banners.tsx - DENGAN TAMBAH + HAPUSss
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  getBanners, 
  updateBanner, 
  updateBannerWithImage, 
  toggleBannerActive,
  deleteBanner,
  createBanner,
  type Banner 
} from "@/lib/banners";
import { ImageUpload } from "@/components/imageUpload";
import { ActionModal } from "@/components/action-modal";
import { 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Edit, 
  X, 
  Image, 
  Plus,
  Trash2 
} from "lucide-react";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [{ title: "Banner Management · Kivora Point Admin" }],
  }),
  component: BannersPage,
});

const bannerTypes = [
  { value: "flash_sale", label: "Flash Sale Banner (Carousel)" },
  { value: "category_ff", label: "Free Fire Category" },
  { value: "category_mlbb", label: "Mobile Legends Category" },
];

const BANNER_TYPES_MAP: Record<string, string> = {
  flash_sale: "Flash Sale Banner (Carousel)",
  category_ff: "Free Fire Category",
  category_mlbb: "Mobile Legends Category",
};

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Banner>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [modal, setModal] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const fetchBanners = async () => {
    setLoading(true);
    const data = await getBanners();
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ================= START EDIT =================
  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setEditForm({ ...banner });
    setImageFile(null);
    setIsAdding(false);
  };

  // ================= START ADD =================
  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      type: "flash_sale",
      title: "",
      subtitle: "",
      description: "",
      cta_text: "Lihat",
      link: "/stock",
      icon: "🔥",
      background_color: "from-orange-600 to-red-600",
      image_url: null,
      is_active: true,
      order_index: banners.length,
    });
    setImageFile(null);
  };

  // ================= CANCEL EDIT/ADD =================
  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
    setImageFile(null);
  };

  // ================= SAVE BANNER (UPDATE) =================
  const saveBanner = async (id: string) => {
    setSaving(true);

    let result;
    if (imageFile) {
      result = await updateBannerWithImage(id, editForm, imageFile);
    } else {
      result = await updateBanner(id, editForm);
    }

    setSaving(false);

    if (result) {
      setBanners((prev) => prev.map((b) => (b.id === id ? result : b)));
      setEditingId(null);
      setEditForm({});
      setImageFile(null);
      setModal({
        open: true,
        type: "success",
        title: "Berhasil!",
        message: "Banner berhasil diperbarui",
      });
    } else {
      setModal({
        open: true,
        type: "error",
        title: "Gagal!",
        message: "Gagal memperbarui banner",
      });
    }
  };

  // ================= CREATE BANNER (TAMBAH) =================
  const createNewBanner = async () => {
    setSaving(true);

    const data: any = {
      type: editForm.type || "flash_sale",
      title: editForm.title || "Banner Baru",
      subtitle: editForm.subtitle || null,
      description: editForm.description || null,
      cta_text: editForm.cta_text || "Lihat",
      link: editForm.link || "/stock",
      icon: editForm.icon || "🔥",
      background_color: editForm.background_color || "from-orange-600 to-red-600",
      image_url: null,
      is_active: true,
      order_index: banners.length,
    };

    const result = await createBanner(data);

    setSaving(false);

    if (result) {
      if (imageFile) {
        const updated = await updateBannerWithImage(result.id, {}, imageFile);
        if (updated) {
          setBanners((prev) => [...prev, updated]);
        } else {
          setBanners((prev) => [...prev, result]);
        }
      } else {
        setBanners((prev) => [...prev, result]);
      }
      
      setIsAdding(false);
      setEditForm({});
      setImageFile(null);
      setModal({
        open: true,
        type: "success",
        title: "Berhasil!",
        message: "Banner berhasil ditambahkan",
      });
    } else {
      setModal({
        open: true,
        type: "error",
        title: "Gagal!",
        message: "Gagal menambahkan banner",
      });
    }
  };

  // ================= DELETE BANNER =================
  const handleDelete = async (banner: Banner) => {
    const success = await deleteBanner(banner.id);
    
    if (success) {
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      setDeleteTarget(null);
      setModal({
        open: true,
        type: "success",
        title: "Berhasil!",
        message: "Banner berhasil dihapus",
      });
    } else {
      setModal({
        open: true,
        type: "error",
        title: "Gagal!",
        message: "Gagal menghapus banner",
      });
    }
  };

  // ================= TOGGLE ACTIVE =================
  const toggleActive = async (banner: Banner) => {
    const result = await toggleBannerActive(banner.id, !banner.is_active);
    if (result) {
      setBanners((prev) => prev.map((b) => (b.id === result.id ? result : b)));
    }
  };

  const getTypeLabel = (type: string) => {
    return BANNER_TYPES_MAP[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      flash_sale: "text-red-400",
      category_ff: "text-orange-400",
      category_mlbb: "text-purple-400",
    };
    return colors[type] || "text-muted-foreground";
  };

  const isEditing = (id: string) => editingId === id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Image className="h-6 w-6 text-primary" />
              Banner Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {banners.length} banner aktif
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startAdd}
              className="inline-flex items-center gap-1.5 rounded-lg gradient-bg px-3.5 py-2 text-sm font-semibold text-white shadow-neon hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" />
              Tambah Banner
            </button>
            <button
              onClick={fetchBanners}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-accent/10 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Add Banner Form */}
        {isAdding && (
          <div className="bg-card rounded-2xl p-6 border border-primary/50 shadow-neon">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Tambah Banner Baru</h3>
              <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-accent/10 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipe Banner</label>
                <select
                  value={editForm.type || "flash_sale"}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Banner["type"] })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                >
                  {bannerTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
                <input
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                  placeholder="Judul banner"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subtitle</label>
                <input
                  value={editForm.subtitle || ""}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                  placeholder="Subtitle (opsional)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                <input
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                  placeholder="Deskripsi (opsional)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">CTA Text</label>
                <input
                  value={editForm.cta_text || "Lihat"}
                  onChange={(e) => setEditForm({ ...editForm, cta_text: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Link</label>
                <input
                  value={editForm.link || "/stock"}
                  onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Icon</label>
                <input
                  value={editForm.icon || "🔥"}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                  placeholder="🔥"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Background Color</label>
                <input
                  value={editForm.background_color || ""}
                  onChange={(e) => setEditForm({ ...editForm, background_color: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                  placeholder="from-orange-600 to-red-600"
                />
                <div className="mt-1 flex items-center gap-2">
                  <div className={`h-4 w-4 rounded bg-gradient-to-r ${editForm.background_color || "from-orange-600 to-red-600"}`} />
                  <span className="text-[10px] text-muted-foreground">Preview</span>
                </div>
              </div>
            </div>
            <ImageUpload
              value={null}
              onChange={(url) => setEditForm({ ...editForm, image_url: url })}
              onFileChange={(file) => setImageFile(file)}
              label="Gambar Banner (opsional)"
            />
            <div className="flex gap-2 pt-4">
              <button
                onClick={createNewBanner}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-neon hover:opacity-90 transition disabled:opacity-50"
              >
                <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                {saving ? "Menyimpan..." : "Simpan Banner"}
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent/10 transition"
              >
                <X className="h-4 w-4" />
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Banner List */}
        <div className="grid gap-4">
          {banners.map((banner) => {
            const isEditingBanner = isEditing(banner.id);

            return (
              <div
                key={banner.id}
                className={`bg-card rounded-2xl p-6 border transition-all duration-300 ${
                  banner.is_active ? "border-border" : "border-border/40 opacity-60"
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{banner.icon}</span>
                    <div>
                      <h3 className="font-semibold">{banner.title}</h3>
                      <p className={`text-xs ${getTypeColor(banner.type)}`}>
                        {getTypeLabel(banner.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        banner.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {banner.is_active ? (
                        <>
                          <Eye className="h-3 w-3" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Inactive
                        </>
                      )}
                    </button>

                    {!isEditingBanner && (
                      <>
                        <button
                          onClick={() => startEdit(banner)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent/10 transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(banner)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 hover:bg-red-500/10 transition text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content - Edit Form */}
                {isEditingBanner && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
                        <input
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subtitle</label>
                        <input
                          value={editForm.subtitle || ""}
                          onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
                        <input
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">CTA Text</label>
                        <input
                          value={editForm.cta_text || ""}
                          onChange={(e) => setEditForm({ ...editForm, cta_text: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Link</label>
                        <input
                          value={editForm.link || ""}
                          onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Icon (Emoji)</label>
                        <input
                          value={editForm.icon || ""}
                          onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                          placeholder="🔥"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Background Color</label>
                        <input
                          value={editForm.background_color || ""}
                          onChange={(e) => setEditForm({ ...editForm, background_color: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary transition"
                          placeholder="from-orange-600 to-red-600"
                        />
                        <div className="mt-1 flex items-center gap-2">
                          <div className={`h-4 w-4 rounded bg-gradient-to-r ${editForm.background_color || "from-orange-600 to-red-600"}`} />
                          <span className="text-[10px] text-muted-foreground">Preview</span>
                        </div>
                      </div>
                    </div>

                    <ImageUpload
                      value={editForm.image_url || null}
                      onChange={(url) => setEditForm({ ...editForm, image_url: url })}
                      onFileChange={(file) => setImageFile(file)}
                      label="Gambar Banner (opsional)"
                    />

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveBanner(banner.id)}
                        disabled={saving}
                        className="flex items-center gap-1.5 rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-neon hover:opacity-90 transition disabled:opacity-50"
                      >
                        <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent/10 transition"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Content - View */}
                {!isEditingBanner && !isAdding && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Title</span>
                      <p className="font-medium">{banner.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">CTA</span>
                      <p className="font-medium">{banner.cta_text}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Link</span>
                      <p className="font-medium text-xs text-primary truncate">{banner.link}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Background</span>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded bg-gradient-to-r ${banner.background_color}`} />
                        <span className="text-xs font-mono truncate">{banner.background_color}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Image</span>
                      {banner.image_url ? (
                        <div className="mt-1 h-10 w-16 overflow-hidden rounded border border-border">
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No image</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ActionModal
        open={!!deleteTarget}
        type="warning"
        title="Hapus Banner?"
        message={`Banner "${deleteTarget?.title}" akan dihapus permanen.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        confirmText="Ya, Hapus"
        danger
      />

      {/* Success/Error Modal */}
      <ActionModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={() => setModal({ ...modal, open: false })}
        confirmText="OK"
      />
    </>
  );
}