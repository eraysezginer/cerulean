"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NavItem({
  href,
  label,
  isActiveMatch,
  level = 0,
}: {
  href: string;
  label: string;
  /** When set, pathname matches this instead of exact href equality */
  isActiveMatch?: (pathname: string, searchParams: URLSearchParams) => boolean;
  level?: 0 | 1;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const sync = () => setSearch(window.location.search);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [pathname]);

  const searchParams = new URLSearchParams(search);
  const active = isActiveMatch ? isActiveMatch(pathname, searchParams) : pathname === href;

  return (
    <Link
      href={href}
      onClick={() => {
        const url = new URL(href, window.location.origin);
        setSearch(url.search);
      }}
      className={cn(
        "block rounded-r-md border-l-[3px] border-transparent py-2 pr-2 text-nav text-text-2 transition-colors",
        level === 0 ? "pl-3" : "ml-3 pl-4 text-[12px]",
        "hover:bg-bg/80 hover:text-text-1",
        active &&
          "border-teal bg-teal/[0.1] font-medium text-teal shadow-[inset_0_1px_0_0_rgba(11,114,117,0.06)]"
      )}
    >
      {label}
    </Link>
  );
}
