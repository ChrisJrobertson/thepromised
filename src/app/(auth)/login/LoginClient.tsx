"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
            "Continue with Google"
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
