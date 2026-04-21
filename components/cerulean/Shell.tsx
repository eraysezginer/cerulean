"use client";

import { Sidebar } from "@/components/cerulean/Sidebar";
import { TopBar } from "@/components/cerulean/TopBar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <TopBar />
      <Sidebar />
      <div className="min-h-screen pt-[44px] pl-[220px]">
        <main className="min-h-[calc(100vh-44px)] bg-bg">{children}</main>
      </div>
    </div>
  );
}
