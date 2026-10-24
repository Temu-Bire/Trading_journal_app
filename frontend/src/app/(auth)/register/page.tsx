"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

const benefits = [
  "Unlimited trade journaling",
  "P&L and risk analytics",
  "Strategy playbooks & emotion tracking",
];

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const { error, success } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnUrl = searchParams.get("returnUrl");
  const returnUrl =
    rawReturnUrl && rawReturnUrl.startsWith("/") && !rawReturnUrl.startsWith("//")
      ? rawReturnUrl
      : "/overview";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitting(true);
    const result = await registerUser(data.name, data.email, data.password);
    setSubmitting(false);

    if (result.success) {
      success("Account created successfully!");
      router.push(returnUrl);
    } else {
      error(result.message || "Registration failed. Try a different email.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Free forever — no credit card required
        </p>
      </div>

      {/* Benefit list */}
      <div className="space-y-1.5 animate-fade-up delay-50">
        {benefits.map((b, i) => (
          <div
            key={b}
            className="flex items-center gap-2 text-xs text-muted-foreground"
            style={{ animationDelay: `${i * 50 + 100}ms` }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            {b}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div className="animate-fade-up delay-150">
          <Input
            label="Full Name"
            type="text"
            placeholder="Your name"
            icon={<UserIcon className="w-4 h-4" />}
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="animate-fade-up delay-200">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="relative animate-fade-up delay-250">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-muted-foreground hover:text-foreground p-1 transition-colors rounded"
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="animate-fade-up delay-300 pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-glow-primary"
            loading={submitting}
            icon={!submitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {submitting ? "Creating account…" : "Create Free Account"}
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border animate-fade-up delay-400">
        Already have an account?{" "}
        <Link
          href={
            returnUrl !== "/overview"
              ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
              : "/login"
          }
          className="text-primary font-semibold hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
