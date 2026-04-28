"use client";

import { useState } from "react";
import type { CompanyFlagDetail } from "@/data/flags";
import { SourceEvidenceModal } from "./SourceEvidenceModal";

export function ViewSourceButton({
  flag,
  className,
}: {
  flag: CompanyFlagDetail;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "shrink-0 rounded bg-teal-light px-2 py-1 text-[12px] font-medium text-teal hover:bg-teal/10"
        }
      >
        View source →
      </button>
      {open && (
        <SourceEvidenceModal
          open={open}
          onOpenChange={setOpen}
          flag={flag}
        />
      )}
    </>
  );
}
