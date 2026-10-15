import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped;

export type AdminAuthState = {
  loading: boolean;
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
};

export function useAdminAuth(redirectIfNot = true) {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminAuthState>({
    loading: true,
    isAdmin: false,
    userId: null,
    email: null,
  });

  useEffect(() => {
    let active = true;
    let didInitialCheck = false;

    const check = async (userId: string | null, email: string | null) => {
      if (!userId) {
        if (active) setState({ loading: false, isAdmin: false, userId: null, email: null });
        if (redirectIfNot) navigate("/admin/login", { replace: true });
        return;
      }

      try {
        // Admin = has an 'admin' row in user_roles
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .limit(1);
        if (error) throw error;

        const isAdmin = Array.isArray(data) && data.length > 0;

        if (!active) return;
        setState({ loading: false, isAdmin, userId, email });

        if (!isAdmin && redirectIfNot) {
          await supabase.auth.signOut({ scope: "local" });
          navigate("/admin/login", { replace: true });
        }
      } catch {
        if (active) setState({ loading: false, isAdmin: false, userId, email });
        if (redirectIfNot) navigate("/admin/login", { replace: true });
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((evt: string) => {
      if (!didInitialCheck) return;
      if (evt === "SIGNED_OUT") {
        if (active) setState({ loading: false, isAdmin: false, userId: null, email: null });
        if (redirectIfNot) navigate("/admin/login", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      didInitialCheck = true;
      void check(session?.user?.id ?? null, session?.user?.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
