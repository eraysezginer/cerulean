"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChevronDown } from "lucide-react";
import { companies } from "@/data/company-seed";
import { cn } from "@/lib/utils";

export function CompanySwitcher({ companyId }: { companyId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState(companyId);

  useEffect(() => {
    setSelectedId(companyId);
  }, [companyId]);

  const rest =
    pathname.match(/^\/companies\/[^/]+\/(.+)$/)?.[1] ?? "flags";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border/90 bg-bg px-3 py-2 shadow-sm ring-1 ring-black/[0.03]">
        <Building2
          className="h-4 w-4 shrink-0 text-teal"
          strokeWidth={2}
          aria-hidden
        />
        <span className="text-[12px] font-medium uppercase tracking-wide text-text-3">
          Company
        </span>
        <div className="relative min-w-0">
          <select
            aria-label="Switch company"
            value={selectedId}
            onChange={(e) => {
              const nextId = e.target.value;
              setSelectedId(nextId);
              router.push(`/companies/${nextId}/${rest}`);
            }}
            className={cn(
              "h-8 w-full min-w-[200px] max-w-[min(100vw-8rem,320px)] cursor-pointer appearance-none rounded-lg border border-border/80 bg-bg-2 py-1 pr-8 pl-2.5",
              "text-left text-[14px] font-medium text-text-1",
              "outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
            )}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-text-3"
            aria-hidden
          />
        </div>
      </div>
      <p className="text-[13px] text-text-3">
        Sidebar “Company: …” links use your{" "}
        <span className="font-medium text-text-2">default company</span> from
        All companies.
      </p>
    </div>
  );
}
