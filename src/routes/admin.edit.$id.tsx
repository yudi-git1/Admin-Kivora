// ============================================
<<<<<<< HEAD
// FILE: routes/admin.edit.$id.tsx - SUPPORT FF + MLBB (FIXED)
=======
// FILE: admin.edit.$id.tsx - BACKGROUND SOLID
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
// ============================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ActionModal } from "@/components/action-modal";
import {
  Save,
  User,
<<<<<<< HEAD
  ImageIcon,
  ArrowLeft,
  Flame,
  Crown,
  Shield,
  Swords,
  Sparkles,
  Eye,
=======
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
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
} from "lucide-react";

export const Route = createFileRoute("/admin/edit/$id")({
  component: EditPage,
});

<<<<<<< HEAD
// ================= RANK DATA =================
const FF_RANKS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Heroic",
  "Elite Heroic",
  "Master",
  "Elite Master",
  "Grandmaster",
];

const MLBB_RANKS = [
=======
// ================= RANK LENGKAP =================
const RANKS = [
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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

<<<<<<< HEAD
const LOGIN_METHODS = ["Google", "Facebook", "VK", "Apple", "Email"];

// ================= RANK COLORS GABUNGAN (TIDAK DUPLIKAT) =================
const RANK_COLORS: Record<string, string> = {
  // FF
  Bronze: "text-amber-600",
  Silver: "text-gray-400",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-400",
  Diamond: "text-blue-400",
  Heroic: "text-purple-400",
  "Elite Heroic": "text-purple-300",
  Master: "text-red-400",
  "Elite Master": "text-red-300",
  Grandmaster: "text-orange-400",
  // MLBB (pake prefix biar gak clash)
  mlbb_Warrior: "text-gray-400",
  mlbb_Elite: "text-slate-300",
  mlbb_Master: "text-cyan-400",
  mlbb_Grandmaster: "text-green-400",
  mlbb_Epic: "text-red-400",
  mlbb_Legend: "text-orange-400",
  mlbb_Mythic: "text-purple-400",
  mlbb_MythicHonor: "text-purple-300",
  mlbb_MythicGlory: "text-yellow-400",
  mlbb_MythicImmortal: "text-amber-400",
};

// ================= GET RANK COLOR =================
const getRankColor = (rank: string, gameType?: string) => {
  if (gameType === "Mobile Legends") {
    const map: Record<string, string> = {
      Warrior: "mlbb_Warrior",
      Elite: "mlbb_Elite",
      Master: "mlbb_Master",
      Grandmaster: "mlbb_Grandmaster",
      Epic: "mlbb_Epic",
      Legend: "mlbb_Legend",
      Mythic: "mlbb_Mythic",
      "Mythic Honor": "mlbb_MythicHonor",
      "Mythic Glory": "mlbb_MythicGlory",
      "Mythic Immortal": "mlbb_MythicImmortal",
    };
    return RANK_COLORS[map[rank] || rank] || "text-foreground";
  }
  return RANK_COLORS[rank] || "text-foreground";
=======
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
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
};

function EditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
<<<<<<< HEAD
  const [gameType, setGameType] = useState<"Free Fire" | "Mobile Legends">("Free Fire");
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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
<<<<<<< HEAD
    // FF Fields
    level: "",
    rank_br: "Bronze",
    rank_cs: "Bronze",
    evo_gun: "",
    bundle: "",
    emote: "",
    elite_pass: "",
    login_method: "Google",
    // MLBB Fields
    rank: "Epic",
    hero_count: "",
    skin_count: "",
    // Common
=======
    rank: "",
    hero_count: "",
    skin_count: "",
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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
<<<<<<< HEAD
        navigate({ to: "/admin/stock" });
        return;
      }

      const isFF = data.game_type === "Free Fire";

      setGameType(isFF ? "Free Fire" : "Mobile Legends");

=======
        navigate({
          to: "/admin/stock",
        });
        return;
      }

