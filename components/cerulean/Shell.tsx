"use client";

import { Sidebar } from "@/components/cerulean/Sidebar";
import { TopBar } from "@/components/cerulean/TopBar";
import { cn } from "@/lib/utils";

export function Shell({
  children,
  /** 44px top bar + offset (Add company flow) */
  compactTopBar,
}: {
  children: React.ReactNode;
  compactTopBar?: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <TopBar compact={compactTopBar} />
      <Sidebar compactTop={compactTopBar} />
      <div
        className={cn(
          "min-h-screen pl-[220px]",
          compactTopBar ? "pt-11" : "pt-14"
        )}
      >
        <main
          className={cn("bg-bg", compactTopBar ? "min-h-[calc(100vh-2.75rem)]" : "min-h-[calc(100vh-3.5rem)]")}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
