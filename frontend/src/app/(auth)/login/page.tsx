"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { error, success } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    const result = await login(data.email, data.password);
    setSubmitting(false);

    if (result.success) {
      success("Welcome back!");
      router.push("/overview");
    } else {
      error(result.message || "Invalid email or password");
    }
  };

  const handleDemoFill = () => {
    setValue("email", "trader@example.com");
    setValue("password", "Password123!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Sign In
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your credentials to access your trading journal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="trader@example.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-muted-foreground hover:text-foreground p-1 transition-colors"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-primary hover:underline font-semibold"
          >
            Fill Demo Account
          </button>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={submitting}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
