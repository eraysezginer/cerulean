"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavItem({
  href,
  label,
  isActiveMatch,
}: {
  href: string;
  label: string;
  /** When set, pathname matches this instead of exact href equality */
  isActiveMatch?: (pathname: string) => boolean;
}) {
  const pathname = usePathname();
  const active = isActiveMatch ? isActiveMatch(pathname) : pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-r-md border-l-[3px] border-transparent py-2 pl-3 pr-2 text-nav text-text-2 transition-colors",
        "hover:bg-bg/80 hover:text-text-1",
        active &&
          "border-teal bg-teal/[0.1] font-medium text-teal shadow-[inset_0_1px_0_0_rgba(11,114,117,0.06)]"
      )}
    >
      {label}
    </Link>
  );
}
