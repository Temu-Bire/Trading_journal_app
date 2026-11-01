import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "'Plus Jakarta Sans'",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          muted: "var(--primary-muted)",
        },
        profit: {
          DEFAULT: "#10B981",
          foreground: "#065F46",
          muted: "rgba(16, 185, 129, 0.12)",
        },
        loss: {
          DEFAULT: "#F43F5E",
          foreground: "#9F1239",
          muted: "rgba(244, 63, 94, 0.12)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#92400E",
          muted: "rgba(245, 158, 11, 0.12)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
        "card-hover":
          "0 12px 32px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.06)",
        dropdown:
          "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        "dropdown-dark":
          "0 10px 40px -8px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)",
        glow: "0 0 20px rgba(79, 70, 229, 0.25)",
        "glow-primary": "0 0 24px rgba(79, 70, 229, 0.35)",
        "glow-emerald": "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.3)",
        "glow-rose": "0 0 20px rgba(244, 63, 94, 0.3)",
        "inner-glow":
          "inset 0 0 20px rgba(79, 70, 229, 0.08)",
        lift: "0 16px 40px -8px rgba(0, 0, 0, 0.12)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary":
          "linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)",
        "gradient-success":
          "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
        "gradient-warning":
          "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-up": "fade-up 0.45s ease-out both",
        "fade-down": "fade-down 0.35s ease-out both",
        "scale-in": "scale-in 0.3s ease-out both",
        "slide-in-left": "slide-in-left 0.4s ease-out both",
        "slide-in-right": "slide-in-right 0.4s ease-out both",
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "count-up": "count-up 0.5s ease-out both",
        "orb-1": "orb-drift-1 12s ease-in-out infinite",
        "orb-2": "orb-drift-2 15s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "pulse-glow-emerald": "pulse-glow-emerald 2.5s ease-in-out infinite",
        "draw-line": "draw-line 1.2s ease-out both",
        "border-flow": "border-flow 4s ease infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.93)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(3deg)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.95)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "orb-drift-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
        "orb-drift-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-25px, 20px) scale(1.08)" },
          "66%": { transform: "translate(20px, -15px) scale(0.92)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(79, 70, 229, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(79, 70, 229, 0)" },
        },
        "pulse-glow-emerald": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(16, 185, 129, 0)" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "border-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
