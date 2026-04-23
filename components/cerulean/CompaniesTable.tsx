"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useDefaultCompanyId } from "@/hooks/use-default-company-id";
import type { CompanyRow } from "@/data/company-types";
import { isSeedCompanyId } from "@/data/company-seed";
import { setDefaultCompanyId } from "@/lib/default-company";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CompanyRowActionMenu } from "@/components/cerulean/CompanyRowActionMenu";

function healthColor(h: number) {
  if (h < 40) return "text-red font-semibold";
  if (h <= 70) return "text-amber font-semibold";
  return "text-green font-semibold";
}

export function CompaniesTable({ rows }: { rows: CompanyRow[] }) {
  const defaultId = useDefaultCompanyId();

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[940px] text-left text-body">
        <thead>
          <tr className="border-b border-border bg-bg-2 text-[12px] uppercase tracking-wide text-text-3">
            <th className="p-3 font-medium">Company</th>
            <th className="p-3 font-medium">Default</th>
            <th className="p-3 font-medium">Health</th>
            <th className="p-3 font-medium">Flags</th>
            <th className="p-3 font-medium">Last update</th>
            <th className="p-3 font-medium">Cadence</th>
            <th className="p-3 font-medium">Actions</th>
            <th className="w-14 p-3 text-center font-medium">
              <span className="sr-only">Row menu</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-b-0">
              <td className="p-3">
                <Link
                  href={`/companies/${c.id}/flags`}
                  className="font-semibold text-teal hover:underline"
                >
                  {c.name}
                </Link>
              </td>
              <td className="p-3">
                <button
                  type="button"
                  onClick={() => setDefaultCompanyId(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px] font-medium transition-colors",
                    defaultId === c.id
                      ? "border-teal/40 bg-teal-light text-teal"
                      : "border-border text-text-3 hover:border-teal/30 hover:bg-bg-2 hover:text-text-2"
                  )}
                  title={
                    defaultId === c.id
                      ? "Default portfolio company"
                      : "Set as default for sidebar shortcuts"
                  }
                  aria-pressed={defaultId === c.id}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      defaultId === c.id
                        ? "fill-teal text-teal"
                        : "text-text-3"
                    )}
                  />
                  {defaultId === c.id ? "Default" : "Set default"}
                </button>
              </td>
              <td className={cn("p-3 tabular-nums", healthColor(c.health))}>
                {c.health}
              </td>
              <td
                className={cn(
                  "p-3 tabular-nums",
                  c.flags > 3 ? "font-semibold text-red" : "text-text-2"
                )}
              >
                {c.flags}
              </td>
              <td className="p-3 text-text-2">{c.lastUpdate}</td>
              <td
                className={cn(
                  "p-3",
                  c.cadence === "Silent"
                    ? "font-semibold text-red"
                    : "text-text-2"
                )}
              >
                {c.cadence}
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/companies/${c.id}/flags`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-border text-text-1 hover:text-text-1"
                    )}
                  >
                    Flags
                  </Link>
                  <Link
                    href={`/companies/${c.id}/behavioral`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-border text-text-1 hover:text-text-1"
                    )}
                  >
                    Behavioral
                  </Link>
                  <Link
                    href={`/companies/${c.id}/external`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-border text-text-1 hover:text-text-1"
                    )}
                  >
                    External
                  </Link>
                  <Link
                    href={`/companies/${c.id}/captable`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "border-border text-text-1 hover:text-text-1"
                    )}
                  >
                    Cap table
                  </Link>
                </div>
              </td>
              <td className="p-3 align-middle text-center">
                {!isSeedCompanyId(c.id) ? (
                  <div className="inline-flex justify-center">
                    <CompanyRowActionMenu companyId={c.id} companyName={c.name} />
                  </div>
                ) : (
                  <span className="text-[12px] text-text-3">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
