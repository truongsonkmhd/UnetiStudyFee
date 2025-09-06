import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/AuthService";
import type { User } from "@/model/User";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  loginOpen: boolean;
  signupOpen: boolean;
  openLogin: () => void;
  openSignup: () => void;
  closeAuth: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await authService.initializeAuth();
        if (!mounted) return;
        setUser(ok ? authService.getCurrentUser() : null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const onLogin = () => {
      setUser(authService.getCurrentUser());
      setLoginOpen(false);
      setSignupOpen(false);
    };
    const onLogout = () => setUser(null);

    window.addEventListener("auth:login", onLogin as EventListener);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:login", onLogin as EventListener);
      window.removeEventListener("auth:logout", onLogout);
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      user,
      loading,
      loginOpen,
      signupOpen,
      openLogin: () => {
        setLoginOpen(true);
        setSignupOpen(false);
      },
      openSignup: () => {
        setSignupOpen(true);
        setLoginOpen(false);
      },
      closeAuth: () => {
        setLoginOpen(false);
        setSignupOpen(false);
      },
      logout: () => authService.logout(),
    }),
    [user, loading, loginOpen, signupOpen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
