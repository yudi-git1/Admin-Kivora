// ============================================
// FILE: admin.stock.tsx - BULK DELETE + PAGINATION
// ============================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity-log";

import {
  Eye,
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  Sword,
  Sparkles,
  X,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Trash,
} from "lucide-react";

import { ActionModal } from "@/components/action-modal";

export const Route = createFileRoute("/admin/stock")({
  head: () => ({
    meta: [{ title: "Stock Akun · Kivora Point Admin" }],
  }),
  component: StockPage,
});

// ================= FILTER OPTIONS =================
const FILTERS: ("All" | "Available" | "Reserved" | "Sold")[] = [
  "All",
  "Available",
  "Reserved",
  "Sold",
];

// ================= RANK LENGKAP =================
const RANK_FILTERS = [
  "All",
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

// ================= RANK BADGE COLORS =================
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

const SORT_OPTIONS = [
  { label: "Nama (A-Z)", value: "name_asc" },
  { label: "Nama (Z-A)", value: "name_desc" },
  { label: "Harga (Terendah)", value: "price_asc" },
  { label: "Harga (Tertinggi)", value: "price_desc" },
  { label: "Terbaru", value: "newest" },
  { label: "Terlama", value: "oldest" },
  { label: "Hero (Terbanyak)", value: "hero_desc" },
  { label: "Skin (Terbanyak)", value: "skin_desc" },
  { label: "Rank (Terendah → Tertinggi)", value: "rank_asc" },
  { label: "Rank (Tertinggi → Terendah)", value: "rank_desc" },
];

const RANK_ORDER: Record<string, number> = {
  Warrior: 1,
  Elite: 2,
  Master: 3,
  Grandmaster: 4,
  Epic: 5,
  Legend: 6,
  Mythic: 7,
  "Mythic Honor": 8,
  "Mythic Glory": 9,
  "Mythic Immortal": 10,
};

// ================= PAGINATION =================
const ITEMS_PER_PAGE = 12;

function StockPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [rankFilter, setRankFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ================= BULK DELETE STATE =================
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // ================= MODAL STATES =================
  const [modal, setModal] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [detailTarget, setDetailTarget] = useState<any>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // ================= CLICK OUTSIDE SORT =================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= FETCH ACCOUNTS =================
  const fetchAccounts = async () => {
    setLoading(true);
    let query = supabase.from("accounts").select("*");

    switch (sortBy) {
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      case "name_desc":
        query = query.order("name", { ascending: false });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "hero_desc":
        query = query.order("hero_count", { ascending: false });
        break;
      case "skin_desc":
        query = query.order("skin_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (!error) {
      let result = data || [];
      if (sortBy === "rank_asc") {
        result = [...result].sort((a, b) => (RANK_ORDER[a.rank] || 0) - (RANK_ORDER[b.rank] || 0));
      } else if (sortBy === "rank_desc") {
        result = [...result].sort((a, b) => (RANK_ORDER[b.rank] || 0) - (RANK_ORDER[a.rank] || 0));
      }
      setAccounts(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, [sortBy]);

  // ================= FILTER =================
  const filtered = accounts.filter((a) => {
    if (filter !== "All" && a.status !== filter) return false;
    if (rankFilter !== "All" && a.rank !== rankFilter) return false;
    if (q && !a.name.toLowerCase().includes(q.toLowerCase()) && !a.code.toLowerCase().includes(q.toLowerCase())) {
      return false;
    }
    if (priceMin && Number(a.price) < Number(priceMin)) return false;
    if (priceMax && Number(a.price) > Number(priceMax)) return false;
    return true;
  });

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, rankFilter, q, priceMin, priceMax, sortBy]);

  // ================= BULK DELETE =================
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((a) => a.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const { error } = await supabase
      .from("accounts")
      .delete()
      .in("id", selectedIds);

    if (error) {
      setModal({
        open: true,
        type: "error",
        title: "Gagal Hapus",
        message: error.message,
      });
      return;
    }

    // Log activity
    await logActivity("bulk_delete", {
      count: selectedIds.length,
      ids: selectedIds,
    });

    setAccounts((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
    setSelectedIds([]);
    setSelectAll(false);
    setBulkDeleteModal(false);

    setModal({
      open: true,
      type: "success",
      title: "Berhasil!",
      message: `${selectedIds.length} akun berhasil dihapus`,
    });
  };

  // ================= DELETE SINGLE =================
  const handleDelete = async (id: string, image?: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (error) {
      setModal({
        open: true,
        type: "error",
        title: "Gagal Hapus Akun",
        message: error.message,
      });
      return;
    }

    if (image) {
      const path = image.split("/account-images/")[1];
      if (path) {
        await supabase.storage.from("account-images").remove([path]);
      }
    }

    await logActivity("delete_account", { id, name: deleteTarget?.name });

    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setModal({
      open: true,
      type: "success",
      title: "Berhasil",
      message: "Akun berhasil dihapus",
    });
  };

  // ================= RESET FILTERS =================
  const resetFilters = () => {
    setFilter("All");
    setRankFilter("All");
    setQ("");
    setPriceMin("");
    setPriceMax("");
    setSortBy("newest");
    setFilterOpen(false);
    setSortOpen(false);
  };

  const getSortLabel = () => {
    const found = SORT_OPTIONS.find((s) => s.value === sortBy);
    return found ? found.label : "Urutkan";
  };

  const getRankBadge = (rank: string) => {
    return RANK_BADGE_COLORS[rank] || "border-border bg-card/50 text-muted-foreground";
  };

  const hasActiveFilters = filter !== "All" || rankFilter !== "All" || priceMin || priceMax || q;

  return (
    <>
      <div className="space-y-4">
        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">📦 Stock Akun</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} dari {accounts.length} akun
              {hasActiveFilters && <span className="ml-2 text-xs text-primary">(filter aktif)</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setBulkDeleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
              >
                <Trash className="h-4 w-4" />
                Hapus {selectedIds.length} akun
              </button>
            )}

            <Link
              to="/admin/add"
              className="inline-flex items-center gap-1.5 rounded-lg gradient-bg px-3.5 py-2 text-sm font-semibold text-white shadow-neon hover:opacity-90 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Tambah Akun
            </Link>
          </div>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama atau kode akun..."
                  className="w-full rounded-lg border border-border bg-card/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>
            </div>

            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                filterOpen || hasActiveFilters ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-accent/10"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse" />}
            </button>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/10 transition"
              >
                <ArrowUpDown className="h-4 w-4" />
                {getSortLabel()}
                <ChevronDown className={`h-3 w-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => {
                        setSortBy(s.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm transition ${
                        sortBy === s.value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/10"
                      }`}
                    >
                      {s.label}
                      {sortBy === s.value && <ChevronUp className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {filterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/50 animate-in slide-in-from-top-5 duration-200">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Rank</label>
                <select
                  value={rankFilter}
                  onChange={(e) => setRankFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                >
                  {RANK_FILTERS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Harga Min</label>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Harga Max</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground hover:bg-accent/10 hover:text-foreground transition"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= SELECT ALL ================= */}
        {paginated.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              {selectAll ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
              {selectAll ? "Unselect All" : "Select All"}
            </button>
            <span className="text-xs text-muted-foreground">
              ({selectedIds.length} selected)
            </span>
          </div>
        )}

        {/* ================= ACCOUNT LIST ================= */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading stock...</p>
            </div>
          </div>
        ) : paginated.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Tidak ada akun yang cocok</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-4 text-sm text-primary hover:underline">
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginated.map((a) => (
                <AccountCard
                  key={a.id}
                  account={a}
                  isSelected={selectedIds.includes(a.id)}
                  onSelect={() => toggleSelect(a.id)}
                  onDetail={() => setDetailTarget(a)}
                  onDelete={() => setDeleteTarget(a)}
                  getRankBadge={getRankBadge}
                />
              ))}
            </div>

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/10 transition"
                >
                  Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-lg text-sm transition ${
                        currentPage === p
                          ? "bg-primary text-white"
                          : "border border-border hover:bg-accent/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/10 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {detailTarget && (
        <DetailModal account={detailTarget} onClose={() => setDetailTarget(null)} />
      )}

      {/* ================= DELETE SINGLE MODAL ================= */}
      <ActionModal
        open={!!deleteTarget}
        type="warning"
        title="Hapus Akun?"
        message={`Akun ${deleteTarget?.name} akan dihapus permanen`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          handleDelete(deleteTarget?.id, deleteTarget?.image);
          setDeleteTarget(null);
        }}
        confirmText="Ya, Hapus"
      />

      {/* ================= BULK DELETE MODAL ================= */}
      <ActionModal
        open={bulkDeleteModal}
        type="warning"
        title="Hapus Banyak Akun?"
        message={`Anda akan menghapus ${selectedIds.length} akun secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        confirmText="Ya, Hapus Semua"
        danger
      />

      {/* ================= ACTION MODAL ================= */}
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

// ================= ACCOUNT CARD =================
function AccountCard({
  account,
  isSelected,
  onSelect,
  onDetail,
  onDelete,
  getRankBadge,
}: {
  account: any;
  isSelected: boolean;
  onSelect: () => void;
  onDetail: () => void;
  onDelete: () => void;
  getRankBadge: (rank: string) => string;
}) {
  return (
    <article className="glass-card overflow-hidden rounded-2xl relative">
      {/* Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={onSelect}
          className="rounded border border-border bg-card/80 p-1 hover:bg-accent/10 transition"
        >
          {isSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative h-44">
        <img
          src={account.image || "https://placehold.co/400x225/1a1a2e/ffffff?text=No+Image"}
          alt={account.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x225/1a1a2e/ffffff?text=No+Image";
          }}
        />
        <div className="absolute left-12 top-3">
          <StatusPill status={account.status} />
        </div>
        <div className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getRankBadge(account.rank)}`}>
          {account.rank}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold">{account.name}</h3>
        <p className="text-xs text-muted-foreground">{account.code}</p>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {account.description || "Tidak ada deskripsi"}
        </p>
        <p className="mt-3 text-lg font-bold gradient-text">
          Rp {Number(account.price).toLocaleString("id-ID")}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat icon={Sword} label="Hero" value={account.hero_count || 0} />
          <Stat icon={Sparkles} label="Skin" value={account.skin_count || 0} />
        </div>
        <div className="mt-5 flex justify-between">
          <button onClick={onDetail} className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-white/10 transition">
            <Eye className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            <Link to="/admin/edit/$id" params={{ id: account.id }} className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-white/10 transition">
              <Pencil className="h-4 w-4" />
            </Link>
            <button onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-red-500/10 hover:border-red-500/30 transition">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ================= STATUS PILL =================
function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    Reserved: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    Sold: "border-red-500/30 bg-red-500/10 text-red-400",
  };
  return <span className={`rounded-full border px-3 py-1 text-xs ${colors[status] || colors.Available}`}>{status}</span>;
}

// ================= STAT =================
function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex gap-2 rounded-lg border p-2">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

// ================= DETAIL MODAL =================
function DetailModal({ account, onClose }: { account: any; onClose: () => void }) {
  const getRankBadge = (rank: string) => {
    return RANK_BADGE_COLORS[rank] || "border-border bg-card/50 text-muted-foreground";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md overflow-hidden rounded-2xl">
        <img
          src={account.image || "https://placehold.co/400x225/1a1a2e/ffffff?text=No+Image"}
          className="h-56 w-full object-cover"
          alt={account.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x225/1a1a2e/ffffff?text=No+Image";
          }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{account.name}</h2>
              <p className="text-xs text-muted-foreground">{account.code}</p>
            </div>
            <button onClick={onClose} className="rounded-lg border p-2 hover:bg-accent/10 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <DetailRow label="Rank" value={account.rank} isRank getRankBadge={getRankBadge} />
            <DetailRow label="Price" value={`Rp ${Number(account.price).toLocaleString("id-ID")}`} isPrice />
            <DetailRow label="Status" value={account.status} isStatus />
            <DetailRow label="Heroes" value={account.hero_count || 0} />
            <DetailRow label="Skins" value={account.skin_count || 0} />
          </div>
          <div className="mt-5">
            <h3 className="font-semibold text-sm">Description</h3>
            <p className="mt-2 text-sm text-muted-foreground">{account.description || "Tidak ada deskripsi"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= DETAIL ROW =================
function DetailRow({ label, value, isPrice, isStatus, isRank, getRankBadge }: any) {
  return (
    <div className="flex justify-between items-center border-b border-border/30 pb-2">
      <span className="text-muted-foreground">{label}</span>
      {isStatus ? (
        <StatusPill status={value} />
      ) : isRank ? (
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRankBadge(value)}`}>{value}</span>
      ) : isPrice ? (
        <span className="font-bold gradient-text">{value}</span>
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  );
}