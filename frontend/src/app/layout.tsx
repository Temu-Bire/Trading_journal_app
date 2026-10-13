import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast";

export const metadata: Metadata = {
  title: "Trading Journal Pro - Financial Performance & Analytics",
  description:
    "Record, manage, and analyze trading performance across Forex, Crypto, Stocks, and Commodities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary-muted selection:text-primary">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
