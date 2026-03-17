"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/supabase/auth";
import { loginSchema } from "@/lib/validation/auth";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginClient() {
  const router = useRouter();
  const nextPath = "/dashboard";
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back.");
    router.push(nextPath);
    router.refresh();
  };

  const sendMagicLink = async () => {
    const supabase = createClient();
    const email = form.getValues("email");
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }

    setIsMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(nextPath),
      },
    });
    setIsMagicLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Magic link sent. Check your inbox.");
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(nextPath),
      },
    });
    setIsGoogleLoading(false);

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthShell
      title="Log in to your account"
      subtitle="Pick up where you left off and keep your case evidence organised."
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <div className="mt-4 grid gap-2">
        <Button onClick={sendMagicLink} type="button" variant="outline">
          {isMagicLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Sending magic link...
            </>
          ) : (
            "Send magic link"
          )}
        </Button>
        <Button onClick={signInWithGoogle} type="button" variant="outline">
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Connecting...
            </>
          ) : (
            <>
              <GoogleIcon /> Continue with Google
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="text-primary underline" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="text-primary underline" href="/register">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </AuthShell>
  );
}
