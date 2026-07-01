// ============================================
// FILE: admin.edit.$id.tsx - DENGAN RANK DROPDOWN LENGKAP
// ============================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ActionModal } from "@/components/action-modal";
import {
  Save,
  User,
  Sword,
  ImageIcon,
  Tag,
  Hash,
  Sparkles,
  Layers,
  FileText,
  ArrowLeft,
  Eye,
  Shield,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin/edit/$id")({
  component: EditPage,
});

// ================= RANK LENGKAP (DARI TERKECIL → TERBESAR) =================
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

// ================= RANK COLORS UNTUK PREVIEW =================
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

// ================= RANK BADGE COLORS UNTUK PREVIEW =================
const RANK_BADGE_COLORS: Record<string, string> = {
  Warrior: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  Elite: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  Master: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
  Grandmaster: "border-green-400/30 bg-green-400/10 text-green-400",
  Epic: "border-red-400/30 bg-red-400/10 text-red-400",
  Legend: "border-orange-400/30 bg-orange-400/10 text-orange-400",
  Mythic: "border-purple-400/30 bg-purple-400/10 text-purple-400",
  "Mythic Honor": "border-purple-300/30 bg-purple-300/10 text-purple-300",
  "Mythic Glory": "border-yellow-400/30 bg-yellow-400/10 text-yellow-400",
  "Mythic Immortal": "border-amber-400/30 bg-amber-400/10 text-amber-400",
};

function EditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    rank: "",
    hero_count: "",
    skin_count: "",
    status: "Available",
    image: "",
    description: "",
  });

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Data tidak ditemukan");
        navigate({
          to: "/admin/stock",
        });
        return;
      }

      setForm({
        name: data.name ?? "",
        code: data.code ?? "",
        price: String(data.price ?? ""),
        rank: data.rank ?? "",
        hero_count: String(data.hero_count ?? 0),
        skin_count: String(data.skin_count ?? 0),
        status: data.status ?? "Available",
        image: data.image ?? "",
        description: data.description ?? "",
      });

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // ================= UPDATE DATA =================
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("accounts")
      .update({
        name: form.name,
        code: form.code,
        price: Number(form.price),
        rank: form.rank,
        hero_count: Number(form.hero_count),
        skin_count: Number(form.skin_count),
        status: form.status,
        image: form.image,
        description: form.description,
      })
      .eq("id", id);

    if (error) {
      setModal({
        open: true,
        type: "error",
        title: "Gagal!",
        message: error.message,
      });
      setSaving(false);
      return;
    }

    setModal({
      open: true,
      type: "success",
      title: "Berhasil!",
      message: "Akun berhasil diperbarui",
    });

    setSaving(false);
  };

  // ================= GET RANK BADGE CLASS =================
  const getRankBadgeClass = (rank: string) => {
    return RANK_BADGE_COLORS[rank] || "border-border bg-card/50 text-muted-foreground";
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Mengambil data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        {/* ================= HEADER ================= */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: "/admin/stock" })}
                className="p-2 rounded-xl border border-border bg-card hover:bg-accent/10 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  Edit Account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update marketplace account information
                </p>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-neon"
            >
              <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Saving..." : "Update Account"}
            </button>
          </div>

          {/* ================= MAIN FORM ================= */}
          <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ================= LEFT COLUMN - FORM ================= */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section: Account Information */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Account Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Account Name
                    </label>
                    <input
                      className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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

                  {/* Code */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Account Code
                    </label>
                    <input
                      className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Price (IDR)
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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

                  {/* ================= RANK DROPDOWN ================= */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Rank
                    </label>
                    <select
                      className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Status
                    </label>
                    <select
                      className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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

                  {/* Hero Count */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Hero Count
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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

                  {/* Skin Count */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Skin Count
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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
                </div>
              </div>

              {/* Section: Description */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </h2>
                </div>
                <textarea
                  className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition min-h-[120px] resize-y"
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

              {/* Section: Image URL */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Image URL
                  </h2>
                </div>
                <input
                  className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                  placeholder="Enter image URL"
                  value={form.image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* ================= RIGHT COLUMN - PREVIEW ================= */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <Eye className="h-5 w-5 text-primary" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Preview
                    </h2>
                  </div>

                  {/* Image Preview */}
                  <div className="mb-4">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt={form.name}
                        className="w-full aspect-video object-cover rounded-xl border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x225/1a1a2e/ffffff?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full aspect-video bg-card/30 border border-border rounded-xl flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info Preview */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Name</span>
                      <span className="text-sm font-medium">
                        {form.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Code</span>
                      <span className="text-sm font-medium">
                        {form.code || "-"}
                      </span>
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
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Sword className="h-3 w-3 text-primary" />
                        {form.hero_count || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Skins</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        {form.skin_count || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">Price</span>
                      <span className="text-lg font-bold gradient-text">
                        Rp {Number(form.price || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                {form.description && (
                  <div className="mt-4 glass-card rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {form.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

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
          // 🔥 Redirect ke halaman stock setelah sukses
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