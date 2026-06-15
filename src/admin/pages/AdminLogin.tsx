import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data?.role === "admin";
  };

  useEffect(() => {
    document.title = "Admin Login";
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      if (!session?.user) return;
      try {
        if (await checkAdminRole(session.user.id)) {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch {
        await supabase.auth.signOut({ scope: "local" });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        toast.error(error?.message ?? "Sign in failed");
        return;
      }
      const isAdmin = await checkAdminRole(data.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut({ scope: "local" });
        toast.error("Access denied");
        return;
      }
      navigate("/admin/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[460px] w-[460px] rounded-full bg-fuchsia-600/20 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 blur-md opacity-70" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-lg shadow-indigo-900/50">
                <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2.2} />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Admin Portal
            </h1>
            <p className="mt-1.5 text-sm text-white/50">
              Sign in to access the control center
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-2xl shadow-black/40">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium text-white/70">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-white/10 bg-white/[0.04] pl-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400/60 focus-visible:ring-1 focus-visible:ring-indigo-400/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium text-white/70">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus-visible:border-indigo-400/60 focus-visible:ring-1 focus-visible:ring-indigo-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/80"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:shadow-fuchsia-900/40 hover:brightness-110 disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {loading ? "Signing in…" : "Sign in"}
                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  )}
                </span>
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/5 pt-5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-[11px] uppercase tracking-wider text-white/40">
                Secure connection · encrypted
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-white/30">
            Authorized personnel only. All activity is monitored and logged.
          </p>
        </div>
      </div>
    </main>
  );
}
