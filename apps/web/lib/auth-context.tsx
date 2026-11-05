"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "@doctor-contract/shared";
import { api, setAccessToken, refreshSession } from "./api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const token = await refreshSession(); // shared: never runs twice in parallel
        if (!token) throw new Error("No token received");
        const meRes = await api.get("/auth/me");
        setUserState(meRes.data?.data?.user);
        setLoading(false);
        return;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          if (typeof window !== "undefined") localStorage.removeItem("refreshToken");
          break;
        }
        // network error / backend waking up -> keep token, wait and retry
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    setAccessToken(null);
    setUserState(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUserState(null);
    
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser: setUserState, logout, refetchUser: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}