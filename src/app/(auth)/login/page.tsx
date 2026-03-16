import type { Metadata } from "next";

import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your TheyPromised account to manage your complaint cases.",
};

export default function LoginPage() {
  return <LoginClient />;
}
