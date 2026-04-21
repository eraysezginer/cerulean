"use client";

import { Sidebar } from "@/components/cerulean/Sidebar";
import { TopBar } from "@/components/cerulean/TopBar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <TopBar />
      <Sidebar />
      <div className="min-h-screen pl-[220px] pt-14">
        <main className="min-h-[calc(100vh-3.5rem)] bg-bg">{children}</main>
      </div>
    </div>
  );
}