>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
      setForm({
        name: data.name ?? "",
        code: data.code ?? "",
        price: String(data.price ?? ""),
<<<<<<< HEAD
        // FF Fields
        level: String(data.level ?? 0),
        rank_br: data.rank_br ?? "Bronze",
        rank_cs: data.rank_cs ?? "Bronze",
        evo_gun: String(data.evo_gun ?? 0),
        bundle: String(data.bundle ?? 0),
        emote: String(data.emote ?? 0),
        elite_pass: String(data.elite_pass ?? 0),
        login_method: data.login_method ?? "Google",
        // MLBB Fields
        rank: data.rank ?? "Epic",
        hero_count: String(data.hero_count ?? 0),
        skin_count: String(data.skin_count ?? 0),
        // Common
=======
        rank: data.rank ?? "",
        hero_count: String(data.hero_count ?? 0),
        skin_count: String(data.skin_count ?? 0),
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
        status: data.status ?? "Available",
        image: data.image ?? "",
        description: data.description ?? "",
      });

      setLoading(false);
    };

    fetchData();
<<<<<<< HEAD
  }, [id, navigate]);
=======
  }, [id]);
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3

  // ================= UPDATE DATA =================
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

<<<<<<< HEAD
    const isFF = gameType === "Free Fire";
    const payload: any = {
      name: form.name,
      code: form.code,
      price: Number(form.price),
      game_type: gameType,
      status: form.status,
      image: form.image,
      description: form.description,
    };

    if (isFF) {
      payload.level = Number(form.level) || 0;
      payload.rank_br = form.rank_br;
      payload.rank_cs = form.rank_cs;
      payload.evo_gun = Number(form.evo_gun) || 0;
      payload.bundle = Number(form.bundle) || 0;
      payload.emote = Number(form.emote) || 0;
      payload.elite_pass = Number(form.elite_pass) || 0;
      payload.login_method = form.login_method;
      payload.rank = form.rank_br;
      payload.hero_count = 0;
      payload.skin_count = 0;
    } else {
      payload.rank = form.rank;
      payload.hero_count = Number(form.hero_count) || 0;
      payload.skin_count = Number(form.skin_count) || 0;
      payload.level = 0;
      payload.rank_br = "Bronze";
      payload.rank_cs = "Bronze";
      payload.evo_gun = 0;
      payload.bundle = 0;
      payload.emote = 0;
      payload.elite_pass = 0;
      payload.login_method = "Google";
    }

    const { error } = await supabase
      .from("accounts")
      .update(payload)
=======
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
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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
        <div className="max-w-7xl mx-auto">
          {/* ================= HEADER ================= */}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ================= LEFT COLUMN - FORM ================= */}
            <div className="lg:col-span-2 space-y-6">
<<<<<<< HEAD
=======
              {/* ✅ CONTAINER SOLID - HAPUS glass-card */}
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Account Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<<<<<<< HEAD
                  {/* Game Type */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Game Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGameType("Free Fire")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition ${
                          gameType === "Free Fire"
                            ? "border-orange-500 bg-orange-500/10 text-orange-400"
                            : "border-border hover:bg-accent/10"
                        }`}
                      >
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">Free Fire</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGameType("Mobile Legends")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition ${
                          gameType === "Mobile Legends"
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-border hover:bg-accent/10"
                        }`}
                      >
                        <Crown className="h-4 w-4" />
                        <span className="text-sm font-medium">Mobile Legends</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Account Name *
=======
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Account Name
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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
<<<<<<< HEAD
                      required
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
<<<<<<< HEAD
                      Account Code *
=======
                      Account Code
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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
<<<<<<< HEAD
                      required
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
<<<<<<< HEAD
                      Price (IDR) *
=======
                      Price (IDR)
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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
<<<<<<< HEAD
                      required
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
<<<<<<< HEAD
=======
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
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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

