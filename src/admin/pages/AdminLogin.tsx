import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped;
import { User, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #b8a9e8 0%, #7b6db3 100%)" }}>

      {/* White card with curved right edge */}
      <div className="relative w-full max-w-md mx-auto">
        <div
          className="absolute left-0 top-0 bottom-0 bg-white"
          style={{
            width: "75%",
            borderTopRightRadius: "200px",
            borderBottomRightRadius: "200px",
            boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
          }}
        />

        {/* Form content */}
        <div className="relative z-10 px-10 py-20 w-full">
          <form onSubmit={handleSubmit} className="space-y-8 max-w-[260px]">
            {/* Email */}
            <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2">
              <User className="h-5 w-5 text-[#7b6db3] shrink-0" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="User name / Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2">
              <Lock className="h-5 w-5 text-[#7b6db3] shrink-0" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-between w-full bg-white rounded-full px-6 py-3.5 shadow-md hover:shadow-lg transition disabled:opacity-60"
            >
              <span className="text-[#5a4d8a] font-bold text-sm tracking-wide uppercase">
                {loading ? "Signing in…" : "Log In Now"}
              </span>
              <ChevronRight className="h-5 w-5 text-[#5a4d8a]" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
