import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isBrowser } from "@/lib/browser";
import { Lock, Mail, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login · Kivora Point Admin" },
      { name: "description", content: "Sign in to the Kivora Point admin control center." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("Kivora Point");

  // ================= FETCH LOGO & STORE NAME FROM SETTINGS =================
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("logo_url, store_name")
          .eq("id", 1)
          .single();

        if (!error && data) {
          if (data.logo_url) setLogoUrl(data.logo_url);
          if (data.store_name) setStoreName(data.store_name);
        }
      } catch (err) {
        console.error("❌ Error fetching settings:", err);
      }
    };

    fetchSettings();
  }, []);

  // ================= CHECK SESSION ON MOUNT =================
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Cek session dari Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("✅ Session found, redirecting to admin");
          if (isBrowser) {
            localStorage.setItem("sb-session", JSON.stringify(session));
            localStorage.setItem("admin", "true");
          }
          navigate({ to: "/admin" });
          return;
        }

        // Cek session di localStorage (only in browser)
        if (isBrowser) {
          const storedSession = localStorage.getItem("sb-session");
          if (storedSession) {
            try {
              const sessionData = JSON.parse(storedSession);
              // Coba restore session
              const { data: restoredData, error: restoreError } = await supabase.auth.setSession(sessionData);
              
              if (!restoreError && restoredData.session) {
                console.log("✅ Session restored from localStorage");
                localStorage.setItem("sb-session", JSON.stringify(restoredData.session));
                localStorage.setItem("admin", "true");
                navigate({ to: "/admin" });
                return;
              } else {
                console.log("❌ Failed to restore session:", restoreError);
                localStorage.removeItem("sb-session");
                localStorage.removeItem("admin");
                localStorage.removeItem("role");
              }
            } catch (e) {
              console.error("❌ Error parsing stored session:", e);
              localStorage.removeItem("sb-session");
              localStorage.removeItem("admin");
              localStorage.removeItem("role");
            }
          }
        }
        
        console.log("ℹ️ No valid session found, showing login page");
      } catch (error) {
        console.error("❌ Session check error:", error);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        alert(error?.message || "Login gagal");
        setLoading(false);
        return;
      }

      const user = data.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Save session to localStorage (only in browser)
      if (isBrowser) {
        localStorage.setItem("role", profile?.role || "viewer");
        localStorage.setItem("admin", "true");
        localStorage.setItem("sb-session", JSON.stringify(data.session));
      }

      navigate({ to: "/admin" });
    } catch (err) {
      console.error("Login error:", err);
      alert("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="text-white">Checking session...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* ================= LOGO DARI DATABASE ================= */}
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl gradient-bg shadow-neon p-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${storeName} Logo`} 
                className="h-14 w-14 object-contain"
                onError={(e) => {
                  // Kalau gambar gagal load, pake fallback
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).style.display = "none";
                  // Tampilkan fallback text
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const fallback = document.createElement("span");
                    fallback.className = "text-2xl font-bold text-white";
                    fallback.textContent = storeName.charAt(0).toUpperCase();
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              // Fallback kalau ga ada logo di database
              <span className="text-2xl font-bold text-white">
                {storeName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">{storeName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Control Center</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-8"
          style={{ boxShadow: "var(--shadow-neon)" }}
        >
          <div className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5" /> Secure Admin Access
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email Address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-input/60 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="admin@kivora.com"
                required
              />
            </div>
          </label>

          <label className="mb-6 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-input/60 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg gradient-bg py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
            style={{ boxShadow: "var(--shadow-neon)" }}
          >
            {loading ? "Signing in…" : "Login to Dashboard"}
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Restricted area · {storeName} staff only
          </p>
        </form>
      </div>
    </div>
  );
}