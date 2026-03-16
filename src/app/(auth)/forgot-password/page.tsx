import type { Metadata } from "next";

import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your TheyPromised account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
