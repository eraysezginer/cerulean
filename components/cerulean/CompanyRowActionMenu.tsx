"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { clearDefaultCompanyIdIfMatches } from "@/lib/default-company";
import { cn } from "@/lib/utils";

export function CompanyRowActionMenu({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onRemove = async () => {
    if (!window.confirm(`Remove “${companyName}” from your portfolio? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/companies/${companyId}`, { method: "DELETE" });
      if (!res.ok) {
        const raw = await res.text();
        let msg = "Could not remove company.";
        try {
          const j = JSON.parse(raw) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          if (raw.length > 0 && raw.length < 200 && !raw.trimStart().startsWith("<")) {
            msg = raw.trim();
          }
        }
        window.alert(msg);
        return;
      }
      clearDefaultCompanyIdIfMatches(companyId);
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label={`More actions: ${companyName}`}
        aria-haspopup="menu"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-8 w-8 shrink-0 border-border text-text-2 hover:border-teal/30 hover:text-text-1"
        )}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={4}
        className="w-[min(16rem,90vw)] border-border bg-bg p-1 text-text-1 shadow-lg"
      >
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/companies/${companyId}/edit?step=1`}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-text-1 hover:bg-bg-2"
            onClick={() => setOpen(false)}
          >
            <Pencil className="h-3.5 w-3.5 shrink-0 text-text-3" aria-hidden />
            Edit company
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-red hover:bg-red-light/40 disabled:opacity-50"
            disabled={busy}
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {busy ? "Removing…" : "Remove company"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
