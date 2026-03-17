import type { Metadata } from "next";

import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Create Account — TheyPromised",
  description:
    "Create your free TheyPromised account and start building a professional complaint timeline today.",
  openGraph: {
    title: "Create Account — TheyPromised",
    description:
      "Create your free TheyPromised account and start building a professional complaint timeline today.",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
