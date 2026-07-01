// ============================================
// FILE: lib/notifications.ts - NOTIFIKASI REALTIME
// ============================================

import { supabase } from "./supabase";

export interface Notification {
  id: string;
  type: "order" | "payment" | "stock";
  title: string;
  message: string;
  data: {
    customer_name: string;
    customer_phone: string;
    account_name: string;
    account_id: string;
    price: number;
    order_id: string;
    payment_status?: string;
  };
  read: boolean;
  created_at: string;
}

// ================= SUBSCRIBE REALTIME =================
export function subscribeNotifications(
  callback: (notification: Notification) => void
) {
  const channel = supabase
    .channel("notifications-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
      },
      async (payload) => {
        // Ambil data account dari order
        const { data: account } = await supabase
          .from("accounts")
          .select("name")
          .eq("id", payload.new.account_id)
          .single();

        const notification: Notification = {
          id: payload.new.id,
          type: "order",
          title: `🛒 Order Baru dari ${payload.new.customer_name}`,
          message: `${payload.new.customer_name} memesan ${account?.name || "akun"} - Rp ${Number(payload.new.price).toLocaleString("id-ID")}`,
          data: {
            customer_name: payload.new.customer_name,
            customer_phone: payload.new.customer_phone || "-",
            account_name: account?.name || "Unknown",
            account_id: payload.new.account_id,
            price: payload.new.price,
            order_id: payload.new.id,
            payment_status: payload.new.payment_status || "Pending",
          },
          read: false,
          created_at: payload.new.created_at,
        };

        callback(notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ================= FETCH UNREAD NOTIFICATIONS =================
export async function fetchUnreadOrders(): Promise<Notification[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, accounts(name)")
    .in("order_status", ["New", "Processing"])
    .order("created_at", { ascending: false });

  if (error || !orders) return [];

  return orders.map((order) => ({
    id: order.id,
    type: "order",
    title: `🛒 Order Baru dari ${order.customer_name}`,
    message: `${order.customer_name} memesan ${order.accounts?.name || "akun"} - Rp ${Number(order.price).toLocaleString("id-ID")}`,
    data: {
      customer_name: order.customer_name,
      customer_phone: order.customer_phone || "-",
      account_name: order.accounts?.name || "Unknown",
      account_id: order.account_id,
      price: order.price,
      order_id: order.id,
      payment_status: order.payment_status || "Pending",
    },
    read: false,
    created_at: order.created_at,
  }));
}