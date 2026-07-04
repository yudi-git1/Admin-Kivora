// ============================================
// FILE: routes/admin.add.tsx - SUPPORT FF + MLBB + FIXED
// ============================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Save,
  Upload,
  X,
  User,
  ImageIcon,
  ArrowLeft,
  Flame,
  Crown,
  Swords,
  Sparkles,
} from "lucide-react";
import { ActionModal } from "@/components/action-modal";

// ================= EXPORT ROUTE =================
export const Route = createFileRoute("/admin/add")({
  component: AddAccountPage,
});

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

const LOGIN_METHODS = ["Google", "Facebook", "VK", "Apple", "Email"];

const RANK_COLORS: Record<string, string> = {
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
};

// ================= COMPONENT =================
function AddAccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [gameType, setGameType] = useState<"Free Fire" | "Mobile Legends">("Free Fire");
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
    level: "",
    rank_br: "Bronze",
    rank_cs: "Bronze",
    evo_gun: "",
    bundle: "",
    emote: "",
    elite_pass: "",
    login_method: "Google",
    rank: "Epic",
    hero_count: "",
    skin_count: "",
    status: "Available",
    image: "",
    description: "",
  });

  useEffect(() => {
    if (gameType === "Free Fire") {
      setForm((prev) => ({ ...prev, rank: "Epic", hero_count: "", skin_count: "" }));
    } else {
      setForm((prev) => ({
        ...prev,
        rank_br: "Bronze",
        rank_cs: "Bronze",
        level: "",
        evo_gun: "",
        bundle: "",
        emote: "",
        elite_pass: "",
        login_method: "Google",
      }));
    }
  }, [gameType]);

  const uploadImage = async () => {
    if (!imageFile) return "";
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { error } = await supabase.storage.from("account-images").upload(fileName, imageFile);
    if (error) {
      console.error("Upload error:", error);
      return "";
    }
    const { data } = supabase.storage.from("account-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Form submitted!");

    // ================= VALIDASI =================
    if (!form.name.trim()) {
      setModal({ open: true, type: "error", title: "Gagal!", message: "Nama akun harus diisi" });
      return;
    }
    if (!form.code.trim()) {
      setModal({ open: true, type: "error", title: "Gagal!", message: "Kode akun harus diisi" });
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setModal({ open: true, type: "error", title: "Gagal!", message: "Harga harus diisi dan lebih dari 0" });
      return;
    }

    setLoading(true);
    console.log("🔍 Loading started...");

    let imageUrl = form.image;
    if (imageFile) {
      console.log("🔍 Uploading image...");
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const isFF = gameType === "Free Fire";
    const payload: any = {
      name: form.name,
      code: form.code,
      price: Number(form.price),
      game_type: gameType,
      status: form.status,
      image: imageUrl,
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

    console.log("🔍 Payload:", payload);

    const { error } = await supabase.from("accounts").insert(payload);

    if (error) {
      console.error("❌ Supabase error:", error);
      setModal({ open: true, type: "error", title: "Gagal!", message: error.message });
      setLoading(false);
      return;
    }

    console.log("✅ Success!");
    setModal({ open: true, type: "success", title: "Berhasil!", message: "Akun berhasil ditambahkan" });
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
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
                Tambah Akun
              </h1>
              <p className="text-sm text-muted-foreground">Tambah akun baru ke store</p>
            </div>
          </div>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit}>
          <div className="grid xl:grid-cols-2 gap-8">
            {/* LEFT COLUMN - FORM */}
            <div className="space-y-5">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h2 className="gradient-text font-bold flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <User size={18} />
                  INFORMASI AKUN
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Jenis Game *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGameType("Free Fire")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition ${
                          gameType === "Free Fire" ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-border hover:bg-accent/10"
                        }`}
                      >
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">Free Fire</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGameType("Mobile Legends")}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition ${
                          gameType === "Mobile Legends" ? "border-purple-500 bg-purple-500/10 text-purple-400" : "border-border hover:bg-accent/10"
                        }`}
                      >
                        <Crown className="h-4 w-4" />
                        <span className="text-sm font-medium">Mobile Legends</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nama Akun *</label>
                    <input
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Masukkan nama akun"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Kode Akun *</label>
                    <input
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Masukkan kode akun"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Harga (IDR) *</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="Masukkan harga"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                    <select
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Available">Tersedia</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Terjual</option>
                    </select>
                  </div>

                  {gameType === "Free Fire" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Level</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Level"
                          value={form.level}
                          onChange={(e) => setForm({ ...form, level: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rank BR</label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          value={form.rank_br}
                          onChange={(e) => setForm({ ...form, rank_br: e.target.value })}
                        >
                          {FF_RANKS.map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rank CS</label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          value={form.rank_cs}
                          onChange={(e) => setForm({ ...form, rank_cs: e.target.value })}
                        >
                          {FF_RANKS.map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Evo Gun</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Evo Gun"
                          value={form.evo_gun}
                          onChange={(e) => setForm({ ...form, evo_gun: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bundle</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Bundle"
                          value={form.bundle}
                          onChange={(e) => setForm({ ...form, bundle: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Emote</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Emote"
                          value={form.emote}
                          onChange={(e) => setForm({ ...form, emote: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Elite Pass</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Elite Pass"
                          value={form.elite_pass}
                          onChange={(e) => setForm({ ...form, elite_pass: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Login Method</label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          value={form.login_method}
                          onChange={(e) => setForm({ ...form, login_method: e.target.value })}
                        >
                          {LOGIN_METHODS.map((m) => (<option key={m} value={m}>{m}</option>))}
                        </select>
                      </div>
                    </>
                  )}

                  {gameType === "Mobile Legends" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rank</label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          value={form.rank}
                          onChange={(e) => setForm({ ...form, rank: e.target.value })}
                        >
                          {MLBB_RANKS.map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hero Count</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Jumlah hero"
                          value={form.hero_count}
                          onChange={(e) => setForm({ ...form, hero_count: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Skin Count</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                          placeholder="Jumlah skin"
                          value={form.skin_count}
                          onChange={(e) => setForm({ ...form, skin_count: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Deskripsi</label>
                    <textarea
                      className="w-full h-32 rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition resize-y"
                      placeholder="Masukkan deskripsi akun..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - IMAGE + PREVIEW */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h2 className="gradient-text font-bold flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <ImageIcon size={18} />
                  GAMBAR AKUN
                </h2>
                <div className="border border-border rounded-xl p-4 relative bg-background/20">
                  {preview ? (
                    <>
                      <img src={preview} className="w-full h-72 object-cover rounded-xl" alt="Preview" />
                      <button type="button" onClick={removeImage} className="absolute top-5 right-5 bg-destructive p-2 rounded-full hover:bg-destructive/80 transition">
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="h-72 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center relative text-muted-foreground gap-4 bg-background/10">
                      <Upload className="h-12 w-12 text-muted-foreground/30" />
                      <p className="text-sm">Klik atau drag untuk upload gambar</p>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h3 className="gradient-text font-bold mb-4 pb-4 border-b border-border">PREVIEW</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Game</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {gameType === "Free Fire" ? <Flame className="h-3 w-3 text-orange-400" /> : <Crown className="h-3 w-3 text-purple-400" />}
                      {gameType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Nama Akun</span>
                    <span className="text-sm font-medium">{form.name || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Kode</span>
                    <span className="text-sm font-medium">{form.code || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${
                      form.status === "Available" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                      form.status === "Reserved" ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" :
                      "border-red-500/30 text-red-400 bg-red-500/10"
                    }`}>
                      {form.status === "Available" ? "Tersedia" : form.status === "Reserved" ? "Reserved" : "Terjual"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">Harga</span>
                    <span className="text-lg font-bold gradient-text">Rp {Number(form.price || 0).toLocaleString("id-ID")}</span>
                  </div>
                </div>
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
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 rounded-xl gradient-bg flex gap-2 items-center font-bold text-white shadow-neon hover:opacity-90 transition disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Menyimpan..." : "Simpan Akun"}
            </button>
          </div>
        </form>
      </div>

      {/* ================= ACTION MODAL ================= */}
      <ActionModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
        onConfirm={() => {
          setModal({ ...modal, open: false });
          if (modal.type === "success") navigate({ to: "/admin/stock" });
        }}
        confirmText={modal.type === "success" ? "OK" : "Tutup"}
      />
    </div>
  );
}