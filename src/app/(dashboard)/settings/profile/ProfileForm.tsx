"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { updateProfile, changePassword, changeEmail } from "@/lib/actions/settings";
import type { Profile } from "@/types/database";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(8, "Enter your current password"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type ProfileFormProps = {
  email: string;
  profile: Profile | null;
};

const emailSchema = z.object({
  new_email: z.string().email("Enter a valid email address"),
});
type EmailFormData = z.infer<typeof emailSchema>;

export function ProfileForm({ email, profile }: ProfileFormProps) {
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      address_line_1: profile?.address_line_1 ?? "",
      address_line_2: profile?.address_line_2 ?? "",
      city: profile?.city ?? "",
      postcode: profile?.postcode ?? "",
    },
  });

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { new_email: "" },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  function onProfileSubmit(data: ProfileFormData) {
    startProfileTransition(async () => {
      const result = await updateProfile({
        full_name: data.full_name,
        phone: data.phone ?? "",
        address_line_1: data.address_line_1 ?? "",
        address_line_2: data.address_line_2 ?? "",
        city: data.city ?? "",
        postcode: data.postcode ?? "",
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated");
      }
    });
  }

  function onEmailSubmit(data: EmailFormData) {
    startEmailTransition(async () => {
      const result = await changeEmail(data.new_email);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message ?? "Confirmation email sent.");
        emailForm.reset();
      }
    });
  }

  function onPasswordSubmit(data: PasswordFormData) {
    startPasswordTransition(async () => {
      const result = await changePassword(data.current_password, data.new_password);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password changed");
        passwordForm.reset();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Profile details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email address</label>
                <Input disabled type="email" value={email} />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>

              <FormField
                control={profileForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="07700 900000" type="tel" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              <p className="text-sm font-medium text-muted-foreground">
                Postal address
                <span className="ml-2 text-xs font-normal">
                  Used as sender address on AI-generated letters
                </span>
              </p>

              <FormField
                control={profileForm.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Example Street" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="address_line_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={profileForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Town</FormLabel>
                      <FormControl>
                        <Input placeholder="London" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input
                          className="uppercase"
                          placeholder="SW1A 1AA"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button disabled={profilePending} type="submit">
                {profilePending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change email address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change email address</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form className="space-y-4" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Current email</label>
                <Input disabled type="email" value={email} />
              </div>
              <FormField
                control={emailForm.control}
                name="new_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New email address</FormLabel>
                    <FormControl>
                      <Input placeholder="newaddress@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground">
                A confirmation link will be sent to both your current and new email address.
                Both must be confirmed before the change takes effect.
              </p>
              <Button disabled={emailPending} type="submit" variant="secondary">
                {emailPending ? "Sending..." : "Send confirmation"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            >
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={passwordPending} type="submit" variant="secondary">
                {passwordPending ? "Changing..." : "Change password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
