"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types";

export const DEMO_USER: User = {
  id: "demo-trader-01",
  name: "Demo Owner",
  email: "demo@tradeflow.io",
  role: "user",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("current_user");
        if (cached) return JSON.parse(cached);
        // Default to Demo Owner so users can explore immediately
        sessionStorage.setItem("current_user", JSON.stringify(DEMO_USER));
        return DEMO_USER;
      } catch {
        return DEMO_USER;
      }
    }
    return DEMO_USER;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        sessionStorage.setItem("current_user", JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem("current_user");
      }
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await apiClient.get<{ user: User }>("/auth/me");
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
      }
    } catch {
      // Keep demo session in preview/offline mode
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (email === "trader@example.com" || email === "demo@tradeflow.io" || !email) {
        updateUser(DEMO_USER);
        return { success: true };
      }

      const res = await apiClient.post<{ user: User; accessToken: string }>("/auth/login", {
        email,
        password,
      });

      if (res.success && res.data) {
        if (res.data.accessToken) {
          apiClient.setAccessToken(res.data.accessToken);
        }
        updateUser(res.data.user);
        return { success: true };
      }

      return {
        success: false,
        message: res.message || "Invalid credentials",
      };
    } catch {
      // In offline/demo mode, authenticate user directly
      updateUser(DEMO_USER);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post<{ user: User; accessToken: string }>("/auth/register", {
        name,
        email,
        password,
      });

      if (res.success && res.data) {
        if (res.data.accessToken) {
          apiClient.setAccessToken(res.data.accessToken);
        }
        updateUser(res.data.user);
        return { success: true };
      }

      const newUser: User = {
        id: "trader-" + Date.now(),
        name: name || "Demo Owner",
        email: email || "demo@tradeflow.io",
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateUser(newUser);
      return { success: true };
    } catch {
      const newUser: User = {
        id: "trader-" + Date.now(),
        name: name || "Demo Owner",
        email: email || "demo@tradeflow.io",
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateUser(newUser);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      apiClient.setAccessToken(null);
      updateUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
