// ============================================
// FILE: admin.orders.tsx - TANPA CREATE ORDER
// ============================================
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, CheckCircle2, Trash2, RefreshCw } from "lucide-react";
import { ActionModal } from "@/components/action-modal";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [{ title: "Pesanan · Kivora Point Admin" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ================= MODAL STATE =================
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  // ================= DELETE MODAL STATE =================
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, accounts(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching orders:", error);
      setConfirmModal({
        open: true,
        type: "error",
        title: "Gagal Load Data",
        message: error.message,
      });
    } else {
      setOrders(data || []);
    }

    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= SYNC ACCOUNT STATUS =================
  const syncAccountStatus = async (
    accountId: string,
    status: "Available" | "Reserved" | "Sold"
  ): Promise<boolean> => {
    if (!accountId) return false;

    const query = supabase
      .from("accounts")
      .update({ status })
      .eq("id", accountId);

    if (status === "Reserved") {
      query.eq("status", "Available");
    }

    const { data, error } = await query.select();

    if (error) {
      console.error("❌ Error syncing account:", error);
      return false;
    }

    if (status === "Reserved" && (!data || data.length === 0)) {
      setConfirmModal({
        open: true,
        type: "error",
        title: "Akun Tidak Tersedia",
        message: "Akun sudah diambil oleh pembeli lain 😹",
      });
      return false;
    }

    return true;
  };

  // ================= UPDATE ORDER STATUS =================
  const updateOrderStatus = async (
    id: string,
    accountId: string,
    status: "Processing" | "Completed" | "Cancelled"
  ) => {
    if (!accountId) {
      setConfirmModal({
        open: true,
        type: "error",
        title: "Error",
        message: "account_id kosong (data rusak)",
      });
      return;
    }

    if (status === "Processing") {
      const locked = await syncAccountStatus(accountId, "Reserved");
      if (!locked) return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", id);

    if (error) {
      setConfirmModal({
        open: true,
        type: "error",
        title: "Gagal Update Order",
        message: error.message,
      });
      return;
    }

    if (status === "Completed") {
      await syncAccountStatus(accountId, "Sold");
    }

    if (status === "Cancelled") {
      await syncAccountStatus(accountId, "Available");
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, order_status: status } : o))
    );

    setConfirmModal({
      open: true,
      type: "success",
      title: "Berhasil!",
      message: `Order berhasil di-${status === "Processing" ? "proses" : status === "Completed" ? "selesaikan" : "batalkan"}`,
    });
  };

  // ================= DELETE ORDER =================
  const handleDeleteOrder = async (id: string) => {
    const order = orders.find((o) => o.id === id);

    if (order && order.account_id) {
      await syncAccountStatus(order.account_id, "Available");
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      setConfirmModal({
        open: true,
        type: "error",
        title: "Gagal Hapus Order",
        message: error.message,
      });
      return;
    }

    setOrders((prev) => prev.filter((o) => o.id !== id));
    setDeleteTarget(null);

    setConfirmModal({
      open: true,
      type: "success",
      title: "Berhasil!",
      message: "Order berhasil dihapus",
    });
  };

  // ================= OPEN CONFIRM MODAL =================
  const openConfirm = (
    id: string,
    accountId: string,
    status: "Processing" | "Completed" | "Cancelled",
    title: string
  ) => {
    setConfirmModal({
      open: true,
      type: "warning",
      title,
      message: "Apakah Anda yakin?",
      onConfirm: () => updateOrderStatus(id, accountId, status),
      confirmText: "Ya",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold">📦 Orders</h1>
          <p className="text-sm text-muted-foreground">
            Total {orders.length} pesanan
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-accent/10 transition"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="grid gap-3 lg:hidden">
        {orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Belum ada pesanan</p>
          </div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="glass-card rounded-2xl p-4">
              <p className="font-mono text-xs text-muted-foreground">
                {o.id.slice(0, 8)}...
              </p>
              <p className="font-semibold">{o.customer_name}</p>
              <p className="text-xs text-muted-foreground">
                {o.customer_phone || "No WhatsApp"}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.accounts?.name || o.account_id}
              </p>
              <p className="mt-2 text-lg font-bold gradient-text">
                Rp {Number(o.price).toLocaleString("id-ID")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    openConfirm(o.id, o.account_id, "Processing", "Terima order ini?")
                  }
                  className="flex-1 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    openConfirm(o.id, o.account_id, "Completed", "Selesaikan order ini?")
                  }
                  className="flex-1 rounded-lg gradient-bg px-3 py-1.5 text-xs text-white shadow-neon hover:opacity-90 transition"
                >
                  Complete
                </button>
                <button
                  onClick={() =>
                    openConfirm(o.id, o.account_id, "Cancelled", "Batalkan order ini?")
                  }
                  className="flex-1 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setDeleteTarget(o)}
                  className="flex-1 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 transition"
                >
                  <Trash2 className="h-3.5 w-3.5 inline" /> Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden lg:block glass-card overflow-hidden rounded-2xl">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Belum ada pesanan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">WhatsApp</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border/60 hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      {o.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-4 font-medium">{o.customer_name}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {o.customer_phone || "-"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {o.accounts?.name || o.account_id}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      Rp {Number(o.price).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <StatusBadge status={o.order_status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <IconBtn
                          icon={Check}
                          tone="success"
                          title="Accept"
                          onClick={() =>
                            openConfirm(o.id, o.account_id, "Processing", "Terima order ini?")
                          }
                        />
                        <IconBtn
                          icon={CheckCircle2}
                          tone="primary"
                          title="Complete"
                          onClick={() =>
                            openConfirm(o.id, o.account_id, "Completed", "Selesaikan order ini?")
                          }
                        />
                        <IconBtn
                          icon={X}
                          tone="destructive"
                          title="Cancel"
                          onClick={() =>
                            openConfirm(o.id, o.account_id, "Cancelled", "Batalkan order ini?")
                          }
                        />
                        <IconBtn
                          icon={Trash2}
                          tone="destructive"
                          title="Delete"
                          onClick={() => setDeleteTarget(o)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <ActionModal
        open={!!deleteTarget}
        type="warning"
        title="Hapus Order?"
        message={`Order dari ${deleteTarget?.customer_name} akan dihapus permanen. Akun akan dikembalikan ke status Available.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteOrder(deleteTarget?.id)}
        confirmText="Ya, Hapus"
      />

      {/* ================= ACTION MODAL ================= */}
      <ActionModal
        open={confirmModal.open}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => {
          setConfirmModal({
            ...confirmModal,
            open: false,
          });
        }}
        onConfirm={() => {
          if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
          }
          setConfirmModal({
            ...confirmModal,
            open: false,
          });
        }}
        confirmText={confirmModal.confirmText || "OK"}
      />
    </>
  );
}

// ================= COMPONENTS =================

function IconBtn({ icon: Icon, tone, title, onClick }: any) {
  const cls =
    tone === "success"
      ? "border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/20"
      : tone === "primary"
      ? "border-primary/50 text-primary hover:bg-primary/20"
      : "border-red-400/40 text-red-300 hover:bg-red-500/20";

  return (
    <button
      onClick={onClick}
      title={title}
      className={`grid h-8 w-8 place-items-center rounded-lg border bg-card transition ${cls}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function StatusBadge({ status }: any) {
  const cls =
    status === "Processing"
      ? "border-yellow-400/40 bg-yellow-500/10 text-yellow-300"
      : status === "Completed"
      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
      : status === "Cancelled"
      ? "border-red-400/40 bg-red-500/10 text-red-300"
      : "border-zinc-400/40 bg-zinc-500/10 text-zinc-300";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${cls}`}>
      {status || "New"}
    </span>
  );
}