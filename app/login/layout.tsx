import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Cerulean",
  description: "Investor access to Cerulean",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
