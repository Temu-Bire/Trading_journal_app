"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { error } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitting(true);
    try {
      const res = await apiClient.post("/auth/forgot-password", data);
      if (res.success) {
        setSubmitted(true);
      } else {
        error(res.message || "Failed to process request");
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Error requesting reset");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-profit flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
            If an account matches that email address, a password reset link has been dispatched.
          </p>
        </div>
        <Link href="/login" className="inline-block w-full">
          <Button variant="outline" size="md" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Reset Password
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your email address and we&apos;ll send you instructions to reset your password.
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={submitting}
        >
          Send Reset Instructions
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        <Link href="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
