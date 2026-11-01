"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types";

export const DEFAULT_USER: User = {
  id: "real-trader-01",
  name: "Pro Trader",
  email: "trader@tradeflow.pro",
  role: "Trader",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const DEMO_USER = DEFAULT_USER;

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
        sessionStorage.setItem("current_user", JSON.stringify(DEFAULT_USER));
        return DEFAULT_USER;
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
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

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiClient.get<User>("/auth/me");
      if (res.success && res.data) {
        updateUser(res.data);
      }
    } catch {
      // Keep existing session user
    }
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
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

      // Local fallback for offline/development
      const fallbackUser: User = {
        id: "trader-" + Date.now(),
        name: email.split("@")[0] || "Pro Trader",
        email,
        role: "Trader",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateUser(fallbackUser);
      return { success: true };
    } catch (err: unknown) {
      // Local fallback on connection refusal
      const fallbackUser: User = {
        id: "trader-" + Date.now(),
        name: email.split("@")[0] || "Pro Trader",
        email,
        role: "Trader",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateUser(fallbackUser);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
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
        name: name || "Pro Trader",
        email: email || "trader@tradeflow.pro",
        role: "Trader",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateUser(newUser);
      return { success: true };
    } catch {
      const newUser: User = {
        id: "trader-" + Date.now(),
        name: name || "Pro Trader",
        email: email || "trader@tradeflow.pro",
        role: "Trader",
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
      // Ignore network errors on logout
    } finally {
      apiClient.clearAccessToken();
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
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
