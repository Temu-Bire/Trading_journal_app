"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await apiClient.get<{ user: User }>("/auth/me");
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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
      const res = await apiClient.post<{ user: User; accessToken: string }>("/auth/login", {
        email,
        password,
      });

      if (res.success && res.data) {
        if (res.data.accessToken) {
          apiClient.setAccessToken(res.data.accessToken);
        }
        setUser(res.data.user);
        return { success: true };
      }

      return {
        success: false,
        message: res.message || "Invalid credentials",
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to sign in",
      };
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
        setUser(res.data.user);
        return { success: true };
      }

      return {
        success: false,
        message: res.message || "Registration failed",
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to register",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      apiClient.setAccessToken(null);
      setUser(null);
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
