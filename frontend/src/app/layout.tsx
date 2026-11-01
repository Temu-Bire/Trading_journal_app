import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/lib/toast";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradeFlow PRO - Retail Forex Trading Journal & Risk Suite",
  description:
    "Next-generation Forex & Gold trading journal, live sessions clock, risk management, and voice journaling for retail traders.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} min-h-screen bg-[#f0f4f8] dark:bg-[#090d16] text-foreground antialiased selection:bg-indigo-500 selection:text-white`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
