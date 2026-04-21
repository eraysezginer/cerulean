"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "block border-l-2 border-transparent py-1.5 pl-3 text-nav text-text-2 transition-colors",
        active &&
          "border-teal bg-teal/[0.08] font-medium text-teal"
      )}
    >
      {label}
    </Link>
  );
}
