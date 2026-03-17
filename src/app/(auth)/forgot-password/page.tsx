import type { Metadata } from "next";

import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password — TheyPromised",
  description: "Reset your TheyPromised password. We'll send a secure link to your email.",
  openGraph: {
    title: "Reset Password — TheyPromised",
    description: "Reset your TheyPromised password. We'll send a secure link to your email.",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
