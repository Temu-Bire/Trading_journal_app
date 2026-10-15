"use client";

import { useState, useEffect } from "react";

export interface ApiHealthStatus {
  online: boolean;
  latencyMs: number | null;
  databaseConnected: boolean;
  loading: boolean;
}

const HEALTH_URL =
  process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/v1\/?$/, "/health").replace(/\/api\/?$/, "/api/health")
    : "http://localhost:5000/api/health";

export function useApiHealth(intervalMs = 45000): ApiHealthStatus {
  const [status, setStatus] = useState<ApiHealthStatus>({
    online: true,
    latencyMs: null,
    databaseConnected: true,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      const start = typeof performance !== "undefined" ? performance.now() : Date.now();
      try {
        const res = await fetch(HEALTH_URL, {
          signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(4000) : undefined,
        });
        const end = typeof performance !== "undefined" ? performance.now() : Date.now();
        const latency = Math.round(end - start);

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (mounted) {
            setStatus({
              online: true,
              latencyMs: latency,
              databaseConnected: Boolean(data.services?.database?.connected ?? true),
              loading: false,
            });
          }
        } else {
          if (mounted) {
            setStatus({
              online: false,
              latencyMs: latency,
              databaseConnected: false,
              loading: false,
            });
          }
        }
      } catch {
        if (mounted) {
          setStatus({
            online: false,
            latencyMs: null,
            databaseConnected: false,
            loading: false,
          });
        }
      }
    }

    checkHealth();
    const timer = setInterval(checkHealth, intervalMs);

    const onFocus = () => checkHealth();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [intervalMs]);

  return status;
}