<<<<<<< HEAD
                  {/* ================= FF FIELDS ================= */}
                  {gameType === "Free Fire" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Level
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Level"
                          value={form.level}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              level: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Rank BR
                        </label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          value={form.rank_br}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              rank_br: e.target.value,
                            })
                          }
                        >
                          {FF_RANKS.map((rank) => (
                            <option key={rank} value={rank}>
                              {rank}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Rank CS
                        </label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          value={form.rank_cs}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              rank_cs: e.target.value,
                            })
                          }
                        >
                          {FF_RANKS.map((rank) => (
                            <option key={rank} value={rank}>
                              {rank}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Evo Gun
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Evo Gun"
                          value={form.evo_gun}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              evo_gun: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Bundle
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Bundle"
                          value={form.bundle}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              bundle: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Emote
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Emote"
                          value={form.emote}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              emote: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Elite Pass
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Elite Pass"
                          value={form.elite_pass}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              elite_pass: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Login Method
                        </label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          value={form.login_method}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              login_method: e.target.value,
                            })
                          }
                        >
                          {LOGIN_METHODS.map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* ================= MLBB FIELDS ================= */}
                  {gameType === "Mobile Legends" && (
                    <>
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
                          {MLBB_RANKS.map((rank) => (
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
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition min-h-[120px] resize-y"
                      placeholder="Enter account description..."
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
=======
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
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
                        })
                      }
                    />
                  </div>
                </div>
              </div>

<<<<<<< HEAD
              {/* Image URL */}
=======
              {/* ✅ CONTAINER SOLID - HAPUS glass-card */}
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </h2>
                </div>
                <textarea
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition min-h-[120px] resize-y"
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

              {/* ✅ CONTAINER SOLID - HAPUS glass-card */}
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Image URL
                  </h2>
                </div>
                <input
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
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
<<<<<<< HEAD
=======
                {/* ✅ CONTAINER SOLID - HAPUS glass-card */}
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <Eye className="h-5 w-5 text-primary" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Preview
                    </h2>
                  </div>

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
                      <div className="w-full aspect-video bg-background/50 border border-border rounded-xl flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
<<<<<<< HEAD
                      <span className="text-xs text-muted-foreground">Game</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        {gameType === "Free Fire" ? (
                          <Flame className="h-3 w-3 text-orange-400" />
                        ) : (
                          <Crown className="h-3 w-3 text-purple-400" />
                        )}
                        {gameType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
                      <span className="text-xs text-muted-foreground">Name</span>
                      <span className="text-sm font-medium">{form.name || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Code</span>
                      <span className="text-sm font-medium">{form.code || "-"}</span>
                    </div>
<<<<<<< HEAD

                    {gameType === "Free Fire" ? (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Level</span>
                          <span className="text-sm font-medium">{form.level || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Rank BR</span>
                          <span className={`text-sm font-medium ${getRankColor(form.rank_br, "Free Fire")}`}>
                            {form.rank_br}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Rank CS</span>
                          <span className={`text-sm font-medium ${getRankColor(form.rank_cs, "Free Fire")}`}>
                            {form.rank_cs}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Evo Gun</span>
                          <span className="text-sm font-medium">{form.evo_gun || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Bundle</span>
                          <span className="text-sm font-medium">{form.bundle || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Emote</span>
                          <span className="text-sm font-medium">{form.emote || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Elite Pass</span>
                          <span className="text-sm font-medium">{form.elite_pass || "0"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Login</span>
                          <span className="text-sm font-medium">{form.login_method}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Rank</span>
                          <span className={`text-sm font-medium ${getRankColor(form.rank, "Mobile Legends")}`}>
                            {form.rank}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground">Heroes</span>
                          <span className="text-sm font-medium flex items-center gap-1">
                            <Swords className="h-3 w-3 text-primary" />
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
                      </>
                    )}

=======
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">Rank</span>
                      <span className={`text-sm font-medium ${RANK_COLORS[form.rank] || "text-foreground"}`}>
                        {form.rank || "-"}
                      </span>
                    </div>
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
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
<<<<<<< HEAD
=======
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
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">Price</span>
                      <span className="text-lg font-bold gradient-text">
                        Rp {Number(form.price || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
<<<<<<< HEAD

                  {form.description && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-foreground line-clamp-3">
                        {form.description}
                      </p>
                    </div>
                  )}
                </div>
=======
                </div>

                {form.description && (
                  <div className="mt-4 bg-card rounded-2xl p-4 border border-border shadow-soft">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {form.description}
                    </p>
                  </div>
                )}
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
              </div>
            </div>
          </div>
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