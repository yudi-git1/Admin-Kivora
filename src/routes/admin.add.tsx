// ============================================
// FILE: routes/admin.add.tsx - MULTIPLE IMAGES
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
} from "lucide-react";
import { ActionModal } from "@/components/action-modal";

export const Route = createFileRoute("/admin/add")({
  component: AddAccountPage,
});

// ================= RANK DATA =================
const FF_RANKS = [
  "Bronze", "Silver", "Gold", "Platinum", "Diamond",
  "Heroic", "Elite Heroic", "Master", "Elite Master", "Grandmaster",
];

const MLBB_RANKS = [
  "Warrior", "Elite", "Master", "Grandmaster", "Epic",
  "Legend", "Mythic", "Mythic Honor", "Mythic Glory", "Mythic Immortal",
];

const LOGIN_METHODS = ["Google", "Facebook", "VK", "Apple", "Email"];

function AddAccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gameType, setGameType] = useState<"Free Fire" | "Mobile Legends">("Free Fire");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

  // ================= UPLOAD MULTIPLE IMAGES =================
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("account-images")
        .upload(fileName, file);
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      const { data } = supabase.storage
        .from("account-images")
        .getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  // ================= HANDLE MULTIPLE IMAGES CHANGE =================
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
      
      const previews: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      // Reset previews biar ga double
      setImagePreviews([]);
      setTimeout(() => {
        fileArray.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }, 100);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name.trim()) {
      setModal({ open: true, type: "error", title: "Gagal!", message: "Nama akun harus diisi" });
      setLoading(false);
      return;
    }
    if (!form.code.trim()) {
      setModal({ open: true, type: "error", title: "Gagal!", message: "Kode akun harus diisi" });
      setLoading(false);
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setModal({ open: true, type: "error", title: "Gagal!", message: "Harga harus diisi" });
      setLoading(false);
      return;
    }

    let imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      imageUrls = await uploadImages(imageFiles);
    }

    const isFF = gameType === "Free Fire";
    const payload: any = {
      name: form.name,
      code: form.code,
      price: Number(form.price),
      game_type: gameType,
      status: form.status,
      image: imageUrls[0] || null,
      images: imageUrls,
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

    const { error } = await supabase.from("accounts").insert(payload);

    if (error) {
      setModal({ open: true, type: "error", title: "Gagal!", message: error.message });
      setLoading(false);
      return;
    }

    setModal({ open: true, type: "success", title: "Berhasil!", message: "Akun berhasil ditambahkan" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
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

        <form onSubmit={handleSubmit}>
          <div className="grid xl:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="gradient-text font-bold flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <User size={18} />
                  INFORMASI AKUN
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Game Type */}
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
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                      placeholder="Masukkan nama akun"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Kode Akun *</label>
                    <input
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
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
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                      placeholder="Masukkan harga"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                    <select
                      className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
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
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                          placeholder="Level"
                          value={form.level}
                          onChange={(e) => setForm({ ...form, level: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rank BR</label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                          value={form.rank_br}
                          onChange={(e) => setForm({ ...form, rank_br: e.target.value })}
                        >
                          {FF_RANKS.map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rank CS</label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
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
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                          placeholder="Evo Gun"
                          value={form.evo_gun}
                          onChange={(e) => setForm({ ...form, evo_gun: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bundle</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                          placeholder="Bundle"
                          value={form.bundle}
                          onChange={(e) => setForm({ ...form, bundle: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Emote</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                          placeholder="Emote"
                          value={form.emote}
                          onChange={(e) => setForm({ ...form, emote: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Elite Pass</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                          placeholder="Elite Pass"
                          value={form.elite_pass}
                          onChange={(e) => setForm({ ...form, elite_pass: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Login Method</label>
                        <select
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
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
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
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
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
                          placeholder="Jumlah hero"
                          value={form.hero_count}
                          onChange={(e) => setForm({ ...form, hero_count: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Skin Count</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition"
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
                      className="w-full h-32 rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary transition resize-y"
                      placeholder="Masukkan deskripsi akun..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - MULTIPLE IMAGES */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="gradient-text font-bold flex items-center gap-2 mb-6 pb-4 border-b border-border">
                  <ImageIcon size={18} />
                  GAMBAR AKUN (Bisa lebih dari 1)
                </h2>
                
                {/* Image Grid Preview */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={preview} className="h-full w-full object-cover" alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-destructive p-1 rounded-full hover:bg-destructive/80 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area - MULTIPLE FILES */}
                <div className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Klik untuk upload multiple gambar
                  </p>
                  <p className="text-xs text-muted-foreground/50">
                    JPG, PNG, WEBP · Max 2MB per file
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImagesChange}
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {imageFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {imageFiles.length} gambar dipilih
                  </p>
                )}
              </div>

              {/* PREVIEW */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="gradient-text font-bold mb-4 pb-4 border-b border-border">PREVIEW</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Game</span>
                    <span className="text-sm font-medium">{gameType}</span>
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

          {/* BUTTONS */}
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