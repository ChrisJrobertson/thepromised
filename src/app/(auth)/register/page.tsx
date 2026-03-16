import type { Metadata } from "next";

import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Your Free Account",
  description:
    "Sign up free to start tracking your complaint. Log interactions, track promises, and get AI-drafted letters to help you win.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
