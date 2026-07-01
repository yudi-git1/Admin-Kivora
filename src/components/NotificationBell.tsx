// ============================================
// FILE: components/NotificationBell.tsx
// NOTIFIKASI REALTIME + DETAIL CUSTOMER
// ============================================

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Phone, User, Package, CreditCard } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { subscribeNotifications, fetchUnreadOrders, type Notification } from "@/lib/notifications";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ================= LOAD INITIAL NOTIFICATIONS =================
  useEffect(() => {
    const loadNotifications = async () => {
      const orders = await fetchUnreadOrders();
      setNotifications(orders);
      setUnreadCount(orders.length);
    };
    loadNotifications();
  }, []);

  // ================= SUBSCRIBE REALTIME =================
  useEffect(() => {
    const unsubscribe = subscribeNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= MARK AS READ =================
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // ================= MARK ALL READ =================
  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  // ================= FORMAT TIME =================
  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  // ================= CLICK NOTIFICATION =================
  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    // Navigasi ke detail order
    window.location.href = `/admin/orders`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ================= BELL ICON ================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card hover:bg-accent/10 transition"
        aria-label="Notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ================= DROPDOWN ================= */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[400px] max-h-[500px] rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50">
            <div>
              <span className="font-semibold text-sm">🔔 Notifikasi</span>
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({unreadCount} baru)
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Tandai semua
              </button>
            )}
          </div>

          {/* List Notifikasi */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
                <p className="text-xs text-muted-foreground/50">Order baru akan muncul di sini</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-border/40 cursor-pointer transition hover:bg-accent/10 ${
                    !notif.read ? "bg-primary/5 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read ? "font-semibold text-white" : "text-foreground"}`}>
                        {notif.data.customer_name}
                      </p>
                      
                      {/* Detail Order */}
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Akun: <span className="text-foreground">{notif.data.account_name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          No HP: <span className="text-foreground">{notif.data.customer_phone}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          Harga: <span className="text-primary font-semibold">Rp {notif.data.price.toLocaleString("id-ID")}</span>
                        </p>
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border text-center bg-surface/30">
            <Link
              to="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              Lihat semua pesanan →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}