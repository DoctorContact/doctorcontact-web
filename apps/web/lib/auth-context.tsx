"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "@doctor-contract/shared";
import { api, setAccessToken } from "./api";

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
    try {
      // 🟢 Update: লোকাল স্টোরেজ থেকে রিফ্রেশ টোকেন নেওয়া
      const localRefreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

      const refreshRes = await api.post("/auth/refresh", {
          refreshToken: localRefreshToken // বডিতে পাঠানো হচ্ছে
      });
      
      const token = refreshRes.data?.data?.accessToken;
      const newRefreshToken = refreshRes.data?.data?.refreshToken;
      
      if (token) {
         setAccessToken(token);
         if (newRefreshToken && typeof window !== "undefined") {
             localStorage.setItem("refreshToken", newRefreshToken);
         }
         
         const meRes = await api.get("/auth/me");
         setUserState(meRes.data?.data?.user);
      } else {
         throw new Error("No token received");
      }
    } catch (err) {
      setAccessToken(null);
      setUserState(null);
    } finally {
      setLoading(false);
    }
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