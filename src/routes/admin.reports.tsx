// ============================================
// FILE: admin.reports.tsx - DENGAN ACTIVITY LOG
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getActivityLogs } from "@/lib/activity-log";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Activity, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Laporan · Kivora Point Admin" }] }),
  component: ReportsPage,
});

const actionLabels: Record<string, { label: string; color: string }> = {
  login: { label: "🔐 Login", color: "text-blue-400" },
  logout: { label: "🚪 Logout", color: "text-gray-400" },
  delete_account: { label: "🗑️ Hapus Akun", color: "text-red-400" },
  bulk_delete: { label: "🗑️ Bulk Delete", color: "text-red-400" },
  edit_account: { label: "✏️ Edit Akun", color: "text-yellow-400" },
  add_account: { label: "➕ Tambah Akun", color: "text-green-400" },
  update_order: { label: "📦 Update Order", color: "text-purple-400" },
};

function ReportsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getActivityLogs(100);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">📝 Activity Log</h1>
          <p className="text-sm text-muted-foreground">
            {logs.length} aktivitas terakhir
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium hover:bg-accent/10 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="p-4">Action</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const action = actionLabels[log.action] || { label: log.action, color: "text-gray-400" };
                  const details = log.details ? JSON.stringify(log.details) : "-";

                  return (
                    <tr key={log.id} className="border-t border-border/40 hover:bg-accent/5 transition">
                      <td className={`p-4 font-medium ${action.color}`}>{action.label}</td>
                      <td className="p-4 text-muted-foreground max-w-xs truncate">{details}</td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}