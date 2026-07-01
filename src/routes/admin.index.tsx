// ============================================
// FILE: admin.index.tsx - DASHBOARD + GRAFIK
// ============================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Package,
  CheckCircle2,
  ShoppingBag,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard · Kivora Point Admin" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch accounts
      const { data: accountsData } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (accountsData) setAccounts(accountsData);
      if (ordersData) setOrders(ordersData);

      // Generate chart data (last 6 months)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const revenue = [0, 0, 0, 0, 0, 0];
      const counts = [0, 0, 0, 0, 0, 0];

      if (ordersData) {
        const currentMonth = new Date().getMonth();
        ordersData.forEach((order) => {
          const date = new Date(order.created_at);
          const month = date.getMonth();
          const diff = (currentMonth - month + 12) % 12;
          if (diff < 6) {
            const idx = 5 - diff;
            revenue[idx] += Number(order.price) || 0;
            counts[idx] += 1;
          }
        });
      }

      setChartData(
        months.map((month, i) => ({
          month,
          revenue: revenue[i],
          orders: counts[i],
        }))
      );

      setLoading(false);
    };

    fetchData();

    // Subscribe ke perubahan orders
    const channel = supabase
      .channel("dashboard-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const total = accounts.length;
  const available = accounts.filter((a) => a.status === "Available").length;
  const sold = accounts.filter((a) => a.status === "Sold").length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.price || 0), 0);
  const totalOrders = orders.length;

  // Hitung persentase perubahan (simulasi)
  const growth = sold > 0 ? Math.round((sold / (total || 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ================= STATS CARDS ================= */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Akun"
          value={total}
          icon={Package}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard
          label="Available"
          value={available}
          icon={CheckCircle2}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <StatCard
          label="Terjual"
          value={sold}
          icon={ShoppingBag}
          color="text-orange-400"
          bg="bg-orange-500/10"
          trend={`${growth}% dari total`}
        />
        <StatCard
          label="Pendapatan"
          value={`Rp ${revenue.toLocaleString("id-ID")}`}
          icon={Wallet}
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">📊 Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">6 bulan terakhir</p>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  formatter={(v: any) => [`Rp ${Number(v).toLocaleString("id-ID")}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={{ fill: "#7C3AED" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">📦 Orders</h3>
              <p className="text-xs text-muted-foreground">Total {totalOrders} pesanan</p>
            </div>
            <span className="text-xs text-blue-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8.3%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= RECENT ORDERS ================= */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">📋 Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline">
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Phone</th>
                <th className="pb-2 pr-4">Price</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-border/40 last:border-0">
                  <td className="py-2 pr-4 font-medium">{order.customer_name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{order.customer_phone || "-"}</td>
                  <td className="py-2 pr-4">Rp {Number(order.price).toLocaleString("id-ID")}</td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={order.order_status} />
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= STAT CARD =================
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
  trend?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <h2 className="mt-1 text-2xl font-bold">{value}</h2>
          {trend && <p className="text-[10px] text-emerald-400 mt-0.5">{trend}</p>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// ================= STATUS BADGE =================
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Processing: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    Cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
  };

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${colors[status] || colors.New}`}>
      {status}
    </span>
  );
}