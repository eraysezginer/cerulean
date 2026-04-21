import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ConditionalShell } from "@/components/cerulean/ConditionalShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cerulean — Investor",
  description:
    "Forensic linguistic intelligence for private market investors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, "theme")}>
      <body className={cn("min-h-screen font-sans antialiased")}>
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
