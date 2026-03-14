"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/supabase/auth";
import { registerSchema } from "@/lib/validation/auth";

type FormValues = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  const password = form.watch("password");
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthLabel = ["Very weak", "Weak", "Fair", "Good", "Strong"][strength];

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Please check your email to verify.");
    router.push("/login");
  };

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });
    setIsGoogleLoading(false);

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building a clear, professional complaint timeline."
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            autoComplete="name"
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
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
            autoComplete="new-password"
            {...form.register("password")}
          />
          <div className="space-y-1 text-xs">
            <p>Password strength: {strengthLabel}</p>
            <div className="h-2 rounded bg-slate-200">
              <div
                className="h-2 rounded bg-secondary transition-all"
                style={{ width: `${(strength / 4) * 100}%` }}
              />
            </div>
          </div>
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input className="mt-1" type="checkbox" {...form.register("acceptTerms")} />
          <span>
            I agree to the{" "}
            <Link className="text-primary underline" href="/terms">
              terms
            </Link>{" "}
            and{" "}
            <Link className="text-primary underline" href="/privacy">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {form.formState.errors.acceptTerms ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.acceptTerms.message}
          </p>
        ) : null}

        <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <Button className="mt-3 w-full" onClick={signInWithGoogle} type="button" variant="outline">
        {isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Connecting...
          </>
        ) : (
          <>
            <Check className="mr-2 size-4" /> Continue with Google
          </>
        )}
      </Button>

      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link className="text-primary underline" href="/login">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
