// ============================================
// FILE: components/admin-shell.tsx - FULL SCRIPT
<<<<<<< HEAD
// DENGAN NOTIFIKASI REALTIME + PP & NAMA DARI SETTINGS + MENU BANNER AKTIF
=======
// DENGAN NOTIFIKASI REALTIME + PP & NAMA DARI SETTINGS
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
// ============================================

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
<<<<<<< HEAD
  Image,
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Gamepad2,
  Menu,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/lib/supabase";
import { ActionModal } from "@/components/action-modal";
import { NotificationBell } from "@/components/NotificationBell";

<<<<<<< HEAD
// ================= NAVIGATION ITEMS =================
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/stock", label: "Stock Akun", icon: Package },
  { to: "/admin/add", label: "Tambah Akun", icon: PlusSquare },
<<<<<<< HEAD
  { to: "/admin/banners", label: "Banner", icon: Image }, // ← MENU BANNER AKTIF
=======
>>>>>>> 0722163535932dbfc2c15b922fca6706bdebcad3
  { to: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customer", icon: Users },
  { to: "/admin/reports", label: "Laporan", icon: BarChart3 },
  { to: "/admin/setting", label: "Settings", icon: Settings },
] as const;

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState({
    open: false,
    loading: false,
  });
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { settings, loading } = useSettings();
  const profileRef = useRef<HTMLDivElement>(null);

  // ================= CLICK OUTSIDE PROFILE =================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (to: string, end?: boolean) =>
    end ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  // ================= LOGOUT =================
  const handleLogoutClick = () => {
    setLogoutModal({ open: true, loading: false });
  };

  const confirmLogout = async () => {
    setLogoutModal((prev) => ({ ...prev, loading: true }));

    try {
      await supabase.auth.signOut();
      localStorage.removeItem("admin");
      localStorage.removeItem("role");
      localStorage.removeItem("sb-session");
      setLogoutModal({ open: false, loading: false });
      navigate({ to: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutModal({ open: false, loading: false });
    }
  };

  // ================= AMBIL DATA DARI SETTINGS =================
  const logoUrl = settings?.logo_url || "";
  const storeName = settings?.store_name || "Kivora Point";
  const profileName = settings?.profile_name || "Admin";
  const profileAvatar = settings?.profile_avatar || "";

  return (
    <>
      <div className="min-h-screen lg:flex">
        {/* ================= SIDEBAR DESKTOP ================= */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
          <SidebarContent
            isActive={isActive}
            onLogout={handleLogoutClick}
            logoUrl={logoUrl}
            storeName={storeName}
          />
        </aside>

        {/* ================= SIDEBAR MOBILE ================= */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar">
              <SidebarContent
                isActive={isActive}
                onLogout={handleLogoutClick}
                onNavigate={() => setOpen(false)}
                logoUrl={logoUrl}
                storeName={storeName}
                isMobile
              />
            </aside>
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* ================= HEADER ================= */}
          <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:px-8">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search - Desktop */}
              <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground lg:w-56"
                  placeholder="Cari..."
                />
              </div>

              {/* 🔔 NOTIFICATION BELL - REALTIME */}
              <NotificationBell />

              {/* ================= PROFILE ================= */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-2.5 hover:bg-accent/10 transition"
                >
                  {/* Avatar - Dari Settings */}
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt="Avatar"
                      className="h-6 w-6 rounded-md object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="grid h-6 w-6 place-items-center rounded-md gradient-bg text-[10px] font-bold text-white">
                      {profileName
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                  
                  {/* Nama - Dari Settings */}
                  <span className="text-xs font-medium hidden sm:block">{profileName}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        {/* Avatar besar di dropdown */}
                        {profileAvatar ? (
                          <img
                            src={profileAvatar}
                            alt="Avatar"
                            className="h-10 w-10 rounded-xl object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "";
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-bg text-white font-bold">
                            {profileName
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{profileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {settings?.email || "admin@kivorapoint.com"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/admin/setting"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/10 transition"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleLogoutClick}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ================= CONTENT ================= */}
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      <ActionModal
        open={logoutModal.open}
        type="warning"
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari dashboard?"
        loading={logoutModal.loading}
        onClose={() => {
          if (!logoutModal.loading) {
            setLogoutModal({ open: false, loading: false });
          }
        }}
        onConfirm={confirmLogout}
        confirmText={logoutModal.loading ? "Logging out..." : "Ya, Keluar"}
        danger
      />
    </>
  );
}

// ================= SIDEBAR CONTENT =================
function SidebarContent({
  isActive,
  onLogout,
  onNavigate,
  logoUrl,
  storeName,
  isMobile = false,
}: {
  isActive: (to: string, end?: boolean) => boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  logoUrl: string;
  storeName: string;
  isMobile?: boolean;
}) {
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-10 rounded-xl object-cover border border-sidebar-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-bg shadow-neon">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">{storeName}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Admin Panel
            </div>
          </div>
        </div>
        {isMobile && onNavigate && (
          <button
            onClick={onNavigate}
            className="grid h-8 w-8 place-items-center rounded-md lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = isActive(item.to, "end" in item ? item.end : undefined);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={[
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white",
              ].join(" ")}
              style={
                active
                  ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-neon)" }
                  : undefined
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/15 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );
}