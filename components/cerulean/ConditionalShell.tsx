"use client";

import { usePathname } from "next/navigation";
import { Shell } from "@/components/cerulean/Shell";

/**
 * Login tam ekran; diğer route’larda sidebar + top bar.
 */
export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin =
    pathname === "/login" || pathname === "/login/";

  if (isLogin) return <>{children}</>;

  const compactTopBar =
    pathname === "/companies/add" || pathname === "/companies/add/";

  return <Shell compactTopBar={compactTopBar}>{children}</Shell>;
}
