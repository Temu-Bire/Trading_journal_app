import type { ApiResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

class ApiClient {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = sessionStorage.getItem("access_token");
    }
  }

  public setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        sessionStorage.setItem("access_token", token);
      } else {
        sessionStorage.removeItem("access_token");
      }
    }
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  public async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include", // Essential for HttpOnly cookies
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized for token refresh
      if (response.status === 401 && !endpoint.includes("/auth/")) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newToken = refreshData.data?.accessToken;
              if (newToken) {
                this.setAccessToken(newToken);
                this.onTokenRefreshed(newToken);
                headers["Authorization"] = `Bearer ${newToken}`;
                const retryResponse = await fetch(url, { ...config, headers });
                return await retryResponse.json();
              }
            } else {
              this.setAccessToken(null);
            }
          } catch {
            this.setAccessToken(null);
          } finally {
            this.isRefreshing = false;
          }
        } else {
          return new Promise((resolve) => {
            this.addRefreshSubscriber(async (token: string) => {
              headers["Authorization"] = `Bearer ${token}`;
              const retryResponse = await fetch(url, { ...config, headers });
              resolve(await retryResponse.json());
            });
          });
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
          errors: data.errors,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Network error. Failed to reach the server.",
      };
    }
  }

  public get<T>(endpoint: string, params?: Record<string, unknown>) {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  public post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
