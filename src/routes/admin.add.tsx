// ============================================
// FILE: admin.add.tsx - BACKGROUND SOLID
// ============================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Save,
  Upload,
  X,
  User,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { ActionModal } from "@/components/action-modal";

export const Route = createFileRoute("/admin/add")({
  head: () => ({
    meta: [
      {
        title: "Tambah Akun · Kivora Point Admin",
      },
    ],
  }),
  component: AddAccountPage,
});

// ================= RANK LENGKAP =================
const RANKS = [
  "Warrior",
  "Elite",
  "Master",
  "Grandmaster",
  "Epic",
  "Legend",
  "Mythic",
  "Mythic Honor",
  "Mythic Glory",
  "Mythic Immortal",
];

const RANK_COLORS: Record<string, string> = {
  Warrior: "text-gray-400",
  Elite: "text-slate-300",
  Master: "text-cyan-400",
  Grandmaster: "text-green-400",
  Epic: "text-red-400",
  Legend: "text-orange-400",
  Mythic: "text-purple-400",
  "Mythic Honor": "text-purple-300",
  "Mythic Glory": "text-yellow-400",
  "Mythic Immortal": "text-amber-400",
};

function AddAccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [modal, setModal] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const [form, setForm] = useState({
    name: "",
    code: "",
    price: "",
    rank: "Epic",
    hero_count: "",
    skin_count: "",
    status: "Available",
    image: "",
    description: "",
  });

  // =============================
  // UPLOAD IMAGE
  // =============================
  const uploadImage = async () => {
    if (!imageFile) return "";

    const fileName = `${Date.now()}-${imageFile.name}`;

    const { error } = await supabase.storage
      .from("account-images")
      .upload(fileName, imageFile);

    if (error) {
      console.error(error);
      return "";
    }

    const { data } = supabase.storage
      .from("account-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = form.image;

    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const { error } = await supabase.from("accounts").insert({
      name: form.name,
      code: form.code,
      price: Number(form.price),
      rank: form.rank,
      hero_count: Number(form.hero_count),
      skin_count: Number(form.skin_count),
      status: form.status,
      image: imageUrl,
      description: form.description,
    });

    if (error) {
      setModal({
        open: true,
        type: "error",
        title: "Gagal Menambahkan Akun",
        message: error.message,
      });
      setLoading(false);
      return;
    }

    setModal({
      open: true,
      type: "success",
      title: "Berhasil!",
      message: "Akun berhasil ditambahkan",
    });

    setLoading(false);
  };

  // =============================
  // IMAGE CHANGE
  // =============================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate({ to: "/admin/stock" })}
                className="p-2 rounded-xl border border-border bg-card hover:bg-accent/10 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  Add New Account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Add a new account to your store
                </p>
              </div>
            </div>
          </div>

          {/* ================= MAIN FORM ================= */}
          <div className="grid xl:grid-cols-2 gap-8">
            {/* ================= LEFT COLUMN ================= */}
            <div className="space-y-5">
              {/* ✅ CONTAINER SOLID - HAPUS glass-card */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h2 className="gradient-text font-bold flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <User size={18} />
                  ACCOUNT INFORMATION
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Account Name
                    </label>
                    <input
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Enter account name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Account Code
                    </label>
                    <input
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Enter account code"
                      value={form.code}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          code: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Price (IDR)
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Enter price"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Rank
                    </label>
                    <select
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      value={form.rank}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          rank: e.target.value,
                        })
                      }
                    >
                      {RANKS.map((rank) => (
                        <option key={rank} value={rank}>
                          {rank}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Hero Count
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Number of heroes"
                      value={form.hero_count}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          hero_count: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Skin Count
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Number of skins"
                      value={form.skin_count}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          skin_count: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Status
                    </label>
                    <select
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Description
                    </label>
                    <textarea
                      className="w-full h-32 rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition resize-y"
                      placeholder="Enter account description..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN ================= */}
            <div className="space-y-6">
              {/* ✅ CONTAINER SOLID - HAPUS glass-card */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h2 className="gradient-text font-bold flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <ImageIcon size={18} />
                  ACCOUNT IMAGE
                </h2>

                <div className="border border-border rounded-xl p-4 relative bg-background/20">
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        className="w-full h-72 object-cover rounded-xl"
                        alt="Preview"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-5 right-5 bg-destructive p-2 rounded-full hover:bg-destructive/80 transition"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="h-72 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center relative text-muted-foreground gap-4 bg-background/10">
                      <Upload className="h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm">Click or drag to upload image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ CONTAINER SOLID - HAPUS glass-card */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h3 className="gradient-text font-bold mb-4 pb-4 border-b border-border">
                  QUICK PREVIEW
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Account Name</span>
                    <span className="text-sm font-medium">{form.name || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Code</span>
                    <span className="text-sm font-medium">{form.code || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Rank</span>
                    <span className={`text-sm font-medium ${RANK_COLORS[form.rank] || "text-foreground"}`}>
                      {form.rank || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${
                        form.status === "Available"
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                          : form.status === "Reserved"
                          ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                          : "border-red-500/30 text-red-400 bg-red-500/10"
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Heroes</span>
                    <span className="text-sm font-medium">{form.hero_count || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Skins</span>
                    <span className="text-sm font-medium">{form.skin_count || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="text-lg font-bold gradient-text">
                      Rp {Number(form.price || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {form.description && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {form.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= BUTTONS ================= */}
          <div className="flex justify-between border-t border-border mt-8 pt-6">
            <button
              type="button"
              onClick={() => navigate({ to: "/admin/stock" })}
              className="px-8 py-3 rounded-xl border border-border bg-card hover:bg-accent/10 transition"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-10 py-3 rounded-xl gradient-bg flex gap-2 items-center font-bold text-white shadow-neon hover:opacity-90 transition disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Account"}
            </button>
          </div>
        </div>
      </form>

      {/* ================= ACTION MODAL ================= */}
      <ActionModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() =>
          setModal({
            ...modal,
            open: false,
          })
        }
        onConfirm={() => {
          setModal({
            ...modal,
            open: false,
          });
          if (modal.type === "success") {
            navigate({
              to: "/admin/stock",
            });
          }
        }}
        confirmText={modal.type === "success" ? "OK" : "Tutup"}
      />
    </>
  );
}