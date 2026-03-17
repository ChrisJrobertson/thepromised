import type { Metadata } from "next";

import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Log In — TheyPromised",
  description: "Log in to your TheyPromised account and pick up where you left off.",
  openGraph: {
    title: "Log In — TheyPromised",
    description: "Log in to your TheyPromised account and pick up where you left off.",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
