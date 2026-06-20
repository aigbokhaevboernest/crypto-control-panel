import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ["touchstart", "touchmove", "keydown", "scroll", "click", "mousemove"] as const;

export function useAutoLogout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const logout = async () => {
      await supabase.auth.signOut();
      const target = location.pathname.startsWith("/admin") ? "/admin/login" : "/admin/login";
      navigate(target, { replace: true });
    };

    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logout, TIMEOUT_MS);
    };

    EVENTS.forEach((evt) => window.addEventListener(evt, reset, { passive: true }));
    reset();

    return () => {
      if (timer) clearTimeout(timer);
      EVENTS.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [navigate, location.pathname]);
}
