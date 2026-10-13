"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const { error, success } = useToast();
  const router = useRouter();

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
      router.push("/overview");
    } else {
      error(result.message || "Registration failed. Try a different email.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Create Account
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Start journaling your trades with professional analytics
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Morgan"
          icon={<UserIcon className="w-4 h-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

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
            placeholder="Min 8 chars, 1 uppercase, 1 symbol"
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={submitting}
        >
          Create Free Account
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
