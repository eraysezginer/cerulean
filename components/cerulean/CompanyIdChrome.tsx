"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CompanySwitcher } from "@/components/cerulean/CompanySwitcher";
import { NotesPanel } from "@/components/cerulean/NotesPanel";
import { cn } from "@/lib/utils";
import type { CompanyRow } from "@/data/company-types";
import type { Note } from "@/data/notes";

export function CompanyIdChrome({
  companyId,
  companyName,
  notes,
  portfolioCompanies,
  children,
}: {
  companyId: string;
  companyName: string;
  notes: Note[];
  portfolioCompanies: CompanyRow[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hideNotes = pathname?.includes("/timeline") ?? false;
  return (
    <>
      <div className={cn(!hideNotes && "pr-[240px]")}>
        <div className="border-b border-border/70 bg-gradient-to-r from-bg via-bg to-teal-light/30 px-8 py-4">
          <CompanySwitcher companyId={companyId} companies={portfolioCompanies} />
        </div>
        {children}
      </div>
      {!hideNotes ? <NotesPanel companyName={companyName} notes={notes} /> : null}
    </>
  );
}
